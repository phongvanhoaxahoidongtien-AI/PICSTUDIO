import type {
  CanvasLayer,
  ImageLayer,
  TextLayer,
  DrawingLayer,
  StickerLayer,
} from '../types';
import { applyAdjustments } from './imageProcessing';
import { FILTER_PRESETS } from './filters';
import { applyBeautyEffects } from './beautyProcessing';

/**
 * Loads an image from a URL or DataURL safely
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image: ' + src.slice(0, 50)));
    img.src = src;
  });
}

/**
 * Renders all current visible canvas layers into a pristine, high-resolution HTMLCanvasElement.
 * This temporarily commits/flattens all edits (images, beauty, filters, text, stickers, drawings)
 * so that tools like Crop & Rotate have a 100% complete, non-black composite to work with.
 */
export async function renderCompositeCanvas(
  layers: CanvasLayer[],
  width: number,
  height: number,
  backgroundColor = '#0f172a'
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Render each visible layer from bottom to top
  for (const layer of layers) {
    if (!layer.visible) continue;

    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;
    ctx.globalCompositeOperation = layer.blendMode || 'source-over';

    const centerX = layer.x + (layer.width * (layer.scaleX ?? 1)) / 2;
    const centerY = layer.y + (layer.height * (layer.scaleY ?? 1)) / 2;

    ctx.translate(centerX, centerY);
    if (layer.rotation) {
      ctx.rotate((layer.rotation * Math.PI) / 180);
    }
    ctx.scale(layer.scaleX ?? 1, layer.scaleY ?? 1);
    ctx.translate(-layer.width / 2, -layer.height / 2);

    if (layer.type === 'image') {
      const imgLayer = layer as ImageLayer;
      try {
        const img = await loadImage(imgLayer.src);
        const offscreen = document.createElement('canvas');
        offscreen.width = Math.max(1, Math.round(layer.width));
        offscreen.height = Math.max(1, Math.round(layer.height));
        const offCtx = offscreen.getContext('2d');

        if (offCtx) {
          offCtx.drawImage(img, 0, 0, layer.width, layer.height);

          // Apply beauty if any
          if (imgLayer.beauty) {
            await applyBeautyEffects(offCtx, layer.width, layer.height, imgLayer.beauty);
          }

          // Combine filter preset adjustments with layer adjustments
          const filterPreset = FILTER_PRESETS.find((f) => f.id === imgLayer.filterId);
          const combinedAdjustments = { ...imgLayer.adjustments };
          if (filterPreset) {
            const intensity = (imgLayer.filterIntensity ?? 100) / 100;
            Object.entries(filterPreset.adjustments).forEach(([key, val]) => {
              if (typeof val === 'number') {
                const currentVal = (combinedAdjustments as unknown as Record<string, number>)[key] ?? 0;
                (combinedAdjustments as unknown as Record<string, number>)[key] = currentVal + val * intensity;
              }
            });
          }

          applyAdjustments(offCtx, layer.width, layer.height, combinedAdjustments, 1.0);
          ctx.drawImage(offscreen, 0, 0);
        }
      } catch (err) {
        console.error('Failed to composite image layer:', err);
      }
    } else if (layer.type === 'text') {
      const textLayer = layer as TextLayer;
      ctx.font = `${textLayer.fontStyle} ${textLayer.fontWeight} ${textLayer.fontSize}px "${textLayer.fontFamily}", sans-serif`;
      ctx.textAlign = textLayer.textAlign;
      ctx.textBaseline = 'top';

      const lines = textLayer.text.split('\n');
      const lineHeight = textLayer.fontSize * 1.25;

      // Background box
      if (textLayer.backgroundColor && textLayer.backgroundColor !== 'transparent') {
        const pad = textLayer.backgroundPadding || 8;
        const radius = textLayer.backgroundRadius || 6;
        ctx.fillStyle = textLayer.backgroundColor;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(-pad, -pad, layer.width + pad * 2, layer.height + pad * 2, radius);
        } else {
          ctx.rect(-pad, -pad, layer.width + pad * 2, layer.height + pad * 2);
        }
        ctx.fill();
      }

      // Shadow
      if (textLayer.shadowColor) {
        ctx.shadowColor = textLayer.shadowColor;
        ctx.shadowBlur = textLayer.shadowBlur || 0;
        ctx.shadowOffsetX = textLayer.shadowOffsetX || 0;
        ctx.shadowOffsetY = textLayer.shadowOffsetY || 0;
      }

      lines.forEach((line, index) => {
        let textX = 0;
        if (textLayer.textAlign === 'center') textX = layer.width / 2;
        else if (textLayer.textAlign === 'right') textX = layer.width;
        const textY = index * lineHeight;

        if (textLayer.isGradient && textLayer.gradientColors) {
          const grad = ctx.createLinearGradient(0, textY, layer.width, textY + lineHeight);
          grad.addColorStop(0, textLayer.gradientColors[0]);
          grad.addColorStop(1, textLayer.gradientColors[1]);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = textLayer.fill;
        }

        ctx.fillText(line, textX, textY);

        if (textLayer.stroke && textLayer.stroke !== 'transparent' && (textLayer.strokeWidth || 0) > 0) {
          ctx.strokeStyle = textLayer.stroke;
          ctx.lineWidth = textLayer.strokeWidth || 1;
          ctx.strokeText(line, textX, textY);
        }
      });
    } else if (layer.type === 'drawing') {
      const drawLayer = layer as DrawingLayer;
      if (drawLayer.paths && drawLayer.paths.length > 0) {
        const offscreen = document.createElement('canvas');
        offscreen.width = Math.max(1, Math.round(layer.width));
        offscreen.height = Math.max(1, Math.round(layer.height));
        const offCtx = offscreen.getContext('2d');
        if (offCtx) {
          offCtx.lineCap = 'round';
          offCtx.lineJoin = 'round';

          drawLayer.paths.forEach((path) => {
            if (!path.points || path.points.length === 0) return;
            offCtx.save();
            offCtx.lineCap = 'round';
            offCtx.lineJoin = 'round';

            if (path.isEraser) {
              offCtx.globalCompositeOperation = 'destination-out';
              offCtx.strokeStyle = 'rgba(0,0,0,1)';
              offCtx.fillStyle = 'rgba(0,0,0,1)';
              offCtx.globalAlpha = 1.0;
            } else {
              offCtx.globalCompositeOperation = 'source-over';
              offCtx.strokeStyle = path.color;
              offCtx.fillStyle = path.color;
              offCtx.globalAlpha = path.opacity ?? 1;
            }
            offCtx.lineWidth = path.size;

            if (path.points.length === 1) {
              offCtx.beginPath();
              offCtx.arc(path.points[0].x, path.points[0].y, Math.max(1, path.size / 2), 0, Math.PI * 2);
              offCtx.fill();
            } else {
              offCtx.beginPath();
              offCtx.arc(path.points[0].x, path.points[0].y, Math.max(1, path.size / 2), 0, Math.PI * 2);
              offCtx.fill();

              offCtx.beginPath();
              offCtx.moveTo(path.points[0].x, path.points[0].y);
              for (let i = 1; i < path.points.length - 1; i++) {
                const midX = (path.points[i].x + path.points[i + 1].x) / 2;
                const midY = (path.points[i].y + path.points[i + 1].y) / 2;
                offCtx.quadraticCurveTo(path.points[i].x, path.points[i].y, midX, midY);
              }
              const lastPt = path.points[path.points.length - 1];
              offCtx.lineTo(lastPt.x, lastPt.y);
              offCtx.stroke();

              offCtx.beginPath();
              offCtx.arc(lastPt.x, lastPt.y, Math.max(1, path.size / 2), 0, Math.PI * 2);
              offCtx.fill();
            }
            offCtx.restore();
          });

          ctx.drawImage(offscreen, 0, 0);
        }
      }
    } else if (layer.type === 'sticker') {
      const stickerLayer = layer as StickerLayer;
      if (stickerLayer.svgContent) {
        try {
          const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(stickerLayer.svgContent)}`;
          const img = await loadImage(svgDataUrl);
          ctx.drawImage(img, 0, 0, layer.width, layer.height);
        } catch (err) {
          console.error('Failed to render sticker in composite:', err);
        }
      }
    }

    ctx.restore();
  }

  return canvas;
}
