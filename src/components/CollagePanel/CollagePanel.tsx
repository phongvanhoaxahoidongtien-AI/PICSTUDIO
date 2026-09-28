import React from 'react';
import {
  LayoutGrid,
  Columns,
  Rows,
  Grid2x2,
  Grid3x3,
  ImagePlus,
  Palette,
  X,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { CollageLayoutType, ImageLayer } from '../../types';

interface CollagePanelProps {
  onAddMorePhotos: () => void;
}

export const CollagePanel: React.FC<CollagePanelProps> = ({ onAddMorePhotos }) => {
  const {
    layers,
    setLayers,
    canvasWidth,
    canvasHeight,
    canvasBackgroundColor,
    setCanvasBackgroundColor,
    setCanvasDimensions,
    collageConfig,
    setCollageConfig,
    setActiveTool,
    pushHistory,
  } = useEditorStore();

  const imageLayers = layers.filter((l) => l.type === 'image') as ImageLayer[];

  const layoutTemplates: { id: CollageLayoutType; label: string; icon: React.ReactNode }[] = [
    { id: 'freeform', label: 'Tự do', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'split-v', label: '2 Dọc (Split V)', icon: <Columns className="w-4 h-4" /> },
    { id: 'split-h', label: '2 Ngang (Split H)', icon: <Rows className="w-4 h-4" /> },
    { id: 'grid-3-top', label: '3 Ảnh (1 Trên 2 Dưới)', icon: <Grid2x2 className="w-4 h-4" /> },
    { id: 'grid-4', label: '4 Ô (2x2 Quad)', icon: <Grid2x2 className="w-4 h-4" /> },
    { id: 'grid-6', label: '6 Ô (3x2)', icon: <Grid3x3 className="w-4 h-4" /> },
    { id: 'grid-9', label: '9 Ô (3x3)', icon: <Grid3x3 className="w-4 h-4" /> },
  ];

  const aspectRatios = [
    { label: '1:1 Vuông', w: 1080, h: 1080 },
    { label: '4:5 IG Feed', w: 1080, h: 1350 },
    { label: '9:16 Story', w: 1080, h: 1920 },
    { label: '16:9 Rộng', w: 1920, h: 1080 },
  ];

  const colorSwatches = ['#0f172a', '#ffffff', '#f8fafc', '#18181b', '#fef3c7', '#fce7f3', '#e0e7ff'];

  // Apply grid layout algorithm
  const applyLayout = (layout: CollageLayoutType, spacing = collageConfig.spacing) => {
    setCollageConfig({ layout, spacing });
    if (layout === 'freeform' || imageLayers.length === 0) return;

    pushHistory();
    const updatedLayers = [...layers];
    const imgs = updatedLayers.filter((l) => l.type === 'image') as ImageLayer[];

    const W = canvasWidth;
    const H = canvasHeight;
    const s = spacing;

    if (layout === 'split-v') {
      const cellW = (W - s * 3) / 2;
      const cellH = H - s * 2;
      imgs.forEach((img, i) => {
        if (i < 2) {
          img.x = s + i * (cellW + s);
          img.y = s;
          img.width = cellW;
          img.height = cellH;
          img.rotation = 0;
          img.scaleX = 1;
          img.scaleY = 1;
        }
      });
    } else if (layout === 'split-h') {
      const cellW = W - s * 2;
      const cellH = (H - s * 3) / 2;
      imgs.forEach((img, i) => {
        if (i < 2) {
          img.x = s;
          img.y = s + i * (cellH + s);
          img.width = cellW;
          img.height = cellH;
          img.rotation = 0;
          img.scaleX = 1;
          img.scaleY = 1;
        }
      });
    } else if (layout === 'grid-3-top') {
      if (imgs[0]) {
        imgs[0].x = s;
        imgs[0].y = s;
        imgs[0].width = W - s * 2;
        imgs[0].height = (H - s * 3) / 2;
        imgs[0].rotation = 0;
      }
      const bW = (W - s * 3) / 2;
      const bH = (H - s * 3) / 2;
      if (imgs[1]) {
        imgs[1].x = s;
        imgs[1].y = s * 2 + bH;
        imgs[1].width = bW;
        imgs[1].height = bH;
        imgs[1].rotation = 0;
      }
      if (imgs[2]) {
        imgs[2].x = s * 2 + bW;
        imgs[2].y = s * 2 + bH;
        imgs[2].width = bW;
        imgs[2].height = bH;
        imgs[2].rotation = 0;
      }
    } else if (layout === 'grid-4') {
      const cellW = (W - s * 3) / 2;
      const cellH = (H - s * 3) / 2;
      imgs.forEach((img, i) => {
        if (i < 4) {
          const col = i % 2;
          const row = Math.floor(i / 2);
          img.x = s + col * (cellW + s);
          img.y = s + row * (cellH + s);
          img.width = cellW;
          img.height = cellH;
          img.rotation = 0;
        }
      });
    } else if (layout === 'grid-6') {
      const cellW = (W - s * 4) / 3;
      const cellH = (H - s * 3) / 2;
      imgs.forEach((img, i) => {
        if (i < 6) {
          const col = i % 3;
          const row = Math.floor(i / 3);
          img.x = s + col * (cellW + s);
          img.y = s + row * (cellH + s);
          img.width = cellW;
          img.height = cellH;
          img.rotation = 0;
        }
      });
    } else if (layout === 'grid-9') {
      const cellW = (W - s * 4) / 3;
      const cellH = (H - s * 4) / 3;
      imgs.forEach((img, i) => {
        if (i < 9) {
          const col = i % 3;
          const row = Math.floor(i / 3);
          img.x = s + col * (cellW + s);
          img.y = s + row * (cellH + s);
          img.width = cellW;
          img.height = cellH;
          img.rotation = 0;
        }
      });
    }

    setLayers(updatedLayers);
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 max-h-[46vh] overflow-y-auto select-none backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Ghép ảnh Collage ({imageLayers.length} ảnh)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddMorePhotos}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95 transition"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span>Thêm ảnh ghép</span>
          </button>
          <button
            onClick={() => setActiveTool('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Layout Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-300 font-medium">Bố cục lưới:</span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
            {layoutTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyLayout(t.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition active:scale-95 ${
                  collageConfig.layout === t.id
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {t.icon}
                <span className="text-[11px] truncate w-full text-center">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spacing Slider & Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Spacing */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Khoảng cách viền:</span>
              <span className="font-mono text-indigo-400 font-bold">{collageConfig.spacing}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={collageConfig.spacing}
              onChange={(e) => applyLayout(collageConfig.layout, Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Aspect Ratio */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1">
            <span className="text-xs text-slate-300 font-medium mb-1">Tỷ lệ khung nền:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.label}
                  onClick={() => setCanvasDimensions(ar.w, ar.h)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                    canvasWidth === ar.w && canvasHeight === ar.h
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700/60 text-slate-300 hover:text-white'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Background Color */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Màu nền canvas:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="color"
              value={canvasBackgroundColor}
              onChange={(e) => setCanvasBackgroundColor(e.target.value)}
              className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer"
            />
            {colorSwatches.map((color) => (
              <button
                key={color}
                onClick={() => setCanvasBackgroundColor(color)}
                style={{ backgroundColor: color }}
                className={`w-6 h-6 rounded-full border border-slate-600 transition ${
                  canvasBackgroundColor === color ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
