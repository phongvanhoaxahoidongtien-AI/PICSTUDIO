import React from 'react';
import { Paintbrush, Eraser, Trash2, X, Undo2, Redo2, Sparkles } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { DrawingLayer } from '../../types';

export const DrawPanel: React.FC = () => {
  const {
    brushColor,
    brushSize,
    brushOpacity,
    isEraser,
    eraserMode,
    setBrushColor,
    setBrushSize,
    setBrushOpacity,
    setIsEraser,
    setEraserMode,
    layers,
    updateLayer,
    setActiveTool,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore();

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
    { label: 'Mảnh', size: 4 },
    { label: 'Vừa', size: 10 },
    { label: 'Đậm', size: 22 },
    { label: 'Lớn', size: 42 },
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

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 shrink-0 max-h-[35dvh] sm:max-h-[40dvh] overflow-y-auto select-none backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Vẽ bút & Tẩy nét</h3>
        </div>

        {/* Quick Undo, Redo, Clear & Close */}
        <div className="flex items-center gap-2">
          {/* Prominent Large Undo & Redo buttons inside DrawPanel */}
          <div className="flex items-center bg-slate-800/95 rounded-xl p-1 border border-slate-700/80 shadow-md">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="p-1.5 sm:p-2 rounded-lg text-slate-100 hover:text-white hover:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition font-bold flex items-center gap-1"
              title="Hoàn tác nét vẽ (Undo) - Ctrl+Z"
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
              title="Làm lại nét vẽ (Redo) - Ctrl+Y"
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
            <span className="hidden sm:inline">Xóa hết</span>
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
        {/* Tool Mode: Brush vs Eraser */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEraser(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition active:scale-95 ${
              !isEraser
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>Bút vẽ tự do</span>
          </button>
          <button
            onClick={() => setIsEraser(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition active:scale-95 ${
              isEraser
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 border-rose-500 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Cục tẩy</span>
          </button>
        </div>

        {/* When Eraser is active: Choose between Pixel Eraser and Stroke Eraser */}
        {isEraser && (
          <div className="p-2 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-rose-200 font-semibold flex items-center gap-1.5">
                <Eraser className="w-3.5 h-3.5 text-rose-400" />
                Kiểu tẩy nét:
              </span>
              <span className="text-[11px] text-rose-300/80">
                {totalDrawPaths > 0 ? `${totalDrawPaths} nét vẽ trên ảnh` : 'Chưa có nét vẽ'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEraserMode('pixel')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border text-center transition active:scale-95 ${
                  eraserMode === 'pixel'
                    ? 'bg-rose-600 border-rose-400 text-white shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Tẩy tự do (Pixel)
              </button>
              <button
                onClick={() => setEraserMode('stroke')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border text-center transition active:scale-95 ${
                  eraserMode === 'stroke'
                    ? 'bg-rose-600 border-rose-400 text-white shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Tẩy theo nét (Xóa nguyên nét)
              </button>
            </div>

            <p className="text-[11px] text-rose-200/90 leading-relaxed px-1">
              {eraserMode === 'pixel'
                ? '💡 Kéo đầu tẩy trên ảnh để cạo xóa chính xác từng điểm theo kích thước đầu tẩy. Ảnh gốc 100% nguyên vẹn.'
                : '💡 Chạm hoặc quét ngón tay qua bất kỳ nét vẽ nào để xóa ngay toàn bộ nét đó ngay lập tức.'}
            </p>
          </div>
        )}

        {/* Preset Stroke Sizes */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Cỡ nét nhanh:</span>
          <div className="grid grid-cols-4 gap-1.5 flex-1">
            {strokePresets.map((sp) => (
              <button
                key={sp.label}
                onClick={() => setBrushSize(sp.size)}
                className={`py-1 px-1.5 rounded-lg border text-center text-[11px] font-semibold transition active:scale-95 ${
                  brushSize === sp.size
                    ? isEraser
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
                {isEraser ? 'Kích thước đầu tẩy:' : 'Kích thước ngòi bút:'}
              </span>
              <span className={`font-mono font-bold ${isEraser ? 'text-rose-400' : 'text-indigo-400'}`}>
                {brushSize}px
              </span>
            </div>
            <input
              type="range"
              min="2"
              max={isEraser ? '120' : '80'}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className={`w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer ${
                isEraser ? 'accent-rose-500' : 'accent-indigo-500'
              }`}
            />
          </div>

          {/* Opacity (only in brush mode) or Eraser hint */}
          {!isEraser ? (
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
          ) : (
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <Eraser className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Kéo đầu tẩy trên ảnh để xóa nét vẽ chính xác, ảnh gốc 100% nguyên vẹn.</span>
            </div>
          )}
        </div>

        {/* Color Palette (disabled in eraser mode) */}
        {!isEraser && (
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
      </div>
    </div>
  );
};

