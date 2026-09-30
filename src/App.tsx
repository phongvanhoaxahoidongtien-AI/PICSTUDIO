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
    // If first image loaded, adapt canvas dimensions
    if (layers.length === 0) {
      setCanvasDimensions(width, height);
    }

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
      width: layers.length === 0 ? width : Math.min(width, canvasWidth),
      height: layers.length === 0 ? height : Math.min(height, canvasHeight),
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
      beauty: {
        ...DEFAULT_BEAUTY_SETTINGS,
        smooth: liveSettings?.smooth ?? 35,
        whiten: liveSettings?.whiten ?? 20,
        glow: liveSettings?.glow ?? 20,
        presetId: liveSettings?.presetId,
      },
      filterId: liveSettings?.filterId || 'normal',
      filterIntensity: 100,
    };

    addLayer(newLayer);
    setAppMode('editor');
    setActiveTool('beauty');
  };

  // Process imported image files
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { dataUrl, width, height } = await downscaleImageIfNeeded(file);

        // If this is the first image loaded, adapt canvas dimensions
        if (layers.length === 0 && i === 0) {
          setCanvasDimensions(width, height);
        }

        const newLayer: ImageLayer = {
          id: 'img_' + Date.now() + '_' + i,
          name: file.name.substring(0, 24) || `Ảnh ${layers.length + 1}`,
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
          width: layers.length === 0 ? width : Math.min(width, canvasWidth),
          height: layers.length === 0 ? height : Math.min(height, canvasHeight),
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

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        try {
          const { dataUrl, width, height } = await downscaleImageIfNeeded(file);
          if (layers.length === 0 && i === 0) {
            setCanvasDimensions(width, height);
          }
          const newLayer: ImageLayer = {
            id: 'img_' + Date.now() + '_' + i,
            name: file.name.substring(0, 24) || `Ảnh ${layers.length + 1}`,
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
            width: layers.length === 0 ? width : Math.min(width, canvasWidth),
            height: layers.length === 0 ? height : Math.min(height, canvasHeight),
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
  }, [layers.length, canvasWidth, canvasHeight, setCanvasDimensions, addLayer]);

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

  // Apply Crop Callback
  const handleApplyCrop = (croppedCanvas: HTMLCanvasElement) => {
    const targetLayer = layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image');
    if (!targetLayer) return;

    pushHistory();
    const newSrc = croppedCanvas.toDataURL('image/jpeg', 0.95);
    updateLayer(targetLayer.id, {
      src: newSrc,
      width: croppedCanvas.width,
      height: croppedCanvas.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
    // If single layer, also match canvas dimensions
    if (layers.length === 1) {
      setCanvasDimensions(croppedCanvas.width, croppedCanvas.height);
    }
    setActiveTool('none');
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
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
      />

      {/* Main Canvas Workspace */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <CanvasEditor
          onOpenFilePicker={handleOpenFilePicker}
          onOpenCamera={() => setAppMode('camera')}
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
    </div>
  );
}
