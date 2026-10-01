import React from 'react';
import { Paintbrush, Eraser, Trash2, X } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { DrawingLayer } from '../../types';

export const DrawPanel: React.FC = () => {
  const {
    brushColor,
    brushSize,
    brushOpacity,
    isEraser,
    setBrushColor,
    setBrushSize,
    setBrushOpacity,
    setIsEraser,
    layers,
    updateLayer,
    setActiveTool,
    pushHistory,
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
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Vẽ bút & Tẩy</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearDrawings}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-medium transition"
            title="Xóa tất cả nét vẽ"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa nét vẽ</span>
          </button>
          <button
            onClick={() => setActiveTool('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
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
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border transition ${
              !isEraser
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>Bút vẽ tự do</span>
          </button>
          <button
            onClick={() => setIsEraser(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border transition ${
              isEraser
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Cục tẩy (Eraser)</span>
          </button>
        </div>

        {/* Brush Size & Opacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Size */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Kích thước ngòi:</span>
              <span className="font-mono text-indigo-400 font-bold">{brushSize}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="72"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Opacity */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Độ mờ đục:</span>
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
                    brushColor === color ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''
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
