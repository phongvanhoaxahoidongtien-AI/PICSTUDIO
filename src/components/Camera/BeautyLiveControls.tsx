import React, { useState } from 'react';
import { Sparkles, Smile, Sun, Check, Wand2, Heart, Camera, Zap } from 'lucide-react';
import {
  SNOW_AR_STICKERS,
  SNOW_FILTERS,
  type SnowArEffect,
  type SnowFilterTone,
} from '../../utils/snowCameraEffects';

export interface LiveBeautySettings {
  smooth: number;        // 0 to 100
  whiten: number;        // 0 to 100
  glow: number;          // 0 to 100
  brightnessBoost: number; // 0 to 60 (Photo Wonder & SNOW skin brightening)
  slimFace?: number;     // 0 to 100
  bigEyes?: number;      // 0 to 100
  filterId: string;      // generic filter preset id
  snowFilter?: SnowFilterTone;
  arEffect?: SnowArEffect;
  presetId?: string;     // beauty preset id
  aspectRatio?: '3:4' | '9:16' | '1:1';
  timestampWatermark?: boolean;
}

interface BeautyLiveControlsProps {
  settings: LiveBeautySettings;
  onChange: (updates: Partial<LiveBeautySettings>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

type TabType = 'snow_filters' | 'ar_stickers' | 'retouch';

export const BeautyLiveControls: React.FC<BeautyLiveControlsProps> = ({
  settings,
  onChange,
  isOpen,
  onToggleOpen,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('snow_filters');

  const hasActiveEffects =
    settings.smooth > 0 ||
    settings.whiten > 0 ||
    settings.glow > 0 ||
    (settings.brightnessBoost ?? 0) > 0 ||
    (settings.slimFace ?? 0) > 0 ||
    (settings.snowFilter && settings.snowFilter !== 'none') ||
    (settings.arEffect && settings.arEffect !== 'none') ||
    settings.filterId !== 'normal';

  const beautyPresets = [
    {
      id: 'wonder_sweet',
      name: '💖 Wonder Sweet',
      sub: 'Photo Wonder má hồng',
      smooth: 65,
      whiten: 48,
      glow: 40,
      brightnessBoost: 30,
      slimFace: 32,
      snowFilter: 'snow_peach' as SnowFilterTone,
    },
    {
      id: 'snow_white',
      name: '❄️ Bạch Tuyết SNOW',
      sub: 'Trắng sáng tinh khôi',
      smooth: 68,
      whiten: 55,
      glow: 45,
      brightnessBoost: 35,
      slimFace: 30,
      snowFilter: 'snow_dewy' as SnowFilterTone,
    },
    {
      id: 'korean_idol',
      name: '✨ Idol K-Pop',
      sub: 'Bừng sáng sân khấu',
      smooth: 70,
      whiten: 45,
      glow: 50,
      brightnessBoost: 28,
      slimFace: 38,
      snowFilter: 'snow_cherry' as SnowFilterTone,
    },
    {
      id: 'glass_skin',
      name: '💧 Glass Skin',
      sub: 'Căng mọng Hàn Quốc',
      smooth: 58,
      whiten: 40,
      glow: 55,
      brightnessBoost: 25,
      slimFace: 25,
      snowFilter: 'snow_dewy' as SnowFilterTone,
    },
    {
      id: 'vintage_film',
      name: '🎞️ Film SNOW 90s',
      sub: 'Ấm áp hoài niệm',
      smooth: 45,
      whiten: 20,
      glow: 25,
      brightnessBoost: 15,
      slimFace: 20,
      snowFilter: 'snow_film' as SnowFilterTone,
    },
    {
      id: 'natural',
      name: '🌿 Tự nhiên',
      sub: 'Sáng nhẹ mộc mạc',
      smooth: 30,
      whiten: 20,
      glow: 18,
      brightnessBoost: 15,
      slimFace: 12,
      snowFilter: 'none' as SnowFilterTone,
    },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto z-20 pointer-events-auto">
      {/* Floating Toggle Pill (Photo Wonder & SNOW Style) */}
      <button
        onClick={onToggleOpen}
        className={`mb-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-xl ${
          isOpen || hasActiveEffects
            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 border-pink-300 text-white shadow-pink-600/40'
            : 'bg-black/60 border-white/20 text-slate-200 hover:bg-black/80'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
        <span>Làm đẹp & Bộ lọc (SNOW / Photo Wonder)</span>
        {hasActiveEffects && (
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping ml-0.5" />
        )}
      </button>

      {/* Expanded Controls Drawer */}
      {isOpen && (
        <div className="w-full bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-3 mb-2 text-white shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-2.5">
          {/* Quick Snow & Photo Wonder Presets */}
          <div className="space-y-1">
            <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wider px-1">
              Chế độ chụp đẹp Photo Wonder & SNOW:
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {beautyPresets.map((p) => {
                const isSelected = settings.presetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() =>
                      onChange({
                        presetId: p.id,
                        smooth: p.smooth,
                        whiten: p.whiten,
                        glow: p.glow,
                        brightnessBoost: p.brightnessBoost,
                        slimFace: p.slimFace,
                        snowFilter: p.snowFilter,
                      })
                    }
                    className={`py-1.5 px-1 rounded-xl text-center transition active:scale-95 border flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-pink-400 text-white shadow-md shadow-pink-500/30'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-tight truncate w-full">{p.name}</span>
                    <span className="text-[9px] text-pink-200/80 leading-tight">{p.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabs Selector: SNOW Filters, AR Stickers, Retouch */}
          <div className="flex items-center justify-center gap-1 p-0.5 bg-white/10 rounded-2xl">
            <button
              onClick={() => setActiveTab('snow_filters')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                activeTab === 'snow_filters'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Bộ lọc SNOW</span>
            </button>

            <button
              onClick={() => setActiveTab('retouch')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                activeTab === 'retouch'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Wand2 className="w-3 h-3" />
              <span>Sáng da & Mịn</span>
            </button>

            <button
              onClick={() => setActiveTab('ar_stickers')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                activeTab === 'ar_stickers'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>AR Sticker</span>
            </button>
          </div>

          {/* Tab 1: SNOW Filters */}
          {activeTab === 'snow_filters' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {SNOW_FILTERS.map((f) => {
                  const isSelected = (settings.snowFilter ?? 'none') === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => onChange({ snowFilter: f.id as SnowFilterTone })}
                      className={`flex flex-col items-center gap-1 p-1 rounded-xl shrink-0 transition active:scale-95 ${
                        isSelected
                          ? 'text-pink-300 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xs font-bold shadow-md transition ${
                          isSelected
                            ? 'border-pink-400 bg-gradient-to-tr from-pink-500 to-rose-500 text-white scale-105 shadow-pink-500/30'
                            : 'border-white/15 bg-white/10 text-slate-300'
                        }`}
                      >
                        {isSelected ? <Check className="w-5 h-5 text-white stroke-[3]" /> : f.name.slice(0, 2)}
                      </div>
                      <span className="text-[10px] truncate max-w-[60px] text-center">{f.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Retouch Sliders */}
          {activeTab === 'retouch' && (
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Brightness / Exposure Boost */}
              <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-medium">
                    <Sun className="w-3 h-3 text-amber-300" /> Tăng sáng bừng da
                  </span>
                  <span className="text-amber-400 font-mono font-bold">+{settings.brightnessBoost ?? 25}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={settings.brightnessBoost ?? 25}
                  onChange={(e) => onChange({ brightnessBoost: Number(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Whiten */}
              <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-pink-300" /> Trắng hồng đào
                  </span>
                  <span className="text-pink-400 font-mono font-bold">{settings.whiten}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.whiten}
                  onChange={(e) => onChange({ whiten: Number(e.target.value) })}
                  className="w-full accent-pink-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Smooth */}
              <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-medium">
                    <Smile className="w-3 h-3 text-pink-400" /> Mịn màng
                  </span>
                  <span className="text-pink-400 font-mono font-bold">{settings.smooth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.smooth}
                  onChange={(e) => onChange({ smooth: Number(e.target.value) })}
                  className="w-full accent-pink-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Dewy Glow */}
              <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-rose-300" /> Căng bóng (Glow)
                  </span>
                  <span className="text-rose-400 font-mono font-bold">{settings.glow}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.glow}
                  onChange={(e) => onChange({ glow: Number(e.target.value) })}
                  className="w-full accent-rose-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tab 3: AR Stickers */}
          {activeTab === 'ar_stickers' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {SNOW_AR_STICKERS.map((stk) => {
                  const isSelected = (settings.arEffect ?? 'none') === stk.id;
                  return (
                    <button
                      key={stk.id}
                      onClick={() => onChange({ arEffect: stk.id as SnowArEffect })}
                      className={`flex flex-col items-center gap-1 p-1 rounded-xl shrink-0 transition active:scale-95 ${
                        isSelected
                          ? 'text-pink-300 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-lg shadow-md transition ${
                          isSelected
                            ? 'border-pink-400 bg-pink-500/40 scale-105 shadow-pink-500/40 ring-2 ring-pink-400/50'
                            : 'border-white/15 bg-white/10'
                        }`}
                      >
                        {stk.emoji}
                      </div>
                      <span className="text-[10px] truncate max-w-[64px] text-center">{stk.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
