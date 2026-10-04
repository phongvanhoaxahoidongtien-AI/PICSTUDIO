import type { ImageAdjustments } from '../types';

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
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

  // Ultra-fast skip: If no adjustments are made, skip heavy getImageData loop entirely!
  const hasAdjustments =
    adjustments.brightness !== 0 ||
    adjustments.contrast !== 0 ||
    adjustments.saturation !== 0 ||
    adjustments.exposure !== 0 ||
    adjustments.highlights !== 0 ||
    adjustments.shadows !== 0 ||
    (adjustments.whites !== undefined && adjustments.whites !== 0) ||
    (adjustments.blacks !== undefined && adjustments.blacks !== 0) ||
    adjustments.temperature !== 0 ||
    adjustments.tint !== 0 ||
    adjustments.sharpness !== 0 ||
    adjustments.vignette !== 0 ||
    adjustments.clarity !== 0 ||
    adjustments.blackPoint !== 0 ||
    (adjustments.gamma !== undefined && adjustments.gamma !== 1.0) ||
    (adjustments.whitePoint !== undefined && adjustments.whitePoint !== 255);

  if (!hasAdjustments) return;

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
  const whites = (adjustments.whites ?? 0) * intensity;
  const blacks = (adjustments.blacks ?? 0) * intensity;
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

    // Whites adjustment (Windows 11 Photos: bright highlight compression / expansion, lum > 170)
    if (whites !== 0 && lum > 170) {
      const whiteWeight = (lum - 170) / 85;
      const wFactor = (whites / 100) * 45 * whiteWeight;
      r += wFactor;
      g += wFactor;
      b += wFactor;
    }

    // Blacks adjustment (Windows 11 Photos: deep shadow stretch / lift, lum < 85)
    if (blacks !== 0 && lum < 85) {
      const blackWeight = (85 - lum) / 85;
      const blkFactor = (blacks / 100) * 45 * blackWeight;
      r += blkFactor;
      g += blkFactor;
      b += blkFactor;
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
 * Professional DSLR-Grade Auto Enhance:
 * Analyzes full RGB histogram & luminescence to deliver professional camera quality:
 * - Dynamic Range Tone Mapping (Deep highlight recovery & clean shadow detail lift)
 * - Optical Micro-Contrast & Prime Lens Acutance (Whites, Blacks, Clarity, Sharpness)
 * - Rich, vibrant color vibrance without clipping (DSLR sensor color science)
 * - Auto White Balance color cast correction with warm daylight compensation
 */
export function calculateAutoEnhance(ctx: CanvasRenderingContext2D, width: number, height: number): Partial<ImageAdjustments> {
  const { r, g, b, lum } = calculateHistogram(ctx, width, height);

  let totalPixels = 0;
  let sumR = 0, sumG = 0, sumB = 0;
  for (let i = 0; i < 256; i++) {
    totalPixels += lum[i];
    sumR += r[i] * i;
    sumG += g[i] * i;
    sumB += b[i] * i;
  }
  if (totalPixels === 0) return {};

  const meanR = sumR / totalPixels;
  const meanG = sumG / totalPixels;
  const meanB = sumB / totalPixels;

  // 1. Professional Auto White Balance / Temperature & Tint Correction
  let autoTemp = 0;
  let autoTint = 0;
  const colorDiffRB = meanR - meanB;
  if (colorDiffRB < -10) {
    // Too blue/cold -> add gentle camera warmth (golden hour sunlight)
    autoTemp = Math.min(18, Math.round(Math.abs(colorDiffRB) * 0.5));
  } else if (colorDiffRB > 25) {
    // Too yellow/amber -> slight cooling
    autoTemp = Math.max(-12, Math.round(-colorDiffRB * 0.28));
  } else {
    // Balanced lighting -> add subtle warm pro-photographer glow
    autoTemp = 8;
  }

  // Tint compensation (neutralize unflattering greenish fluorescent casts, add healthy rose glow)
  const avgRB = (meanR + meanB) / 2;
  if (meanG > avgRB + 6) {
    autoTint = Math.min(16, Math.round((meanG - avgRB) * 0.6));
  } else {
    autoTint = 4; // Subtle magenta tint for natural vibrant skin tones
  }

  // 2. Histogram percentiles for true DSLR dynamic range expansion
  const p1Threshold = totalPixels * 0.012;
  const p99Threshold = totalPixels * 0.988;

  let count = 0;
  let minLum = 0;
  let maxLum = 255;

  for (let i = 0; i < 256; i++) {
    count += lum[i];
    if (count >= p1Threshold && minLum === 0) {
      minLum = i;
    }
    if (count >= p99Threshold) {
      maxLum = i;
      break;
    }
  }

  // Dynamic range measurement
  const dynamicRange = Math.max(20, maxLum - minLum);
  const medianLum = (minLum + maxLum) / 2;

  // Exposure calibration: target optimal midtone brightness (124-136)
  const targetMedian = 130;
  const exposureOffset = Math.round(((targetMedian - medianLum) / targetMedian) * 26);

  // Dynamic contrast curve
  const contrastBoost = Math.min(36, Math.max(16, Math.round(((255 - dynamicRange) / 255) * 50) + 10));

  // Shadow lift: Dark scenes get stronger shadow opening
  const shadowLift = medianLum < 100 ? 38 : medianLum < 140 ? 28 : 20;

  // Highlight recovery: Bright scenes get more highlight compression to save clouds & sky
  const highlightRecovery = maxLum > 230 ? -28 : -18;

  return {
    exposure: Math.min(22, Math.max(-16, exposureOffset)),
    contrast: contrastBoost,
    saturation: 30,             // Rich, vivid DSLR saturation
    clarity: 28,                // Optical midtone micro-contrast & 3D depth
    sharpness: 38,              // Prime lens edge acutance & razor detail
    highlights: highlightRecovery, // Recover sky, clouds & bright skin highlights
    shadows: shadowLift,        // Lift dark shadows to reveal crisp details
    whites: 20,                 // Clean, punchy whites
    blacks: -16,                // Deep, filmic cinema blacks
    temperature: autoTemp,      // Warm daylight white balance
    tint: autoTint,
  };
}

export interface WindowsPhotosPreset {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  previewBg: string;
  adjustments: Partial<ImageAdjustments>;
}

export const WINDOWS_PHOTOS_PRESETS: WindowsPhotosPreset[] = [
  {
    id: 'original',
    name: 'Original',
    nameVi: 'Gốc',
    description: 'Ảnh gốc không hiệu ứng',
    previewBg: 'bg-slate-700',
    adjustments: {
      exposure: 0,
      brightness: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      saturation: 0,
      temperature: 0,
      tint: 0,
      clarity: 0,
      sharpness: 0,
      vignette: 0,
    },
  },
  {
    id: 'dslr_pro',
    name: 'DSLR Vivid',
    nameVi: 'Máy ảnh cơ (DSLR Pro)',
    description: 'Màu sắc rực rỡ, sắc nét, chiều sâu quang học chuẩn máy ảnh cơ chuyên nghiệp',
    previewBg: 'bg-gradient-to-tr from-rose-600 via-amber-500 to-indigo-600',
    adjustments: {
      exposure: 6,
      contrast: 24,
      saturation: 26,
      clarity: 22,
      sharpness: 28,
      highlights: -18,
      shadows: 22,
      whites: 16,
      blacks: -12,
      temperature: 6,
      tint: 2,
    },
  },
  {
    id: 'auto_enhance',
    name: 'Enhance',
    nameVi: 'Tối ưu tự động',
    description: 'Tự động cân bằng sáng và màu sắc thông minh như Photos Win 10/11',
    previewBg: 'bg-gradient-to-tr from-amber-500 to-rose-500',
    adjustments: {
      exposure: 8,
      contrast: 18,
      saturation: 16,
      clarity: 14,
      highlights: -12,
      shadows: 18,
      whites: 10,
      blacks: -10,
      sharpness: 18,
    },
  },
  {
    id: 'sauna',
    name: 'Sauna',
    nameVi: 'Ấm áp (Sauna)',
    description: 'Tông màu cam vàng ấm áp, gợi cảm giác hoàng hôn và thư giãn',
    previewBg: 'bg-gradient-to-tr from-amber-600 to-orange-400',
    adjustments: {
      temperature: 35,
      tint: 8,
      saturation: 15,
      contrast: 10,
      highlights: -8,
      shadows: 14,
      whites: 12,
      blacks: -6,
      clarity: 8,
    },
  },
  {
    id: 'neo',
    name: 'Neo',
    nameVi: 'Hiện đại (Neo)',
    description: 'Độ tương phản cao, phong cách thành thị sắc sảo hiện đại',
    previewBg: 'bg-gradient-to-tr from-cyan-600 to-indigo-600',
    adjustments: {
      contrast: 28,
      clarity: 22,
      saturation: 8,
      exposure: 5,
      highlights: -18,
      shadows: -14,
      whites: 15,
      blacks: -22,
      sharpness: 24,
    },
  },
  {
    id: 'slate',
    name: 'Slate',
    nameVi: 'Phiến đá (Slate)',
    description: 'Tông lạnh trung tính trầm tĩnh, phong cách phim điện ảnh Bắc Âu',
    previewBg: 'bg-gradient-to-tr from-slate-600 to-teal-700',
    adjustments: {
      temperature: -24,
      tint: -10,
      saturation: -18,
      contrast: 16,
      shadows: 10,
      highlights: -15,
      clarity: 15,
      whites: 8,
      blacks: -8,
    },
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    nameVi: 'Vani (Vanilla)',
    description: 'Sáng trong trẻo, nhẹ nhàng êm dịu phong cách pastel thanh lịch',
    previewBg: 'bg-gradient-to-tr from-yellow-200 to-pink-200',
    adjustments: {
      exposure: 15,
      brightness: 12,
      contrast: -8,
      saturation: -10,
      temperature: 12,
      highlights: -20,
      shadows: 25,
      whites: 18,
      blacks: 15,
      clarity: -6,
    },
  },
  {
    id: 'icarus',
    name: 'Icarus',
    nameVi: 'Rực rỡ (Icarus)',
    description: 'Ánh nắng mặt trời chói chang vàng rực, độ bão hòa cao',
    previewBg: 'bg-gradient-to-tr from-yellow-500 to-red-500',
    adjustments: {
      temperature: 28,
      saturation: 32,
      contrast: 15,
      exposure: 8,
      highlights: -10,
      shadows: 10,
      whites: 20,
      blacks: -12,
    },
  },
  {
    id: 'rouge',
    name: 'Rouge',
    nameVi: 'Hồng phấn (Rouge)',
    description: 'Phớt hồng ngọt ngào, làm da tươi tắn rạng ngời tự nhiên',
    previewBg: 'bg-gradient-to-tr from-pink-500 to-rose-400',
    adjustments: {
      tint: 28,
      temperature: 8,
      saturation: 18,
      exposure: 10,
      contrast: 12,
      shadows: 16,
      whites: 15,
      clarity: 6,
    },
  },
  {
    id: 'zeke',
    name: 'Zeke',
    nameVi: 'Đen trắng sâu (Zeke)',
    description: 'Ảnh đen trắng nghệ thuật kịch tính với độ tương phản sắc bén',
    previewBg: 'bg-gradient-to-tr from-zinc-900 to-zinc-400',
    adjustments: {
      saturation: -100,
      contrast: 38,
      clarity: 28,
      exposure: 4,
      highlights: -15,
      shadows: -20,
      whites: 25,
      blacks: -35,
      sharpness: 30,
    },
  },
  {
    id: 'mercury',
    name: 'Mercury',
    nameVi: 'Ánh bạc (Mercury)',
    description: 'Đen trắng ánh bạc dịu dàng, dải chuyển sắc mịn màng cổ điển',
    previewBg: 'bg-gradient-to-tr from-gray-500 to-gray-300',
    adjustments: {
      saturation: -100,
      contrast: 10,
      exposure: 8,
      highlights: -25,
      shadows: 20,
      whites: 10,
      blacks: 10,
      clarity: 5,
    },
  },
  {
    id: 'denim',
    name: 'Denim',
    nameVi: 'Xanh Jean (Denim)',
    description: 'Tông màu xanh dương chàm đậm đà cá tính của quần jean cổ điển',
    previewBg: 'bg-gradient-to-tr from-blue-700 to-indigo-900',
    adjustments: {
      temperature: -36,
      tint: 12,
      saturation: -12,
      contrast: 22,
      shadows: -10,
      whites: 12,
      blacks: -15,
      vignette: 18,
    },
  },
];

