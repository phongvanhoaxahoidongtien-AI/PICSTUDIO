/**
 * SNOW Camera Live AR Stickers & Filter Effects
 * 100% Client-side, Real-time 60fps Canvas 2D Rendering
 */

import type { DetectedFace } from '../types';

export type SnowArEffect =
  | 'none'
  | 'cute_cat'
  | 'puppy_dog'
  | 'sparkle_crown'
  | 'blushing_bear'
  | 'heart_blush'
  | 'kira_stars'
  | 'angel_halo'
  | 'bunny_ears'
  | 'y2k_stars';

export type SnowFilterTone =
  | 'none'
  | 'snow_peach'
  | 'snow_milk'
  | 'snow_kirakira'
  | 'snow_y2k'
  | 'snow_kpop'
  | 'snow_softblur'
  | 'snow_vintage90s'
  | 'snow_dewy'
  | 'snow_cherry';

export interface SnowArStickerOption {
  id: SnowArEffect;
  name: string;
  emoji: string;
}

export const SNOW_AR_STICKERS: SnowArStickerOption[] = [
  { id: 'none', name: 'Tự nhiên', emoji: '✨' },
  { id: 'cute_cat', name: 'Tai Mèo', emoji: '🐱' },
  { id: 'puppy_dog', name: 'Cún Con', emoji: '🐶' },
  { id: 'sparkle_crown', name: 'Vương Miện', emoji: '👑' },
  { id: 'blushing_bear', name: 'Gấu Nâu', emoji: '🐻' },
  { id: 'heart_blush', name: 'Tim Má Hồng', emoji: '💕' },
  { id: 'kira_stars', name: 'Kira Lấp Lánh', emoji: '✨' },
  { id: 'angel_halo', name: 'Thiên Thần', emoji: '👼' },
  { id: 'bunny_ears', name: 'Tai Thỏ', emoji: '🐰' },
  { id: 'y2k_stars', name: 'Y2K Sao', emoji: '⭐' },
];

export const SNOW_FILTERS = [
  { id: 'none', name: 'Bình thường', desc: 'Tone tự nhiên' },
  { id: 'snow_peach', name: 'Baby Peach', desc: 'Má hồng đào, ngọt ngào' },
  { id: 'snow_milk', name: 'Milk Glass', desc: 'Trắng sứ trong trẻo' },
  { id: 'snow_dewy', name: 'Glass Dewy', desc: 'Căng bóng sương mai Hàn Quốc' },
  { id: 'snow_cherry', name: 'Cherry Blossom', desc: 'Hoa anh đào phớt hồng' },
  { id: 'snow_kirakira', name: 'Kira Shimmer', desc: 'Lấp lánh sương mai' },
  { id: 'snow_vintage90s', name: 'Film 1998', desc: 'Tone máy ảnh phim ấm áp' },
  { id: 'snow_y2k', name: 'Y2K Retro', desc: 'Màu phim hoài niệm 2000s' },
  { id: 'snow_kpop', name: 'K-Pop Idol', desc: 'Bừng sáng rực rỡ' },
  { id: 'snow_softblur', name: 'Soft Mood', desc: 'Mờ sương thơ mộng' },
];

/**
 * Applies SNOW color filter effects live to canvas
 */
export function applySnowFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filterId: SnowFilterTone
) {
  if (filterId === 'none') return;

  ctx.save();

  if (filterId === 'snow_peach') {
    // Soft peach/pink warmth & delicate bloom
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(255, 175, 189, 0.35)';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 235, 238, 0.12)';
    ctx.fillRect(0, 0, width, height);
  } else if (filterId === 'snow_milk') {
    // Ultra bright, clear porcelain skin
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(235, 245, 255, 0.28)';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, width, height);
  } else if (filterId === 'snow_kirakira') {
    // Subtle pastel glow
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 240, 245, 0.2)';
    ctx.fillRect(0, 0, width, height);
  } else if (filterId === 'snow_y2k') {
    // 90s film tone with golden highlights
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(255, 248, 220, 0.22)';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(218, 165, 32, 0.25)';
    ctx.fillRect(0, 0, width, height);
  } else if (filterId === 'snow_kpop') {
    // Saturated high-contrast idol look
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 220, 230, 0.18)';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 245, 240, 0.15)';
    ctx.fillRect(0, 0, width, height);
  } else if (filterId === 'snow_softblur') {
    // Dreamy soft focus
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(240, 230, 245, 0.3)';
    ctx.fillRect(0, 0, width, height);
  } else if (filterId === 'snow_vintage90s') {
    // Warm retro 90s film tone with golden warmth
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(255, 235, 205, 0.2)';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(245, 175, 110, 0.28)';
    ctx.fillRect(0, 0, width, height);
  } else if (filterId === 'snow_dewy') {
    // Ultra luminous Korean glass skin glow
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(220, 245, 255, 0.25)';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, width, height);
  } else if (filterId === 'snow_cherry') {
    // Vibrant blossom pink blush
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 215, 230, 0.24)';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 185, 210, 0.18)';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

