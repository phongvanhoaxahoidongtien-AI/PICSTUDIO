import React, { useState } from 'react';
import { Smile, X, Flame, Sparkles, Share2, ShoppingBag, Video, MessageCircle, Award, Frame, Shapes, Search, Check } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { OFFLINE_STICKERS, type StickerItem } from '../../utils/stickers';
import type { StickerLayer, ImageLayer } from '../../types';

export const StickersPanel: React.FC = () => {
  const { layers, updateLayer, removeLayer, addLayer, canvasWidth, canvasHeight, setActiveTool, pushHistory } = useEditorStore();
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

  // Bake / Flatten all sticker layers directly onto base photo canvas (Tạm lưu sticker vào ảnh)
  const handleBakeAllStickersToPhoto = async () => {
    const baseLayer = layers.find((l) => l.type === 'image') as ImageLayer | undefined;
    const stickerLayers = layers.filter((l) => l.type === 'sticker') as StickerLayer[];
    if (!baseLayer || stickerLayers.length === 0) {
      setActiveTool('none');
      return;
    }

    pushHistory();
    const naturalW = baseLayer.originalWidth || baseLayer.width || canvasWidth;
    const naturalH = baseLayer.originalHeight || baseLayer.height || canvasHeight;

    const canvas = document.createElement('canvas');
    canvas.width = naturalW;
    canvas.height = naturalH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    if (!baseLayer.src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = baseLayer.src;
    });

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, naturalW, naturalH);

    const scaleX = naturalW / canvasWidth;
    const scaleY = naturalH / canvasHeight;

    for (const sl of stickerLayers) {
      if (!sl.svgContent) continue;
      try {
        const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sl.svgContent)}`;
        const sImg = new Image();
        await new Promise<void>((resolve, reject) => {
          sImg.onload = () => resolve();
          sImg.onerror = reject;
          sImg.src = svgDataUrl;
        });

        ctx.save();
        const centerX = (sl.x + (sl.width * sl.scaleX) / 2) * scaleX;
        const centerY = (sl.y + (sl.height * sl.scaleY) / 2) * scaleY;
        const sw = sl.width * sl.scaleX * scaleX;
        const sh = sl.height * sl.scaleY * scaleY;

        ctx.translate(centerX, centerY);
        if (sl.rotation) {
          ctx.rotate((sl.rotation * Math.PI) / 180);
        }
        ctx.globalAlpha = sl.opacity ?? 1;
        ctx.drawImage(sImg, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();
      } catch (err) {
        console.error('Failed to bake sticker:', err);
      }
    }

    const isPng = baseLayer.src.startsWith('data:image/png') || (baseLayer.name && baseLayer.name.endsWith('.png'));
    const newSrc = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.98);

    updateLayer(baseLayer.id, {
      src: newSrc,
      originalWidth: naturalW,
      originalHeight: naturalH,
    });

    for (const sl of stickerLayers) {
      removeLayer(sl.id);
    }
    useEditorStore.getState().setActiveLayerId(baseLayer.id);

    setActiveTool('none');

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
    }, 40);
  };

  const stickerLayerCount = layers.filter((l) => l.type === 'sticker').length;

  return (
    <div className="bg-slate-900/95 border-t lg:border-t-0 border-slate-800 p-3 sm:p-4 shrink-0 w-full h-full max-h-[44dvh] lg:max-h-none overflow-y-auto select-none backdrop-blur-md flex flex-col font-sans">
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

      {/* Persistent Bottom Action Bar for Quick Bake / Flatten / Commit */}
      {stickerLayerCount > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={handleBakeAllStickersToPhoto}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-95"
            title="Lưu tất cả sticker vĩnh viễn vào ảnh gốc để có thể cắt, xoay hoặc chỉnh sửa tiếp theo"
          >
            <Check className="w-4 h-4" />
            <span>Tạm lưu sticker vào ảnh ({stickerLayerCount})</span>
          </button>
          <button
            onClick={() => setActiveTool('none')}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition active:scale-95"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};
