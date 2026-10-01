import React from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  X,
  Image as ImageIcon,
  Type,
  Paintbrush,
  Smile,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { BlendMode } from '../../types';

export const LayersPanel: React.FC = () => {
  const {
    layers,
    activeLayerId,
    setActiveLayerId,
    updateLayer,
    removeLayer,
    duplicateLayer,
    reorderLayers,
    setActiveTool,
    pushHistory,
  } = useEditorStore();

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const blendModes: { value: BlendMode; label: string }[] = [
    { value: 'source-over', label: 'Bình thường (Normal)' },
    { value: 'multiply', label: 'Nhân màu (Multiply)' },
    { value: 'screen', label: 'Làm sáng (Screen)' },
    { value: 'overlay', label: 'Phủ lên (Overlay)' },
    { value: 'darken', label: 'Làm tối (Darken)' },
    { value: 'lighten', label: 'Làm sáng (Lighten)' },
    { value: 'color-dodge', label: 'Né màu (Color Dodge)' },
  ];

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-indigo-400" />;
      case 'text':
        return <Type className="w-4 h-4 text-emerald-400" />;
      case 'drawing':
        return <Paintbrush className="w-4 h-4 text-amber-400" />;
      case 'sticker':
        return <Smile className="w-4 h-4 text-rose-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 shrink-0 max-h-[35dvh] sm:max-h-[40dvh] overflow-y-auto select-none backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Quản lý Lớp ảnh ({layers.length})
          </h3>
        </div>
        <button
          onClick={() => setActiveTool('none')}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {layers.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400">
          Chưa có lớp nào trên canvas.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active Layer Controls (Opacity & Blend Mode) */}
          {activeLayer && (
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/70 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white truncate max-w-[180px]">
                  {activeLayer.name}
                </span>
                <span className="text-indigo-400 font-mono text-[11px]">
                  {Math.round(activeLayer.opacity * 100)}% độ mờ
                </span>
              </div>

              {/* Opacity Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={activeLayer.opacity}
                onChange={(e) => updateLayer(activeLayer.id, { opacity: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              {/* Blend Mode Dropdown */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-300 font-medium">Chế độ hòa trộn:</span>
                <select
                  value={activeLayer.blendMode}
                  onChange={(e) => updateLayer(activeLayer.id, { blendMode: e.target.value as BlendMode })}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                >
                  {blendModes.map((bm) => (
                    <option key={bm.value} value={bm.value}>
                      {bm.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Layer List (Top to Bottom: inverted display order) */}
          <div className="space-y-1.5">
            {[...layers].reverse().map((layer, reverseIndex) => {
              const actualIndex = layers.length - 1 - reverseIndex;
              const isSelected = layer.id === activeLayerId;

              return (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500'
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80'
                  }`}
                >
                  {/* Left: Icon & Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-lg bg-slate-800 shrink-0">
                      {getLayerIcon(layer.type)}
                    </div>
                    <span className={`text-xs truncate ${isSelected ? 'text-white font-bold' : 'text-slate-300'}`}>
                      {layer.name}
                    </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Toggle Visibility */}
                    <button
                      onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                      className={`p-1.5 rounded-lg transition ${
                        layer.visible ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={layer.visible ? 'Ẩn lớp' : 'Hiện lớp'}
                    >
                      {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Toggle Lock */}
                    <button
                      onClick={() => updateLayer(layer.id, { locked: !layer.locked })}
                      className={`p-1.5 rounded-lg transition ${
                        layer.locked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                      }`}
                      title={layer.locked ? 'Mở khóa lớp' : 'Khóa lớp'}
                    >
                      {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>

                    {/* Move Up */}
                    <button
                      onClick={() => actualIndex < layers.length - 1 && reorderLayers(actualIndex, actualIndex + 1)}
                      disabled={actualIndex === layers.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 transition"
                      title="Chuyển lên trên"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => actualIndex > 0 && reorderLayers(actualIndex, actualIndex - 1)}
                      disabled={actualIndex === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 transition"
                      title="Chuyển xuống dưới"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => duplicateLayer(layer.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                      title="Nhân đôi lớp"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 transition"
                      title="Xóa lớp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
