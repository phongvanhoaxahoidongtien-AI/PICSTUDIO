import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import type { ImageLayer } from '../../types';
import { calculateHistogram } from '../../utils/imageProcessing';

export const HistogramView: React.FC = () => {
  const { layers, activeLayerId } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeLayer = (layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image')) as ImageLayer | undefined;

  useEffect(() => {
    if (!activeLayer || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = Math.min(300, img.width);
      offscreen.height = Math.min(300, img.height);
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;
      offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);

      const { r, g, b, lum, max } = calculateHistogram(offCtx, offscreen.width, offscreen.height);

      // Draw histogram on canvas
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Draw curves: Lum, Red, Green, Blue
      const drawChannel = (arr: Uint32Array, color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 256; i++) {
          const x = (i / 255) * w;
          const y = h - (arr[i] / max) * (h - 4);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      drawChannel(lum, 'rgba(255, 255, 255, 0.5)');
      drawChannel(r, 'rgba(239, 68, 68, 0.7)');
      drawChannel(g, 'rgba(34, 197, 94, 0.7)');
      drawChannel(b, 'rgba(59, 130, 246, 0.7)');
    };
    img.src = activeLayer.src;
  }, [activeLayer]);

  if (!activeLayer) return null;

  return (
    <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-lg">
      <div className="flex items-center justify-between w-full mb-1 text-[10px] text-slate-400 font-medium">
        <span>Biểu đồ Histogram</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={256}
        height={56}
        className="w-full h-14 rounded bg-slate-950 border border-slate-800"
      />
    </div>
  );
};
