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
import { TimeMarkPanel } from './components/TimeMarkPanel/TimeMarkPanel';
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
    setLayers,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isShareAppOpen, setIsShareAppOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounterRef = useRef(0);

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

  // Core image file processor for File Picker, Drag & Drop, and Clipboard Paste
  const processImageFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const isMultiLayerMode = activeTool === 'layers' || activeTool === 'collage';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const { dataUrl, width, height } = await downscaleImageIfNeeded(file);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').trim();

        if (!isMultiLayerMode) {
          // SINGLE IMAGE EDITING MODE (Default Gallery / Photos App style):
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
          }, 40);
        }
      } catch (err) {
        console.error('Failed to import image:', err);
      }
    }
  };

  // Process imported image files from file picker
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processImageFiles(files);
    }
  };

  // Full-window Drag and Drop handlers with visual overlay feedback
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingFile(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processImageFiles(files);
    }
  };

  // Clipboard Paste support (Ctrl+V / Cmd+V) on web
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)
      ) {
        return;
      }
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        await processImageFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTool, canvasWidth, canvasHeight]);

  // Keyboard shortcuts (Undo, Redo, Delete, Escape, Save, Open)
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
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFilePicker();
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
  const handleApplyCrop = (croppedCanvas: HTMLCanvasElement, mimeType = 'image/png') => {
    pushHistory();
    const newSrc = croppedCanvas.toDataURL(mimeType, 1.0);
    const newW = croppedCanvas.width;
    const newH = croppedCanvas.height;

    // The cropped result is now the consolidated base image containing all baked edits
    const existingImage = layers.find((l) => l.type === 'image') as ImageLayer | undefined;
    const baseId = existingImage ? existingImage.id : 'img_' + Date.now();
    const baseName = existingImage ? existingImage.name : 'Ảnh đã cắt';

    const updatedImageLayer: ImageLayer = {
      id: baseId,
      name: baseName,
      type: 'image',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      src: newSrc,
      originalWidth: newW,
      originalHeight: newH,
      x: 0,
      y: 0,
      width: newW,
      height: newH,
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

    setLayers([updatedImageLayer]);
    useEditorStore.getState().setActiveLayerId(baseId);
    setCanvasDimensions(newW, newH);
    setActiveTool('none');

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
    }, 40);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col bg-slate-950 text-slate-100 select-none font-sans"
    >
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

      {/* Workspace Area: Mobile bottom sheet vs Desktop right inspector sidebar */}
      <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row overflow-hidden relative">
        {/* Main Canvas Workspace with min-h-0 to allow flex shrinking on all screens */}
        <main className="relative flex-1 min-h-0 min-w-0 w-full h-full flex items-center justify-center overflow-hidden">
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

        {/* Active Specialized Editing Panels (Bottom Sheet on Mobile, Right Inspector Sidebar on Desktop Web) */}
        {activeTool !== 'none' && activeTool !== 'crop' && (
          <aside className="w-full lg:w-96 xl:w-[410px] lg:h-full shrink-0 z-20 flex flex-col overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/95 dark:bg-slate-950/95 shadow-2xl animate-in lg:slide-in-from-right slide-in-from-bottom duration-200 max-h-[46dvh] lg:max-h-none">
            {activeTool === 'beauty' && <BeautyPanel />}
            {activeTool === 'adjust' && <AdjustmentsPanel />}
            {activeTool === 'filters' && <FiltersPanel />}
            {activeTool === 'timemark' && <TimeMarkPanel />}
            {activeTool === 'text' && <TextPanel />}
            {activeTool === 'collage' && <CollagePanel onAddMorePhotos={handleOpenFilePicker} />}
            {activeTool === 'draw' && <DrawPanel />}
            {activeTool === 'stickers' && <StickersPanel />}
            {activeTool === 'layers' && <LayersPanel />}
          </aside>
        )}
      </div>

      {/* Bottom Tool Bar */}
      <BottomNav
        onOpenFilePicker={handleOpenFilePicker}
        onOpenCamera={() => setAppMode('camera')}
      />

      {/* Visual File Dropzone Overlay for Web Drag-and-Drop */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 border-4 border-dashed border-indigo-500 m-3 rounded-3xl pointer-events-none animate-in fade-in duration-150">
          <div className="p-5 rounded-3xl bg-indigo-600/20 text-indigo-400 mb-4 border border-indigo-500/30 shadow-xl shadow-indigo-600/20">
            <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Thả ảnh vào đây để mở chỉnh sửa</h2>
          <p className="text-sm text-slate-300">Chỉnh sửa trực tiếp trên ảnh gốc, bảo toàn 100% độ phân giải</p>
        </div>
      )}

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
