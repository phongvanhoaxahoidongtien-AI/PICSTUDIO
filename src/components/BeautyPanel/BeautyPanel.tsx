import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Wand2,
  Smile,
  Eye,
  RotateCcw,
  X,
  Palette,
  Check,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { ImageLayer, BeautySettings } from '../../types';
import {
  BEAUTY_PRESETS,
  LIPSTICK_COLORS,
  BLUSH_COLORS,
  DEFAULT_BEAUTY_SETTINGS,
} from '../../utils/beautyProcessing';

type BeautyTab = 'presets' | 'skin' | 'reshape' | 'makeup';

export const BeautyPanel: React.FC = () => {
  const {
    layers,
    activeLayerId,
    setActiveTool,
    updateActiveImageBeauty,
    resetActiveImageBeauty,
    setIsBeforeAfterActive,
    isBeforeAfterActive,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<BeautyTab>('presets');

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image');
  const imgLayer = activeLayer?.type === 'image' ? (activeLayer as ImageLayer) : null;
  const beauty: BeautySettings = imgLayer?.beauty || { ...DEFAULT_BEAUTY_SETTINGS };

  if (!imgLayer) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-4 z-20 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-slate-400 mb-2">Vui lòng chọn một lớp ảnh để sử dụng công cụ làm đẹp.</p>
        <button
          onClick={() => setActiveTool('none')}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300"
        >
          Đóng
        </button>
      </div>
    );
  }

  const handleApplyPreset = (presetId: string) => {
    const found = BEAUTY_PRESETS.find((p) => p.id === presetId);
    if (found) {
      updateActiveImageBeauty({ ...found.settings });
    }
  };

  return (
    <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-800 max-h-[46vh] sm:max-h-[42vh] flex flex-col z-20 shadow-2xl select-none animate-in slide-in-from-bottom duration-200">
      {/* Top Header of Panel */}
      <div className="px-3 sm:px-4 py-2 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-pink-500/20 text-pink-400">
            <Heart className="w-4 h-4 fill-pink-500/30" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              Làm đẹp khuôn mặt
              <span className="text-[10px] px-1.5 py-0.2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded font-medium">
                Offline AI
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Compare Before/After Button */}
          <button
            onMouseDown={() => setIsBeforeAfterActive(true)}
            onMouseUp={() => setIsBeforeAfterActive(false)}
            onMouseLeave={() => setIsBeforeAfterActive(false)}
            onTouchStart={() => setIsBeforeAfterActive(true)}
            onTouchEnd={() => setIsBeforeAfterActive(false)}
            className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
              isBeforeAfterActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Nhấn giữ để so sánh với ảnh gốc"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden xs:inline">Gốc</span>
          </button>

          {/* Reset Beauty */}
          <button
            onClick={resetActiveImageBeauty}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Đặt lại cài đặt làm đẹp"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Close Panel */}
          <button
            onClick={() => setActiveTool('none')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Đóng bảng làm đẹp"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-800/60 overflow-x-auto scrollbar-none shrink-0 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'presets'
              ? 'bg-pink-600/25 text-pink-400 border border-pink-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Gợi ý (Presets)
        </button>

        <button
          onClick={() => setActiveTab('skin')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'skin'
              ? 'bg-pink-600/25 text-pink-400 border border-pink-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Smile className="w-3.5 h-3.5" />
          Làn da
        </button>

        <button
          onClick={() => setActiveTab('reshape')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'reshape'
              ? 'bg-pink-600/25 text-pink-400 border border-pink-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Gương mặt (V-Line/Mắt)
        </button>

        <button
          onClick={() => setActiveTab('makeup')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'makeup'
              ? 'bg-pink-600/25 text-pink-400 border border-pink-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Trang điểm (Son & Má)
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {/* Tab 1: 1-Tap Presets */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {BEAUTY_PRESETS.map((p) => {
              const isSelected = beauty.presetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id)}
                  className={`relative flex flex-col p-2.5 rounded-xl border text-left transition active:scale-95 ${
                    isSelected
                      ? 'bg-pink-950/40 border-pink-500 shadow-md shadow-pink-500/10'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                      {p.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-slate-700/80 text-pink-300 rounded font-medium">
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-400">
                    <span className="text-pink-400 font-semibold">Mịn {p.settings.smooth}%</span>
                    <span>•</span>
                    <span className="text-rose-300">Trắng {p.settings.whiten}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Skin Retouch Sliders */}
        {activeTab === 'skin' && (
          <div className="space-y-3.5 max-w-2xl mx-auto">
            {/* Skin Smooth */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Làm mịn da (Skin Smooth)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.smooth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.smooth}
                onChange={(e) => updateActiveImageBeauty({ smooth: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Xóa khuyết điểm và làm mềm mịn da, giữ nét tự nhiên của mắt và chân mày.</p>
            </div>

            {/* Blemish & Acne Smooth */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Xóa mụn & Khuyết điểm (Blemish Remover)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.blemishSmooth ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.blemishSmooth ?? 0}
                onChange={(e) => updateActiveImageBeauty({ blemishSmooth: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Làm mờ vết thâm, tàn nhang và mụn đỏ trên da.</p>
            </div>

            {/* Whitening */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Làm trắng da (Whitening)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.whiten}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.whiten}
                onChange={(e) => updateActiveImageBeauty({ whiten: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Nâng tone da sáng trong trẻo mà không làm cháy sáng vùng nền.</p>
            </div>

            {/* Teeth Whitening */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Trắng răng rạng rỡ (Teeth Whitening)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.teethWhiten ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.teethWhiten ?? 0}
                onChange={(e) => updateActiveImageBeauty({ teethWhiten: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Khử vàng ố, mang lại nụ cười trắng sáng tự tin như sao Meitu.</p>
            </div>

            {/* Dewy Glow */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Căng bóng da sương mai (Dewy Glass-Skin)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.glow}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.glow}
                onChange={(e) => updateActiveImageBeauty({ glow: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Hiệu ứng sương mai căng mọng phong cách Hàn Quốc.</p>
            </div>

            {/* Tone Warmth */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Tone da hồng hào (Tone Warmth)</span>
                <span className="text-pink-400 font-mono font-bold">
                  {beauty.toneWarmth > 0 ? `+${beauty.toneWarmth}` : beauty.toneWarmth}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={beauty.toneWarmth}
                onChange={(e) => updateActiveImageBeauty({ toneWarmth: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Trắng lạnh</span>
                <span>Tự nhiên</span>
                <span>Hồng hào ấm áp</span>
              </div>
            </div>

            {/* Dark Circles */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Xóa quầng thâm mắt (Dark Circles)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.darkCircles ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.darkCircles ?? 0}
                onChange={(e) => updateActiveImageBeauty({ darkCircles: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Làm sáng bọng mắt, xóa tan vẻ mệt mỏi cho đôi mắt rạng rỡ.</p>
            </div>
          </div>
        )}

        {/* Tab 3: Face Reshape & Body */}
        {activeTab === 'reshape' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center gap-2 text-[11px] text-slate-300">
              <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
              <span>Định vị đường nét thông minh để căn chỉnh tỉ lệ vàng Meitu hoàn toàn tự nhiên.</span>
            </div>

            {/* Slim Face */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Thon gọn cằm / V-Line (Slim Face)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.slimFace}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.slimFace}
                onChange={(e) => updateActiveImageBeauty({ slimFace: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Thu nhỏ góc hàm giúp gương mặt thanh thoát hơn.</p>
            </div>

            {/* Big Eyes */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Mắt to long lanh (Big Eyes)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.bigEyes}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.bigEyes}
                onChange={(e) => updateActiveImageBeauty({ bigEyes: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Phóng to nhẹ vùng mắt tạo ánh nhìn có hồn và thu hút.</p>
            </div>

            {/* Eye Brighten */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Sáng tròng mắt (Eye Brighten)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.eyeBright ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.eyeBright ?? 0}
                onChange={(e) => updateActiveImageBeauty({ eyeBright: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Tăng độ trong và tương phản cho tròng mắt long lanh như đeo lens.</p>
            </div>

            {/* Nose Slim */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Thu gọn sống mũi (Nose Slim)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.noseSlim ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.noseSlim ?? 0}
                onChange={(e) => updateActiveImageBeauty({ noseSlim: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Tạo khối nhẹ hai bên cánh mũi giúp mũi cao và thon thả.</p>
            </div>

            {/* Highlighter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Bắt sáng gò má & Sống mũi (Highlighter)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.highlighter ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.highlighter ?? 0}
                onChange={(e) => updateActiveImageBeauty({ highlighter: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Hiệu ứng ngọc trai bắt sáng tinh tế trên các điểm cao của khuôn mặt.</p>
            </div>

            {/* Body Reshape / Leg Lengthening */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="text-pink-400 font-bold">✨ Meitu Pro:</span>
                  Kéo dài chân / Thon dáng (Body Reshape)
                </span>
                <span className="text-pink-400 font-mono font-bold">{beauty.bodyReshape ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.bodyReshape ?? 0}
                onChange={(e) => updateActiveImageBeauty({ bodyReshape: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Kéo dài đôi chân chuẩn tỉ lệ người mẫu, giữ nguyên khuôn mặt và nửa trên cơ thể.</p>
            </div>
          </div>
        )}

        {/* Tab 4: Makeup (Lipstick, Blush & Sparkle) */}
        {activeTab === 'makeup' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Lipstick Section */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex justify-between text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: beauty.lipstickColor }} />
                  Độ đậm son môi (Lipstick)
                </span>
                <span className="text-pink-400 font-mono font-bold">{beauty.lipstick}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={beauty.lipstick}
                onChange={(e) => updateActiveImageBeauty({ lipstick: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />

              {/* Jelly Gloss */}
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-300 font-medium">Độ bóng mọng môi thạch (Jelly Gloss)</span>
                <span className="text-pink-400 font-mono font-bold">{beauty.lipstickGloss ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.lipstickGloss ?? 0}
                onChange={(e) => updateActiveImageBeauty({ lipstickGloss: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />

              {/* Lipstick Swatches */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1.5">Màu son thời thượng:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {LIPSTICK_COLORS.map((c) => {
                    const isSelected = beauty.lipstickColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        onClick={() => updateActiveImageBeauty({ lipstickColor: c.hex, lipstick: beauty.lipstick === 0 ? 35 : beauty.lipstick })}
                        className={`flex flex-col items-center gap-1 shrink-0 p-1 rounded-lg transition active:scale-95 ${
                          isSelected ? 'bg-slate-700/80 ring-2 ring-pink-500' : 'hover:bg-slate-800/60'
                        }`}
                        title={c.name}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-white/20 shadow-inner flex items-center justify-center"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                        </div>
                        <span className="text-[9px] text-slate-300 whitespace-nowrap">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Blush Section */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex justify-between text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: beauty.blushColor }} />
                  Độ đậm má hồng (Blush)
                </span>
                <span className="text-pink-400 font-mono font-bold">{beauty.blush}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={beauty.blush}
                onChange={(e) => updateActiveImageBeauty({ blush: Number(e.target.value), presetId: undefined })}
                className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />

              {/* Blush Swatches */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1.5">Tone màu má hồng:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {BLUSH_COLORS.map((c) => {
                    const isSelected = beauty.blushColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        onClick={() => updateActiveImageBeauty({ blushColor: c.hex, blush: beauty.blush === 0 ? 30 : beauty.blush })}
                        className={`flex flex-col items-center gap-1 shrink-0 p-1 rounded-lg transition active:scale-95 ${
                          isSelected ? 'bg-slate-700/80 ring-2 ring-pink-500' : 'hover:bg-slate-800/60'
                        }`}
                        title={c.name}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-white/20 shadow-inner flex items-center justify-center"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                        </div>
                        <span className="text-[9px] text-slate-300 whitespace-nowrap">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sparkle Dust Kira-Kira */}
            <div className="space-y-1 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex justify-between text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Bụi sao lấp lánh (Meitu Kira-Kira)
                </span>
                <span className="text-amber-400 font-mono font-bold">{beauty.sparkleDust ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beauty.sparkleDust ?? 0}
                onChange={(e) => updateActiveImageBeauty({ sparkleDust: Number(e.target.value), presetId: undefined })}
                className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Hiệu ứng kim tuyến ngôi sao lấp lánh bắt sáng quanh mắt và gò má.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
