import type { BeautySettings, DetectedFace } from '../types';
import { detectFaces } from './faceDetection';

export const DEFAULT_BEAUTY_SETTINGS: BeautySettings = {
  smooth: 0,
  whiten: 0,
  toneWarmth: 0,
  glow: 0,
  slimFace: 0,
  bigEyes: 0,
  blush: 0,
  blushColor: '#f43f5e',
  lipstick: 0,
  lipstickColor: '#e11d48',
  presetId: undefined,
};

export interface BeautyPreset {
  id: string;
  name: string;
  description: string;
  tag: string;
  settings: BeautySettings;
}

export const BEAUTY_PRESETS: BeautyPreset[] = [
  {
    id: 'natural',
    name: 'Tự nhiên',
    description: 'Làn da mịn màng, hồng hào trong trẻo như mặt mộc',
    tag: 'Daily',
    settings: {
      smooth: 35,
      whiten: 18,
      toneWarmth: 10,
      glow: 20,
      slimFace: 15,
      bigEyes: 12,
      blush: 20,
      blushColor: '#fb7185',
      lipstick: 25,
      lipstickColor: '#f43f5e',
      presetId: 'natural',
    },
  },
  {
    id: 'korean_glow',
    name: 'Chuẩn Hàn',
    description: 'Làn da sương mai dewy căng bóng, má hồng đào ngọt ngào',
    tag: 'Trending',
    settings: {
      smooth: 50,
      whiten: 35,
      toneWarmth: 5,
      glow: 55,
      slimFace: 25,
      bigEyes: 18,
      blush: 38,
      blushColor: '#f472b6',
      lipstick: 45,
      lipstickColor: '#ec4899',
      presetId: 'korean_glow',
    },
  },
  {
    id: 'glamour',
    name: 'Quyến rũ',
    description: 'Gương mặt thon gọn V-line, mắt to long lanh, môi đỏ quyến rũ',
    tag: 'Party',
    settings: {
      smooth: 55,
      whiten: 28,
      toneWarmth: -5,
      glow: 30,
      slimFace: 40,
      bigEyes: 28,
      blush: 32,
      blushColor: '#f43f5e',
      lipstick: 60,
      lipstickColor: '#be123c',
      presetId: 'glamour',
    },
  },
  {
    id: 'fresh',
    name: 'Tươi tắn',
    description: 'Năng động rạng rỡ với tone cam đào ấm áp',
    tag: 'Summer',
    settings: {
      smooth: 40,
      whiten: 22,
      toneWarmth: 20,
      glow: 25,
      slimFace: 18,
      bigEyes: 15,
      blush: 35,
      blushColor: '#fb923c',
      lipstick: 40,
      lipstickColor: '#ea580c',
      presetId: 'fresh',
    },
  },
  {
    id: 'pale_snow',
    name: 'Da tuyết',
    description: 'Trắng sứ thanh khiết, nhấn mắt và môi đỏ anh đào',
    tag: 'Fair',
    settings: {
      smooth: 45,
      whiten: 60,
      toneWarmth: -15,
      glow: 30,
      slimFace: 20,
      bigEyes: 16,
      blush: 18,
      blushColor: '#fda4af',
      lipstick: 45,
      lipstickColor: '#b91c1c',
      presetId: 'pale_snow',
    },
  },
  {
    id: 'baby_skin',
    name: 'Da em bé',
    description: 'Xóa mờ mọi khuyết điểm, làn da mềm mịn không tì vết',
    tag: 'Smooth',
    settings: {
      smooth: 75,
      whiten: 25,
      toneWarmth: 12,
      glow: 40,
      slimFace: 12,
      bigEyes: 14,
      blush: 28,
      blushColor: '#fca5a5',
      lipstick: 20,
      lipstickColor: '#f43f5e',
      presetId: 'baby_skin',
    },
  },
  {
    id: 'bold_diva',
    name: 'Sắc sảo',
    description: 'Đường nét cằm V-line góc cạnh, thần thái sắc sảo đỉnh cao',
    tag: 'Bold',
    settings: {
      smooth: 45,
      whiten: 15,
      toneWarmth: 0,
      glow: 20,
      slimFace: 50,
      bigEyes: 32,
      blush: 25,
      blushColor: '#e11d48',
      lipstick: 70,
      lipstickColor: '#881337',
      presetId: 'bold_diva',
    },
  },
];

