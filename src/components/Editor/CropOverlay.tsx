import React, { useState, useRef, useEffect } from 'react';
import { Check, X, RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { ImageLayer } from '../../types';

interface CropOverlayProps {
  onApplyCrop: (croppedCanvas: HTMLCanvasElement) => void;
  onCancel: () => void;
}

export const CropOverlay: React.FC<CropOverlayProps> = ({ onApplyCrop, onCancel }) => {
  const { layers, activeLayerId, updateLayer, pushHistory } = useEditorStore();
  const activeLayer = (layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image')) as ImageLayer | undefined;

  const [aspectRatio, setAspectRatio] = useState<number | null>(null); // null = freeform
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [straightenAngle, setStraightenAngle] = useState(0);

  // Normalized crop rectangle: 0 to 1 relative to image
  const [cropRect, setCropRect] = useState({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<{ handle: string | null; startX: number; startY: number; startRect: typeof cropRect }>({
    handle: null,
    startX: 0,
    startY: 0,
    startRect: { x: 0, y: 0, w: 0, h: 0 },
  });

  const aspectPresets = [
    { label: 'Tự do', value: null },
    { label: 'Gốc', value: activeLayer ? activeLayer.width / activeLayer.height : 1 },
    { label: '1:1', value: 1 },
    { label: '4:5 (IG)', value: 4 / 5 },
    { label: '3:4', value: 3 / 4 },
    { label: '9:16 (Story)', value: 9 / 16 },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
  ];

  const handleSelectAspect = (ratio: number | null) => {
    setAspectRatio(ratio);
    if (ratio !== null) {
      // Adjust width and height to match ratio
      let newW = cropRect.w;
      let newH = newW / ratio;
      if (newH > 0.9) {
        newH = 0.9;
        newW = newH * ratio;
      }
      setCropRect({
        x: Math.max(0.02, (1 - newW) / 2),
        y: Math.max(0.02, (1 - newH) / 2),
        w: Math.min(0.96, newW),
        h: Math.min(0.96, newH),
      });
    }
  };

  const handleRotate = (deg: number) => {
    setRotation((r) => (r + deg) % 360);
  };

  const executeApply = () => {
    if (!activeLayer) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Create offscreen canvas for transform & crop
      const canvas = document.createElement('canvas');
      const totalAngle = ((rotation + straightenAngle) * Math.PI) / 180;

      // Calculate cropped pixel coordinates on the source image
      const srcW = activeLayer.width;
      const srcH = activeLayer.height;
      const cropPxX = cropRect.x * srcW;
      const cropPxY = cropRect.y * srcH;
      const cropPxW = cropRect.w * srcW;
      const cropPxH = cropRect.h * srcH;

      canvas.width = Math.round(cropPxW);
      canvas.height = Math.round(cropPxH);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      // Center and apply transforms
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(totalAngle);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Draw relative to center
      ctx.drawImage(
        img,
        cropPxX,
        cropPxY,
        cropPxW,
        cropPxH,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );
      ctx.restore();

      onApplyCrop(canvas);
    };
    img.src = activeLayer.src;
  };

  // Pointer drag logic for crop box
  const onPointerDown = (handle: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect: { ...cropRect },
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const { handle, startX, startY, startRect } = isDraggingRef.current;
    if (!handle || !containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const deltaX = (e.clientX - startX) / bounds.width;
    const deltaY = (e.clientY - startY) / bounds.height;

    let { x, y, w, h } = startRect;

    if (handle === 'move') {
      x = Math.max(0, Math.min(1 - w, x + deltaX));
      y = Math.max(0, Math.min(1 - h, y + deltaY));
    } else if (handle === 'nw') {
      const newW = Math.max(0.1, w - deltaX);
      const newH = aspectRatio ? newW / aspectRatio : Math.max(0.1, h - deltaY);
      x = Math.max(0, x + (w - newW));
      y = Math.max(0, y + (h - newH));
      w = newW;
      h = newH;
    } else if (handle === 'ne') {
      const newW = Math.max(0.1, w + deltaX);
      const newH = aspectRatio ? newW / aspectRatio : Math.max(0.1, h - deltaY);
      y = Math.max(0, y + (h - newH));
      w = Math.min(1 - x, newW);
      h = newH;
    } else if (handle === 'se') {
      const newW = Math.max(0.1, w + deltaX);
      const newH = aspectRatio ? newW / aspectRatio : Math.max(0.1, h + deltaY);
      w = Math.min(1 - x, newW);
      h = Math.min(1 - y, newH);
    } else if (handle === 'sw') {
      const newW = Math.max(0.1, w - deltaX);
      const newH = aspectRatio ? newW / aspectRatio : Math.max(0.1, h + deltaY);
      x = Math.max(0, x + (w - newW));
      w = newW;
      h = Math.min(1 - y, newH);
    }

    setCropRect({ x, y, w, h });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current.handle) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      isDraggingRef.current.handle = null;
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-between p-2 sm:p-3 select-none overflow-hidden">
      {/* Top Toolbar: Ratios */}
      <div className="w-full max-w-xl flex items-center justify-center gap-1.5 overflow-x-auto py-1 sm:py-2 px-1 scrollbar-none shrink-0">
        {aspectPresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleSelectAspect(preset.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              aspectRatio === preset.value
                ? 'bg-indigo-600 text-white shadow-md'
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
        className="relative flex-1 min-h-0 w-full max-w-lg max-h-[48dvh] sm:max-h-[58dvh] flex items-center justify-center my-1 sm:my-2 overflow-hidden touch-none"
      >
        {activeLayer && (
          <div
            className="relative w-full h-full flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `rotate(${rotation + straightenAngle}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
            }}
          >
            <img
              src={activeLayer.src}
              alt="Crop target"
              className="max-w-full max-h-full object-contain pointer-events-none rounded shadow-lg"
            />
          </div>
        )}

        {/* Crop Grid & Handles */}
        <div
          style={{
            left: `${cropRect.x * 100}%`,
            top: `${cropRect.y * 100}%`,
            width: `${cropRect.w * 100}%`,
            height: `${cropRect.h * 100}%`,
          }}
          onPointerDown={(e) => onPointerDown('move', e)}
          className="absolute border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move touch-none"
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
            className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-white cursor-nwse-resize bg-transparent"
          />
          <div
            onPointerDown={(e) => onPointerDown('ne', e)}
            className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-white cursor-nesw-resize bg-transparent"
          />
          <div
            onPointerDown={(e) => onPointerDown('se', e)}
            className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-white cursor-nwse-resize bg-transparent"
          />
          <div
            onPointerDown={(e) => onPointerDown('sw', e)}
            className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-white cursor-nesw-resize bg-transparent"
          />
        </div>
      </div>

      {/* Bottom Controls: Rotate, Flip, Straighten & Confirm */}
      <div className="w-full max-w-xl flex flex-col gap-3 py-2 px-2 bg-slate-900/95 rounded-2xl border border-slate-800 shadow-xl">
        {/* Straighten angle slider */}
        <div className="flex items-center gap-3 px-2">
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
            className="text-xs font-mono text-indigo-400 w-8 text-right"
          >
            {straightenAngle}°
          </button>
        </div>

        {/* Rotate & Flip Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleRotate(-90)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Xoay trái 90°"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRotate(90)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Xoay phải 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFlipH((f) => !f)}
              className={`p-2 rounded-xl transition ${flipH ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Lật ngang (Flip Horizontal)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFlipV((f) => !f)}
              className={`p-2 rounded-xl transition ${flipV ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Lật dọc (Flip Vertical)"
            >
              <FlipVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons: Cancel & Apply */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              <X className="w-4 h-4" />
              <span>Hủy</span>
            </button>
            <button
              onClick={executeApply}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Áp dụng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
