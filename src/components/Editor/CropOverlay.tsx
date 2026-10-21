import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Check,
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  Loader2,
  Crop as CropIcon,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { renderCompositeCanvas } from '../../utils/compositeHelper';

interface CropOverlayProps {
  onApplyCrop: (croppedCanvas: HTMLCanvasElement, mimeType: string) => void;
  onCancel: () => void;
}

export const CropOverlay: React.FC<CropOverlayProps> = ({ onApplyCrop, onCancel }) => {
  const { layers, canvasWidth, canvasHeight, canvasBackgroundColor } = useEditorStore();

  const [aspectRatio, setAspectRatio] = useState<number | null>(null); // null = freeform
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [straightenAngle, setStraightenAngle] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [isLoadingComposite, setIsLoadingComposite] = useState(true);

  // Normalized crop rectangle: 0 to 1 relative to rotated canvas. Default 100% (no crop border)
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 1, h: 1 });

  const containerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const compositeImageRef = useRef<HTMLImageElement | null>(null);

  const isDraggingRef = useRef<{
    handle: string | null;
    startX: number;
    startY: number;
    startRect: typeof cropRect;
  }>({
    handle: null,
    startX: 0,
    startY: 0,
    startRect: { x: 0, y: 0, w: 1, h: 1 },
  });

  const normalizedRot = ((rotation % 360) + 360) % 360;
  const isQuarterTurn = normalizedRot === 90 || normalizedRot === 270;

  const originalWidth = canvasWidth || 1200;
  const originalHeight = canvasHeight || 800;
  const currentAspect = isQuarterTurn
    ? originalHeight / originalWidth
    : originalWidth / originalHeight;

  const aspectPresets = [
    { label: 'Tự do', value: null },
    { label: 'Gốc', value: currentAspect },
    { label: '1:1', value: 1 },
    { label: '4:5', value: 4 / 5 },
    { label: '3:4', value: 3 / 4 },
    { label: '9:16', value: 9 / 16 },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
  ];

  // Draw live rotated preview on preview canvas
  const drawPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = compositeImageRef.current;
    const container = containerRef.current;
    if (!canvas || !img || !container) return;

    const contW = Math.max(120, container.clientWidth - 24);
    const contH = Math.max(120, container.clientHeight - 24);

    const normRot = ((rotation % 360) + 360) % 360;
    const totalDeg = normRot + straightenAngle;
    const totalRad = (totalDeg * Math.PI) / 180;

    const naturalW = img.naturalWidth || originalWidth;
    const naturalH = img.naturalHeight || originalHeight;

    const cos = Math.abs(Math.cos(totalRad));
    const sin = Math.abs(Math.sin(totalRad));
    const rotatedW = Math.round(naturalW * cos + naturalH * sin);
    const rotatedH = Math.round(naturalW * sin + naturalH * cos);

    // Calculate display dimensions fitting comfortably inside container
    const scale = Math.min(contW / rotatedW, contH / rotatedH);
    const dispW = Math.max(120, Math.round(rotatedW * scale));
    const dispH = Math.max(120, Math.round(rotatedH * scale));

    canvas.width = dispW;
    canvas.height = dispH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dispW, dispH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    ctx.translate(dispW / 2, dispH / 2);
    ctx.rotate(totalRad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const drawW = naturalW * scale;
    const drawH = naturalH * scale;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [rotation, straightenAngle, flipH, flipV, originalWidth, originalHeight]);

  // Load complete snapshot/composite of current canvas (never black screen!)
  useEffect(() => {
    let isCancelled = false;

    const loadComposite = async () => {
      if (layers.length === 0) {
        setIsLoadingComposite(false);
        return;
      }
      try {
        setIsLoadingComposite(true);
        const compCanvas = await renderCompositeCanvas(
          layers,
          canvasWidth,
          canvasHeight,
          canvasBackgroundColor
        );
        if (isCancelled) return;

        const dataUrl = compCanvas.toDataURL('image/png');
        const img = new Image();
        img.onload = () => {
          if (isCancelled) return;
          compositeImageRef.current = img;
          setIsLoadingComposite(false);
          requestAnimationFrame(() => drawPreview());
        };
        img.onerror = () => {
          if (isCancelled) return;
          setIsLoadingComposite(false);
        };
        img.src = dataUrl;
      } catch (err) {
        console.error('Error generating composite for crop:', err);
        if (!isCancelled) setIsLoadingComposite(false);
      }
    };

    loadComposite();

    return () => {
      isCancelled = true;
    };
  }, [layers, canvasWidth, canvasHeight, canvasBackgroundColor, drawPreview]);

  // Handle ResizeObserver so container resize or modal layout settling immediately redraws preview
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => drawPreview());
    });
    ro.observe(container);

    const handleResize = () => drawPreview();
    window.addEventListener('resize', handleResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [drawPreview]);

  // Handle aspect ratio selection
  const handleSelectAspect = (ratio: number | null) => {
    setAspectRatio(ratio);
    if (ratio !== null) {
      let newW = cropRect.w;
      let newH = newW / ratio;
      if (newH > 1.0) {
        newH = 1.0;
        newW = newH * ratio;
      }
      if (newW > 1.0) {
        newW = 1.0;
        newH = newW / ratio;
      }
      setCropRect({
        x: Math.max(0, (1 - newW) / 2),
        y: Math.max(0, (1 - newH) / 2),
        w: Math.min(1, newW),
        h: Math.min(1, newH),
      });
    }
  };

  const handleRotate = (deg: number) => {
    setRotation((r) => (r + deg) % 360);
    // Reset crop rect to full image on rotation so 100% is preserved
    setCropRect({ x: 0, y: 0, w: 1, h: 1 });
  };

  const handleResetCrop = () => {
    setAspectRatio(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setStraightenAngle(0);
    setCropRect({ x: 0, y: 0, w: 1, h: 1 });
  };

  // Execute full native crop & rotate preserving 100% original dimensions & quality
  const executeApply = () => {
    const img = compositeImageRef.current;
    if (!img) return;
    setIsApplying(true);

    try {
      const naturalW = img.naturalWidth || canvasWidth;
      const naturalH = img.naturalHeight || canvasHeight;

      const normRot = ((rotation % 360) + 360) % 360;
      const totalDeg = normRot + straightenAngle;
      const totalRad = (totalDeg * Math.PI) / 180;

      // 1. Calculate bounding box of rotated native image
      const cos = Math.abs(Math.cos(totalRad));
      const sin = Math.abs(Math.sin(totalRad));
      const rotatedW = Math.max(1, Math.round(naturalW * cos + naturalH * sin));
      const rotatedH = Math.max(1, Math.round(naturalW * sin + naturalH * cos));

      // Full native rotated canvas
      const rotCanvas = document.createElement('canvas');
      rotCanvas.width = rotatedW;
      rotCanvas.height = rotatedH;
      const rotCtx = rotCanvas.getContext('2d');
      if (!rotCtx) {
        setIsApplying(false);
        return;
      }

      rotCtx.imageSmoothingEnabled = true;
      rotCtx.imageSmoothingQuality = 'high';
      rotCtx.save();
      rotCtx.translate(rotatedW / 2, rotatedH / 2);
      rotCtx.rotate(totalRad);
      rotCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      rotCtx.drawImage(img, -naturalW / 2, -naturalH / 2, naturalW, naturalH);
      rotCtx.restore();

      // 2. Sample the crop region strictly from full native rotated canvas
      const isFullImage =
        cropRect.x <= 0.005 &&
        cropRect.y <= 0.005 &&
        cropRect.w >= 0.995 &&
        cropRect.h >= 0.995;

      let finalCanvas: HTMLCanvasElement;

      if (isFullImage) {
        // If no cropping was made, use full rotated canvas directly (100% lossless!)
        finalCanvas = rotCanvas;
      } else {
        const cropPxX = Math.max(0, Math.round(cropRect.x * rotatedW));
        const cropPxY = Math.max(0, Math.round(cropRect.y * rotatedH));
        const cropPxW = Math.max(1, Math.min(rotatedW - cropPxX, Math.round(cropRect.w * rotatedW)));
        const cropPxH = Math.max(1, Math.min(rotatedH - cropPxY, Math.round(cropRect.h * rotatedH)));

        finalCanvas = document.createElement('canvas');
        finalCanvas.width = cropPxW;
        finalCanvas.height = cropPxH;
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) {
          setIsApplying(false);
          return;
        }

        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(
          rotCanvas,
          cropPxX,
          cropPxY,
          cropPxW,
          cropPxH,
          0,
          0,
          cropPxW,
          cropPxH
        );
      }

      onApplyCrop(finalCanvas, 'image/png');
    } catch (err) {
      console.error('Crop execution error:', err);
    } finally {
      setIsApplying(false);
    }
  };

  // Robust pointer drag handling for crop handles & move
  const startDrag = (handle: string, clientX: number, clientY: number) => {
    isDraggingRef.current = {
      handle,
      startX: clientX,
      startY: clientY,
      startRect: { ...cropRect },
    };

    const handlePointerMove = (e: PointerEvent) => {
      const { handle: curHandle, startX, startY, startRect } = isDraggingRef.current;
      if (!curHandle || !previewCanvasRef.current) return;

      const bounds = previewCanvasRef.current.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;

      const deltaX = (e.clientX - startX) / bounds.width;
      const deltaY = (e.clientY - startY) / bounds.height;

      let { x, y, w, h } = startRect;

      if (curHandle === 'move') {
        x = Math.max(0, Math.min(1 - w, x + deltaX));
        y = Math.max(0, Math.min(1 - h, y + deltaY));
      } else if (curHandle === 'nw') {
        const newW = Math.max(0.05, Math.min(startRect.x + startRect.w, w - deltaX));
        const newH = aspectRatio ? newW / aspectRatio : Math.max(0.05, Math.min(startRect.y + startRect.h, h - deltaY));
        x = startRect.x + (w - newW);
        y = startRect.y + (h - newH);
        w = newW;
        h = newH;
      } else if (curHandle === 'ne') {
        const newW = Math.max(0.05, Math.min(1 - startRect.x, w + deltaX));
        const newH = aspectRatio ? newW / aspectRatio : Math.max(0.05, Math.min(startRect.y + startRect.h, h - deltaY));
        y = startRect.y + (h - newH);
        w = newW;
        h = newH;
      } else if (curHandle === 'se') {
        const newW = Math.max(0.05, Math.min(1 - startRect.x, w + deltaX));
        const newH = aspectRatio ? newW / aspectRatio : Math.max(0.05, Math.min(1 - startRect.y, h + deltaY));
        w = newW;
        h = newH;
      } else if (curHandle === 'sw') {
        const newW = Math.max(0.05, Math.min(startRect.x + startRect.w, w - deltaX));
        const newH = aspectRatio ? newW / aspectRatio : Math.max(0.05, Math.min(1 - startRect.y, h + deltaY));
        x = startRect.x + (w - newW);
        w = newW;
        h = newH;
      } else if (curHandle === 'n') {
        const newH = Math.max(0.05, Math.min(startRect.y + startRect.h, h - deltaY));
        y = startRect.y + (h - newH);
        h = newH;
      } else if (curHandle === 's') {
        h = Math.max(0.05, Math.min(1 - startRect.y, h + deltaY));
      } else if (curHandle === 'w') {
        const newW = Math.max(0.05, Math.min(startRect.x + startRect.w, w - deltaX));
        x = startRect.x + (w - newW);
        w = newW;
      } else if (curHandle === 'e') {
        w = Math.max(0.05, Math.min(1 - startRect.x, w + deltaX));
      }

      x = Math.max(0, Math.min(1 - w, x));
      y = Math.max(0, Math.min(1 - h, y));
      w = Math.min(1 - x, w);
      h = Math.min(1 - y, h);

      setCropRect({ x, y, w, h });
    };

    const handlePointerUp = () => {
      isDraggingRef.current.handle = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // Estimated output pixel dimensions
  const normRot = ((rotation % 360) + 360) % 360;
  const isQuarter = normRot === 90 || normRot === 270;
  const curRotW = isQuarter ? originalHeight : originalWidth;
  const curRotH = isQuarter ? originalWidth : originalHeight;
  const outputW = Math.round(curRotW * cropRect.w);
  const outputH = Math.round(curRotH * cropRect.h);

  if (layers.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-sm flex flex-col items-center">
          <CropIcon className="w-12 h-12 text-indigo-400 mb-3" />
          <h3 className="text-base font-bold text-white mb-1.5">Chưa có ảnh để cắt xoay</h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Vui lòng thêm hoặc mở ảnh từ thiết bị trước khi sử dụng công cụ cắt xoay.
          </p>
          <button
            onClick={onCancel}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-md flex flex-col justify-between p-2 sm:p-4 select-none font-sans text-white touch-none">
      {/* Top Toolbar: Aspect Ratios & Dimension pill */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-2 overflow-x-auto py-1 px-1 scrollbar-none shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {aspectPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleSelectAspect(preset.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                aspectRatio === preset.value
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Live Pixel Dimensions Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono text-indigo-300 shrink-0">
          <span>{outputW} × {outputH} px</span>
          <span className="text-slate-400">
            {cropRect.w >= 0.99 && cropRect.h >= 0.99 ? '(100% Gốc)' : '(Đã cắt)'}
          </span>
        </div>
      </div>

      {/* Center Crop Box Viewer */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full max-w-xl mx-auto flex items-center justify-center my-1 sm:my-2 overflow-hidden touch-none"
      >
        {isLoadingComposite ? (
          <div className="flex flex-col items-center gap-2.5 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <span className="text-xs font-medium">Đang chuẩn bị ảnh & các mục chỉnh sửa...</span>
          </div>
        ) : (
          <div className="relative inline-flex items-center justify-center">
            {/* Visual Rotated Canvas Preview */}
            <canvas
              ref={previewCanvasRef}
              className="block rounded shadow-2xl pointer-events-none"
            />

            {/* Interactive Crop Grid & Handles Overlay matching Canvas exactly */}
            <div
              style={{
                left: `${cropRect.x * 100}%`,
                top: `${cropRect.y * 100}%`,
                width: `${cropRect.w * 100}%`,
                height: `${cropRect.h * 100}%`,
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                startDrag('move', e.clientX, e.clientY);
              }}
              className="absolute border-2 border-white/95 shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] cursor-move touch-none z-10"
            >
              {/* Rule of thirds grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div />
              </div>

              {/* Corner Handles (Large touch targets with sharp white brackets) */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  startDrag('nw', e.clientX, e.clientY);
                }}
                className="absolute -top-3.5 -left-3.5 w-8 h-8 border-t-4 border-l-4 border-white cursor-nwse-resize bg-transparent z-20 touch-none active:scale-125 transition"
              />
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  startDrag('ne', e.clientX, e.clientY);
                }}
                className="absolute -top-3.5 -right-3.5 w-8 h-8 border-t-4 border-r-4 border-white cursor-nesw-resize bg-transparent z-20 touch-none active:scale-125 transition"
              />
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  startDrag('se', e.clientX, e.clientY);
                }}
                className="absolute -bottom-3.5 -right-3.5 w-8 h-8 border-b-4 border-r-4 border-white cursor-nwse-resize bg-transparent z-20 touch-none active:scale-125 transition"
              />
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  startDrag('sw', e.clientX, e.clientY);
                }}
                className="absolute -bottom-3.5 -left-3.5 w-8 h-8 border-b-4 border-l-4 border-white cursor-nesw-resize bg-transparent z-20 touch-none active:scale-125 transition"
              />

              {/* Edge Midpoint Handles */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  startDrag('n', e.clientX, e.clientY);
                }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 border-t-4 border-white cursor-ns-resize bg-transparent z-20 touch-none"
              />
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  startDrag('s', e.clientX, e.clientY);
                }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 border-b-4 border-white cursor-ns-resize bg-transparent z-20 touch-none"
              />
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  startDrag('w', e.clientX, e.clientY);
                }}
                className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-8 border-l-4 border-white cursor-ew-resize bg-transparent z-20 touch-none"
              />
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  startDrag('e', e.clientX, e.clientY);
                }}
                className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-8 border-r-4 border-white cursor-ew-resize bg-transparent z-20 touch-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls: Rotate, Flip, Straighten & Confirm */}
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-2.5 py-2.5 px-3 bg-slate-900/95 rounded-2xl border border-slate-800 shadow-2xl shrink-0">
        {/* Straighten angle slider */}
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-slate-400 whitespace-nowrap">Nghiêng:</span>
          <input
            type="range"
            min="-45"
            max="45"
            value={straightenAngle}
            onChange={(e) => setStraightenAngle(Number(e.target.value))}
            className="flex-1 accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <button
            onClick={() => setStraightenAngle(0)}
            className="text-xs font-mono text-indigo-400 w-8 text-right font-bold hover:underline"
            title="Đặt lại góc nghiêng về 0°"
          >
            {straightenAngle}°
          </button>
        </div>

        {/* Rotate & Flip Buttons & Action Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => handleRotate(-90)}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold active:scale-95 transition"
              title="Xoay trái 90°"
            >
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              <span className="hidden xs:inline">-90°</span>
            </button>
            <button
              onClick={() => handleRotate(90)}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold active:scale-95 transition"
              title="Xoay phải 90°"
            >
              <RotateCw className="w-4 h-4 text-indigo-400" />
              <span className="hidden xs:inline">+90°</span>
            </button>
            <button
              onClick={() => setFlipH((f) => !f)}
              className={`p-2 rounded-xl transition active:scale-95 ${
                flipH ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Lật ngang"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFlipV((f) => !f)}
              className={`p-2 rounded-xl transition active:scale-95 ${
                flipV ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Lật dọc"
            >
              <FlipVertical className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetCrop}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-95"
              title="Đặt lại khung cắt 100%"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons: Cancel & Apply */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold active:scale-95 transition"
            >
              <X className="w-4 h-4" />
              <span>Hủy</span>
            </button>
            <button
              onClick={executeApply}
              disabled={isApplying || isLoadingComposite}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isApplying ? 'Đang cắt...' : 'Áp dụng cắt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
