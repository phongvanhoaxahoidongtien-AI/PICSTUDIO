/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Header } from './components/Header/Header';
import { CanvasEditor } from './components/Editor/CanvasEditor';
import { CropOverlay } from './components/Editor/CropOverlay';
import { BottomNav } from './components/Toolbar/BottomNav';
import { AdjustmentsPanel } from './components/AdjustmentsPanel/AdjustmentsPanel';
import { FiltersPanel } from './components/FiltersPanel/FiltersPanel';
import { TextPanel } from './components/TextPanel/TextPanel';
import { CollagePanel } from './components/CollagePanel/CollagePanel';
import { DrawPanel } from './components/DrawPanel/DrawPanel';
import { StickersPanel } from './components/StickersPanel/StickersPanel';
import { LayersPanel } from './components/LayersPanel/LayersPanel';
import { BeautyPanel } from './components/BeautyPanel/BeautyPanel';
import { CameraView } from './components/Camera/CameraView';
import type { LiveBeautySettings } from './components/Camera/BeautyLiveControls';
import { ExportModal } from './components/ExportModal/ExportModal';
import { ProjectsModal } from './components/ProjectsModal/ProjectsModal';
import { ShareAppModal } from './components/ShareAppModal/ShareAppModal';
import { OfflineIndicator } from './components/PWA/OfflineIndicator';
import { useEditorStore } from './stores/editorStore';
import { downscaleImageIfNeeded } from './utils/imageProcessing';
import { DEFAULT_BEAUTY_SETTINGS } from './utils/beautyProcessing';
import type { ImageLayer } from './types';

