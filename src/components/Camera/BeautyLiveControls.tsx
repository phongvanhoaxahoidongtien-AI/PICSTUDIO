import React from 'react';
import { Sparkles, Smile, Sun, Sliders, Check } from 'lucide-react';
import { FILTER_PRESETS } from '../../utils/filters';
import { BEAUTY_PRESETS } from '../../utils/beautyProcessing';

export interface LiveBeautySettings {
  smooth: number;     // 0 to 100
  whiten: number;     // 0 to 100
  glow: number;       // 0 to 100
  filterId: string;   // filter preset id
  presetId?: string;  // beauty preset id
}

interface BeautyLiveControlsProps {
  settings: LiveBeautySettings;
  onChange: (updates: Partial<LiveBeautySettings>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const BeautyLiveControls: React.FC<BeautyLiveControlsProps> = ({
  settings,
  onChange,
  isOpen,
  onToggleOpen,
}) => {
  // Top 10 popular camera filters
  const cameraFilters = [
    { id: 'normal', name: 'Gốc' },
    { id: 'cinematic', name: 'Điện ảnh' },
    { id: 'vintage_70', name: 'Vintage' },
    { id: 'film_classic', name: 'Phim' },
    { id: 'warm_sunset', name: 'Hoàng hôn' },
    { id: 'cool_breeze', name: 'Trong trẻo' },
    { id: 'noir_bw', name: 'Trắng đen' },
    { id: 'moody_dark', name: 'Moody' },
    { id: 'pastel_dream', name: 'Pastel' },
    { id: 'cyberpunk_neon', name: 'Cyber' },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto z-20 pointer-events-auto">
      {/* Floating Toggle Pill */}
      <button
        onClick={onToggleOpen}
        className={`mb-2.5 px-3.5 py-1.5 rounded-full backdrop-blur-md border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-lg ${
          isOpen || settings.smooth > 0 || settings.whiten > 0 || settings.filterId !== 'normal'
            ? 'bg-pink-600/80 border-pink-400 text-white shadow-pink-600/30'
            : 'bg-black/60 border-white/20 text-slate-200 hover:bg-black/80'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 fill-current" />
        <span>Làm đẹp & Bộ lọc live</span>
        {(settings.smooth > 0 || settings.whiten > 0 || settings.filterId !== 'normal') && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        )}
      </button>

      {/* Expanded Controls Drawer */}
      {isOpen && (
        <div className="w-full bg-black/80 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 mb-2 text-white shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-3">
          {/* Quick Beauty Presets */}
          <div>
            <span className="text-[11px] text-pink-300 font-semibold block mb-1.5">
              Preset làm đẹp tức thì:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {BEAUTY_PRESETS.slice(0, 5).map((p) => {
                const isSelected = settings.presetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() =>
                      onChange({
                        presetId: p.id,
                        smooth: p.settings.smooth,
                        whiten: p.settings.whiten,
                        glow: p.settings.glow,
                      })
                    }
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium shrink-0 transition active:scale-95 border ${
                      isSelected
                        ? 'bg-pink-600 border-pink-400 text-white shadow-md shadow-pink-600/40'
                        : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Sliders: Smooth & Whiten */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/10">
            {/* Smooth */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 flex items-center gap-1">
                  <Smile className="w-3 h-3 text-pink-400" /> Mịn da
                </span>
                <span className="text-pink-400 font-mono font-bold">{settings.smooth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.smooth}
                onChange={(e) => onChange({ smooth: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>

            {/* Whiten */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-300" /> Sáng hồng
                </span>
                <span className="text-pink-400 font-mono font-bold">{settings.whiten}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.whiten}
                onChange={(e) => onChange({ whiten: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Color Filters */}
          <div className="pt-1 border-t border-white/10">
            <span className="text-[11px] text-slate-300 font-semibold block mb-1.5">
              Bộ lọc màu real-time:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {cameraFilters.map((f) => {
                const isSelected = settings.filterId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onChange({ filterId: f.id })}
                    className={`flex flex-col items-center gap-0.5 p-1 rounded-xl shrink-0 transition active:scale-95 ${
                      isSelected
                        ? 'bg-pink-600/30 ring-2 ring-pink-500 text-pink-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center text-[10px] font-bold ${
                        isSelected
                          ? 'border-pink-400 bg-pink-500/30'
                          : 'border-white/15 bg-white/10'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 text-white" /> : f.name[0]}
                    </div>
                    <span className="text-[10px] truncate max-w-[54px]">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
