import type { BeautySettings, DetectedFace } from '../types';
import { detectFaces } from './faceDetection';

export const DEFAULT_BEAUTY_SETTINGS: BeautySettings = {
  smooth: 0,
  whiten: 0,
  toneWarmth: 0,
  glow: 0,
  slimFace: 0,
  bigEyes: 0,
  darkCircles: 0,
  eyeBright: 0,
  noseSlim: 0,
  highlighter: 0,
  teethWhiten: 0,
  blemishSmooth: 0,
  bodyReshape: 0,
  blush: 0,
  blushColor: '#f43f5e',
  lipstick: 0,
  lipstickColor: '#e11d48',
  lipstickGloss: 0,
  sparkleDust: 0,
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
    id: 'snow_baby',
    name: 'SNOW Baby Face',
    description: 'Phong cách máy ảnh SNOW chuẩn Hàn: Da sứ căng mọng trong veo, má ửng hồng đào, mắt to tự nhiên',
    tag: 'SNOW Best',
    settings: {
      smooth: 68,
      whiten: 42,
      toneWarmth: 10,
      glow: 55,
      slimFace: 32,
      bigEyes: 30,
      darkCircles: 55,
      eyeBright: 50,
      noseSlim: 28,
      highlighter: 45,
      teethWhiten: 48,
      blemishSmooth: 45,
      bodyReshape: 20,
      blush: 40,
      blushColor: '#fb7185',
      lipstick: 50,
      lipstickColor: '#f43f5e',
      lipstickGloss: 60,
      sparkleDust: 35,
      presetId: 'snow_baby',
    },
  },
  {
    id: 'snow_korean_idol',
    name: 'SNOW K-Idol Glam',
    description: 'Thần thái idol K-Pop: Bừng sáng sân khấu, làn da không tì vết, mắt bắt sáng cuốn hút',
    tag: 'SNOW Idol',
    settings: {
      smooth: 72,
      whiten: 46,
      toneWarmth: 6,
      glow: 62,
      slimFace: 38,
      bigEyes: 34,
      darkCircles: 60,
      eyeBright: 60,
      noseSlim: 32,
      highlighter: 55,
      teethWhiten: 55,
      blemishSmooth: 50,
      bodyReshape: 22,
      blush: 48,
      blushColor: '#fda4af',
      lipstick: 58,
      lipstickColor: '#e11d48',
      lipstickGloss: 65,
      sparkleDust: 45,
      presetId: 'snow_korean_idol',
    },
  },
  {
    id: 'meitu_douyin',
    name: 'Douyin Nữ Thần',
    description: 'Hot trend Douyin / Tiểu Hồng Thư: da trắng phát sáng, mắt to long lanh, môi mọng cherry',
    tag: 'Douyin Hot',
    settings: {
      smooth: 70,
      whiten: 48,
      toneWarmth: 12,
      glow: 60,
      slimFace: 40,
      bigEyes: 35,
      darkCircles: 60,
      eyeBright: 55,
      noseSlim: 35,
      highlighter: 55,
      teethWhiten: 50,
      blemishSmooth: 45,
      bodyReshape: 25,
      blush: 45,
      blushColor: '#fb7185',
      lipstick: 55,
      lipstickColor: '#be123c',
      lipstickGloss: 65,
      sparkleDust: 40,
      presetId: 'meitu_douyin',
    },
  },
  {
    id: 'meitu_doll',
    name: 'Búp Bê Meitu',
    description: 'Phong cách Meitu kinh điển: da sứ mịn màng, mắt to long lanh, môi mọng đào',
    tag: 'Meitu Hot',
    settings: {
      smooth: 65,
      whiten: 40,
      toneWarmth: 8,
      glow: 45,
      slimFace: 35,
      bigEyes: 30,
      darkCircles: 50,
      eyeBright: 45,
      noseSlim: 30,
      highlighter: 40,
      teethWhiten: 45,
      blemishSmooth: 40,
      bodyReshape: 20,
      blush: 35,
      blushColor: '#fb7185',
      lipstick: 45,
      lipstickColor: '#f43f5e',
      lipstickGloss: 50,
      sparkleDust: 30,
      presetId: 'meitu_doll',
    },
  },
  {
    id: 'meitu_vintage_film',
    name: 'Điện Ảnh 90s',
    description: 'Mỹ nhân Hong Kong thập niên 90: môi đỏ nhung kiêu kỳ, mắt sâu hút hồn',
    tag: 'Hong Kong 90s',
    settings: {
      smooth: 45,
      whiten: 20,
      toneWarmth: -5,
      glow: 25,
      slimFace: 25,
      bigEyes: 18,
      darkCircles: 40,
      eyeBright: 35,
      noseSlim: 25,
      highlighter: 30,
      teethWhiten: 35,
      blemishSmooth: 30,
      bodyReshape: 15,
      blush: 30,
      blushColor: '#ea580c',
      lipstick: 70,
      lipstickColor: '#881337',
      lipstickGloss: 25,
      sparkleDust: 0,
      presetId: 'meitu_vintage_film',
    },
  },
  {
    id: 'meitu_anime_star',
    name: 'Anime Kawaii Star',
    description: 'Mắt búp bê long lanh, bụi sao lấp lánh như nhân vật truyện tranh bước ra đời thực',
    tag: 'Anime Kawaii',
    settings: {
      smooth: 75,
      whiten: 45,
      toneWarmth: 15,
      glow: 55,
      slimFace: 45,
      bigEyes: 45,
      darkCircles: 65,
      eyeBright: 70,
      noseSlim: 35,
      highlighter: 60,
      teethWhiten: 55,
      blemishSmooth: 50,
      bodyReshape: 30,
      blush: 60,
      blushColor: '#fda4af',
      lipstick: 50,
      lipstickColor: '#ec4899',
      lipstickGloss: 75,
      sparkleDust: 70,
      presetId: 'meitu_anime_star',
    },
  },
  {
    id: 'meitu_sakura',
    name: 'Hoa Anh Đào',
    description: 'Tone hồng pastel mộng mơ, má ửng phớt hoa đào và làn da trong suốt',
    tag: 'Sakura',
    settings: {
      smooth: 55,
      whiten: 35,
      toneWarmth: 15,
      glow: 50,
      slimFace: 20,
      bigEyes: 22,
      darkCircles: 45,
      eyeBright: 35,
      noseSlim: 20,
      highlighter: 45,
      blush: 50,
      blushColor: '#f472b6',
      lipstick: 50,
      lipstickColor: '#ec4899',
      lipstickGloss: 60,
      sparkleDust: 45,
      presetId: 'meitu_sakura',
    },
  },
  {
    id: 'meitu_stage',
    name: 'Idol Sân Khấu',
    description: 'Thần thái idol K-Pop: cằm V-line sắc nét, mắt sáng bắt đèn sân khấu',
    tag: 'Idol',
    settings: {
      smooth: 60,
      whiten: 30,
      toneWarmth: 0,
      glow: 35,
      slimFace: 45,
      bigEyes: 25,
      darkCircles: 55,
      eyeBright: 60,
      noseSlim: 40,
      highlighter: 60,
      blush: 30,
      blushColor: '#e11d48',
      lipstick: 65,
      lipstickColor: '#be123c',
      lipstickGloss: 40,
      sparkleDust: 55,
      presetId: 'meitu_stage',
    },
  },
  {
    id: 'meitu_cleangirl',
    name: 'Nữ Thần Mộc',
    description: 'Làn da dewy glass-skin bóng khỏe tự nhiên, môi mọng như không trang điểm',
    tag: 'Clean Girl',
    settings: {
      smooth: 40,
      whiten: 20,
      toneWarmth: 5,
      glow: 60,
      slimFace: 15,
      bigEyes: 12,
      darkCircles: 40,
      eyeBright: 30,
      noseSlim: 15,
      highlighter: 35,
      blush: 20,
      blushColor: '#fca5a5',
      lipstick: 30,
      lipstickColor: '#f43f5e',
      lipstickGloss: 70,
      sparkleDust: 0,
      presetId: 'meitu_cleangirl',
    },
  },
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
      darkCircles: 30,
      eyeBright: 20,
      noseSlim: 10,
      highlighter: 15,
      blush: 20,
      blushColor: '#fb7185',
      lipstick: 25,
      lipstickColor: '#f43f5e',
      lipstickGloss: 25,
      sparkleDust: 0,
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
      darkCircles: 40,
      eyeBright: 35,
      noseSlim: 20,
      highlighter: 45,
      blush: 38,
      blushColor: '#f472b6',
      lipstick: 45,
      lipstickColor: '#ec4899',
      lipstickGloss: 50,
      sparkleDust: 0,
      presetId: 'korean_glow',
    },
  },
  {
    id: 'pale_snow',
    name: 'Bạch Tuyết',
    description: 'Trắng sứ thanh khiết, nhấn mắt và môi đỏ anh đào',
    tag: 'Fair',
    settings: {
      smooth: 50,
      whiten: 65,
      toneWarmth: -15,
      glow: 30,
      slimFace: 20,
      bigEyes: 16,
      darkCircles: 50,
      eyeBright: 30,
      noseSlim: 25,
      highlighter: 30,
      blush: 18,
      blushColor: '#fda4af',
      lipstick: 50,
      lipstickColor: '#b91c1c',
      lipstickGloss: 35,
      sparkleDust: 20,
      presetId: 'pale_snow',
    },
  },
  {
    id: 'baby_skin',
    name: 'Da em bé',
    description: 'Xóa mờ mọi khuyết điểm, làn da mềm mịn không tì vết',
    tag: 'Smooth',
    settings: {
      smooth: 80,
      whiten: 28,
      toneWarmth: 12,
      glow: 40,
      slimFace: 12,
      bigEyes: 14,
      darkCircles: 60,
      eyeBright: 25,
      noseSlim: 10,
      highlighter: 20,
      blush: 28,
      blushColor: '#fca5a5',
      lipstick: 20,
      lipstickColor: '#f43f5e',
      lipstickGloss: 30,
      sparkleDust: 0,
      presetId: 'baby_skin',
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
    (beauty.darkCircles ?? 0) > 0 ||
    (beauty.eyeBright ?? 0) > 0 ||
    (beauty.noseSlim ?? 0) > 0 ||
    (beauty.highlighter ?? 0) > 0 ||
    (beauty.teethWhiten ?? 0) > 0 ||
    (beauty.blemishSmooth ?? 0) > 0 ||
    (beauty.bodyReshape ?? 0) > 0 ||
    (beauty.sparkleDust ?? 0) > 0 ||
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

  // 2. Body Reshaping / Leg Lengthening Meitu
  if ((beauty.bodyReshape ?? 0) > 0) {
    applyBodyReshape(ctx, width, height, beauty.bodyReshape ?? 0);
  }

  // 3. Face Reshaping (Mesh / Area Pin Warp for V-line and Big Eyes)
  if ((beauty.slimFace > 0 || beauty.bigEyes > 0) && faces.length > 0) {
    applyFaceReshape(ctx, width, height, faces[0], beauty.slimFace, beauty.bigEyes);
  }

  // 4. Blemish & Acne Removal
  if ((beauty.blemishSmooth ?? 0) > 0) {
    applyBlemishRemoval(ctx, width, height, beauty.blemishSmooth ?? 0);
  }

  // 5. Pixel-level skin processing: Smooth, Whiten, Tone, Glow
  if (beauty.smooth > 0 || beauty.whiten > 0 || beauty.toneWarmth !== 0 || beauty.glow > 0) {
    applySkinProcessing(ctx, width, height, beauty);
  }

  // 6. Meitu Eye Area: Dark Circles Reduction & Eye Brighten
  if (((beauty.darkCircles ?? 0) > 0 || (beauty.eyeBright ?? 0) > 0) && faces.length > 0) {
    applyEyeAreaEffects(ctx, faces[0], beauty.darkCircles ?? 0, beauty.eyeBright ?? 0);
  }

  // 7. Meitu Teeth Whitening
  if ((beauty.teethWhiten ?? 0) > 0 && faces.length > 0) {
    applyTeethWhitening(ctx, faces[0], beauty.teethWhiten ?? 0);
  }

  // 8. Meitu Nose Slimming & Pearl Highlighter
  if (((beauty.noseSlim ?? 0) > 0 || (beauty.highlighter ?? 0) > 0) && faces.length > 0) {
    applyContourAndHighlight(ctx, faces[0], beauty.noseSlim ?? 0, beauty.highlighter ?? 0);
  }

  // 9. Makeup: Blush on cheeks & Lipstick with Jelly Gloss on lips
  if ((beauty.blush > 0 || beauty.lipstick > 0) && faces.length > 0) {
    applyMakeup(ctx, width, height, faces[0], beauty);
  }

  // 10. Meitu Kira-Kira Sparkle Dust
  if ((beauty.sparkleDust ?? 0) > 0) {
    applySparkleDust(ctx, width, height, beauty.sparkleDust ?? 0, faces.length > 0 ? faces[0] : undefined);
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
 * Meitu Teeth Whitening: Targets mouth cavity and selectively brightens and desaturates yellow tones
 */
function applyTeethWhitening(ctx: CanvasRenderingContext2D, face: DetectedFace, intensity: number) {
  const lm = face.landmarks;
  if (!lm || !lm.mouth || intensity <= 0) return;

  const mouthX = Math.round(lm.mouth.x);
  const mouthY = Math.round(lm.mouth.y);
  const mouthRadiusX = Math.round(face.width * 0.16);
  const mouthRadiusY = Math.round(face.height * 0.08);

  const startX = Math.max(0, mouthX - mouthRadiusX);
  const startY = Math.max(0, mouthY - mouthRadiusY);
  const patchW = Math.min(ctx.canvas.width - startX, mouthRadiusX * 2);
  const patchH = Math.min(ctx.canvas.height - startY, mouthRadiusY * 2);
  if (patchW <= 0 || patchH <= 0) return;

  const imgData = ctx.getImageData(startX, startY, patchW, patchH);
  const d = imgData.data;
  const level = intensity / 100;

  for (let y = 0; y < patchH; y++) {
    for (let x = 0; x < patchW; x++) {
      const dx = (x - mouthRadiusX) / mouthRadiusX;
      const dy = (y - mouthRadiusY) / mouthRadiusY;
      const distSq = dx * dx + dy * dy;

      if (distSq < 1) {
        const falloff = (1 - distSq) * level;
        const idx = (y * patchW + x) * 4;
        let r = d[idx];
        let g = d[idx + 1];
        let b = d[idx + 2];

        // Teeth detection: brighter than deep mouth shadow, yellowish or off-white
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 70 && r >= g && g >= b - 20) {
          // Whiten & reduce yellow stain (lift blue, equalize red/green)
          const boost = (255 - lum) * falloff * 0.45;
          const avg = (r + g + b) / 3;
          r = r + (avg - r) * falloff * 0.6 + boost;
          g = g + (avg - g) * falloff * 0.5 + boost;
          b = b + (avg - b) * falloff * 0.8 + boost * 1.1;

          d[idx] = Math.min(255, Math.max(0, r));
          d[idx + 1] = Math.min(255, Math.max(0, g));
          d[idx + 2] = Math.min(255, Math.max(0, b));
        }
      }
    }
  }
  ctx.putImageData(imgData, startX, startY);
}

/**
 * Meitu Blemish & Acne Concealer: Smooths sharp, high-contrast skin spots
 */
function applyBlemishRemoval(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
) {
  if (intensity <= 0) return;
  const level = intensity / 100;

  // Create subtle median/spot blur overlay
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = width;
  blurCanvas.height = height;
  const bCtx = blurCanvas.getContext('2d');
  if (!bCtx) return;

  bCtx.drawImage(ctx.canvas, 0, 0);
  const blurPx = Math.max(2, Math.round(level * 5 + 1));
  bCtx.filter = `blur(${blurPx}px)`;
  bCtx.drawImage(blurCanvas, 0, 0);

  ctx.save();
  ctx.globalAlpha = level * 0.4;
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(blurCanvas, 0, 0);
  ctx.restore();
}

/**
 * Meitu Body Reshape: Subtle Golden-Ratio Leg Lengthening and Waist Contouring
 */
function applyBodyReshape(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
) {
  if (intensity <= 0) return;
  const stretchRatio = 1 + (intensity / 100) * 0.08; // subtle up to 8% vertical elegance

  const temp = document.createElement('canvas');
  temp.width = width;
  temp.height = height;
  const tCtx = temp.getContext('2d');
  if (!tCtx) return;
  tCtx.drawImage(ctx.canvas, 0, 0);

  const splitY = Math.round(height * 0.45); // Keep head & upper torso intact
  const lowerH = height - splitY;
  const targetLowerH = Math.min(height - splitY, Math.round(lowerH * stretchRatio));

  ctx.save();
  // Clear and re-render lower half with progressive vertical stretch
  ctx.clearRect(0, splitY, width, lowerH);
  ctx.drawImage(temp, 0, 0, width, splitY, 0, 0, width, splitY);
  ctx.drawImage(temp, 0, splitY, width, lowerH, 0, splitY, width, targetLowerH);
  ctx.restore();
}

/**
 * Eye Area Effects: Dark circle reduction & iris brightening
 */
function applyEyeAreaEffects(
  ctx: CanvasRenderingContext2D,
  face: DetectedFace,
  darkCircles: number,
  eyeBright: number
) {
  const lm = face.landmarks;
  if (!lm) return;

  const eyes = [lm.leftEye, lm.rightEye].filter(Boolean) as { x: number; y: number }[];
  if (eyes.length === 0) return;

  const eyeRadius = face.width * 0.12;

  // Dark Circles Removal: soft brightening beneath eyes
  if (darkCircles > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const dcAlpha = (darkCircles / 100) * 0.35;

    eyes.forEach((eye) => {
      const underEyeY = eye.y + eyeRadius * 0.55;
      const grad = ctx.createRadialGradient(eye.x, underEyeY, eyeRadius * 0.2, eye.x, underEyeY, eyeRadius * 0.85);
      grad.addColorStop(0, `rgba(255, 235, 225, ${dcAlpha})`);
      grad.addColorStop(0.6, `rgba(255, 235, 225, ${dcAlpha * 0.5})`);
      grad.addColorStop(1, 'rgba(255, 235, 225, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(eye.x, underEyeY, eyeRadius * 0.8, eyeRadius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Eye Brightening: crisp radiance in center of iris
  if (eyeBright > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'color-dodge';
    const ebAlpha = (eyeBright / 100) * 0.4;

    eyes.forEach((eye) => {
      const grad = ctx.createRadialGradient(eye.x, eye.y, 1, eye.x, eye.y, eyeRadius * 0.45);
      grad.addColorStop(0, `rgba(255, 255, 255, ${ebAlpha})`);
      grad.addColorStop(0.5, `rgba(240, 245, 255, ${ebAlpha * 0.6})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, eyeRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}

/**
 * Nose Slimming & Pearl Highlighter
 */
function applyContourAndHighlight(
  ctx: CanvasRenderingContext2D,
  face: DetectedFace,
  noseSlim: number,
  highlighter: number
) {
  const lm = face.landmarks;
  if (!lm) return;

  const noseX = lm.nose ? lm.nose.x : face.x + face.width * 0.5;
  const noseY = lm.nose ? lm.nose.y : face.y + face.height * 0.55;
  const noseW = face.width * 0.16;
  const noseH = face.height * 0.26;

  // Nose Slimming (soft contour shadows on nose bridge sides)
  if (noseSlim > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const shadowAlpha = (noseSlim / 100) * 0.22;

    // Left nose bridge shadow
    const leftShadow = ctx.createLinearGradient(noseX - noseW * 0.6, noseY, noseX - noseW * 0.2, noseY);
    leftShadow.addColorStop(0, `rgba(120, 80, 70, ${shadowAlpha})`);
    leftShadow.addColorStop(1, 'rgba(120, 80, 70, 0)');
    ctx.fillStyle = leftShadow;
    ctx.fillRect(noseX - noseW * 0.7, noseY - noseH * 0.6, noseW * 0.5, noseH * 1.2);

    // Right nose bridge shadow
    const rightShadow = ctx.createLinearGradient(noseX + noseW * 0.2, noseY, noseX + noseW * 0.6, noseY);
    rightShadow.addColorStop(0, 'rgba(120, 80, 70, 0)');
    rightShadow.addColorStop(1, `rgba(120, 80, 70, ${shadowAlpha})`);
    ctx.fillStyle = rightShadow;
    ctx.fillRect(noseX + noseW * 0.2, noseY - noseH * 0.6, noseW * 0.5, noseH * 1.2);

    ctx.restore();
  }

  // Pearl Highlighter (nose bridge + cheekbone points)
  if (highlighter > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const hlAlpha = (highlighter / 100) * 0.45;

    // Nose bridge highlight
    const noseGlow = ctx.createRadialGradient(noseX, noseY, 2, noseX, noseY, noseW * 0.35);
    noseGlow.addColorStop(0, `rgba(255, 250, 245, ${hlAlpha})`);
    noseGlow.addColorStop(1, 'rgba(255, 250, 245, 0)');
    ctx.fillStyle = noseGlow;
    ctx.beginPath();
    ctx.ellipse(noseX, noseY - noseH * 0.1, noseW * 0.15, noseH * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheekbone highlighters
    if (lm.leftCheek && lm.rightCheek) {
      const cheekRadius = face.width * 0.12;
      [lm.leftCheek, lm.rightCheek].forEach((cheek) => {
        const cheekHl = ctx.createRadialGradient(cheek.x, cheek.y - cheekRadius * 0.3, 1, cheek.x, cheek.y - cheekRadius * 0.3, cheekRadius * 0.7);
        cheekHl.addColorStop(0, `rgba(255, 245, 240, ${hlAlpha * 0.8})`);
        cheekHl.addColorStop(1, 'rgba(255, 245, 240, 0)');
        ctx.fillStyle = cheekHl;
        ctx.beginPath();
        ctx.arc(cheek.x, cheek.y - cheekRadius * 0.3, cheekRadius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }
}

/**
 * Meitu Kira-Kira Sparkle Dust
 */
function applySparkleDust(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number,
  face?: DetectedFace
) {
  if (intensity <= 0) return;
  const count = Math.round((intensity / 100) * 24);
  const alpha = Math.min(1, (intensity / 100) * 0.85);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const anchorX = face ? face.x + face.width * 0.5 : width * 0.5;
  const anchorY = face ? face.y + face.height * 0.4 : height * 0.4;
  const spreadX = face ? face.width * 0.65 : width * 0.4;
  const spreadY = face ? face.height * 0.5 : height * 0.35;

  for (let i = 0; i < count; i++) {
    const seed = i * 137.5;
    const px = anchorX + (Math.sin(seed) * spreadX * 0.95);
    const py = anchorY + (Math.cos(seed * 1.3) * spreadY * 0.85);
    const size = 3 + (i % 5) * 2.5;

    ctx.fillStyle = i % 2 === 0 ? `rgba(255, 245, 210, ${alpha})` : `rgba(255, 220, 240, ${alpha * 0.9})`;

    ctx.beginPath();
    ctx.moveTo(px, py - size);
    ctx.quadraticCurveTo(px, py, px + size, py);
    ctx.quadraticCurveTo(px, py, px, py + size);
    ctx.quadraticCurveTo(px, py, px - size, py);
    ctx.quadraticCurveTo(px, py, px, py - size);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
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
