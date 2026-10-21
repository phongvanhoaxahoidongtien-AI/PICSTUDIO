import React, { useState } from 'react';
import {
  Type,
  Plus,
  Minus,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type { TextLayer, ImageLayer } from '../../types';

export const TextPanel: React.FC = () => {
  const {
    layers,
    activeLayerId,
    addLayer,
    updateActiveText,
    updateLayer,
    removeLayer,
    canvasWidth,
    canvasHeight,
    setActiveTool,
    pushHistory,
  } = useEditorStore();

  const activeLayer = layers.find((l) => l.id === activeLayerId && l.type === 'text') as TextLayer | undefined;

  const fontOptions = [
    { label: 'Plus Jakarta', value: 'Plus Jakarta Sans' },
    { label: 'Montserrat', value: 'Montserrat' },
    { label: 'Playfair (Cổ điển)', value: 'Playfair Display' },
    { label: 'Caveat (Viết tay)', value: 'Caveat' },
    { label: 'Pacifico (Uốn lượn)', value: 'Pacifico' },
    { label: 'Oswald (Mạnh mẽ)', value: 'Oswald' },
    { label: 'Sans-Serif', value: 'sans-serif' },
    { label: 'Serif', value: 'serif' },
  ];

  const colorSwatches = [
    '#ffffff',
    '#000000',
    '#f43f5e',
    '#fbbf24',
    '#10b981',
    '#38bdf8',
    '#818cf8',
    '#c084fc',
    '#f472b6',
  ];

  const handleAddText = () => {
    pushHistory();
    const newText: TextLayer = {
      id: 'text_' + Date.now(),
      name: 'Văn bản',
      type: 'text',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      text: 'Chạm để sửa chữ',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 48,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'center',
      fill: '#ffffff',
      x: canvasWidth / 4,
      y: canvasHeight / 2 - 40,
      width: canvasWidth / 2,
      height: 80,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
    };
    addLayer(newText);
  };

  // Bake / Flatten all text layers directly onto base photo canvas (Tạm lưu chữ vào ảnh)
  const handleBakeAllTextToPhoto = async () => {
    const baseLayer = layers.find((l) => l.type === 'image') as ImageLayer | undefined;
    const textLayers = layers.filter((l) => l.type === 'text') as TextLayer[];
    if (!baseLayer || textLayers.length === 0) {
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

    // Scale text coordinates to natural photo dimensions
    const scaleX = naturalW / canvasWidth;
    const scaleY = naturalH / canvasHeight;

    for (const tl of textLayers) {
      ctx.save();
      const textCenterX = (tl.x + (tl.width * tl.scaleX) / 2) * scaleX;
      const textCenterY = (tl.y + (tl.height * tl.scaleY) / 2) * scaleY;

      ctx.translate(textCenterX, textCenterY);
      ctx.rotate((tl.rotation * Math.PI) / 180);

      const scaledFontSize = Math.round(tl.fontSize * scaleX * tl.scaleX);
      const isItalic = tl.fontStyle === 'italic';
      const isBold = tl.fontWeight === 'bold' || tl.fontWeight === '900';
      ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${scaledFontSize}px "${tl.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
      ctx.textAlign = (tl.textAlign as CanvasTextAlign) || 'center';
      ctx.textBaseline = 'middle';

      if (tl.shadowColor) {
        ctx.shadowColor = tl.shadowColor;
        ctx.shadowBlur = (tl.shadowBlur || 4) * scaleX;
        ctx.shadowOffsetX = (tl.shadowOffsetX || 0) * scaleX;
        ctx.shadowOffsetY = (tl.shadowOffsetY || 0) * scaleY;
      }

      // Support multiline text
      const lines = tl.text.split('\n');
      const lineHeight = scaledFontSize * 1.25;
      const totalH = lines.length * lineHeight;
      const startY = -totalH / 2 + lineHeight / 2;

      // Background box if set
      if (tl.backgroundColor && tl.backgroundColor !== 'transparent') {
        const pad = (tl.backgroundPadding || 8) * scaleX;
        const radius = (tl.backgroundRadius || 6) * scaleX;
        ctx.fillStyle = tl.backgroundColor;
        const lw = tl.width * scaleX * tl.scaleX;
        const lh = tl.height * scaleY * tl.scaleY;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(-lw / 2 - pad, -lh / 2 - pad, lw + pad * 2, lh + pad * 2, radius);
        } else {
          ctx.rect(-lw / 2 - pad, -lh / 2 - pad, lw + pad * 2, lh + pad * 2);
        }
        ctx.fill();
      }

      lines.forEach((line, idx) => {
        const yPos = startY + idx * lineHeight;
        let xPos = 0;
        if (tl.textAlign === 'left') xPos = (-tl.width * scaleX * tl.scaleX) / 2;
        else if (tl.textAlign === 'right') xPos = (tl.width * scaleX * tl.scaleX) / 2;

        if (tl.stroke && tl.stroke !== 'transparent' && (tl.strokeWidth || 0) > 0) {
          ctx.strokeStyle = tl.stroke;
          ctx.lineWidth = (tl.strokeWidth || 1) * scaleX;
          ctx.strokeText(line, xPos, yPos);
        }

        ctx.fillStyle = tl.fill || '#ffffff';
        ctx.fillText(line, xPos, yPos);
      });

      ctx.restore();
    }

    const isPng = baseLayer.src.startsWith('data:image/png') || (baseLayer.name && baseLayer.name.endsWith('.png'));
    const newSrc = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.98);

    updateLayer(baseLayer.id, {
      src: newSrc,
      originalWidth: naturalW,
      originalHeight: naturalH,
    });

    for (const tl of textLayers) {
      removeLayer(tl.id);
    }
    useEditorStore.getState().setActiveLayerId(baseLayer.id);

    setActiveTool('none');

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
    }, 40);
  };

  return (
    <div className="bg-slate-900/95 border-t lg:border-t-0 border-slate-800 p-3 sm:p-4 shrink-0 w-full h-full max-h-[44dvh] lg:max-h-none overflow-y-auto select-none backdrop-blur-md flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Thêm & Sửa Chữ</h3>
        </div>
        <div className="flex items-center gap-2">
          {layers.some((l) => l.type === 'text') && (
            <button
              onClick={handleBakeAllTextToPhoto}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition"
              title="Tạm lưu tất cả chữ vào ảnh gốc để có thể cắt xoay hoặc chỉnh sửa tiếp theo"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">Tạm lưu vào ảnh</span>
            </button>
          )}
          <button
            onClick={handleAddText}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Thêm mới</span>
          </button>
          <button
            onClick={() => setActiveTool('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* When no text layer is selected */}
      {!activeLayer ? (
        <div className="p-6 text-center rounded-2xl bg-slate-800/40 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-3">
            Chưa có lớp chữ nào được chọn. Nhấn nút bên dưới để tạo chữ mới hoặc chạm vào chữ trên màn hình.
          </p>
          <button
            onClick={handleAddText}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo lớp chữ đầu tiên</span>
          </button>
        </div>
      ) : (
        /* Text Editor Controls */
        <div className="space-y-3.5">
          {/* Text Input Content */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-300 font-medium">Nội dung chữ (hỗ trợ tiếng Việt có dấu):</label>
            <textarea
              value={activeLayer.text}
              onChange={(e) => updateActiveText({ text: e.target.value })}
              rows={2}
              className="w-full bg-slate-800 text-white text-sm rounded-xl p-2.5 border border-slate-700 focus:border-indigo-500 focus:outline-none resize-none font-medium"
              placeholder="Nhập nội dung văn bản..."
            />
          </div>

          {/* Font Family Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-300 font-medium">Phông chữ (Font):</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {fontOptions.map((f) => (
                <button
                  key={f.value}
                  onClick={() => updateActiveText({ fontFamily: f.value })}
                  style={{ fontFamily: f.value }}
                  className={`p-2 rounded-xl text-xs truncate border transition ${
                    activeLayer.fontFamily === f.value
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Styling Bar: Bold, Italic, Align */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700/60">
              <button
                onClick={() =>
                  updateActiveText({
                    fontWeight: activeLayer.fontWeight === 'bold' ? 'normal' : 'bold',
                  })
                }
                className={`p-1.5 rounded-lg transition ${
                  activeLayer.fontWeight === 'bold'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Đậm"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  updateActiveText({
                    fontStyle: activeLayer.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
                className={`p-1.5 rounded-lg transition ${
                  activeLayer.fontStyle === 'italic'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Nghiêng"
              >
                <Italic className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700/60">
              <button
                onClick={() => updateActiveText({ textAlign: 'left' })}
                className={`p-1.5 rounded-lg transition ${
                  activeLayer.textAlign === 'left'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Căn trái"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateActiveText({ textAlign: 'center' })}
                className={`p-1.5 rounded-lg transition ${
                  activeLayer.textAlign === 'center'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Căn giữa"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateActiveText({ textAlign: 'right' })}
                className={`p-1.5 rounded-lg transition ${
                  activeLayer.textAlign === 'right'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Căn phải"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            {/* Font Size with Quick Shrink & Enlarge Buttons */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <span className="text-xs text-slate-400 shrink-0">Cỡ chữ:</span>
              <button
                type="button"
                onClick={() => {
                  const newSize = Math.max(12, activeLayer.fontSize - 4);
                  updateActiveText({
                    fontSize: newSize,
                    height: Math.max(activeLayer.height, Math.round(newSize * 1.3)),
                  });
                }}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold active:scale-90 transition border border-slate-700"
                title="Thu nhỏ chữ (-4px)"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="14"
                max="160"
                value={activeLayer.fontSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  updateActiveText({
                    fontSize: newSize,
                    height: Math.max(activeLayer.height, Math.round(newSize * 1.3)),
                  });
                }}
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <button
                type="button"
                onClick={() => {
                  const newSize = Math.min(200, activeLayer.fontSize + 4);
                  updateActiveText({
                    fontSize: newSize,
                    height: Math.max(activeLayer.height, Math.round(newSize * 1.3)),
                  });
                }}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold active:scale-90 transition border border-slate-700"
                title="Phóng to chữ (+4px)"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="text-xs font-mono text-indigo-400 font-bold w-8 text-right shrink-0">
                {activeLayer.fontSize}px
              </span>
            </div>
          </div>

          {/* Quick Font Size Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[11px] text-slate-400 shrink-0">Cỡ nhanh:</span>
            {[
              { label: 'Nhỏ (24)', size: 24 },
              { label: 'Vừa (36)', size: 36 },
              { label: 'Chuẩn (48)', size: 48 },
              { label: 'Lớn (64)', size: 64 },
              { label: 'Siêu lớn (92)', size: 92 },
            ].map((p) => (
              <button
                key={p.size}
                type="button"
                onClick={() => {
                  updateActiveText({
                    fontSize: p.size,
                    height: Math.max(activeLayer.height, Math.round(p.size * 1.3)),
                  });
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition shrink-0 ${
                  activeLayer.fontSize === p.size
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Color Palettes */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-300 font-medium">Màu chữ:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="color"
                value={activeLayer.fill}
                onChange={(e) => updateActiveText({ fill: e.target.value, isGradient: false })}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                title="Chọn màu tùy ý"
              />
              {colorSwatches.map((color) => (
                <button
                  key={color}
                  onClick={() => updateActiveText({ fill: color, isGradient: false })}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full border border-slate-600 transition active:scale-95 ${
                    activeLayer.fill === color ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Outline Stroke & Background Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Outline */}
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Viền chữ (Stroke):</span>
                <input
                  type="color"
                  value={activeLayer.stroke || '#000000'}
                  onChange={(e) => updateActiveText({ stroke: e.target.value })}
                  className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                />
              </div>
              <input
                type="range"
                min="0"
                max="16"
                value={activeLayer.strokeWidth || 0}
                onChange={(e) => updateActiveText({ strokeWidth: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Background Box */}
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Hộp nền (Box):</span>
                <input
                  type="color"
                  value={activeLayer.backgroundColor || '#000000'}
                  onChange={(e) => updateActiveText({ backgroundColor: e.target.value })}
                  className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                />
              </div>
              <button
                onClick={() =>
                  updateActiveText({
                    backgroundColor: activeLayer.backgroundColor ? '' : 'rgba(0,0,0,0.6)',
                  })
                }
                className="text-[11px] text-indigo-400 hover:text-indigo-300 text-left font-medium"
              >
                {activeLayer.backgroundColor ? 'Tắt nền chữ' : 'Bật nền chữ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Action Bar for Quick Bake / Flatten / Commit */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
        {layers.some((l) => l.type === 'text') && (
          <button
            onClick={handleBakeAllTextToPhoto}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-95"
            title="Lưu tất cả chữ vĩnh viễn vào ảnh gốc để có thể cắt, xoay hoặc chỉnh sửa tiếp theo"
          >
            <Check className="w-4 h-4" />
            <span>Tạm lưu chữ vào ảnh ({layers.filter((l) => l.type === 'text').length})</span>
          </button>
        )}
        <button
          onClick={handleAddText}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs border border-slate-700 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm chữ</span>
        </button>
        <button
          onClick={() => setActiveTool('none')}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition active:scale-95"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