/**
 * Draws real-time AR face stickers anchored to face detection or center selfie position
 */
export function drawSnowArSticker(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  effect: SnowArEffect,
  detectedFace?: DetectedFace
) {
  if (effect === 'none') return;

  ctx.save();

  // Face coordinates or fallback to centered selfie proportions
  let headX = canvasW * 0.5;
  let headY = canvasH * 0.38;
  let faceW = canvasW * 0.45;
  let faceH = canvasH * 0.45;

  if (detectedFace) {
    headX = detectedFace.x + detectedFace.width / 2;
    headY = detectedFace.y + detectedFace.height / 2;
    faceW = detectedFace.width;
    faceH = detectedFace.height;
  }

  const scale = faceW / 240;

  if (effect === 'cute_cat') {
    // 1. Cute Cat Ears on top of head
    const earY = headY - faceH * 0.55;
    const earDist = faceW * 0.38;
    const earSize = 46 * scale;

    ctx.save();
    // Left ear
    drawCatEar(ctx, headX - earDist, earY, earSize, -0.2);
    // Right ear
    drawCatEar(ctx, headX + earDist, earY, earSize, 0.2);

    // Cute pink nose
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(headX, headY + 10 * scale, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers (left & right)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.lineCap = 'round';

    // Left whiskers
    drawWhisker(ctx, headX - 16 * scale, headY + 8 * scale, -40 * scale, -4 * scale);
    drawWhisker(ctx, headX - 16 * scale, headY + 14 * scale, -38 * scale, 6 * scale);

    // Right whiskers
    drawWhisker(ctx, headX + 16 * scale, headY + 8 * scale, 40 * scale, -4 * scale);
    drawWhisker(ctx, headX + 16 * scale, headY + 14 * scale, 38 * scale, 6 * scale);

    // Cheeks blush
    drawCheekBlush(ctx, headX - 55 * scale, headY + 22 * scale, 22 * scale);
    drawCheekBlush(ctx, headX + 55 * scale, headY + 22 * scale, 22 * scale);
    ctx.restore();
  } else if (effect === 'puppy_dog') {
    // Cute puppy floppy ears & wet black nose & tongue
    const earY = headY - faceH * 0.42;
    const earDist = faceW * 0.4;
    const earW = 28 * scale;
    const earH = 68 * scale;

    ctx.save();
    // Floppy ears
    drawPuppyEar(ctx, headX - earDist, earY, earW, earH, -0.22);
    drawPuppyEar(ctx, headX + earDist, earY, earW, earH, 0.22);

    // Shiny black puppy nose
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.ellipse(headX, headY + 12 * scale, 9 * scale, 6.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(headX - 2.5 * scale, headY + 10 * scale, 2.5 * scale, 1.5 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink tongue
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(headX, headY + 24 * scale, 8 * scale, 10 * scale, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(headX, headY + 18 * scale);
    ctx.lineTo(headX, headY + 28 * scale);
    ctx.stroke();

    // Rosy cheeks
    drawCheekBlush(ctx, headX - 52 * scale, headY + 20 * scale, 24 * scale);
    drawCheekBlush(ctx, headX + 52 * scale, headY + 20 * scale, 24 * scale);
    ctx.restore();
  } else if (effect === 'sparkle_crown') {
    // Crystal Queen Tiara on head
    const crownY = headY - faceH * 0.58;
    const crownW = 80 * scale;
    const crownH = 36 * scale;

    drawCrown(ctx, headX, crownY, crownW, crownH);

    // Sparkles shimmering around crown
    drawSparkleStar(ctx, headX - crownW * 0.6, crownY - 10 * scale, 12 * scale, '#ffd700');
    drawSparkleStar(ctx, headX + crownW * 0.6, crownY - 8 * scale, 14 * scale, '#ffd700');
    drawSparkleStar(ctx, headX, crownY - crownH - 6 * scale, 16 * scale, '#ffffff');

    // Delicate cheek glow
    drawCheekBlush(ctx, headX - 48 * scale, headY + 18 * scale, 22 * scale);
    drawCheekBlush(ctx, headX + 48 * scale, headY + 18 * scale, 22 * scale);
  } else if (effect === 'blushing_bear') {
    // Round fluffy teddy bear ears
    const earY = headY - faceH * 0.52;
    const earDist = faceW * 0.36;
    const earRadius = 26 * scale;

    drawBearEar(ctx, headX - earDist, earY, earRadius);
    drawBearEar(ctx, headX + earDist, earY, earRadius);

    // Cute bear nose
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(headX, headY + 11 * scale, 7 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    drawCheekBlush(ctx, headX - 54 * scale, headY + 20 * scale, 26 * scale);
    drawCheekBlush(ctx, headX + 54 * scale, headY + 20 * scale, 26 * scale);
  } else if (effect === 'heart_blush') {
    // Sweet heart blush on both cheeks
    const cheekY = headY + 20 * scale;
    const cheekDist = faceW * 0.32;
    const heartSize = 14 * scale;

    // Glowing pink airbrush blush under hearts
    drawCheekBlush(ctx, headX - cheekDist, cheekY, 32 * scale);
    drawCheekBlush(ctx, headX + cheekDist, cheekY, 32 * scale);

    // Left heart
    drawHeart(ctx, headX - cheekDist, cheekY - 4 * scale, heartSize, -0.15);
    drawHeart(ctx, headX - cheekDist - 14 * scale, cheekY + 8 * scale, heartSize * 0.65, 0.2);

    // Right heart
    drawHeart(ctx, headX + cheekDist, cheekY - 4 * scale, heartSize, 0.15);
    drawHeart(ctx, headX + cheekDist + 14 * scale, cheekY + 8 * scale, heartSize * 0.65, -0.2);

    // Sparkle sparkles on cheeks
    drawSparkleStar(ctx, headX - cheekDist + 16 * scale, cheekY - 8 * scale, 8 * scale);
    drawSparkleStar(ctx, headX + cheekDist - 16 * scale, cheekY - 8 * scale, 8 * scale);
  } else if (effect === 'kira_stars') {
    // Multi-star Kira Kira shimmer around face & eyes
    const time = Date.now() / 600;
    const shimmer = 1 + Math.sin(time) * 0.2;

    const stars = [
      { x: headX - faceW * 0.42, y: headY - faceH * 0.15, size: 16 * scale * shimmer },
      { x: headX + faceW * 0.42, y: headY - faceH * 0.12, size: 18 * scale * (2 - shimmer) },
      { x: headX - faceW * 0.3, y: headY + faceH * 0.25, size: 13 * scale * shimmer },
      { x: headX + faceW * 0.32, y: headY + faceH * 0.22, size: 14 * scale },
      { x: headX, y: headY - faceH * 0.45, size: 15 * scale * (1.5 - shimmer * 0.5) },
      { x: headX - faceW * 0.15, y: headY + faceH * 0.38, size: 11 * scale },
      { x: headX + faceW * 0.18, y: headY + faceH * 0.36, size: 12 * scale * shimmer },
    ];

    stars.forEach((s) => {
      drawSparkleStar(ctx, s.x, s.y, s.size);
    });
  } else if (effect === 'angel_halo') {
    // Floating glowing gold angel halo
    const haloY = headY - faceH * 0.65;
    const haloW = faceW * 0.55;
    const haloH = 18 * scale;

    ctx.save();
    ctx.shadowColor = 'rgba(255, 215, 0, 0.85)';
    ctx.shadowBlur = 18 * scale;

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = Math.max(3, 4.5 * scale);
    ctx.beginPath();
    ctx.ellipse(headX, haloY, haloW, haloH, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner bright halo ring
    ctx.strokeStyle = '#fffbeb';
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.stroke();

    // Golden sparkles around halo
    drawSparkleStar(ctx, headX - haloW * 0.7, haloY - 10 * scale, 10 * scale, '#fff');
    drawSparkleStar(ctx, headX + haloW * 0.8, haloY - 5 * scale, 12 * scale, '#fff');
    ctx.restore();
  } else if (effect === 'bunny_ears') {
    // Pink & white bunny ears
    const earY = headY - faceH * 0.52;
    const earDist = faceW * 0.26;
    const earHeight = 90 * scale;
    const earW = 22 * scale;

    drawBunnyEar(ctx, headX - earDist, earY, earW, earHeight, -0.15);
    drawBunnyEar(ctx, headX + earDist, earY, earW, earHeight, 0.15);

    // Cheek blush
    drawCheekBlush(ctx, headX - 50 * scale, headY + 22 * scale, 24 * scale);
    drawCheekBlush(ctx, headX + 50 * scale, headY + 22 * scale, 24 * scale);
  } else if (effect === 'y2k_stars') {
    // Y2K holographic stickers across cheeks & bridge of nose
    const starY = headY + 12 * scale;
    drawY2KStar(ctx, headX - faceW * 0.28, starY, 14 * scale, '#f43f5e');
    drawY2KStar(ctx, headX + faceW * 0.28, starY, 14 * scale, '#ec4899');
    drawY2KStar(ctx, headX - faceW * 0.14, starY - 6 * scale, 10 * scale, '#38bdf8');
    drawY2KStar(ctx, headX + faceW * 0.14, starY - 6 * scale, 10 * scale, '#fbbf24');
    drawY2KStar(ctx, headX, starY - 10 * scale, 12 * scale, '#a855f7');
  }

  ctx.restore();
}

/**
 * Draws vintage SNOW classic timestamp in bottom right corner
 */
export function drawSnowTimestamp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.save();
  const now = new Date();
  const yearShort = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const dateStr = `'${yearShort} ${month} ${day}`;

  const fontSize = Math.max(14, Math.round(width / 36));
  ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';

  const marginX = Math.round(width * 0.04);
  const marginY = Math.round(height * 0.04);

  // Digital Amber Glow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = '#ff9800';
  ctx.fillText(`${dateStr} ${timeStr}`, width - marginX, height - marginY);

  ctx.font = `600 ${Math.max(10, Math.round(fontSize * 0.65))}px sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SNOW CAM', width - marginX, height - marginY - fontSize - 2);

  ctx.restore();
}

/* Helper drawing functions */

function drawCatEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rot: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Outer ear (white)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.65, size * 0.3);
  ctx.quadraticCurveTo(0, size * 0.1, -size * 0.65, size * 0.3);
  ctx.closePath();
  ctx.fill();

  // Inner ear (pink)
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.7);
  ctx.lineTo(size * 0.42, size * 0.15);
  ctx.quadraticCurveTo(0, 0, -size * 0.42, size * 0.15);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawWhisker(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  dx: number,
  dy: number
) {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(startX + dx * 0.5, startY + dy * 0.5 - 2, startX + dx, startY + dy);
  ctx.stroke();
}

function drawCheekBlush(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, 'rgba(251, 113, 133, 0.45)');
  grad.addColorStop(0.6, 'rgba(244, 63, 94, 0.18)');
  grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rot: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(0, topCurveHeight);
  ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
  ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size * 0.85, 0, size);
  ctx.bezierCurveTo(0, size * 0.85, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
  ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSparkleStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color = '#ffffff'
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = size * 0.6;

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(0, 0, size, 0);
  ctx.quadraticCurveTo(0, 0, 0, size);
  ctx.quadraticCurveTo(0, 0, -size, 0);
  ctx.quadraticCurveTo(0, 0, 0, -size);
  ctx.fill();
  ctx.restore();
}

function drawBunnyEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  rot: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Outer ear
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, -height / 2, width, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner ear
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.ellipse(0, -height / 2, width * 0.55, height * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawY2KStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * size);
    ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (size * 0.45), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (size * 0.45));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPuppyEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  rot: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Outer golden/brown floppy puppy ear
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(-width * 0.4, 0);
  ctx.quadraticCurveTo(-width * 0.8, height * 0.5, -width * 0.3, height);
  ctx.quadraticCurveTo(0, height * 1.1, width * 0.4, height * 0.9);
  ctx.quadraticCurveTo(width * 0.7, height * 0.4, width * 0.3, 0);
  ctx.closePath();
  ctx.fill();

  // Inner soft pink patch
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.ellipse(0, height * 0.55, width * 0.28, height * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCrown(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.shadowColor = 'rgba(255, 215, 0, 0.85)';
  ctx.shadowBlur = 12;

  // Crown body
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(-w / 2, -h * 0.7);
  ctx.lineTo(-w * 0.25, -h * 0.35);
  ctx.lineTo(0, -h);
  ctx.lineTo(w * 0.25, -h * 0.35);
  ctx.lineTo(w / 2, -h * 0.7);
  ctx.lineTo(w / 2, 0);
  ctx.closePath();
  ctx.fill();

  // Jewels on points
  const jewelPoints = [
    { x: -w / 2, y: -h * 0.7, r: 3.5, color: '#f43f5e' },
    { x: -w * 0.25, y: -h * 0.35, r: 2.5, color: '#38bdf8' },
    { x: 0, y: -h, r: 5, color: '#e11d48' },
    { x: w * 0.25, y: -h * 0.35, r: 2.5, color: '#38bdf8' },
    { x: w / 2, y: -h * 0.7, r: 3.5, color: '#f43f5e' },
  ];

  jewelPoints.forEach((j) => {
    ctx.fillStyle = j.color;
    ctx.beginPath();
    ctx.arc(j.x, j.y, j.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Base rim
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(w / 2, 0);
  ctx.stroke();

  ctx.restore();
}

function drawBearEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Outer bear ear
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Inner ear
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
