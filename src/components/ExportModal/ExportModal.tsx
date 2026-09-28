import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  X,
  FileImage,
  CheckCircle2,
  Sliders,
  Layers,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { ImageLayer, TextLayer, DrawingLayer, StickerLayer } from '../../types';
import { applyAdjustments } from '../../utils/imageProcessing';
import { FILTER_PRESETS } from '../../utils/filters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const {
    layers,
    canvasWidth,
    canvasHeight,
    canvasBackgroundColor,
    projectName,
  } = useEditorStore();

  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(1);
  const [estimatedSize, setEstimatedSize] = useState<string>('...');
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const outWidth = Math.round(canvasWidth * scale);
  const outHeight = Math.round(canvasHeight * scale);

  // Render high-res export canvas
  const generateExportCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    // Fill background
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, outWidth, outHeight);

    for (const layer of layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode;

      const layerScale = scale;
      const lx = layer.x * layerScale;
      const ly = layer.y * layerScale;
      const lw = layer.width * layerScale;
      const lh = layer.height * layerScale;

      const centerX = lx + (lw * layer.scaleX) / 2;
      const centerY = ly + (lh * layer.scaleY) / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scaleX, layer.scaleY);
      ctx.translate(-lw / 2, -lh / 2);

      if (layer.type === 'image') {
        const imgLayer = layer as ImageLayer;
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const offscreen = document.createElement('canvas');
            offscreen.width = Math.round(lw);
            offscreen.height = Math.round(lh);
            const offCtx = offscreen.getContext('2d');
            if (offCtx) {
              offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);

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

              applyAdjustments(offCtx, offscreen.width, offscreen.height, combinedAdjustments, 1.0);
              ctx.drawImage(offscreen, 0, 0);
            }
            resolve();
          };
          img.onerror = () => resolve();
          img.src = imgLayer.src;
        });
      } else if (layer.type === 'text') {
        const textLayer = layer as TextLayer;
        const scaledFontSize = textLayer.fontSize * layerScale;
        ctx.font = `${textLayer.fontStyle} ${textLayer.fontWeight} ${scaledFontSize}px "${textLayer.fontFamily}", sans-serif`;
        ctx.textAlign = textLayer.textAlign;
        ctx.textBaseline = 'top';

        const lines = textLayer.text.split('\n');
        const lineHeight = scaledFontSize * 1.25;

        if (textLayer.backgroundColor && textLayer.backgroundColor !== 'transparent') {
          const pad = (textLayer.backgroundPadding || 8) * layerScale;
          const radius = (textLayer.backgroundRadius || 6) * layerScale;
          ctx.fillStyle = textLayer.backgroundColor;
          ctx.beginPath();
          ctx.roundRect(-pad, -pad, lw + pad * 2, lh + pad * 2, radius);
          ctx.fill();
        }

        if (textLayer.shadowColor) {
          ctx.shadowColor = textLayer.shadowColor;
          ctx.shadowBlur = (textLayer.shadowBlur || 0) * layerScale;
          ctx.shadowOffsetX = (textLayer.shadowOffsetX || 0) * layerScale;
          ctx.shadowOffsetY = (textLayer.shadowOffsetY || 0) * layerScale;
        }

        lines.forEach((line, index) => {
          let textX = 0;
          if (textLayer.textAlign === 'center') textX = lw / 2;
          if (textLayer.textAlign === 'right') textX = lw;
          const textY = index * lineHeight;

          if (textLayer.isGradient && textLayer.gradientColors) {
            const grad = ctx.createLinearGradient(0, textY, lw, textY + lineHeight);
            grad.addColorStop(0, textLayer.gradientColors[0]);
            grad.addColorStop(1, textLayer.gradientColors[1]);
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = textLayer.fill;
          }

          ctx.fillText(line, textX, textY);

          if (textLayer.stroke && (textLayer.strokeWidth || 0) > 0) {
            ctx.strokeStyle = textLayer.stroke;
            ctx.lineWidth = (textLayer.strokeWidth || 1) * layerScale;
            ctx.strokeText(line, textX, textY);
          }
        });
      } else if (layer.type === 'drawing') {
        const drawLayer = layer as DrawingLayer;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        drawLayer.paths.forEach((path) => {
          if (path.points.length < 2) return;
          ctx.save();
          if (path.isEraser) {
            ctx.globalCompositeOperation = 'destination-out';
          } else {
            ctx.strokeStyle = path.color;
            ctx.globalAlpha = path.opacity;
          }
          ctx.lineWidth = path.size * layerScale;
          ctx.beginPath();
          ctx.moveTo(path.points[0].x * layerScale, path.points[0].y * layerScale);
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x * layerScale, path.points[i].y * layerScale);
          }
          ctx.stroke();
          ctx.restore();
        });
      } else if (layer.type === 'sticker') {
        const stickerLayer = layer as StickerLayer;
        if (stickerLayer.svgContent) {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              ctx.drawImage(img, 0, 0, lw, lh);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = `data:image/svg+xml;utf8,${encodeURIComponent(stickerLayer.svgContent!)}`;
          });
        }
      }

      ctx.restore();
    }

    return canvas;
  };

  // Estimate file size on options change
  useEffect(() => {
    let isCancelled = false;
    const calculateEstimate = async () => {
      try {
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = Math.min(600, outWidth);
        sampleCanvas.height = Math.min(600, outHeight);
        const ctx = sampleCanvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = canvasBackgroundColor;
        ctx.fillRect(0, 0, sampleCanvas.width, sampleCanvas.height);

        sampleCanvas.toBlob(
          (blob) => {
            if (isCancelled || !blob) return;
            const ratio = (outWidth * outHeight) / (sampleCanvas.width * sampleCanvas.height);
            const estBytes = blob.size * ratio;
            if (estBytes > 1024 * 1024) {
              setEstimatedSize((estBytes / (1024 * 1024)).toFixed(1) + ' MB');
            } else {
              setEstimatedSize(Math.round(estBytes / 1024) + ' KB');
            }
          },
          format,
          quality
        );
      } catch {
        setEstimatedSize('~1 MB');
      }
    };

    calculateEstimate();
    return () => {
      isCancelled = true;
    };
  }, [format, quality, scale, outWidth, outHeight, canvasBackgroundColor]);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateExportCanvas();
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
          const filename = `${projectName.replace(/\s+/g, '_')}_lumix.${ext}`;

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 3000);
        },
        format,
        quality
      );
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateExportCanvas();
      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
          const filename = `${projectName.replace(/\s+/g, '_')}_lumix.${ext}`;
          const file = new File([blob], filename, { type: format });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: projectName,
              text: 'Ảnh chỉnh sửa từ Lumix Studio PWA Offline',
            });
          } else {
            // Fallback download if share not supported
            handleDownload();
          }
        },
        format,
        quality
      );
    } catch (err) {
      console.error('Sharing failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xuất ảnh đã chỉnh sửa</h3>
              <p className="text-xs text-slate-400">Độ phân giải: {outWidth} × {outHeight} px</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-semibold">Định dạng file:</label>
          <div className="grid grid-cols-3 gap-2">
            {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  format === fmt
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {fmt === 'image/jpeg' ? 'JPEG' : fmt === 'image/png' ? 'PNG' : 'WebP'}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider (for JPEG / WebP) */}
        {format !== 'image/png' && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Chất lượng ảnh:</span>
              <span className="font-mono text-indigo-400 font-bold">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        )}

        {/* Resolution Scale */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-semibold">Độ phân giải xuất:</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '0.5x', val: 0.5 },
              { label: '1x Gốc', val: 1 },
              { label: '1.5x HD', val: 1.5 },
              { label: '2x 4K', val: 2 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setScale(s.val)}
                className={`py-1.5 rounded-xl border text-xs font-medium transition ${
                  scale === s.val
                    ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <span>Kích thước file ước tính:</span>
          <span className="font-mono text-emerald-400 font-bold text-sm">{estimatedSize}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {/* Share Button (iOS Safari / Android native share) */}
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95 disabled:opacity-50"
            title="Chia sẻ lên Instagram, Zalo, AirDrop..."
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Chia sẻ</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Đã lưu thành công!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Đang xuất...' : 'Tải về máy'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
