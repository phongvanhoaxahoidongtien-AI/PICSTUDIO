import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, X, RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { ImageLayer } from '../../types';

interface CropOverlayProps {
  onApplyCrop: (croppedCanvas: HTMLCanvasElement, mimeType: string) => void;
  onCancel: () => void;
}

export const CropOverlay: React.FC<CropOverlayProps> = ({ onApplyCrop, onCancel }) => {
  const { layers, activeLayerId } = useEditorStore();
  const activeLayer = (layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image')) as ImageLayer | undefined;

  const [aspectRatio, setAspectRatio] = useState<number | null>(null); // null = freeform
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270...
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [straightenAngle, setStraightenAngle] = useState(0);

  // Normalized crop rectangle: 0 to 1 relative to the transformed image
  const [cropRect, setCropRect] = useState({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageDisplayRef = useRef<HTMLDivElement>(null);

  const isDraggingRef = useRef<{
    handle: string | null;
    startX: number;
    startY: number;
    startRect: typeof cropRect;
  }>({
    handle: null,
    startX: 0,
    startY: 0,
    startRect: { x: 0, y: 0, w: 0, h: 0 },
  });

  const normalizedRot = ((rotation % 360) + 360) % 360;
  const isQuarterTurn = normalizedRot === 90 || normalizedRot === 270;
  
  const originalWidth = activeLayer?.originalWidth || activeLayer?.width || 1000;
  const originalHeight = activeLayer?.originalHeight || activeLayer?.height || 1000;
  const baseAspect = isQuarterTurn
    ? originalHeight / originalWidth
    : originalWidth / originalHeight;

  const aspectPresets = [
    { label: 'Tự do', value: null },
    { label: 'Gốc', value: baseAspect },
    { label: '1:1 Vuông', value: 1 },
    { label: '4:5 (IG)', value: 4 / 5 },
    { label: '3:4', value: 3 / 4 },
    { label: '9:16 (Story)', value: 9 / 16 },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
  ];

  const handleSelectAspect = (ratio: number | null) => {
    setAspectRatio(ratio);
    if (ratio !== null) {
      let newW = cropRect.w;
      let newH = newW / ratio;
      if (newH > 0.95) {
        newH = 0.95;
        newW = newH * ratio;
      }
      if (newW > 0.95) {
        newW = 0.95;
        newH = newW / ratio;
      }
      setCropRect({
        x: Math.max(0.01, (1 - newW) / 2),
        y: Math.max(0.01, (1 - newH) / 2),
        w: Math.min(0.98, newW),
        h: Math.min(0.98, newH),
      });
    }
  };

  const handleRotate = (deg: number) => {
    setRotation((r) => (r + deg) % 360);
    // Reset crop rect when rotated
    setCropRect({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
  };

  // Execute full native crop & rotate preserving 100% original dimensions & quality
  const executeApply = () => {
    if (!activeLayer) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 100% Real Native dimensions of the source image
      const naturalW = img.naturalWidth || activeLayer.originalWidth || activeLayer.width;
      const naturalH = img.naturalHeight || activeLayer.originalHeight || activeLayer.height;

      const normRot = ((rotation % 360) + 360) % 360;
      const totalDeg = normRot + straightenAngle;
      const totalRad = (totalDeg * Math.PI) / 180;

      // 1. Calculate bounding box of rotated native image
      const cos = Math.abs(Math.cos(totalRad));
      const sin = Math.abs(Math.sin(totalRad));
      const rotatedW = Math.round(naturalW * cos + naturalH * sin);
      const rotatedH = Math.round(naturalW * sin + naturalH * cos);

      // Create full native rotated canvas
      const rotCanvas = document.createElement('canvas');
      rotCanvas.width = rotatedW;
      rotCanvas.height = rotatedH;
      const rotCtx = rotCanvas.getContext('2d');
      if (!rotCtx) return;

      rotCtx.imageSmoothingEnabled = true;
      rotCtx.imageSmoothingQuality = 'high';
      rotCtx.save();
      rotCtx.translate(rotatedW / 2, rotatedH / 2);
      rotCtx.rotate(totalRad);
      rotCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      rotCtx.drawImage(img, -naturalW / 2, -naturalH / 2, naturalW, naturalH);
      rotCtx.restore();

      // 2. Sample the crop region strictly from the full native rotated canvas
      const cropPxX = Math.round(cropRect.x * rotatedW);
      const cropPxY = Math.round(cropRect.y * rotatedH);
      const cropPxW = Math.max(1, Math.min(rotatedW - cropPxX, Math.round(cropRect.w * rotatedW)));
      const cropPxH = Math.max(1, Math.min(rotatedH - cropPxY, Math.round(cropRect.h * rotatedH)));

      // 3. Create final cropped canvas at 100% full real pixel dimensions
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = cropPxW;
      finalCanvas.height = cropPxH;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) return;

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

      // 4. Preserve original format (PNG with transparency vs JPEG)
      const isPng =
        activeLayer.src.startsWith('data:image/png') ||
        (activeLayer.name && activeLayer.name.toLowerCase().endsWith('.png'));
      const mimeType = isPng ? 'image/png' : 'image/jpeg';

      onApplyCrop(finalCanvas, mimeType);
    };
    img.src = activeLayer.src;
  };

  // Pointer drag logic for crop handles
  const onPointerDown = (handle: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    isDraggingRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect: { ...cropRect },
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const { handle, startX, startY, startRect } = isDraggingRef.current;
    if (!handle || !imageDisplayRef.current) return;

    const bounds = imageDisplayRef.current.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    const deltaX = (e.clientX - startX) / bounds.width;
    const deltaY = (e.clientY - startY) / bounds.height;

    let { x, y, w, h } = startRect;

    if (handle === 'move') {
      x = Math.max(0, Math.min(1 - w, x + deltaX));
      y = Math.max(0, Math.min(1 - h, y + deltaY));
    } else if (handle === 'nw') {
      const newW = Math.max(0.08, Math.min(startRect.x + startRect.w, w - deltaX));
      const newH = aspectRatio ? newW / aspectRatio : Math.max(0.08, Math.min(startRect.y + startRect.h, h - deltaY));
      x = startRect.x + (w - newW);
      y = startRect.y + (h - newH);
      w = newW;
      h = newH;
    } else if (handle === 'ne') {
      const newW = Math.max(0.08, Math.min(1 - startRect.x, w + deltaX));
      const newH = aspectRatio ? newW / aspectRatio : Math.max(0.08, Math.min(startRect.y + startRect.h, h - deltaY));
      y = startRect.y + (h - newH);
      w = newW;
      h = newH;
    } else if (handle === 'se') {
      const newW = Math.max(0.08, Math.min(1 - startRect.x, w + deltaX));
      const newH = aspectRatio ? newW / aspectRatio : Math.max(0.08, Math.min(1 - startRect.y, h + deltaY));
      w = newW;
      h = newH;
    } else if (handle === 'sw') {
      const newW = Math.max(0.08, Math.min(startRect.x + startRect.w, w - deltaX));
      const newH = aspectRatio ? newW / aspectRatio : Math.max(0.08, Math.min(1 - startRect.y, h + deltaY));
      x = startRect.x + (w - newW);
      w = newW;
      h = newH;
    }

    // Ensure within bounds
    x = Math.max(0, Math.min(1 - w, x));
    y = Math.max(0, Math.min(1 - h, y));
    w = Math.min(1 - x, w);
    h = Math.min(1 - y, h);

    setCropRect({ x, y, w, h });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current.handle) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      isDraggingRef.current.handle = null;
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-3 select-none overflow-hidden font-sans">
      {/* Top Toolbar: Aspect Ratios */}
      <div className="w-full max-w-xl flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto py-1 sm:py-2 px-1 scrollbar-none shrink-0">
        {aspectPresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleSelectAspect(preset.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
              aspectRatio === preset.value
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Center Crop Box Viewer */}
      <div
        ref={containerRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative flex-1 min-h-0 w-full max-w-lg max-h-[50dvh] sm:max-h-[60dvh] flex items-center justify-center my-1 sm:my-2 overflow-hidden touch-none"
      >
        {activeLayer && (
          <div
            ref={imageDisplayRef}
            className="relative flex items-center justify-center transition-transform duration-75 max-w-full max-h-full"
            style={{
              aspectRatio: `${baseAspect}`,
            }}
          >
            {/* The rotated preview image filling the aspect box */}
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-md shadow-2xl"
              style={{
                transform: `rotate(${rotation + straightenAngle}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={activeLayer.src}
                alt="Ảnh đang cắt"
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
            </div>

            {/* Crop Grid & Boundary Handles strictly over the image box */}
            <div
              style={{
                left: `${cropRect.x * 100}%`,
                top: `${cropRect.y * 100}%`,
                width: `${cropRect.w * 100}%`,
                height: `${cropRect.h * 100}%`,
              }}
              onPointerDown={(e) => onPointerDown('move', e)}
              className="absolute border-2 border-white/95 shadow-[0_0_0_9999px_rgba(0,0,0,0.72)] cursor-move touch-none z-10"
            >
              {/* Rule of thirds grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>

              {/* Corner Handles */}
              <div
                onPointerDown={(e) => onPointerDown('nw', e)}
                className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-white cursor-nwse-resize bg-transparent z-20"
              />
              <div
                onPointerDown={(e) => onPointerDown('ne', e)}
                className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-white cursor-nesw-resize bg-transparent z-20"
              />
              <div
                onPointerDown={(e) => onPointerDown('se', e)}
                className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-white cursor-nwse-resize bg-transparent z-20"
              />
              <div
                onPointerDown={(e) => onPointerDown('sw', e)}
                className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-white cursor-nesw-resize bg-transparent z-20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls: Rotate, Flip, Straighten & Confirm */}
      <div className="w-full max-w-xl flex flex-col gap-2.5 py-2.5 px-3 bg-slate-900/95 rounded-2xl border border-slate-800 shadow-xl">
        {/* Straighten angle slider */}
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-slate-400 whitespace-nowrap">Góc nghiêng:</span>
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
            className="text-xs font-mono text-indigo-400 w-8 text-right font-bold"
          >
            {straightenAngle}°
          </button>
        </div>

        {/* Rotate & Flip Buttons & Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => handleRotate(-90)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white active:scale-95 transition"
              title="Xoay trái 90°"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRotate(90)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white active:scale-95 transition"
              title="Xoay phải 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFlipH((f) => !f)}
              className={`p-2 rounded-xl transition active:scale-95 ${flipH ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Lật ngang (Flip Horizontal)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFlipV((f) => !f)}
              className={`p-2 rounded-xl transition active:scale-95 ${flipV ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Lật dọc (Flip Vertical)"
            >
              <FlipVertical className="w-4 h-4" />
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Áp dụng cắt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