export default function App() {
  const {
    appMode,
    setAppMode,
    activeTool,
    setActiveTool,
    layers,
    setSingleImage,
    addLayer,
    updateLayer,
    setCanvasDimensions,
    canvasWidth,
    canvasHeight,
    undo,
    redo,
    activeLayerId,
    removeLayer,
    pushHistory,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isShareAppOpen, setIsShareAppOpen] = useState(false);

  // File picker trigger
  const handleOpenFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Process camera snapshot capture
  const handleCapture = (
    dataUrl: string,
    width: number,
    height: number,
    liveSettings?: LiveBeautySettings
  ) => {
    const isMultiLayerMode = activeTool === 'layers' || activeTool === 'collage';
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    let layerW = width;
    let layerH = height;
    let layerX = 0;
    let layerY = 0;

    if (isMultiLayerMode && layers.length > 0) {
      const curW = canvasWidth;
      const curH = canvasHeight;
      const maxDim = Math.min(curW, curH) * 0.75;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      layerW = Math.round(width * scale);
      layerH = Math.round(height * scale);
      layerX = Math.round((curW - layerW) / 2);
      layerY = Math.round((curH - layerH) / 2);
    }

    const newLayer: ImageLayer = {
      id: 'img_' + Date.now() + '_cam',
      name: `Ảnh chụp ${timeStr}`,
      type: 'image',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      src: dataUrl,
      originalWidth: width,
      originalHeight: height,
      x: 0,
      y: 0,
      width: width,
      height: height,
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
        whites: 0,
        blacks: 0,
        temperature: 0,
        tint: 0,
        sharpness: 0,
        vignette: 0,
        clarity: 0,
        blackPoint: 0,
        gamma: 1.0,
        whitePoint: 255,
      },
      beauty: {
        ...DEFAULT_BEAUTY_SETTINGS,
        smooth: liveSettings?.smooth ?? 0,
        whiten: liveSettings?.whiten ?? 0,
        glow: liveSettings?.glow ?? 0,
        presetId: liveSettings?.presetId || 'none',
      },
      filterId: liveSettings?.filterId || 'normal',
      filterIntensity: 100,
    };

    // Native single image editing: 100% full original resolution, no sub-layers
    setSingleImage(newLayer, width, height, `Ảnh chụp ${timeStr}`);

    setAppMode('editor');
    setActiveTool('none');

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
    }, 40);
  };

  // Process imported image files (Main photo editing flow)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const isMultiLayerMode = activeTool === 'layers' || activeTool === 'collage';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { dataUrl, width, height } = await downscaleImageIfNeeded(file);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').trim();

        if (!isMultiLayerMode) {
          // SINGLE IMAGE EDITING MODE (Default iOS / Android style):
          // Canvas dimensions = 100% EXACT pixel dimensions of this photo
          // Discard previous layers so this is a clean single photo edit
          const newLayer: ImageLayer = {
            id: 'img_' + Date.now() + '_' + i,
            name: cleanName || 'Ảnh chỉnh sửa',
            type: 'image',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'source-over',
            src: dataUrl,
            originalWidth: width,
            originalHeight: height,
            x: 0,
            y: 0,
            width: width,
            height: height,
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
              whites: 0,
              blacks: 0,
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

          setSingleImage(newLayer, width, height, cleanName || 'Ảnh chỉnh sửa');

          // Trigger fit-to-screen to fit viewport with comfortable margins
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
          }, 30);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
          }, 150);
          // In single image mode, process 1 photo as primary
          break;
        } else {
          // MULTI-LAYER / COLLAGE MODE:
          const curW = useEditorStore.getState().canvasWidth || width;
          const curH = useEditorStore.getState().canvasHeight || height;
          const layerX = Math.round((curW - width) / 2);
          const layerY = Math.round((curH - height) / 2);

          const newLayer: ImageLayer = {
            id: 'img_' + Date.now() + '_' + i,
            name: cleanName || `Lớp ảnh ${useEditorStore.getState().layers.length + 1}`,
            type: 'image',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'source-over',
            src: dataUrl,
            originalWidth: width,
            originalHeight: height,
            x: layerX,
            y: layerY,
            width: width,
            height: height,
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

          addLayer(newLayer);
        }
      } catch (err) {
        console.error('Failed to import image:', err);
      }
    }
  };

  // Drag and drop onto window
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const isMultiLayerMode = activeTool === 'layers' || activeTool === 'collage';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        try {
          const { dataUrl, width, height } = await downscaleImageIfNeeded(file);
          const cleanName = file.name.replace(/\.[^/.]+$/, '').trim();

          if (!isMultiLayerMode) {
            // Single Image Editing Mode
            const newLayer: ImageLayer = {
              id: 'img_' + Date.now() + '_' + i,
              name: cleanName || 'Ảnh chỉnh sửa',
              type: 'image',
              visible: true,
              locked: false,
              opacity: 1,
              blendMode: 'source-over',
              src: dataUrl,
              originalWidth: width,
              originalHeight: height,
              x: 0,
              y: 0,
              width: width,
              height: height,
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

            setSingleImage(newLayer, width, height, cleanName || 'Ảnh chỉnh sửa');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
            }, 30);
            break;
          } else {
            // Multi-layer mode
            const curW = useEditorStore.getState().canvasWidth || width;
            const curH = useEditorStore.getState().canvasHeight || height;
            const layerX = Math.round((curW - width) / 2);
            const layerY = Math.round((curH - height) / 2);

            const newLayer: ImageLayer = {
              id: 'img_' + Date.now() + '_' + i,
              name: cleanName || `Lớp ảnh ${useEditorStore.getState().layers.length + 1}`,
              type: 'image',
              visible: true,
              locked: false,
              opacity: 1,
              blendMode: 'source-over',
              src: dataUrl,
              originalWidth: width,
              originalHeight: height,
              x: layerX,
              y: layerY,
              width: width,
              height: height,
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
                whites: 0,
                blacks: 0,
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

            addLayer(newLayer);
            useEditorStore.getState().setActiveLayerId(newLayer.id);

            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
            }, 30);
          }
        } catch (err) {
          console.error('Drop image failed:', err);
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [setCanvasDimensions, addLayer]);

  // Keyboard shortcuts (Undo, Redo, Delete, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        setActiveTool('none');
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && activeLayerId) {
        removeLayer(activeLayerId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, setActiveTool, activeLayerId, removeLayer]);

  // Apply Crop Callback (100% Native Resolution, No Quality Loss)
  const handleApplyCrop = (croppedCanvas: HTMLCanvasElement, mimeType = 'image/jpeg') => {
    const targetLayer = layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image');
    if (!targetLayer) return;

    pushHistory();
    const newSrc = croppedCanvas.toDataURL(mimeType, 1.0);
    updateLayer(targetLayer.id, {
      src: newSrc,
      originalWidth: croppedCanvas.width,
      originalHeight: croppedCanvas.height,
      width: croppedCanvas.width,
      height: croppedCanvas.height,
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
    // Set exact native dimensions for the cropped photo
    setCanvasDimensions(croppedCanvas.width, croppedCanvas.height);
    setActiveTool('none');

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
    }, 40);
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col bg-slate-950 text-slate-100 select-none font-sans">
      {/* Hidden File Input for Single / Multi image import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header */}
      <Header
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenCamera={() => setAppMode('camera')}
        onOpenShareApp={() => setIsShareAppOpen(true)}
      />

      {/* Main Canvas Workspace with min-h-0 to allow flex shrinking on iOS */}
      <main className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
        <CanvasEditor
          onOpenFilePicker={handleOpenFilePicker}
          onOpenCamera={() => setAppMode('camera')}
          onOpenShareApp={() => setIsShareAppOpen(true)}
        />

        {/* Interactive Crop & Rotate Tool Overlay */}
        {activeTool === 'crop' && (
          <CropOverlay
            onApplyCrop={handleApplyCrop}
            onCancel={() => setActiveTool('none')}
          />
        )}
      </main>

      {/* Active Specialized Editing Panels */}
      {activeTool === 'beauty' && <BeautyPanel />}
      {activeTool === 'adjust' && <AdjustmentsPanel />}
      {activeTool === 'filters' && <FiltersPanel />}
      {activeTool === 'text' && <TextPanel />}
      {activeTool === 'collage' && <CollagePanel onAddMorePhotos={handleOpenFilePicker} />}
      {activeTool === 'draw' && <DrawPanel />}
      {activeTool === 'stickers' && <StickersPanel />}
      {activeTool === 'layers' && <LayersPanel />}

      {/* Bottom Tool Bar */}
      <BottomNav
        onOpenFilePicker={handleOpenFilePicker}
        onOpenCamera={() => setAppMode('camera')}
      />

      {/* Floating Offline Status Toast */}
      <OfflineIndicator />

      {/* Real-time Beauty Camera Modal / Fullscreen View */}
      {appMode === 'camera' && (
        <CameraView
          onCapture={handleCapture}
          onClose={() => setAppMode('editor')}
          onOpenGallery={handleOpenFilePicker}
        />
      )}

      {/* Export / Share Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Projects Library Modal (IndexedDB) */}
      <ProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        onNewCanvas={handleOpenFilePicker}
      />

      {/* Share Application Modal */}
      <ShareAppModal
        isOpen={isShareAppOpen}
        onClose={() => setIsShareAppOpen(false)}
      />
    </div>
  );
}
