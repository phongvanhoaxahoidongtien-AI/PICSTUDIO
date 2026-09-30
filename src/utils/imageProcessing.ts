import type { ImageAdjustments } from '../types';

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  temperature: 0,
  tint: 0,
  sharpness: 0,
  vignette: 0,
  clarity: 0,
  blackPoint: 0,
  gamma: 1.0,
  whitePoint: 255,
};

/**
 * Safely load photos while preserving 100% of their original pixel dimensions and quality.
 * Only downscales if exceeding 4096px (e.g. 48MP/100MP raw sensors) to prevent iOS Safari 256MB canvas memory crash.
 */
export async function downscaleImageIfNeeded(
  fileOrBlob: Blob | File,
  maxDimension = 4096
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const originalDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;

        // If the photo is within safe limits (<= 4096px), KEEP 100% EXACT ORIGINAL BYTES & DIMENSIONS!
        if (naturalW <= maxDimension && naturalH <= maxDimension) {
          resolve({ dataUrl: originalDataUrl, width: naturalW, height: naturalH });
          return;
        }

        // Only scale down if extremely huge (> 4096px) to protect mobile browsers from memory exhaustion
        const ratio = Math.min(maxDimension / naturalW, maxDimension / naturalH);
        const width = Math.round(naturalW * ratio);
        const height = Math.round(naturalH * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: originalDataUrl, width: naturalW, height: naturalH });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = fileOrBlob.type === 'image/png';
        const finalDataUrl = isPng
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', 0.95);

        resolve({ dataUrl: finalDataUrl, width, height });
      };
      img.onerror = reject;
      img.src = originalDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * High-performance pixel manipulation applying adjustments in a single pass
 */
export function applyAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adjustments: ImageAdjustments,
  intensity = 1.0 // 0 to 1
) {
  if (width <= 0 || height <= 0) return;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  // Scale adjustment values by intensity
  const brightness = adjustments.brightness * intensity;
  const contrast = adjustments.contrast * intensity;
  const saturation = adjustments.saturation * intensity;
  const exposure = adjustments.exposure * intensity;
  const highlights = adjustments.highlights * intensity;
  const shadows = adjustments.shadows * intensity;
  const temp = adjustments.temperature * intensity;
  const tint = adjustments.tint * intensity;
  const vignette = adjustments.vignette * intensity;
  const clarity = adjustments.clarity * intensity;
  const blackPoint = adjustments.blackPoint * intensity;
  const whitePoint = 255 - (255 - adjustments.whitePoint) * intensity;
  const gamma = 1 + (adjustments.gamma - 1) * intensity;

  // Pre-calculate constants
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const exposureMultiplier = Math.pow(2, exposure / 45);
  const satMultiplier = 1 + saturation / 100;
  const clarityFactor = 1 + clarity / 180;

  // Temperature color shift
  const rTemp = temp > 0 ? temp * 0.9 : temp * 0.3;
  const bTemp = temp < 0 ? -temp * 0.9 : -temp * 0.3;
  // Tint color shift (green vs magenta)
  const gTint = -tint * 0.7;
  const rTint = tint > 0 ? tint * 0.5 : 0;
  const bTint = tint > 0 ? tint * 0.5 : 0;

  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  // Gamma table lookup for speed
  const gammaTable = new Uint8Array(256);
  const invGamma = 1 / Math.max(0.1, gamma);
  for (let i = 0; i < 256; i++) {
    gammaTable[i] = Math.min(255, Math.max(0, Math.round(Math.pow(i / 255, invGamma) * 255)));
  }

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Exposure
    if (exposure !== 0) {
      r *= exposureMultiplier;
      g *= exposureMultiplier;
      b *= exposureMultiplier;
    }

    // 2. Brightness
    if (brightness !== 0) {
      const bOffset = brightness * 1.5;
      r += bOffset;
      g += bOffset;
      b += bOffset;
    }

    // 3. Contrast
    if (contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // 4. Highlights and Shadows (Tone curve adjustment based on luminance)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (shadows !== 0 && lum < 128) {
      const shadowWeight = (128 - lum) / 128;
      const sFactor = (shadows / 100) * 50 * shadowWeight;
      r += sFactor;
      g += sFactor;
      b += sFactor;
    }
    if (highlights !== 0 && lum > 128) {
      const highlightWeight = (lum - 128) / 128;
      const hFactor = (highlights / 100) * 50 * highlightWeight;
      r += hFactor;
      g += hFactor;
      b += hFactor;
    }

    // 5. Clarity (Midtone micro-contrast)
    if (clarity !== 0) {
      const midtoneDist = 1 - Math.abs(lum - 128) / 128;
      if (midtoneDist > 0) {
        const cShift = (lum - 128) * (clarityFactor - 1) * midtoneDist;
        r += cShift;
        g += cShift;
        b += cShift;
      }
    }

    // 6. Temperature & Tint
    if (temp !== 0 || tint !== 0) {
      r += rTemp + rTint;
      g += gTint;
      b += bTemp + bTint;
    }

    // 7. Saturation
    if (saturation !== 0) {
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      r = l + (r - l) * satMultiplier;
      g = l + (g - l) * satMultiplier;
      b = l + (b - l) * satMultiplier;
    }

    // 8. Levels (Black point, White point, Gamma)
    if (blackPoint > 0 || whitePoint < 255 || gamma !== 1.0) {
      const range = Math.max(1, whitePoint - blackPoint);
      r = ((Math.min(whitePoint, Math.max(blackPoint, r)) - blackPoint) / range) * 255;
      g = ((Math.min(whitePoint, Math.max(blackPoint, g)) - blackPoint) / range) * 255;
      b = ((Math.min(whitePoint, Math.max(blackPoint, b)) - blackPoint) / range) * 255;

      r = gammaTable[Math.min(255, Math.max(0, Math.round(r)))];
      g = gammaTable[Math.min(255, Math.max(0, Math.round(g)))];
      b = gammaTable[Math.min(255, Math.max(0, Math.round(b)))];
    }

    // 9. Vignette
    if (vignette > 0) {
      const px = (i / 4) % width;
      const py = Math.floor(i / 4 / width);
      const dx = px - centerX;
      const dy = py - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normDist = dist / maxDist;
      if (normDist > 0.35) {
        const vFactor = 1 - ((normDist - 0.35) / 0.65) * (vignette / 100);
        r *= vFactor;
        g *= vFactor;
        b *= vFactor;
      }
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  // 10. Sharpness via 3x3 unsharp mask kernel convolution
  if (adjustments.sharpness > 0) {
    applySharpness(imgData, width, height, adjustments.sharpness * intensity);
  }

  ctx.putImageData(imgData, 0, 0);
}

function applySharpness(imgData: ImageData, width: number, height: number, amount: number) {
  const strength = (amount / 100) * 1.5;
  const src = new Uint8ClampedArray(imgData.data);
  const dst = imgData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = src[idx + c];
        const top = src[((y - 1) * width + x) * 4 + c];
        const bottom = src[((y + 1) * width + x) * 4 + c];
        const left = src[(y * width + (x - 1)) * 4 + c];
        const right = src[(y * width + (x + 1)) * 4 + c];

        const sharpVal = center + strength * (4 * center - top - bottom - left - right);
        dst[idx + c] = Math.min(255, Math.max(0, sharpVal));
      }
    }
  }
}

