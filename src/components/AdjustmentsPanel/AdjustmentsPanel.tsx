import React, { useState } from 'react';
import {
  Wand2,
  RotateCcw,
  Sun,
  Contrast as ContrastIcon,
  Flame,
  Gauge,
  Sparkles,
  Sliders,
  X,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { ImageLayer, ImageAdjustments } from '../../types';
import { DEFAULT_ADJUSTMENTS, calculateAutoEnhance } from '../../utils/imageProcessing';
import { HistogramView } from '../Editor/HistogramView';

export const AdjustmentsPanel: React.FC = () => {
  const {
    layers,
    activeLayerId,
    updateActiveImageAdjustments,
    resetActiveImageAdjustments,
    setActiveTool,
    pushHistory,
  } = useEditorStore();

  const activeLayer = (layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image')) as ImageLayer | undefined;
  const adjustments = activeLayer?.adjustments || DEFAULT_ADJUSTMENTS;

  const [activeCategory, setActiveCategory] = useState<'light' | 'color' | 'detail' | 'levels'>('light');

  if (!activeLayer) {
    return (
      <div className="p-4 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400">
        Vui lòng chọn hoặc thêm 1 ảnh để chỉnh màu.
      </div>
    );
  }

  // Auto Enhance handler
  const handleAutoEnhance = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(600, img.width);
      canvas.height = Math.min(600, img.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const enhanced = calculateAutoEnhance(ctx, canvas.width, canvas.height);
      pushHistory();
      updateActiveImageAdjustments(enhanced);
    };
    img.src = activeLayer.src;
  };

  const handleSliderChange = (key: keyof ImageAdjustments, value: number) => {
    updateActiveImageAdjustments({ [key]: value });
  };

  const resetSingle = (key: keyof ImageAdjustments) => {
    updateActiveImageAdjustments({ [key]: DEFAULT_ADJUSTMENTS[key] });
  };

  const sliderGroups = {
    light: [
      { key: 'exposure', label: 'Phơi sáng (Exposure)', min: -100, max: 100, step: 1 },
      { key: 'brightness', label: 'Độ sáng (Brightness)', min: -100, max: 100, step: 1 },
      { key: 'contrast', label: 'Tương phản (Contrast)', min: -100, max: 100, step: 1 },
      { key: 'highlights', label: 'Vùng sáng (Highlights)', min: -100, max: 100, step: 1 },
      { key: 'shadows', label: 'Vùng tối (Shadows)', min: -100, max: 100, step: 1 },
    ],
    color: [
      { key: 'saturation', label: 'Độ bão hòa (Saturation)', min: -100, max: 100, step: 1 },
      { key: 'temperature', label: 'Nhiệt độ màu (Temp)', min: -100, max: 100, step: 1 },
      { key: 'tint', label: 'Sắc thái (Tint)', min: -100, max: 100, step: 1 },
    ],
    detail: [
      { key: 'clarity', label: 'Độ rõ nét (Clarity)', min: -100, max: 100, step: 1 },
      { key: 'sharpness', label: 'Độ sắc nét (Sharpness)', min: 0, max: 100, step: 1 },
      { key: 'vignette', label: 'Hiệu ứng viền tối (Vignette)', min: 0, max: 100, step: 1 },
    ],
    levels: [
      { key: 'blackPoint', label: 'Điểm đen (Black Point)', min: 0, max: 100, step: 1 },
      { key: 'gamma', label: 'Độ dốc Gamma (Midtones)', min: 0.2, max: 2.5, step: 0.05 },
      { key: 'whitePoint', label: 'Điểm trắng (White Point)', min: 155, max: 255, step: 1 },
    ],
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 shrink-0 max-h-[35dvh] sm:max-h-[40dvh] overflow-y-auto select-none backdrop-blur-md">
      {/* Top Header of Panel */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoEnhance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition"
            title="Tự động cân bằng sáng và màu sắc tối ưu (100% offline)"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Tự động tối ưu (Auto)</span>
          </button>

          <button
            onClick={resetActiveImageAdjustments}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            title="Đặt lại tất cả thông số về mặc định"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đặt lại</span>
          </button>
        </div>

        <button
          onClick={() => setActiveTool('none')}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto mb-3 scrollbar-none pb-1">
        <button
          onClick={() => setActiveCategory('light')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeCategory === 'light'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Ánh sáng</span>
        </button>
        <button
          onClick={() => setActiveCategory('color')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeCategory === 'color'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Màu sắc</span>
        </button>
        <button
          onClick={() => setActiveCategory('detail')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeCategory === 'detail'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:text-white'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Chi tiết</span>
        </button>
        <button
          onClick={() => setActiveCategory('levels')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeCategory === 'levels'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Levels & Curves</span>
        </button>
      </div>

      {/* Histogram when in Levels or Light */}
      {(activeCategory === 'levels' || activeCategory === 'light') && (
        <div className="mb-3">
          <HistogramView />
        </div>
      )}

      {/* Sliders Grid */}
      <div className="space-y-3">
        {sliderGroups[activeCategory].map((s) => {
          const val = adjustments[s.key as keyof ImageAdjustments] as number;
          const isModified = val !== DEFAULT_ADJUSTMENTS[s.key as keyof ImageAdjustments];

          return (
            <div key={s.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${isModified ? 'text-indigo-400 font-semibold' : 'text-slate-300'}`}>
                  {s.label}
                </span>
                <button
                  onClick={() => resetSingle(s.key as keyof ImageAdjustments)}
                  className={`font-mono px-1.5 py-0.5 rounded text-[11px] transition ${
                    isModified
                      ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900/80'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Nhấn để đặt lại về 0"
                >
                  {typeof val === 'number' ? (s.step < 1 ? val.toFixed(2) : val) : val}
                </button>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={val}
                onChange={(e) => handleSliderChange(s.key as keyof ImageAdjustments, Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