export const LIPSTICK_COLORS = [
  { name: 'Đỏ thuần', hex: '#e11d48' },
  { name: 'Đỏ cherry', hex: '#be123c' },
  { name: 'Đỏ rượu vang', hex: '#881337' },
  { name: 'Hồng đào', hex: '#fb7185' },
  { name: 'Hồng fuchsia', hex: '#ec4899' },
  { name: 'Cam cháy', hex: '#ea580c' },
  { name: 'Cam san hô', hex: '#f97316' },
  { name: 'Đỏ đất', hex: '#9f1239' },
  { name: 'Hồng đất', hex: '#c084fc' },
  { name: 'Nude đào', hex: '#fca5a5' },
];

export const BLUSH_COLORS = [
  { name: 'Hồng đào', hex: '#fb7185' },
  { name: 'Hồng phấn', hex: '#fda4af' },
  { name: 'Cam đào', hex: '#fb923c' },
  { name: 'San hô ngọt', hex: '#f472b6' },
  { name: 'Đỏ nhẹ', hex: '#f43f5e' },
  { name: 'Cam cháy', hex: '#ea580c' },
];

// Cache detected faces to prevent repetitive calculation on same canvas
const faceCache = new WeakMap<HTMLCanvasElement, DetectedFace[]>();

/**
 * Checks if a pixel RGB value falls within human skin spectrum
 */
function isSkinPixel(r: number, g: number, b: number): boolean {
  return (
    r > 75 &&
    g > 35 &&
    b > 20 &&
    r > g &&
    r > b &&
    Math.abs(r - g) > 10 &&
    Math.max(r, g, b) - Math.min(r, g, b) > 12
  );
}

/**
 * Applies high-fidelity Beauty Effects:
 * 1. Skin Smoothing (smart edge-preserving bilateral-like filter on skin mask)
 * 2. Skin Whitening & Rosy Tone Warmth
 * 3. Soft Dewy Glow (luminance blooming)
 * 4. Face Reshape (Slim chin / V-line & Enlarge eyes)
 * 5. Makeup (Blush on cheeks & Lipstick on lips)
 */
export async function applyBeautyEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  beauty: BeautySettings,
  providedFaces?: DetectedFace[]
) {
  if (width <= 0 || height <= 0) return;

  const hasAnyEffect =
    beauty.smooth > 0 ||
    beauty.whiten > 0 ||
    beauty.glow > 0 ||
    beauty.toneWarmth !== 0 ||
    beauty.slimFace > 0 ||
    beauty.bigEyes > 0 ||
    beauty.blush > 0 ||
    beauty.lipstick > 0;

  if (!hasAnyEffect) return;

  // 1. Detect or reuse faces for geometric operations (eyes, lips, cheeks, reshape)
  let faces = providedFaces;
  if (!faces || faces.length === 0) {
    const cached = faceCache.get(ctx.canvas);
    if (cached) {
      faces = cached;
    } else {
      faces = await detectFaces(ctx.canvas, width, height);
      faceCache.set(ctx.canvas, faces);
    }
  }

  // 2. Face Reshaping (Mesh / Area Pin Warp for V-line and Big Eyes)
  if ((beauty.slimFace > 0 || beauty.bigEyes > 0) && faces.length > 0) {
    applyFaceReshape(ctx, width, height, faces[0], beauty.slimFace, beauty.bigEyes);
  }

  // 3. Pixel-level skin processing: Smooth, Whiten, Tone, Glow
  if (beauty.smooth > 0 || beauty.whiten > 0 || beauty.toneWarmth !== 0 || beauty.glow > 0) {
    applySkinProcessing(ctx, width, height, beauty);
  }

  // 4. Makeup: Blush on cheeks & Lipstick on lips
  if ((beauty.blush > 0 || beauty.lipstick > 0) && faces.length > 0) {
    applyMakeup(ctx, width, height, faces[0], beauty);
  }
}

/**
 * High-performance edge-preserving skin smoothing & brightening
 */
