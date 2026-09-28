import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ImagePlus,
  Sparkles,
  Camera,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  RotateCw,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import type {
  CanvasLayer,
  ImageLayer,
  TextLayer,
  DrawingLayer,
  StickerLayer,
  DrawPoint,
} from '../../types';
import { applyAdjustments, downscaleImageIfNeeded } from '../../utils/imageProcessing';
import { FILTER_PRESETS } from '../../utils/filters';
import { generateSampleImage } from '../../utils/sampleImages';

interface CanvasEditorProps {
  onOpenFilePicker: () => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ onOpenFilePicker }) => {
  const {
    layers,
    activeLayerId,
    setActiveLayerId,
    updateLayer,
    removeLayer,
    duplicateLayer,
    reorderLayers,
    canvasWidth,
    canvasHeight,
    canvasBackgroundColor,
    zoom,
    setZoom,
    pan,
    setPan,
    isBeforeAfterActive,
    activeTool,
    brushColor,
    brushSize,
    brushOpacity,
    isEraser,
    addLayer,
    pushHistory,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const processedCanvasCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // Interaction State
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [transformHandle, setTransformHandle] = useState<string | null>(null);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    layerX: number;
    layerY: number;
    layerW: number;
    layerH: number;
    layerRot: number;
  }>({
    clientX: 0,
    clientY: 0,
    layerX: 0,
    layerY: 0,
    layerW: 0,
    layerH: 0,
    layerRot: 0,
  });

  // Touch pinch-to-zoom state
  const pinchRef = useRef<{
    initialDist: number;
    initialZoom: number;
    initialPan: { x: number; y: number };
    midX: number;
    midY: number;
  } | null>(null);

  // Drawing state
  const isDrawingRef = useRef(false);
  const currentDrawPointsRef = useRef<DrawPoint[]>([]);

  // Get active selected layer
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  // Helper to load image
  const getImage = useCallback((src: string): Promise<HTMLImageElement> => {
    if (imageCacheRef.current.has(src)) {
      return Promise.resolve(imageCacheRef.current.get(src)!);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCacheRef.current.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  // Main canvas render loop
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and fill canvas background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render layers from bottom to top
    for (const layer of layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode;

      // Translate to layer center for rotation & scale
      const centerX = layer.x + (layer.width * layer.scaleX) / 2;
      const centerY = layer.y + (layer.height * layer.scaleY) / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scaleX, layer.scaleY);
      ctx.translate(-layer.width / 2, -layer.height / 2);

      if (layer.type === 'image') {
        const imgLayer = layer as ImageLayer;
        try {
          const img = await getImage(imgLayer.src);

          if (isBeforeAfterActive) {
            // Render original raw image
            ctx.drawImage(img, 0, 0, layer.width, layer.height);
          } else {
            // Render with adjustments & filter preset
            const offscreen = document.createElement('canvas');
            offscreen.width = layer.width;
            offscreen.height = layer.height;
            const offCtx = offscreen.getContext('2d');
            if (offCtx) {
              offCtx.drawImage(img, 0, 0, layer.width, layer.height);

              // Merge layer adjustments with preset filter adjustments
              const filterPreset = FILTER_PRESETS.find((f) => f.id === imgLayer.filterId);
              const combinedAdjustments = { ...imgLayer.adjustments };
              if (filterPreset) {
                const intensity = (imgLayer.filterIntensity ?? 100) / 100;
                Object.entries(filterPreset.adjustments).forEach(([key, val]) => {
                  if (typeof val === 'number') {
                    const currentVal = (combinedAdjustments as unknown as Record<string, number>)[key] ?? 0;
                    (combinedAdjustments as unknown as Record<string, number>)[key] = currentVal + val * intensity;
                  }
                });
              }

              applyAdjustments(offCtx, layer.width, layer.height, combinedAdjustments, 1.0);
              ctx.drawImage(offscreen, 0, 0);
            }
          }
        } catch (err) {
          console.error('Failed to render image layer:', err);
        }
      } else if (layer.type === 'text') {
        const textLayer = layer as TextLayer;
        ctx.font = `${textLayer.fontStyle} ${textLayer.fontWeight} ${textLayer.fontSize}px "${textLayer.fontFamily}", sans-serif`;
        ctx.textAlign = textLayer.textAlign;
        ctx.textBaseline = 'top';

        const lines = textLayer.text.split('\n');
        const lineHeight = textLayer.fontSize * 1.25;

        // Background box
        if (textLayer.backgroundColor && textLayer.backgroundColor !== 'transparent') {
          const pad = textLayer.backgroundPadding || 8;
          const radius = textLayer.backgroundRadius || 6;
          ctx.fillStyle = textLayer.backgroundColor;
          ctx.beginPath();
          ctx.roundRect(-pad, -pad, layer.width + pad * 2, layer.height + pad * 2, radius);
          ctx.fill();
        }

        // Shadow
        if (textLayer.shadowColor) {
          ctx.shadowColor = textLayer.shadowColor;
          ctx.shadowBlur = textLayer.shadowBlur || 0;
          ctx.shadowOffsetX = textLayer.shadowOffsetX || 0;
          ctx.shadowOffsetY = textLayer.shadowOffsetY || 0;
        }

        lines.forEach((line, index) => {
          let textX = 0;
          if (textLayer.textAlign === 'center') textX = layer.width / 2;
          if (textLayer.textAlign === 'right') textX = layer.width;
          const textY = index * lineHeight;

          if (textLayer.isGradient && textLayer.gradientColors) {
            const grad = ctx.createLinearGradient(0, textY, layer.width, textY + lineHeight);
            grad.addColorStop(0, textLayer.gradientColors[0]);
            grad.addColorStop(1, textLayer.gradientColors[1]);
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = textLayer.fill;
          }

          ctx.fillText(line, textX, textY);

          if (textLayer.stroke && (textLayer.strokeWidth || 0) > 0) {
            ctx.strokeStyle = textLayer.stroke;
            ctx.lineWidth = textLayer.strokeWidth || 1;
            ctx.strokeText(line, textX, textY);
          }
        });
      } else if (layer.type === 'drawing') {
        const drawLayer = layer as DrawingLayer;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        drawLayer.paths.forEach((path) => {
          if (path.points.length < 2) return;
          ctx.save();
          if (path.isEraser) {
            ctx.globalCompositeOperation = 'destination-out';
          } else {
            ctx.strokeStyle = path.color;
            ctx.globalAlpha = path.opacity;
          }
          ctx.lineWidth = path.size;
          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
          }
          ctx.stroke();
          ctx.restore();
        });
      } else if (layer.type === 'sticker') {
        const stickerLayer = layer as StickerLayer;
        if (stickerLayer.svgContent) {
          try {
            const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(stickerLayer.svgContent)}`;
            const img = await getImage(svgDataUrl);
            ctx.drawImage(img, 0, 0, layer.width, layer.height);
          } catch (err) {
            console.error('Failed to render sticker:', err);
          }
        }
      }

      ctx.restore();
    }
  }, [
    layers,
    canvasWidth,
    canvasHeight,
    canvasBackgroundColor,
    isBeforeAfterActive,
    getImage,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Convert screen coordinates to canvas space
  const screenToCanvas = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2 + pan.x;
    const centerY = rect.height / 2 + pan.y;

    const canvasScreenLeft = centerX - (canvasWidth * zoom) / 2;
    const canvasScreenTop = centerY - (canvasHeight * zoom) / 2;

    const x = (clientX - rect.left - canvasScreenLeft) / zoom;
    const y = (clientY - rect.top - canvasScreenTop) / zoom;
    return { x, y };
  };

  // Find layer at canvas coordinate
  const hitTestLayer = (cx: number, cy: number): CanvasLayer | null => {
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (!layer.visible || layer.locked) continue;
      if (
        cx >= layer.x &&
        cx <= layer.x + layer.width * layer.scaleX &&
        cy >= layer.y &&
        cy <= layer.y + layer.height * layer.scaleY
      ) {
        return layer;
      }
    }
    return null;
  };

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'draw') {
      // Start freehand drawing
      isDrawingRef.current = true;
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      currentDrawPointsRef.current = [{ x, y }];

      // Check if there is an active drawing layer, else create one
      let drawLayer = layers.find((l) => l.type === 'drawing' && !l.locked) as DrawingLayer | undefined;
      if (!drawLayer) {
        drawLayer = {
          id: 'draw_' + Date.now(),
          name: 'Nét vẽ',
          type: 'drawing',
          visible: true,
          locked: false,
          opacity: 1,
          blendMode: 'source-over',
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          paths: [],
        };
        addLayer(drawLayer);
      }
      return;
    }

    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const hit = hitTestLayer(x, y);

    if (hit) {
      setActiveLayerId(hit.id);
      setIsDraggingLayer(true);
      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        layerX: hit.x,
        layerY: hit.y,
        layerW: hit.width,
        layerH: hit.height,
        layerRot: hit.rotation,
      };
    } else {
      setActiveLayerId(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDrawingRef.current) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      currentDrawPointsRef.current.push({ x, y });

      const drawLayer = layers.find((l) => l.type === 'drawing' && !l.locked) as DrawingLayer | undefined;
      if (drawLayer) {
        const lastPath = {
          points: [...currentDrawPointsRef.current],
          color: brushColor,
          size: brushSize,
          opacity: brushOpacity,
          isEraser,
        };
        const nextPaths = [...drawLayer.paths.filter((_, i) => i !== drawLayer.paths.length - 1), lastPath];
        updateLayer(drawLayer.id, { paths: nextPaths });
      }
      return;
    }

    if (isDraggingLayer && activeLayer && !activeLayer.locked) {
      const deltaX = (e.clientX - dragStartRef.current.clientX) / zoom;
      const deltaY = (e.clientY - dragStartRef.current.clientY) / zoom;

      if (transformHandle === 'rotate') {
        const centerX = (activeLayer.x + (activeLayer.width * activeLayer.scaleX) / 2) * zoom;
        const centerY = (activeLayer.y + (activeLayer.height * activeLayer.scaleY) / 2) * zoom;
        const angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const deg = Math.round((angleRad * 180) / Math.PI);
        updateLayer(activeLayer.id, { rotation: deg });
      } else if (transformHandle === 'se') {
        const newW = Math.max(20, dragStartRef.current.layerW + deltaX);
        const newH = Math.max(20, dragStartRef.current.layerH + deltaY);
        updateLayer(activeLayer.id, { width: newW, height: newH });
      } else {
        // Move position
        updateLayer(activeLayer.id, {
          x: Math.round(dragStartRef.current.layerX + deltaX),
          y: Math.round(dragStartRef.current.layerY + deltaY),
        });
      }
    }
  };

  const handlePointerUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      pushHistory();
    }
    if (isDraggingLayer) {
      setIsDraggingLayer(false);
      setTransformHandle(null);
      pushHistory();
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((z) => Math.min(4, Math.max(0.2, z * zoomFactor)));
  };

  // Touch pinch gesture handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchRef.current = {
        initialDist: dist,
        initialZoom: zoom,
        initialPan: { ...pan },
        midX: (t1.clientX + t2.clientX) / 2,
        midY: (t1.clientY + t2.clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = dist / pinchRef.current.initialDist;
      const newZoom = Math.min(4, Math.max(0.2, pinchRef.current.initialZoom * ratio));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    pinchRef.current = null;
  };

  // Load sample image
  const handleLoadSample = (theme: 'landscape' | 'portrait' | 'neon') => {
    const dataUrl = generateSampleImage(theme);
    const img = new Image();
    img.onload = () => {
      const newLayer: ImageLayer = {
        id: 'img_' + Date.now(),
        name: `Ảnh mẫu ${theme === 'landscape' ? 'Hoàng hôn' : theme === 'portrait' ? 'Chân dung' : 'Neon'}`,
        type: 'image',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'source-over',
        src: dataUrl,
        originalWidth: img.width,
        originalHeight: img.height,
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        adjustments: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          exposure: 0,
          highlights: 0,
          shadows: 0,
          temperature: 0,
          tint: 0,
          sharpness: 0,
          vignette: 0,
          clarity: 0,
          blackPoint: 0,
          gamma: 1.0,
          whitePoint: 255,
        },
        filterId: 'normal',
        filterIntensity: 100,
      };
      addLayer(newLayer);
    };
    img.src = dataUrl;
  };

  const hasLayers = layers.length > 0;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex-1 w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center select-none touch-none"
    >
      {/* Empty State / Welcome Screen */}
      {!hasLayers ? (
        <div className="flex flex-col items-center justify-center max-w-md mx-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Bắt đầu chỉnh sửa ảnh</h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
            Ứng dụng chạy hoàn toàn offline trên trình duyệt. Mọi bức ảnh được xử lý trực tiếp trên thiết bị của bạn với độ bảo mật tối đa.
          </p>

          <div className="w-full flex flex-col gap-2.5">
            <button
              onClick={onOpenFilePicker}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 active:scale-98 transition"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Mở ảnh từ thiết bị</span>
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-3 text-slate-500 font-medium">hoặc dùng ảnh mẫu có sẵn</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleLoadSample('landscape')}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-slate-200 text-xs transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Hoàng hôn</span>
              </button>
              <button
                onClick={() => handleLoadSample('portrait')}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-slate-200 text-xs transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Chân dung</span>
              </button>
              <button
                onClick={() => handleLoadSample('neon')}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-slate-200 text-xs transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Neon City</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* The Interactive Canvas */
        <div
          style={{
            width: `${canvasWidth * zoom}px`,
            height: `${canvasHeight * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
          className="relative transition-transform duration-75 shadow-2xl rounded-sm"
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="w-full h-full block rounded-sm cursor-crosshair"
          />

          {/* Active Layer Transformer / Selection Box */}
          {activeLayer && !activeLayer.locked && (
            <div
              style={{
                left: `${activeLayer.x * zoom}px`,
                top: `${activeLayer.y * zoom}px`,
                width: `${activeLayer.width * activeLayer.scaleX * zoom}px`,
                height: `${activeLayer.height * activeLayer.scaleY * zoom}px`,
                transform: `rotate(${activeLayer.rotation}deg)`,
                transformOrigin: 'center center',
              }}
              className="absolute border border-indigo-500 pointer-events-none"
            >
              {/* Corner Resize Handle */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setTransformHandle('se');
                  setIsDraggingLayer(true);
                  dragStartRef.current = {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    layerX: activeLayer.x,
                    layerY: activeLayer.y,
                    layerW: activeLayer.width,
                    layerH: activeLayer.height,
                    layerRot: activeLayer.rotation,
                  };
                }}
                className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow-md cursor-se-resize pointer-events-auto active:scale-125 transition"
              />

              {/* Rotation Handle */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setTransformHandle('rotate');
                  setIsDraggingLayer(true);
                  dragStartRef.current = {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    layerX: activeLayer.x,
                    layerY: activeLayer.y,
                    layerW: activeLayer.width,
                    layerH: activeLayer.height,
                    layerRot: activeLayer.rotation,
                  };
                }}
                className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md cursor-grab pointer-events-auto active:scale-125 transition"
                title="Kéo để xoay"
              >
                <RotateCw className="w-3 h-3" />
              </div>

              {/* Quick Action Floating Bar above layer */}
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 rounded-xl px-1.5 py-1 shadow-xl pointer-events-auto">
                <button
                  onClick={() => duplicateLayer(activeLayer.id)}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Nhân bản layer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const idx = layers.findIndex((l) => l.id === activeLayer.id);
                    if (idx < layers.length - 1) reorderLayers(idx, idx + 1);
                  }}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Lên trên 1 lớp"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const idx = layers.findIndex((l) => l.id === activeLayer.id);
                    if (idx > 0) reorderLayers(idx, idx - 1);
                  }}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Xuống dưới 1 lớp"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => removeLayer(activeLayer.id)}
                  className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition"
                  title="Xóa layer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
