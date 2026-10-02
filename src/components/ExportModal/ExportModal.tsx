import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  X,
  FileImage,
  CheckCircle2,
  Sliders,
  Layers,
  Image as ImageIcon,
  FolderDown,
  Copy,
  FolderCheck,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { ImageLayer, TextLayer, DrawingLayer, StickerLayer } from '../../types';
import { applyAdjustments } from '../../utils/imageProcessing';
import { FILTER_PRESETS } from '../../utils/filters';
import { applyBeautyEffects } from '../../utils/beautyProcessing';

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
  const [successMessage, setSuccessMessage] = useState('Đã lưu thành công!');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
          img.onload = async () => {
            const offscreen = document.createElement('canvas');
            offscreen.width = Math.round(lw);
            offscreen.height = Math.round(lh);
            const offCtx = offscreen.getContext('2d');
            if (offCtx) {
              offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);

              if (imgLayer.beauty) {
                await applyBeautyEffects(offCtx, offscreen.width, offscreen.height, imgLayer.beauty);
              }

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
        if (drawLayer.paths.length > 0) {
          const offscreen = document.createElement('canvas');
          offscreen.width = Math.max(1, Math.round(lw));
          offscreen.height = Math.max(1, Math.round(lh));
          const offCtx = offscreen.getContext('2d');
          if (offCtx) {
            offCtx.lineCap = 'round';
            offCtx.lineJoin = 'round';

            drawLayer.paths.forEach((path) => {
              if (path.points.length === 0) return;
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
                offCtx.globalAlpha = path.opacity;
              }
              offCtx.lineWidth = path.size * layerScale;

              if (path.points.length === 1) {
                offCtx.beginPath();
                offCtx.arc(path.points[0].x * layerScale, path.points[0].y * layerScale, Math.max(1, (path.size * layerScale) / 2), 0, Math.PI * 2);
                offCtx.fill();
              } else {
                offCtx.beginPath();
                offCtx.arc(path.points[0].x * layerScale, path.points[0].y * layerScale, Math.max(1, (path.size * layerScale) / 2), 0, Math.PI * 2);
                offCtx.fill();

                offCtx.beginPath();
                offCtx.moveTo(path.points[0].x * layerScale, path.points[0].y * layerScale);
                for (let i = 1; i < path.points.length - 1; i++) {
                  const midX = ((path.points[i].x + path.points[i + 1].x) / 2) * layerScale;
                  const midY = ((path.points[i].y + path.points[i + 1].y) / 2) * layerScale;
                  offCtx.quadraticCurveTo(path.points[i].x * layerScale, path.points[i].y * layerScale, midX, midY);
                }
                const lastPt = path.points[path.points.length - 1];
                offCtx.lineTo(lastPt.x * layerScale, lastPt.y * layerScale);
                offCtx.stroke();

                offCtx.beginPath();
                offCtx.arc(lastPt.x * layerScale, lastPt.y * layerScale, Math.max(1, (path.size * layerScale) / 2), 0, Math.PI * 2);
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
            try {
              setPreviewUrl(sampleCanvas.toDataURL(format, quality));
            } catch {
              // Ignore preview fallback
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

  // 1. Save directly to Photos / Gallery (Bộ sưu tập ảnh)
  const handleSaveToGallery = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateExportCanvas();
      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
          const filename = `${projectName.replace(/\s+/g, '_')}_lumix.${ext}`;
          const file = new File([blob], filename, { type: format });

          // Web Share API triggers native "Save Image" / "Lưu hình ảnh" into Photos on iOS and Android
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: projectName,
                text: 'Lưu vào Bộ sưu tập ảnh của thiết bị',
              });
              setIsSuccess(true);
              setSuccessMessage('Đã mở hộp thoại lưu vào Bộ sưu tập!');
              setTimeout(() => setIsSuccess(false), 3500);
            } catch (shareErr) {
              if ((shareErr as Error).name !== 'AbortError') {
                handleDownload();
              }
            }
          } else {
            // Desktop fallback: prompt download & notification
            handleDownload();
          }
        },
        format,
        quality
      );
    } catch (err) {
      console.error('Save to gallery failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Download directly to device Downloads folder (Tải về thư mục Download)
  const handleDownload = async (askFolder = false) => {
    setIsExporting(true);
    try {
      const canvas = await generateExportCanvas();
      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
          const filename = `${projectName.replace(/\s+/g, '_')}_lumix.${ext}`;

          // File System Access API: Allow user to pick exact folder (Pictures, Downloads, Documents)
          if (askFolder && 'showSaveFilePicker' in window) {
            try {
              const handle = await (window as unknown as {
                showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>;
              }).showSaveFilePicker({
                suggestedName: filename,
                types: [
                  {
                    description: 'Tệp hình ảnh',
                    accept: { [format]: [`.${ext}`] },
                  },
                ],
              });
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
              setIsSuccess(true);
              setSuccessMessage('Đã lưu ảnh vào thư mục bạn chọn thành công!');
              setTimeout(() => setIsSuccess(false), 3500);
              return;
            } catch (pickerErr) {
              if ((pickerErr as Error).name === 'AbortError') return;
            }
          }

          // Direct browser download into Downloads folder
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setIsSuccess(true);
          setSuccessMessage('Đã tải xuống thư mục Download (Tải về) thành công!');
          setTimeout(() => setIsSuccess(false), 3500);
        },
        format,
        quality
      );
    } catch (err) {
      console.error('Export download failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Copy image to system clipboard
  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateExportCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          let pngBlob = blob;
          if (blob.type !== 'image/png') {
            const pngCanvas = document.createElement('canvas');
            pngCanvas.width = canvas.width;
            pngCanvas.height = canvas.height;
            const pCtx = pngCanvas.getContext('2d');
            if (pCtx) {
              pCtx.drawImage(canvas, 0, 0);
              pngBlob = await new Promise<Blob>((res) => pngCanvas.toBlob((b) => res(b!), 'image/png'));
            }
          }
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob }),
          ]);
          setIsSuccess(true);
          setSuccessMessage('Đã sao chép ảnh vào bộ nhớ tạm! Bạn có thể dán (Ctrl+V) ngay.');
          setTimeout(() => setIsSuccess(false), 3500);
        } catch {
          handleDownload(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
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

        {/* Info card & Live Preview Thumbnail */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          {previewUrl && (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-slate-700 shrink-0 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Xem trước ảnh xuất"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] mb-0.5">
              <span className="text-slate-400">Dung lượng ước tính:</span>
              <span className="font-mono text-emerald-400 font-bold">{estimatedSize}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Mẹo: Chạm giữ ảnh nhỏ để chọn &quot;Lưu vào Ảnh&quot; hoặc bấm nút bên dưới.
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Action Buttons: 1. Save to Photos/Gallery, 2. Download to Downloads folder */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Primary: Save to Photos / Camera Roll / Gallery */}
            <button
              onClick={handleSaveToGallery}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pink-600/25 transition active:scale-95 disabled:opacity-50"
              title="Lưu ảnh trực tiếp vào Cuộn camera / Bộ sưu tập Ảnh trên thiết bị"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isExporting ? 'Đang xử lý...' : 'Lưu vào Bộ sưu tập (Ảnh)'}</span>
            </button>

            {/* Direct Download to Downloads directory */}
            <button
              onClick={() => handleDownload(false)}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
              title="Tải tệp ảnh trực tiếp về thư mục Tải về (Downloads)"
            >
              <FolderDown className="w-4 h-4" />
              <span>{isExporting ? 'Đang tải...' : 'Tải về mục Download'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Custom Folder Picker via File System Access API */}
            <button
              onClick={() => handleDownload(true)}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-slate-200 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
              title="Tự chọn thư mục lưu (Downloads, Pictures, Documents...)"
            >
              <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chọn thư mục lưu...</span>
            </button>

            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyToClipboard}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-slate-200 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
              title="Sao chép ảnh vào bộ nhớ tạm để dán ngay"
            >
              <Copy className="w-3.5 h-3.5 text-sky-400" />
              <span>Sao chép ảnh</span>
            </button>
          </div>

          {/* Secondary: Native Share to social apps */}
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-300 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
            title="Chia sẻ lên Zalo, Messenger, Instagram, AirDrop..."
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Chia sẻ qua ứng dụng khác (Zalo, Instagram, Facebook...)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