function applySkinProcessing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  beauty: BeautySettings
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  const smoothLevel = beauty.smooth / 100; // 0 to 1
  const whitenLevel = beauty.whiten / 100; // 0 to 1
  const warmth = beauty.toneWarmth / 100;  // -0.5 to 0.5
  const glowLevel = beauty.glow / 100;     // 0 to 1

  // Create blurred copy for bilateral/surface blur blend
  let blurredData: Uint8ClampedArray | null = null;
  if (smoothLevel > 0 || glowLevel > 0) {
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = width;
    blurCanvas.height = height;
    const bCtx = blurCanvas.getContext('2d');
    if (bCtx) {
      bCtx.putImageData(imgData, 0, 0);
      const blurRadius = Math.max(2, Math.round(smoothLevel * 6 + (width / 500)));
      bCtx.filter = `blur(${blurRadius}px)`;
      bCtx.drawImage(blurCanvas, 0, 0);
      blurredData = bCtx.getImageData(0, 0, width, height).data;
    }
  }

  // Whitening constants
  const whitenLift = whitenLevel * 38;
  const whitenContrast = 1 + whitenLevel * 0.12;

  // Warmth shifts
  const rWarm = warmth > 0 ? warmth * 22 : warmth * 8;
  const gWarm = warmth > 0 ? warmth * 8 : warmth * 6;
  const bWarm = warmth < 0 ? -warmth * 24 : -warmth * 6;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const isSkin = isSkinPixel(r, g, b);

    // 1. Skin Smoothing (Bilateral blend on skin tones)
    if (isSkin && blurredData && smoothLevel > 0) {
      const br = blurredData[i];
      const bg = blurredData[i + 1];
      const bb = blurredData[i + 2];

      // Edge preserving weight: if difference between pixel and blur is too high, it's an edge (freckle border, eyelid, hair)
      const diff = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
      const edgeWeight = Math.max(0, 1 - diff / 110);
      const smoothAlpha = smoothLevel * 0.85 * edgeWeight;

      r = r * (1 - smoothAlpha) + br * smoothAlpha;
      g = g * (1 - smoothAlpha) + bg * smoothAlpha;
      b = b * (1 - smoothAlpha) + bb * smoothAlpha;
    }

    // 2. Soft Glow on highlights
    if (glowLevel > 0 && blurredData) {
      const br = blurredData[i];
      const bg = blurredData[i + 1];
      const bb = blurredData[i + 2];
      const lum = 0.299 * br + 0.587 * bg + 0.114 * bb;

      if (lum > 90) {
        const glowFactor = ((lum - 90) / 165) * glowLevel * 0.45;
        // Screen blend
        r = 255 - ((255 - r) * (255 - br * glowFactor)) / 255;
        g = 255 - ((255 - g) * (255 - bg * glowFactor)) / 255;
        b = 255 - ((255 - b) * (255 - bb * glowFactor)) / 255;
      }
    }

    // 3. Whitening (lifts midtones of skin while maintaining black levels)
    if (whitenLevel > 0 && isSkin) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const weight = Math.sin((lum / 255) * Math.PI); // Peak at midtones
      const lift = whitenLift * weight;

      r = (r - 128) * whitenContrast + 128 + lift;
      g = (g - 128) * whitenContrast + 128 + lift;
      b = (b - 128) * whitenContrast + 128 + lift * 0.95;
    }

    // 4. Tone Warmth & Rosy shift
    if (warmth !== 0 && isSkin) {
      r += rWarm;
      g += gWarm;
      b += bWarm;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Subtle V-Line Chin Slimming and Eye Enlargement via area deformation
 */
function applyFaceReshape(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  face: DetectedFace,
  slimFace: number,
  bigEyes: number
) {
  const lm = face.landmarks;
  if (!lm) return;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  tempCtx.drawImage(ctx.canvas, 0, 0);

  // 1. Slim Face / V-Line
  if (slimFace > 0) {
    const strength = (slimFace / 100) * 0.18;
    const chinY = face.y + face.height * 0.85;
    const chinX = face.x + face.width * 0.5;

    // Left jaw push inward
    const leftJawX = face.x + face.width * 0.18;
    const leftJawY = face.y + face.height * 0.72;
    const jawRadius = face.width * 0.32;

    applyRadialPinch(ctx, tempCanvas, leftJawX, leftJawY, chinX, chinY, jawRadius, strength);

    // Right jaw push inward
    const rightJawX = face.x + face.width * 0.82;
    const rightJawY = face.y + face.height * 0.72;
    applyRadialPinch(ctx, tempCanvas, rightJawX, rightJawY, chinX, chinY, jawRadius, strength);
  }

  // 2. Big Eyes Enlargement
  if (bigEyes > 0 && lm.leftEye && lm.rightEye) {
    const eyeScale = 1 + (bigEyes / 100) * 0.22;
    const eyeRadius = face.width * 0.14;

    // Enlarge left eye
    applyRadialExpand(ctx, tempCanvas, lm.leftEye.x, lm.leftEye.y, eyeRadius, eyeScale);
    // Enlarge right eye
    applyRadialExpand(ctx, tempCanvas, lm.rightEye.x, lm.rightEye.y, eyeRadius, eyeScale);
  }
}

/**
 * Radial pinch/pull towards target
 */
function applyRadialPinch(
  ctx: CanvasRenderingContext2D,
  srcCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  targetX: number,
  targetY: number,
  radius: number,
  strength: number
) {
  const rInt = Math.round(radius);
  const minX = Math.max(0, Math.floor(x - rInt));
  const minY = Math.max(0, Math.floor(y - rInt));
  const w = Math.min(srcCanvas.width - minX, rInt * 2);
  const h = Math.min(srcCanvas.height - minY, rInt * 2);

  if (w <= 0 || h <= 0) return;

  const dx = targetX - x;
  const dy = targetY - y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const moveX = (dx / dist) * radius * strength;
  const moveY = (dy / dist) * radius * strength;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(srcCanvas, minX, minY, w, h, minX + moveX * 0.5, minY + moveY * 0.5, w, h);
  ctx.restore();
}

/**
 * Radial eye expansion with soft feathered edge
 */
function applyRadialExpand(
  ctx: CanvasRenderingContext2D,
  srcCanvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  radius: number,
  scale: number
) {
  const rInt = Math.round(radius);
  const minX = Math.max(0, Math.floor(centerX - rInt));
  const minY = Math.max(0, Math.floor(centerY - rInt));
  const w = Math.min(srcCanvas.width - minX, rInt * 2);
  const h = Math.min(srcCanvas.height - minY, rInt * 2);

  if (w <= 0 || h <= 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();

  const newW = w * scale;
  const newH = h * scale;
  const newX = centerX - newW / 2;
  const newY = centerY - newH / 2;

  ctx.globalAlpha = 0.85;
  ctx.drawImage(srcCanvas, minX, minY, w, h, newX, newY, newW, newH);
  ctx.restore();
}

/**
 * Makeup: Blush on cheeks & Lipstick on lips
 */
function applyMakeup(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  face: DetectedFace,
  beauty: BeautySettings
) {
  const lm = face.landmarks;
  if (!lm) return;

  // 1. Blush on Cheeks
  if (beauty.blush > 0 && lm.leftCheek && lm.rightCheek) {
    const blushAlpha = (beauty.blush / 100) * 0.38;
    const cheekRadius = face.width * 0.16;

    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';

    // Left cheek
    const gradLeft = ctx.createRadialGradient(
      lm.leftCheek.x,
      lm.leftCheek.y,
      cheekRadius * 0.15,
      lm.leftCheek.x,
      lm.leftCheek.y,
      cheekRadius
    );
    gradLeft.addColorStop(0, hexToRgba(beauty.blushColor, blushAlpha));
    gradLeft.addColorStop(0.5, hexToRgba(beauty.blushColor, blushAlpha * 0.6));
    gradLeft.addColorStop(1, hexToRgba(beauty.blushColor, 0));

    ctx.fillStyle = gradLeft;
    ctx.beginPath();
    ctx.arc(lm.leftCheek.x, lm.leftCheek.y, cheekRadius, 0, Math.PI * 2);
    ctx.fill();

    // Right cheek
    const gradRight = ctx.createRadialGradient(
      lm.rightCheek.x,
      lm.rightCheek.y,
      cheekRadius * 0.15,
      lm.rightCheek.x,
      lm.rightCheek.y,
      cheekRadius
    );
    gradRight.addColorStop(0, hexToRgba(beauty.blushColor, blushAlpha));
    gradRight.addColorStop(0.5, hexToRgba(beauty.blushColor, blushAlpha * 0.6));
    gradRight.addColorStop(1, hexToRgba(beauty.blushColor, 0));

    ctx.fillStyle = gradRight;
    ctx.beginPath();
    ctx.arc(lm.rightCheek.x, lm.rightCheek.y, cheekRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 2. Lipstick on Lips
  if (beauty.lipstick > 0 && lm.mouth) {
    const lipAlpha = (beauty.lipstick / 100) * 0.65;
    const lipW = face.width * 0.24;
    const lipH = face.height * 0.11;

    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';

    const gradLip = ctx.createRadialGradient(
      lm.mouth.x,
      lm.mouth.y,
      lipH * 0.2,
      lm.mouth.x,
      lm.mouth.y,
      lipW * 0.65
    );
    gradLip.addColorStop(0, hexToRgba(beauty.lipstickColor, lipAlpha));
    gradLip.addColorStop(0.55, hexToRgba(beauty.lipstickColor, lipAlpha * 0.75));
    gradLip.addColorStop(1, hexToRgba(beauty.lipstickColor, 0));

    ctx.fillStyle = gradLip;
    ctx.beginPath();
    ctx.ellipse(lm.mouth.x, lm.mouth.y, lipW * 0.6, lipH * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Extra multiply touch for richer color depth in center
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = (beauty.lipstick / 100) * 0.25;
    ctx.fillStyle = beauty.lipstickColor;
    ctx.beginPath();
    ctx.ellipse(lm.mouth.x, lm.mouth.y, lipW * 0.45, lipH * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Converts Hex string to rgba() CSS color
 */
function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}
