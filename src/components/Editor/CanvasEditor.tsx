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
  Edit3,
  ZoomIn,
  ZoomOut,
  Minus,
  Plus,
  X,
  Maximize2,
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
import { applyBeautyEffects, DEFAULT_BEAUTY_SETTINGS } from '../../utils/beautyProcessing';

interface CanvasEditorProps {
  onOpenFilePicker: () => void;
  onOpenCamera?: () => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ onOpenFilePicker, onOpenCamera }) => {
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
    setCanvasDimensions,
    canvasBackgroundColor,
    zoom,
    setZoom,
    pan,
    setPan,
    isBeforeAfterActive,
    activeTool,
    setActiveTool,
    brushColor,
    brushSize,
    brushOpacity,
    isEraser,
    setSingleImage,
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
    layerFontSize?: number;
    centerX?: number;
    centerY?: number;
    initialDist?: number;
  }>({
    clientX: 0,
    clientY: 0,
    layerX: 0,
    layerY: 0,
    layerW: 0,
    layerH: 0,
    layerRot: 0,
  });

  // Background panning state
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ clientX: 0, clientY: 0, panX: 0, panY: 0 });

  // Touch pinch-to-scale/rotate active layer state
  const touchLayerPinchRef = useRef<{
    initialDist: number;
    initialW: number;
    initialH: number;
    initialFontSize?: number;
    initialAngle: number;
    initialRotation: number;
  } | null>(null);

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
            // Render original raw image directly
            ctx.drawImage(img, 0, 0, layer.width, layer.height);
          } else {
            // High-performance image cache: avoids recalculating heavy 12MP pixel loops on every render!
            const cacheKey = `${imgLayer.id}_${imgLayer.src}_${layer.width}_${layer.height}_${imgLayer.filterId}_${imgLayer.filterIntensity}_${JSON.stringify(imgLayer.adjustments)}_${JSON.stringify(imgLayer.beauty)}`;
            let cachedCanvas = processedCanvasCacheRef.current.get(cacheKey);

            if (!cachedCanvas) {
              cachedCanvas = document.createElement('canvas');
              cachedCanvas.width = layer.width;
              cachedCanvas.height = layer.height;
              const offCtx = cachedCanvas.getContext('2d');
              if (offCtx) {
                offCtx.drawImage(img, 0, 0, layer.width, layer.height);

                // Apply Beauty Retouching (Skin Smooth, Whiten, Glow, Reshape, Makeup)
                if (imgLayer.beauty) {
                  await applyBeautyEffects(offCtx, layer.width, layer.height, imgLayer.beauty);
                }

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
              }

              // Evict older entries if cache size exceeds 3 to keep mobile memory slim
              if (processedCanvasCacheRef.current.size > 3) {
                const oldestKey = processedCanvasCacheRef.current.keys().next().value;
                if (oldestKey) processedCanvasCacheRef.current.delete(oldestKey);
              }
              processedCanvasCacheRef.current.set(cacheKey, cachedCanvas);
            }

            ctx.drawImage(cachedCanvas, 0, 0, layer.width, layer.height);
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

  // Serialized render queue to prevent multiple heavy async render passes running concurrently (eliminates device overheating & battery drain!)
  const isRenderingRef = useRef(false);
  const pendingRenderRef = useRef(false);

  const scheduleRender = useCallback(() => {
    if (isRenderingRef.current) {
      pendingRenderRef.current = true;
      return;
    }
    isRenderingRef.current = true;
    pendingRenderRef.current = false;

    requestAnimationFrame(async () => {
      try {
        await renderCanvas();
      } catch (err) {
        console.error('Render canvas error:', err);
      } finally {
        isRenderingRef.current = false;
        if (pendingRenderRef.current) {
          pendingRenderRef.current = false;
          scheduleRender();
        }
      }
    });
  }, [renderCanvas]);

  useEffect(() => {
    scheduleRender();
  }, [scheduleRender]);

  // Auto-fit canvas into viewport whenever canvas dimensions change, panel opens/closes, or screen resizes
  useEffect(() => {
    if (!containerRef.current) return;

    const handleFit = () => {
      requestAnimationFrame(() => {
        if (!containerRef.current || canvasWidth <= 0 || canvasHeight <= 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        // Generous padding so the entire image is always comfortably visible with breathing room
        const paddingX = rect.width < 640 ? 16 : 36;
        const paddingY = rect.height < 640 ? 16 : 36;
        const availW = Math.max(20, rect.width - paddingX);
        const availH = Math.max(20, rect.height - paddingY);
        const fitScale = Math.min(availW / canvasWidth, availH / canvasHeight);

        // Apply the precise fit scale
        const finalZoom = Number(Math.max(0.01, fitScale).toFixed(4));
        setZoom(finalZoom);
        setPan({ x: 0, y: 0 });
      });
    };

    // Run fit immediately and after layout settles
    handleFit();
    const timer = setTimeout(handleFit, 60);

    // Use ResizeObserver to detect when tool panels (Beauty, Adjustments, Filters, etc.) open/close
    const ro = new ResizeObserver(() => {
      handleFit();
    });
    ro.observe(containerRef.current);

    window.addEventListener('lumix:fit-to-screen', handleFit);
    window.addEventListener('resize', handleFit);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('lumix:fit-to-screen', handleFit);
      window.removeEventListener('resize', handleFit);
    };
  }, [canvasWidth, canvasHeight, activeTool, setZoom, setPan]);

  // Keyboard shortcut to delete active layer (Delete / Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)
      ) {
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeLayerId) {
        e.preventDefault();
        removeLayer(activeLayerId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLayerId, removeLayer]);

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

  // Find layer at canvas coordinate (with rotation support)
  const hitTestLayer = (cx: number, cy: number): CanvasLayer | null => {
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (!layer.visible || layer.locked) continue;

      // Single photo editing mode: The base image layer (main photo being edited)
      // should NOT be selected as a draggable layer box unless user is in 'layers' or 'collage' mode!
      if (layer.type === 'image' && activeTool !== 'layers' && activeTool !== 'collage') {
        continue;
      }

      const layerW = layer.width * layer.scaleX;
      const layerH = layer.height * layer.scaleY;

      // Handle unrotation if layer is rotated
      let testX = cx;
      let testY = cy;
      if (layer.rotation) {
        const centerX = layer.x + layerW / 2;
        const centerY = layer.y + layerH / 2;
        const rad = (-layer.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const dx = cx - centerX;
        const dy = cy - centerY;
        testX = centerX + dx * cos - dy * sin;
        testY = centerY + dx * sin + dy * cos;
      }

      if (
        testX >= layer.x &&
        testX <= layer.x + layerW &&
        testY >= layer.y &&
        testY <= layer.y + layerH
      ) {
        return layer;
      }
    }
    return null;
  };

  // Helper to scale active layer up or down smoothly
  const handleScaleLayer = (ratio: number) => {
    if (!activeLayer) return;
    pushHistory();
    if (activeLayer.type === 'text') {
      const textLayer = activeLayer as TextLayer;
      const newFontSize = Math.max(12, Math.min(260, Math.round(textLayer.fontSize * ratio)));
      const newW = Math.max(40, Math.round(textLayer.width * ratio));
      const newH = Math.max(20, Math.round(textLayer.height * ratio));
      updateLayer(activeLayer.id, {
        fontSize: newFontSize,
        width: newW,
        height: newH,
        x: Math.round(activeLayer.x + (activeLayer.width - newW) / 2),
        y: Math.round(activeLayer.y + (activeLayer.height - newH) / 2),
      });
    } else {
      const newW = Math.max(24, Math.round(activeLayer.width * ratio));
      const newH = Math.max(24, Math.round(activeLayer.height * ratio));
      updateLayer(activeLayer.id, {
        width: newW,
        height: newH,
        x: Math.round(activeLayer.x + (activeLayer.width - newW) / 2),
        y: Math.round(activeLayer.y + (activeLayer.height - newH) / 2),
      });
    }
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
      const centerX = hit.x + (hit.width * hit.scaleX) / 2;
      const centerY = hit.y + (hit.height * hit.scaleY) / 2;
      const initialDist = Math.hypot((hit.width * hit.scaleX) / 2, (hit.height * hit.scaleY) / 2) || 1;
      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        layerX: hit.x,
        layerY: hit.y,
        layerW: hit.width,
        layerH: hit.height,
        layerRot: hit.rotation,
        layerFontSize: hit.type === 'text' ? (hit as TextLayer).fontSize : 48,
        centerX,
        centerY,
        initialDist,
      };
    } else {
      setActiveLayerId(null);
      // Panning the canvas
      isPanningRef.current = true;
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
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

    if (isPanningRef.current) {
      const deltaX = e.clientX - panStartRef.current.clientX;
      const deltaY = e.clientY - panStartRef.current.clientY;
      setPan({
        x: panStartRef.current.panX + deltaX,
        y: panStartRef.current.panY + deltaY,
      });
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
      } else if (
        transformHandle === 'nw' ||
        transformHandle === 'ne' ||
        transformHandle === 'se' ||
        transformHandle === 'sw'
      ) {
        // Proportional 4-corner scaling
        const { x: currCanvasX, y: currCanvasY } = screenToCanvas(e.clientX, e.clientY);
        const centerX = dragStartRef.current.centerX ?? (activeLayer.x + activeLayer.width / 2);
        const centerY = dragStartRef.current.centerY ?? (activeLayer.y + activeLayer.height / 2);
        const currentDist = Math.hypot(currCanvasX - centerX, currCanvasY - centerY);
        const scaleRatio = Math.max(0.15, Math.min(8, currentDist / (dragStartRef.current.initialDist || 1)));

        if (activeLayer.type === 'text') {
          const initFont = dragStartRef.current.layerFontSize || 48;
          const newFontSize = Math.max(12, Math.min(260, Math.round(initFont * scaleRatio)));
          const newW = Math.max(40, Math.round(dragStartRef.current.layerW * scaleRatio));
          const newH = Math.max(20, Math.round(dragStartRef.current.layerH * scaleRatio));
          updateLayer(activeLayer.id, {
            fontSize: newFontSize,
            width: newW,
            height: newH,
            x: Math.round(centerX - newW / 2),
            y: Math.round(centerY - newH / 2),
          });
        } else {
          const newW = Math.max(20, Math.round(dragStartRef.current.layerW * scaleRatio));
          const newH = Math.max(20, Math.round(dragStartRef.current.layerH * scaleRatio));
          updateLayer(activeLayer.id, {
            width: newW,
            height: newH,
            x: Math.round(centerX - newW / 2),
            y: Math.round(centerY - newH / 2),
          });
        }
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
    isPanningRef.current = false;
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
      const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX);

      if (activeLayer && !activeLayer.locked && (activeLayer.type === 'sticker' || activeLayer.type === 'text')) {
        touchLayerPinchRef.current = {
          initialDist: dist,
          initialW: activeLayer.width,
          initialH: activeLayer.height,
          initialFontSize: activeLayer.type === 'text' ? (activeLayer as TextLayer).fontSize : 48,
          initialAngle: angle,
          initialRotation: activeLayer.rotation,
        };
      } else {
        pinchRef.current = {
          initialDist: dist,
          initialZoom: zoom,
          initialPan: { ...pan },
          midX: (t1.clientX + t2.clientX) / 2,
          midY: (t1.clientY + t2.clientY) / 2,
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

      if (touchLayerPinchRef.current && activeLayer && !activeLayer.locked) {
        const ratio = dist / touchLayerPinchRef.current.initialDist;
        const currentAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX);
        const angleDiff = ((currentAngle - touchLayerPinchRef.current.initialAngle) * 180) / Math.PI;
        const newRot = Math.round((touchLayerPinchRef.current.initialRotation + angleDiff) % 360);

        if (activeLayer.type === 'text') {
          const initFont = touchLayerPinchRef.current.initialFontSize || 48;
          const newFontSize = Math.max(12, Math.min(260, Math.round(initFont * ratio)));
          const newW = Math.round(touchLayerPinchRef.current.initialW * ratio);
          const newH = Math.round(touchLayerPinchRef.current.initialH * ratio);
          updateLayer(activeLayer.id, {
            fontSize: newFontSize,
            width: newW,
            height: newH,
            rotation: newRot,
          });
        } else {
          const newW = Math.max(20, Math.round(touchLayerPinchRef.current.initialW * ratio));
          const newH = Math.max(20, Math.round(touchLayerPinchRef.current.initialH * ratio));
          updateLayer(activeLayer.id, {
            width: newW,
            height: newH,
            rotation: newRot,
          });
        }
      } else if (pinchRef.current) {
        const ratio = dist / pinchRef.current.initialDist;
        const newZoom = Math.min(4, Math.max(0.05, pinchRef.current.initialZoom * ratio));
        setZoom(newZoom);
      }
    }
  };

  const handleTouchEnd = () => {
    pinchRef.current = null;
    touchLayerPinchRef.current = null;
  };

  // Double click / tap to toggle between Fit to Screen and 100% Native Resolution
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (Math.abs(zoom - 1) < 0.05) {
      window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
    } else {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  // Load sample image
  const handleLoadSample = (theme: 'landscape' | 'portrait' | 'neon') => {
    const dataUrl = generateSampleImage(theme);
    const img = new Image();
    img.onload = () => {
      setCanvasDimensions(img.width, img.height);
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
        width: img.width,
        height: img.height,
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
        beauty: { ...DEFAULT_BEAUTY_SETTINGS },
        filterId: 'normal',
        filterIntensity: 100,
      };
      setSingleImage(
        newLayer,
        img.width,
        img.height,
        `Ảnh mẫu ${theme === 'landscape' ? 'Hoàng hôn' : theme === 'portrait' ? 'Chân dung' : 'Neon'}`
      );
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
      }, 40);
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Chụp & Chỉnh sửa ảnh đẹp</h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-5 leading-relaxed">
            Ứng dụng chạy hoàn toàn offline 100% trên trình duyệt. Chụp ảnh làm đẹp real-time và chỉnh sửa đa lớp chuyên nghiệp mà không bao giờ tải ảnh lên mạng.
          </p>

          <div className="w-full flex flex-col gap-2.5">
            {onOpenCamera && (
              <button
                onClick={onOpenCamera}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-pink-600/30 active:scale-98 transition"
              >
                <Camera className="w-5 h-5" />
                <span>Chụp ảnh đẹp ngay (Camera)</span>
              </button>
            )}

            <button
              onClick={onOpenFilePicker}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs sm:text-sm border border-slate-700 active:scale-98 transition"
            >
              <ImagePlus className="w-4 h-4 text-indigo-400" />
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
          onDoubleClick={handleDoubleClick}
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

          {/* Active Layer Transformer / Selection Box (Only for stickers, text, drawings, or in multi-layer mode) */}
          {activeLayer && !activeLayer.locked && (activeTool === 'layers' || activeTool === 'collage' || activeLayer.type !== 'image') && (
            <div
              style={{
                left: `${activeLayer.x * zoom}px`,
                top: `${activeLayer.y * zoom}px`,
                width: `${activeLayer.width * activeLayer.scaleX * zoom}px`,
                height: `${activeLayer.height * activeLayer.scaleY * zoom}px`,
                transform: `rotate(${activeLayer.rotation}deg)`,
                transformOrigin: 'center center',
              }}
              className="absolute border-2 border-indigo-400/90 shadow-sm pointer-events-none rounded-sm"
            >
              {/* Top-Left Corner: Quick Delete Button */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  removeLayer(activeLayer.id);
                }}
                className="absolute -top-3.5 -left-3.5 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white cursor-pointer pointer-events-auto active:scale-125 transition z-20"
                title="Xóa nhanh (Delete)"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>

              {/* Top-Right Corner: Rotate Handle */}
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
                className="absolute -top-3.5 -right-3.5 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg border-2 border-white cursor-grab pointer-events-auto active:scale-125 transition z-20"
                title="Kéo xoay tròn"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </div>

              {/* Bottom-Right Corner: Scale & Resize Handle (Pinch / Drag to scale) */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setTransformHandle('se');
                  setIsDraggingLayer(true);
                  const centerX = activeLayer.x + (activeLayer.width * activeLayer.scaleX) / 2;
                  const centerY = activeLayer.y + (activeLayer.height * activeLayer.scaleY) / 2;
                  const initialDist = Math.hypot((activeLayer.width * activeLayer.scaleX) / 2, (activeLayer.height * activeLayer.scaleY) / 2) || 1;
                  dragStartRef.current = {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    layerX: activeLayer.x,
                    layerY: activeLayer.y,
                    layerW: activeLayer.width,
                    layerH: activeLayer.height,
                    layerRot: activeLayer.rotation,
                    layerFontSize: activeLayer.type === 'text' ? (activeLayer as TextLayer).fontSize : 48,
                    centerX,
                    centerY,
                    initialDist,
                  };
                }}
                className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-indigo-600 flex items-center justify-center shadow-2xl border-2 border-indigo-600 cursor-se-resize pointer-events-auto active:scale-125 transition z-20"
                title="Kéo góc để thu nhỏ hoặc phóng to"
              >
                <Maximize2 className="w-4 h-4 rotate-90 stroke-[2.5]" />
              </div>

              {/* Bottom-Left Corner: Quick Duplicate */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  duplicateLayer(activeLayer.id);
                }}
                className="absolute -bottom-3.5 -left-3.5 w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white cursor-pointer pointer-events-auto active:scale-125 transition z-20"
                title="Nhân bản (Copy)"
              >
                <Copy className="w-3 h-3" />
              </div>

              {/* Top Stem Rotation Handle (Extra convenient) */}
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
                className="absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md cursor-grab pointer-events-auto active:scale-125 transition border border-white"
                title="Kéo để xoay"
              >
                <RotateCw className="w-3 h-3" />
              </div>

              {/* Quick Action Floating Bar with Scaling Controls */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onPointerUp={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                style={{
                  transform: `translateX(-50%) rotate(${-activeLayer.rotation}deg)`,
                }}
                className={`absolute left-1/2 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1 shadow-2xl pointer-events-auto z-30 select-none whitespace-nowrap ${
                  (activeLayer.y + activeLayer.height * activeLayer.scaleY) * zoom > canvasHeight * zoom - 65
                    ? '-top-14'
                    : '-bottom-14'
                }`}
              >
                {/* Quick Shrink Button */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScaleLayer(0.85);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-amber-400 hover:text-white hover:bg-amber-500/20 active:scale-90 transition font-bold"
                  title="Thu nhỏ chữ/sticker (-15%)"
                >
                  <Minus className="w-4 h-4 stroke-[3]" />
                </button>

                {/* Quick Enlarge Button */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScaleLayer(1.15);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-amber-400 hover:text-white hover:bg-amber-500/20 active:scale-90 transition font-bold"
                  title="Phóng to chữ/sticker (+15%)"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>

                <div className="w-[1px] h-4 bg-slate-700/60 mx-0.5" />

                {activeLayer.type === 'text' && (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTool('text');
                    }}
                    className="flex items-center gap-1 px-2.5 h-8 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-600/30 active:scale-90 transition"
                    title="Sửa nội dung văn bản"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                )}

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateLayer(activeLayer.id);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-90 transition"
                  title="Nhân bản (Copy)"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={layers.findIndex((l) => l.id === activeLayer.id) >= layers.length - 1}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = layers.findIndex((l) => l.id === activeLayer.id);
                    if (idx < layers.length - 1) reorderLayers(idx, idx + 1);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-20 active:scale-90 transition"
                  title="Lên trên 1 lớp"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={layers.findIndex((l) => l.id === activeLayer.id) <= 0}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = layers.findIndex((l) => l.id === activeLayer.id);
                    if (idx > 0) reorderLayers(idx, idx - 1);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-20 active:scale-90 transition"
                  title="Xuống dưới 1 lớp"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-4 bg-slate-700/60 mx-0.5" />

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLayer(activeLayer.id);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/30 active:scale-90 transition"
                  title="Xóa layer (Delete)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Zoom Indicator & Quick Fit Pill */}
      {hasLayers && (
        <button
          onClick={() => {
            if (Math.abs(zoom - 1) < 0.05) {
              window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
            } else {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }
          }}
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white text-[11px] font-mono shadow-xl transition active:scale-95"
          title="Chạm để chuyển đổi giữa Vừa màn hình (Fit) và 100% Gốc"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>{Math.round(zoom * 100)}%</span>
          <span className="text-[10px] text-slate-400 font-sans hidden xs:inline">
            {Math.abs(zoom - 1) < 0.05 ? 'Gốc 1:1' : 'Vừa khít'}
          </span>
        </button>
      )}
    </div>
  );
};
