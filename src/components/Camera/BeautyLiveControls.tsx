import React, { useState } from 'react';
import { Sparkles, Smile, Sun, Check, Wand2, Heart, Camera } from 'lucide-react';
import {
  SNOW_AR_STICKERS,
  SNOW_FILTERS,
  type SnowArEffect,
  type SnowFilterTone,
} from '../../utils/snowCameraEffects';

export interface LiveBeautySettings {
  smooth: number;     // 0 to 100
  whiten: number;     // 0 to 100
  glow: number;       // 0 to 100
  slimFace?: number;  // 0 to 100
  bigEyes?: number;   // 0 to 100
  filterId: string;   // generic filter preset id
  snowFilter?: SnowFilterTone;
  arEffect?: SnowArEffect;
  presetId?: string;  // beauty preset id
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
    (settings.slimFace ?? 0) > 0 ||
    (settings.snowFilter && settings.snowFilter !== 'none') ||
    (settings.arEffect && settings.arEffect !== 'none') ||
    settings.filterId !== 'normal';

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto z-20 pointer-events-auto">
      {/* Floating Toggle Pill (SNOW Style) */}
      <button
        onClick={onToggleOpen}
        className={`mb-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-xl ${
          isOpen || hasActiveEffects
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-pink-300 text-white shadow-pink-600/40'
            : 'bg-black/60 border-white/20 text-slate-200 hover:bg-black/80'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
        <span>SNOW Làm đẹp & AR Filter</span>
        {hasActiveEffects && (
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping ml-0.5" />
        )}
      </button>

      {/* Expanded Controls Drawer */}
      {isOpen && (
        <div className="w-full bg-slate-950/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-3 mb-2 text-white shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-2.5">
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

            <button
              onClick={() => setActiveTab('retouch')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                activeTab === 'retouch'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Wand2 className="w-3 h-3" />
              <span>Làm mịn da</span>
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
                      <span className="text-[10px] truncate max-w-[62px] text-center">{f.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: AR Face Stickers */}
          {activeTab === 'ar_stickers' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {SNOW_AR_STICKERS.map((stk) => {
                  const isSelected = (settings.arEffect ?? 'none') === stk.id;
                  return (
                    <button
                      key={stk.id}
                      onClick={() => onChange({ arEffect: stk.id })}
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

          {/* Tab 3: Retouch Sliders */}
          {activeTab === 'retouch' && (
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Smooth */}
              <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-medium">
                    <Smile className="w-3 h-3 text-pink-400" /> Mịn da
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

              {/* Whiten */}
              <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-medium">
                    <Sun className="w-3 h-3 text-amber-300" /> Sáng hồng
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

              {/* Dewy Glow */}
              <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-rose-300" /> Căng bóng
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

              {/* Slim Face V-line */}
              <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-medium">
                    <Wand2 className="w-3 h-3 text-indigo-400" /> Gọn cằm
                  </span>
                  <span className="text-indigo-400 font-mono font-bold">{settings.slimFace ?? 20}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.slimFace ?? 20}
                  onChange={(e) => onChange({ slimFace: Number(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
