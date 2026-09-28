import React, { useState } from 'react';
import { X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { ImageLayer } from '../../types';
import { FILTER_PRESETS } from '../../utils/filters';

export const FiltersPanel: React.FC = () => {
  const {
    layers,
    activeLayerId,
    updateActiveImageFilter,
    setActiveTool,
    pushHistory,
  } = useEditorStore();

  const activeLayer = (layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image')) as ImageLayer | undefined;
  const currentFilterId = activeLayer?.filterId || 'normal';
  const currentIntensity = activeLayer?.filterIntensity ?? 100;

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  if (!activeLayer) {
    return (
      <div className="p-4 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400">
        Vui lòng chọn hoặc mở 1 ảnh để áp dụng bộ lọc màu.
      </div>
    );
  }

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'classic', label: 'Kinh điển' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'cinematic', label: 'Điện ảnh' },
    { id: 'moody', label: 'Moody' },
    { id: 'creative', label: 'Sáng tạo' },
  ];

  const filteredPresets = FILTER_PRESETS.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter
  );

  const handleSelectFilter = (id: string) => {
    pushHistory();
    updateActiveImageFilter(id, currentIntensity);
  };

  const handleIntensityChange = (val: number) => {
    updateActiveImageFilter(currentFilterId, val);
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 max-h-[46vh] overflow-y-auto select-none backdrop-blur-md">
      {/* Header with Intensity Slider */}
      <div className="flex flex-col gap-2.5 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Bộ lọc màu phong cách</h3>
          </div>
          <button
            onClick={() => setActiveTool('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Intensity Slider */}
        {currentFilterId !== 'normal' && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Độ đậm bộ lọc:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={currentIntensity}
              onChange={(e) => handleIntensityChange(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs font-mono text-indigo-400 font-bold w-10 text-right">
              {currentIntensity}%
            </span>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                categoryFilter === c.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {filteredPresets.map((preset) => {
          const isSelected = currentFilterId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectFilter(preset.id)}
              className={`flex flex-col p-2 rounded-2xl text-left border transition active:scale-95 ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-750 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>
                  {preset.name}
                </span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