/**
 * Calculates RGB and Luminance Histogram (256 buckets)
 */
export function calculateHistogram(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const r = new Uint32Array(256);
  const g = new Uint32Array(256);
  const b = new Uint32Array(256);
  const lum = new Uint32Array(256);

  // Subsample large images to guarantee 60fps responsiveness
  const step = Math.max(1, Math.floor((width * height) / 100000));
  const imgData = ctx.getImageData(0, 0, width, height).data;

  for (let i = 0; i < imgData.length; i += 4 * step) {
    const red = imgData[i];
    const green = imgData[i + 1];
    const blue = imgData[i + 2];
    const l = Math.round(0.299 * red + 0.587 * green + 0.114 * blue);

    r[red]++;
    g[green]++;
    b[blue]++;
    lum[l]++;
  }

  // Find maximum bucket count to normalize
  let max = 1;
  for (let i = 0; i < 256; i++) {
    if (lum[i] > max) max = lum[i];
  }

  return { r, g, b, lum, max };
}

/**
 * Client-side Auto Enhance:
 * Calculates histogram statistics and automatically balances exposure, contrast and saturation.
 */
export function calculateAutoEnhance(ctx: CanvasRenderingContext2D, width: number, height: number): Partial<ImageAdjustments> {
  const { lum } = calculateHistogram(ctx, width, height);

  let totalPixels = 0;
  for (let i = 0; i < 256; i++) totalPixels += lum[i];
  if (totalPixels === 0) return {};

  // Find 2nd and 98th percentile to avoid outlier noise
  const p2Threshold = totalPixels * 0.02;
  const p98Threshold = totalPixels * 0.98;

  let count = 0;
  let minLum = 0;
  let maxLum = 255;

  for (let i = 0; i < 256; i++) {
    count += lum[i];
    if (count >= p2Threshold && minLum === 0) {
      minLum = i;
    }
    if (count >= p98Threshold) {
      maxLum = i;
      break;
    }
  }

  // Auto exposure: how far is median from middle (128)
  const medianLum = (minLum + maxLum) / 2;
  const exposureOffset = Math.round(((128 - medianLum) / 128) * 25);
  // Auto contrast: stretch dynamic range
  const dynamicRange = maxLum - minLum;
  const contrastBoost = Math.min(30, Math.max(10, Math.round(((255 - dynamicRange) / 255) * 45)));

  return {
    exposure: Math.min(25, Math.max(-25, exposureOffset)),
    contrast: contrastBoost,
    saturation: 14,
    clarity: 12,
    highlights: -10,
    shadows: 15,
    sharpness: 15,
  };
}
