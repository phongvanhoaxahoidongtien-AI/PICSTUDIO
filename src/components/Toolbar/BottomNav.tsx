import React from 'react';
import {
  Crop,
  Sliders,
  Sparkles,
  Type,
  LayoutGrid,
  Paintbrush,
  Smile,
  Layers as LayersIcon,
  ImagePlus,
  Heart,
  Camera,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { ToolType } from '../../types';

interface BottomNavProps {
  onOpenFilePicker: () => void;
  onOpenCamera?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenFilePicker, onOpenCamera }) => {
  const { activeTool, setActiveTool, layers } = useEditorStore();

  const isMultiLayerMode = activeTool === 'layers' || activeTool === 'collage';
  const hasImage = layers.some((l) => l.type === 'image');

  const tools: { id: ToolType; label: string; icon: React.ReactNode }[] = [
    { id: 'beauty', label: 'Làm đẹp', icon: <Heart className="w-5 h-5 text-pink-400" /> },
    { id: 'adjust', label: 'Chỉnh màu', icon: <Sliders className="w-5 h-5" /> },
    { id: 'filters', label: 'Bộ lọc', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'crop', label: 'Cắt / Xoay', icon: <Crop className="w-5 h-5" /> },
    { id: 'text', label: 'Chữ', icon: <Type className="w-5 h-5" /> },
    { id: 'collage', label: 'Ghép ảnh', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'draw', label: 'Vẽ bút', icon: <Paintbrush className="w-5 h-5" /> },
    { id: 'stickers', label: 'Sticker', icon: <Smile className="w-5 h-5" /> },
    { id: 'layers', label: 'Lớp ảnh', icon: <LayersIcon className="w-5 h-5" /> },
  ];

  return (
    <nav
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      className="w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-800 z-30 select-none shrink-0"
    >
      <div
        style={{
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0px))',
        }}
        className="h-14 flex items-center gap-1 sm:gap-2 overflow-x-auto w-full justify-start sm:justify-center py-1 scrollbar-none"
      >
        {/* Quick Camera Capture Button */}
        {onOpenCamera && (
          <button
            onClick={onOpenCamera}
            className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-xl text-pink-400 hover:text-pink-300 hover:bg-pink-950/30 transition shrink-0 active:scale-95"
            title="Mở Camera chụp ảnh đẹp"
          >
            <div className="p-1 rounded-lg bg-pink-500/20 text-pink-400 shadow-sm shadow-pink-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Chụp ảnh</span>
          </button>
        )}

        {/* Quick Open/Change Photo or Add Layer Button */}
        <button
          onClick={onOpenFilePicker}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30 transition shrink-0 active:scale-95"
          title={
            isMultiLayerMode
              ? 'Thêm lớp ảnh mới (Ghép ảnh / Đa lớp)'
              : hasImage
              ? 'Đổi ảnh khác để chỉnh sửa đơn ảnh'
              : 'Mở ảnh từ máy để chỉnh sửa'
          }
        >
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
            <ImagePlus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium mt-0.5">
            {isMultiLayerMode ? 'Thêm lớp' : hasImage ? 'Đổi ảnh' : 'Mở ảnh'}
          </span>
        </button>

        <div className="w-[1px] h-7 bg-slate-800 shrink-0 mx-0.5" />

        {/* Editing Tool Tabs */}
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          const isBeauty = t.id === 'beauty';
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(isActive ? 'none' : t.id)}
              className={`flex flex-col items-center justify-center min-w-[58px] sm:min-w-[68px] py-1 px-1.5 rounded-xl transition shrink-0 active:scale-95 ${
                isActive
                  ? isBeauty
                    ? 'bg-pink-600/25 text-pink-400 border border-pink-500/40 font-semibold'
                    : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t.icon}
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
