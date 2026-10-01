import React, { useState } from 'react';
import { Smile, X, Flame, Sparkles, Share2, ShoppingBag, Video, MessageCircle, Award, Frame, Shapes, Search } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { OFFLINE_STICKERS, type StickerItem } from '../../utils/stickers';
import type { StickerLayer } from '../../types';

export const StickersPanel: React.FC = () => {
  const { addLayer, canvasWidth, canvasHeight, setActiveTool, pushHistory } = useEditorStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'trending', label: 'Thịnh hành (Trending)', icon: Flame, isHot: true },
    { id: 'reaction', label: 'Biểu cảm & Tim ❤️', icon: MessageCircle, isHot: true },
    { id: 'all', label: 'Tất cả', icon: Sparkles },
    { id: 'social', label: 'Mạng xã hội', icon: Share2 },
    { id: 'ecommerce', label: 'Bán hàng / Sale', icon: ShoppingBag },
    { id: 'vlog', label: 'Vlog & Story', icon: Video },
    { id: 'badge', label: 'Huy hiệu', icon: Award },
    { id: 'frame', label: 'Khung ảnh', icon: Frame },
    { id: 'shape', label: 'Mũi tên & Hình', icon: Shapes },
  ];

  const filteredStickers = OFFLINE_STICKERS.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const handleAddSticker = (sticker: StickerItem) => {
    const maxDim = Math.min(canvasWidth, canvasHeight) * 0.35;
    const initialScale = Math.min(1, maxDim / Math.max(sticker.defaultWidth, sticker.defaultHeight));
    const finalW = Math.round(sticker.defaultWidth * initialScale);
    const finalH = Math.round(sticker.defaultHeight * initialScale);

    const newLayer: StickerLayer = {
      id: 'sticker_' + Date.now(),
      name: sticker.name,
      type: 'sticker',
      stickerId: sticker.id,
      category: sticker.category,
      svgContent: sticker.svg,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      x: Math.round((canvasWidth - finalW) / 2),
      y: Math.round((canvasHeight - finalH) / 2),
      width: finalW,
      height: finalH,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    addLayer(newLayer);
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 max-h-[50vh] overflow-y-auto select-none backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Smile className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Sticker & Khung Nhấn Mạnh ({OFFLINE_STICKERS.length} sticker)
          </h3>
        </div>
        <button
          onClick={() => setActiveTool('none')}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm sticker: khung đỏ nét đứt, bong bóng thoại, doodle, sale, tim..."
          className="w-full bg-slate-800/80 text-white text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none mb-3 pb-1">
        {categories.map((c) => {
          const Icon = c.icon;
          const isSelected = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition active:scale-95 ${
                isSelected
                  ? c.isHot
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md font-bold'
                    : 'bg-indigo-600 text-white shadow-md font-semibold'
                  : c.isHot
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${c.isHot && !isSelected ? 'text-rose-400 animate-pulse' : ''}`} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stickers Grid */}
      {filteredStickers.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">
          Không tìm thấy sticker nào phù hợp với &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {filteredStickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => handleAddSticker(sticker)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-750 hover:border-indigo-500 transition active:scale-95 group shadow-sm"
              title={`Nhấn để thêm: ${sticker.name}`}
            >
              <div
                className="w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-110"
                dangerouslySetInnerHTML={{ __html: sticker.svg }}
              />
              <span className="text-[11px] text-slate-300 font-medium mt-1.5 truncate w-full text-center group-hover:text-white transition">
                {sticker.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
