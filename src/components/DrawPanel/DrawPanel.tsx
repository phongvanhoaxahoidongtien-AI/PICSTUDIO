import React, { useState } from 'react';
import {
  Paintbrush,
  Eraser,
  Trash2,
  X,
  Check,
  Undo2,
  Redo2,
  Sparkles,
  Wand2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { DrawingLayer, ImageLayer } from '../../types';
import { applyAiInpainting } from '../../utils/aiInpainting';

export const DrawPanel: React.FC = () => {
  const {
    brushColor,
    brushSize,
    brushOpacity,
    isEraser,
    eraserMode,
    isAiEraser,
    aiMaskPoints,
    setBrushColor,
    setBrushSize,
    setBrushOpacity,
    setIsEraser,
    setEraserMode,
    setIsAiEraser,
    setAiMaskPoints,
    clearAiMask,
    layers,
    activeLayerId,
    canvasWidth,
    canvasHeight,
    updateLayer,
    removeLayer,
    setActiveTool,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore();

  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const colorSwatches = [
    '#ef4444',
    '#f97316',
    '#facc15',
    '#10b981',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#ffffff',
    '#000000',
  ];

  const strokePresets = [
    { label: 'Mảnh', size: 6 },
    { label: 'Vừa', size: 14 },
    { label: 'Đậm', size: 28 },
    { label: 'Lớn', size: 52 },
  ];

  // Count total drawn paths on canvas
  const totalDrawPaths = layers.reduce((acc, l) => {
    if (l.type === 'drawing') {
      return acc + (l as DrawingLayer).paths.length;
    }
    return acc;
  }, 0);

  const handleClearDrawings = () => {
    pushHistory();
    layers.forEach((l) => {
      if (l.type === 'drawing') {
        updateLayer(l.id, { paths: [] });
      }
    });
  };

  // Merge/bake all drawings directly into base photo at 100% native resolution (NO LAYERS!)
  const handleBakeDrawingsToPhoto = async () => {
    const targetLayer = layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image');
    if (!targetLayer || targetLayer.type !== 'image') {
      setActiveTool('none');
      return;
    }
    const imgLayer = targetLayer as ImageLayer;

    const drawLayers = layers.filter((l) => l.type === 'drawing') as DrawingLayer[];
    const hasStrokes = drawLayers.some((dl) => dl.paths && dl.paths.length > 0);
    if (!hasStrokes) {
      setActiveTool('none');
      return;
    }

    pushHistory();
    const naturalW = imgLayer.originalWidth || imgLayer.width || canvasWidth;
    const naturalH = imgLayer.originalHeight || imgLayer.height || canvasHeight;

    const canvas = document.createElement('canvas');
    canvas.width = naturalW;
    canvas.height = naturalH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw base photo
    const img = new Image();
    if (!imgLayer.src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imgLayer.src;
    });

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, naturalW, naturalH);

    // 2. Scale factor from canvas space to natural photo space
    const scaleX = naturalW / canvasWidth;
    const scaleY = naturalH / canvasHeight;

    // 3. Draw all drawing strokes onto base photo canvas at full natural resolution
    for (const dLayer of drawLayers) {
      if (!dLayer.visible || !dLayer.paths) continue;
      for (const path of dLayer.paths) {
        if (!path.points || path.points.length === 0) continue;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (path.isEraser) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = 'rgba(0,0,0,1)';
          ctx.fillStyle = 'rgba(0,0,0,1)';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = path.color;
          ctx.fillStyle = path.color;
        }

        const size = Math.max(1, path.size * scaleX);
        ctx.lineWidth = size;
        ctx.globalAlpha = path.opacity ?? 1;

        if (path.points.length === 1) {
          ctx.beginPath();
          ctx.arc(path.points[0].x * scaleX, path.points[0].y * scaleY, Math.max(1, size / 2), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(path.points[0].x * scaleX, path.points[0].y * scaleY, Math.max(1, size / 2), 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(path.points[0].x * scaleX, path.points[0].y * scaleY);
          for (let i = 1; i < path.points.length - 1; i++) {
            const midX = ((path.points[i].x + path.points[i + 1].x) / 2) * scaleX;
            const midY = ((path.points[i].y + path.points[i + 1].y) / 2) * scaleY;
            ctx.quadraticCurveTo(path.points[i].x * scaleX, path.points[i].y * scaleY, midX, midY);
          }
          const lastPt = path.points[path.points.length - 1];
          ctx.lineTo(lastPt.x * scaleX, lastPt.y * scaleY);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(lastPt.x * scaleX, lastPt.y * scaleY, Math.max(1, size / 2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const isPng = imgLayer.src.startsWith('data:image/png') || (imgLayer.name && imgLayer.name.endsWith('.png'));
    const newSrc = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.98);

    // Update base layer with new merged image
    updateLayer(imgLayer.id, {
      src: newSrc,
      originalWidth: naturalW,
      originalHeight: naturalH,
    });

    // Remove all drawing layers so NO separate layers remain!
    for (const dLayer of drawLayers) {
      removeLayer(dLayer.id);
    }

    setActiveTool('none');
  };

  // Execute AI Object Removal / Inpainting
  const handleExecuteAiInpaint = async () => {
    if (aiMaskPoints.length === 0) return;
    const targetLayer = layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image');
    if (!targetLayer || targetLayer.type !== 'image') return;
    const imgLayer = targetLayer as ImageLayer;

    setIsAiProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imgLayer.src;
      });

      const naturalW = img.naturalWidth || imgLayer.width;
      const naturalH = img.naturalHeight || imgLayer.height;

      // Source canvas
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = naturalW;
      srcCanvas.height = naturalH;
      const srcCtx = srcCanvas.getContext('2d');
      if (!srcCtx) return;
      srcCtx.drawImage(img, 0, 0, naturalW, naturalH);

      // Mask canvas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = naturalW;
      maskCanvas.height = naturalH;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) return;

      const scaleX = naturalW / (imgLayer.width || canvasWidth);
      const scaleY = naturalH / (imgLayer.height || canvasHeight);

      maskCtx.fillStyle = '#ffffff';
      maskCtx.strokeStyle = '#ffffff';
      maskCtx.lineCap = 'round';
      maskCtx.lineJoin = 'round';

      // Draw all mask points and strokes onto mask canvas
      for (let i = 0; i < aiMaskPoints.length; i++) {
        const pt = aiMaskPoints[i];
        const scaledX = (pt.x - (targetLayer.x || 0)) * scaleX;
        const scaledY = (pt.y - (targetLayer.y || 0)) * scaleY;
        const scaledSize = Math.max(8, pt.size * Math.max(scaleX, scaleY));

        maskCtx.beginPath();
        maskCtx.arc(scaledX, scaledY, scaledSize / 2, 0, Math.PI * 2);
        maskCtx.fill();

        if (i > 0) {
          const prevPt = aiMaskPoints[i - 1];
          const prevX = (prevPt.x - (targetLayer.x || 0)) * scaleX;
          const prevY = (prevPt.y - (targetLayer.y || 0)) * scaleY;
          maskCtx.lineWidth = scaledSize;
          maskCtx.beginPath();
          maskCtx.moveTo(prevX, prevY);
          maskCtx.lineTo(scaledX, scaledY);
          maskCtx.stroke();
        }
      }

      // Execute AI Inpainting algorithm with resolution-scaled neighborhood radius
      const inpaintRadius = Math.max(10, Math.round((brushSize / 2) * Math.max(scaleX, scaleY)));
      applyAiInpainting(srcCtx, naturalW, naturalH, maskCanvas, inpaintRadius);

      pushHistory();
      const isPng = imgLayer.src.startsWith('data:image/png') || (imgLayer.name && imgLayer.name.endsWith('.png'));
      const newSrc = srcCanvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.98);

      updateLayer(imgLayer.id, {
        src: newSrc,
      });

      clearAiMask();
    } catch (err) {
      console.error('AI Inpainting failed:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900/95 border-t lg:border-t-0 border-slate-800 p-3 sm:p-4 shrink-0 w-full h-full max-h-[46dvh] lg:max-h-none overflow-y-auto select-none backdrop-blur-md flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Vẽ bút & Tẩy AI</h3>
        </div>

        {/* Quick Undo, Redo, Clear & Close */}
        <div className="flex items-center gap-2">
          {/* Prominent Large Undo & Redo buttons inside DrawPanel */}
          <div className="flex items-center bg-slate-800/95 rounded-xl p-1 border border-slate-700/80 shadow-md">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="p-1.5 sm:p-2 rounded-lg text-slate-100 hover:text-white hover:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition font-bold flex items-center gap-1"
              title="Hoàn tác nét vẽ / xóa (Undo) - Ctrl+Z"
              aria-label="Hoàn tác nét vẽ"
            >
              <Undo2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
              <span className="hidden sm:inline text-[11px] font-bold">Undo</span>
            </button>
            <div className="w-[1px] h-4 sm:h-5 bg-slate-700 mx-1" />
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="p-1.5 sm:p-2 rounded-lg text-slate-100 hover:text-white hover:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition font-bold flex items-center gap-1"
              title="Làm lại (Redo) - Ctrl+Y"
              aria-label="Làm lại nét vẽ"
            >
              <Redo2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
              <span className="hidden sm:inline text-[11px] font-bold">Redo</span>
            </button>
          </div>

          <button
            onClick={handleClearDrawings}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-400 text-xs font-semibold transition active:scale-95 border border-slate-700/60"
            title="Xóa tất cả nét vẽ trên ảnh"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xóa nét</span>
          </button>

          <button
            onClick={() => setActiveTool('none')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Tool Mode: 1. Brush, 2. Pen Eraser, 3. AI Smart Eraser */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              setIsEraser(false);
              setIsAiEraser(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition active:scale-95 ${
              !isEraser && !isAiEraser
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Bút vẽ</span>
          </button>

          <button
            onClick={() => {
              setIsEraser(true);
              setIsAiEraser(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition active:scale-95 ${
              isEraser && !isAiEraser
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 border-rose-500 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Eraser className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tẩy nét vẽ</span>
          </button>

          <button
            onClick={() => {
              setIsAiEraser(true);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition active:scale-95 ${
              isAiEraser
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 border-amber-400 text-white shadow-md shadow-pink-600/30 ring-1 ring-amber-400'
                : 'bg-slate-800/80 border-slate-700 text-amber-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tẩy AI xóa vật thể</span>
          </button>
        </div>

        {/* When AI Eraser is active: Show AI inpaint controls and execute button */}
        {isAiEraser && (
          <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-200 font-bold flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-amber-400" />
                Tẩy AI thông minh (Xóa vật thể / chữ / ngày giờ):
              </span>
              <span className="text-[11px] font-semibold text-pink-300">
                {aiMaskPoints.length > 0 ? `${aiMaskPoints.length} điểm đã quét` : 'Chưa quét vùng'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              👉 Dùng ngón tay hoặc chuột <b>quét cọ lên vật thể, người, ngày giờ, chữ hoặc hình mờ</b> cần xóa. Sau đó nhấn nút &quot;Xóa vật thể ngay&quot; để AI tái tạo lại nền mượt mà 100% tự nhiên.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExecuteAiInpaint}
                disabled={isAiProcessing || aiMaskPoints.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition active:scale-95 disabled:opacity-40"
              >
                {isAiProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI đang phân tích & xóa vật thể...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Xóa vật thể ngay (AI Inpaint)</span>
                  </>
                )}
              </button>

              {aiMaskPoints.length > 0 && (
                <button
                  onClick={clearAiMask}
                  disabled={isAiProcessing}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition active:scale-95"
                >
                  Tô lại
                </button>
              )}
            </div>
          </div>
        )}

        {/* When Pen Eraser is active: Choose between Stroke Eraser and Precision Segment Eraser */}
        {isEraser && !isAiEraser && (
          <div className="p-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-rose-200 font-semibold flex items-center gap-1.5">
                <Eraser className="w-3.5 h-3.5 text-rose-400" />
                Kiểu tẩy nét vẽ:
              </span>
              <span className="text-[11px] font-semibold text-rose-300">
                {totalDrawPaths > 0 ? `${totalDrawPaths} nét vẽ trên ảnh` : 'Chưa có nét vẽ'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEraserMode('stroke')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border text-center transition active:scale-95 ${
                  eraserMode === 'stroke'
                    ? 'bg-rose-600 border-rose-400 text-white shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Tẩy theo nét (Xóa nhanh)
              </button>
              <button
                onClick={() => setEraserMode('pixel')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border text-center transition active:scale-95 ${
                  eraserMode === 'pixel'
                    ? 'bg-rose-600 border-rose-400 text-white shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Tẩy cắt đoạn (Chính xác)
              </button>
            </div>

            {totalDrawPaths === 0 ? (
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-2 text-[11px] text-amber-200">
                <span>Chưa có nét bút nào. Muốn xóa chi tiết trên ảnh gốc?</span>
                <button
                  onClick={() => setIsAiEraser(true)}
                  className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shrink-0"
                >
                  Dùng Tẩy AI
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-rose-200/90 leading-relaxed px-1">
                {eraserMode === 'stroke'
                  ? '💡 Chạm hoặc quét ngón tay qua nét vẽ để xóa ngay toàn bộ nét đó ngay lập tức.'
                  : '💡 Di chuyển đầu tẩy để cắt ngắn hoặc xóa chính xác đoạn nét vẽ bạn muốn.'}
              </p>
            )}
          </div>
        )}

        {/* Preset Stroke Sizes */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Cỡ cọ nhanh:</span>
          <div className="grid grid-cols-4 gap-1.5 flex-1">
            {strokePresets.map((sp) => (
              <button
                key={sp.label}
                onClick={() => setBrushSize(sp.size)}
                className={`py-1 px-1.5 rounded-lg border text-center text-[11px] font-semibold transition active:scale-95 ${
                  brushSize === sp.size
                    ? isAiEraser
                      ? 'bg-amber-500 border-amber-300 text-slate-950 font-bold shadow-sm'
                      : isEraser
                      ? 'bg-rose-600 border-rose-400 text-white shadow-sm'
                      : 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                {sp.label} ({sp.size}px)
              </button>
            ))}
          </div>
        </div>

        {/* Brush / Eraser Size & Opacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Size */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                {isAiEraser
                  ? 'Kích thước cọ tẩy AI:'
                  : isEraser
                  ? 'Kích thước đầu tẩy:'
                  : 'Kích thước ngòi bút:'}
              </span>
              <span
                className={`font-mono font-bold ${
                  isAiEraser ? 'text-amber-400' : isEraser ? 'text-rose-400' : 'text-indigo-400'
                }`}
              >
                {brushSize}px
              </span>
            </div>
            <input
              type="range"
              min="4"
              max={isAiEraser ? '140' : isEraser ? '120' : '80'}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className={`w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer ${
                isAiEraser
                  ? 'accent-amber-400'
                  : isEraser
                  ? 'accent-rose-500'
                  : 'accent-indigo-500'
              }`}
            />
          </div>

          {/* Opacity (only in brush mode) or Eraser hint */}
          {!isEraser && !isAiEraser ? (
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Độ mờ đục nét vẽ:</span>
                <span className="font-mono text-indigo-400 font-bold">{Math.round(brushOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          ) : isAiEraser ? (
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Vùng quét màu hồng tím sẽ được AI xóa sạch và lấp đầy tự nhiên.</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <Eraser className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Kéo đầu tẩy trên ảnh để xóa nét vẽ chính xác, ảnh gốc 100% nguyên vẹn.</span>
            </div>
          )}
        </div>

        {/* Color Palette (disabled in eraser / AI eraser mode) */}
        {!isEraser && !isAiEraser && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-300 font-medium">Màu mực:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              {colorSwatches.map((color) => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full border border-slate-600 transition active:scale-95 ${
                    brushColor === color ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900 scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Bar: Apply directly to photo (No Layers!) */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={handleBakeDrawingsToPhoto}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-95"
            title="Lưu tất cả nét vẽ vĩnh viễn vào ảnh gốc để có thể cắt, xoay hoặc chỉnh sửa tiếp theo"
          >
            <Check className="w-4 h-4" />
            <span>Tạm lưu nét vẽ vào ảnh {totalDrawPaths > 0 ? `(${totalDrawPaths})` : ''}</span>
          </button>
          <button
            onClick={() => setActiveTool('none')}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

