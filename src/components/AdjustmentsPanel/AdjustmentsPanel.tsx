import React, { useState } from 'react';
import {
  Wand2,
  RotateCcw,
  Sun,
  Flame,
  Gauge,
  Sliders,
  X,
  Monitor,
  Check,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { ImageLayer, ImageAdjustments } from '../../types';
import {
  DEFAULT_ADJUSTMENTS,
  calculateAutoEnhance,
  WINDOWS_PHOTOS_PRESETS,
  type WindowsPhotosPreset,
} from '../../utils/imageProcessing';
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

  const [activeCategory, setActiveCategory] = useState<'win_photos' | 'light' | 'color' | 'detail' | 'levels'>('win_photos');
  const [selectedWinPreset, setSelectedWinPreset] = useState<string>('original');

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
      setSelectedWinPreset('auto_enhance');
    };
    img.src = activeLayer.src;
  };

  const handleSliderChange = (key: keyof ImageAdjustments, value: number) => {
    updateActiveImageAdjustments({ [key]: value });
  };

  const resetSingle = (key: keyof ImageAdjustments) => {
    updateActiveImageAdjustments({ [key]: DEFAULT_ADJUSTMENTS[key] });
  };

  const handleApplyWinPreset = (preset: WindowsPhotosPreset) => {
    pushHistory();
    setSelectedWinPreset(preset.id);
    if (preset.id === 'original') {
      resetActiveImageAdjustments();
    } else {
      updateActiveImageAdjustments(preset.adjustments);
    }
  };

  const sliderGroups = {
    win_photos: [
      // Light section of Windows 11 Photos
      { key: 'exposure', label: 'Phơi sáng (Exposure)', min: -100, max: 100, step: 1, section: 'Ánh sáng (Light)' },
      { key: 'brightness', label: 'Độ sáng (Brightness)', min: -100, max: 100, step: 1, section: 'Ánh sáng (Light)' },
      { key: 'contrast', label: 'Tương phản (Contrast)', min: -100, max: 100, step: 1, section: 'Ánh sáng (Light)' },
      { key: 'highlights', label: 'Vùng sáng (Highlights)', min: -100, max: 100, step: 1, section: 'Ánh sáng (Light)' },
      { key: 'shadows', label: 'Vùng tối (Shadows)', min: -100, max: 100, step: 1, section: 'Ánh sáng (Light)' },
      { key: 'whites', label: 'Mức trắng (Whites)', min: -100, max: 100, step: 1, section: 'Ánh sáng (Light)' },
      { key: 'blacks', label: 'Mức đen (Blacks)', min: -100, max: 100, step: 1, section: 'Ánh sáng (Light)' },
      // Color section of Windows 11 Photos
      { key: 'saturation', label: 'Độ bão hòa (Saturation)', min: -100, max: 100, step: 1, section: 'Màu sắc (Color)' },
      { key: 'temperature', label: 'Độ ấm (Warmth / Temp)', min: -100, max: 100, step: 1, section: 'Màu sắc (Color)' },
      { key: 'tint', label: 'Sắc thái (Tint)', min: -100, max: 100, step: 1, section: 'Màu sắc (Color)' },
      // Clarity section of Windows 11 Photos
      { key: 'clarity', label: 'Độ rõ nét (Clarity)', min: -100, max: 100, step: 1, section: 'Độ rõ & Viền tối' },
      { key: 'sharpness', label: 'Độ sắc nét (Sharpness)', min: 0, max: 100, step: 1, section: 'Độ rõ & Viền tối' },
      { key: 'vignette', label: 'Viền tối góc (Vignette)', min: 0, max: 100, step: 1, section: 'Độ rõ & Viền tối' },
    ],
    light: [
      { key: 'exposure', label: 'Phơi sáng (Exposure)', min: -100, max: 100, step: 1 },
      { key: 'brightness', label: 'Độ sáng (Brightness)', min: -100, max: 100, step: 1 },
      { key: 'contrast', label: 'Tương phản (Contrast)', min: -100, max: 100, step: 1 },
      { key: 'highlights', label: 'Vùng sáng (Highlights)', min: -100, max: 100, step: 1 },
      { key: 'shadows', label: 'Vùng tối (Shadows)', min: -100, max: 100, step: 1 },
      { key: 'whites', label: 'Mức trắng (Whites - Win 11)', min: -100, max: 100, step: 1 },
      { key: 'blacks', label: 'Mức đen (Blacks - Win 11)', min: -100, max: 100, step: 1 },
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
            title="Tự động cân bằng sáng và màu sắc tối ưu (100% offline như Windows Photos)"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Tự động tối ưu (Auto)</span>
          </button>

          <button
            onClick={() => {
              resetActiveImageAdjustments();
              setSelectedWinPreset('original');
            }}
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
          onClick={() => setActiveCategory('win_photos')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-sm ${
            activeCategory === 'win_photos'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-800/80 text-blue-300 hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Photos Windows 10/11</span>
        </button>
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

      {/* Windows 10/11 Photos Filter Presets Bar */}
      {activeCategory === 'win_photos' && (
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Bộ lọc màu kinh điển Windows Photos:</span>
            <span className="text-[10px] text-blue-400 font-normal">Windows 10 & 11 Photos App</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {WINDOWS_PHOTOS_PRESETS.map((p) => {
              const isSelected = selectedWinPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyWinPreset(p)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-2xl border transition shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-750 hover:border-slate-600'
                  }`}
                  title={`${p.nameVi} - ${p.description}`}
                >
                  <div className={`relative w-12 h-10 rounded-xl overflow-hidden ${p.previewBg} flex items-center justify-center shadow-inner`}>
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[11px] font-medium leading-none px-1 truncate max-w-[68px] ${isSelected ? 'text-blue-300 font-bold' : 'text-slate-300'}`}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Histogram when in Levels or Light */}
      {(activeCategory === 'levels' || activeCategory === 'light') && (
        <div className="mb-3">
          <HistogramView />
        </div>
      )}

      {/* Sliders Grid */}
      <div className="space-y-3">
        {sliderGroups[activeCategory].map((s, idx, arr) => {
          const val = (adjustments[s.key as keyof ImageAdjustments] as number) ?? 0;
          const isModified = val !== (DEFAULT_ADJUSTMENTS[s.key as keyof ImageAdjustments] ?? 0);
          const showSectionHeader =
            activeCategory === 'win_photos' &&
            'section' in s &&
            (idx === 0 || (s as { section?: string }).section !== (arr[idx - 1] as { section?: string }).section);

          return (
            <React.Fragment key={s.key}>
              {showSectionHeader && (
                <div className="pt-2 pb-1 border-t border-slate-800 text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{(s as { section?: string }).section}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
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
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

