import { create } from 'zustand';
import type {
  CanvasLayer,
  ImageLayer,
  TextLayer,
  DrawingLayer,
  StickerLayer,
  ToolType,
  ImageAdjustments,
  BeautySettings,
  CollageConfig,
  ProjectData,
} from '../types';
import { DEFAULT_ADJUSTMENTS } from '../utils/imageProcessing';
import { DEFAULT_BEAUTY_SETTINGS } from '../utils/beautyProcessing';

interface HistorySnapshot {
  layers: CanvasLayer[];
  width: number;
  height: number;
  backgroundColor: string;
}

export type AppMode = 'editor' | 'camera';

interface EditorState {
  // App Mode (Editor vs Camera)
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  // Tool & Navigation
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  isBeforeAfterActive: boolean;
  setIsBeforeAfterActive: (active: boolean) => void;

  // Canvas Viewport
  canvasWidth: number;
  canvasHeight: number;
  canvasBackgroundColor: string;
  zoom: number;
  pan: { x: number; y: number };
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  resetZoomPan: () => void;
  setCanvasDimensions: (width: number, height: number) => void;
  setCanvasBackgroundColor: (color: string) => void;

  // Project Info
  projectId: string;
  projectName: string;
  setProjectName: (name: string) => void;

  // Layers
  layers: CanvasLayer[];
  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;
  setSingleImage: (layer: ImageLayer, width: number, height: number, projectName?: string) => void;
  addLayer: (layer: CanvasLayer) => void;
  updateLayer: (id: string, updates: Partial<CanvasLayer>) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  reorderLayers: (sourceIndex: number, destinationIndex: number) => void;
  setLayers: (layers: CanvasLayer[]) => void;

  // Specific Layer Updaters
  updateActiveImageAdjustments: (adjustments: Partial<ImageAdjustments>) => void;
  resetActiveImageAdjustments: () => void;
  updateActiveImageBeauty: (beauty: Partial<BeautySettings>) => void;
  resetActiveImageBeauty: () => void;
  updateActiveImageFilter: (filterId: string, intensity?: number) => void;
  updateActiveText: (updates: Partial<TextLayer>) => void;

  // Drawing tool state
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  isEraser: boolean;
  eraserMode: 'pixel' | 'stroke';
  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setBrushOpacity: (opacity: number) => void;
  setIsEraser: (isEraser: boolean) => void;
  setEraserMode: (mode: 'pixel' | 'stroke') => void;

  // Collage tool state
  collageConfig: CollageConfig;
  setCollageConfig: (config: Partial<CollageConfig>) => void;

  // History (Undo / Redo)
  historyPast: HistorySnapshot[];
  historyFuture: HistorySnapshot[];
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Project Actions
  loadProject: (project: ProjectData) => void;
  resetProject: () => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  appMode: 'editor',
  setAppMode: (mode) => set({ appMode: mode }),

  activeTool: 'none',
  setActiveTool: (tool) => set({ activeTool: tool }),
  isBeforeAfterActive: false,
  setIsBeforeAfterActive: (active) => set({ isBeforeAfterActive: active }),

  canvasWidth: 1080,
  canvasHeight: 1080,
  canvasBackgroundColor: '#0f172a',
  zoom: 1,
  pan: { x: 0, y: 0 },
  setZoom: (zoomOrFn) =>
    set((state) => ({
      zoom: typeof zoomOrFn === 'function' ? zoomOrFn(state.zoom) : zoomOrFn,
    })),
  setPan: (panOrFn) =>
    set((state) => ({
      pan: typeof panOrFn === 'function' ? panOrFn(state.pan) : panOrFn,
    })),
  resetZoomPan: () => {
    set({ pan: { x: 0, y: 0 } });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
    }
  },
  setCanvasDimensions: (width, height) => {
    get().pushHistory();
    set({ canvasWidth: width, canvasHeight: height });
  },
  setCanvasBackgroundColor: (color) => {
    get().pushHistory();
    set({ canvasBackgroundColor: color });
  },

  projectId: 'proj_' + Date.now(),
  projectName: 'Bản thiết kế mới',
  setProjectName: (name) => set({ projectName: name }),

  layers: [],
  activeLayerId: null,
  setActiveLayerId: (id) => set({ activeLayerId: id }),

  pushHistory: () => {
    const { layers, canvasWidth, canvasHeight, canvasBackgroundColor, historyPast } = get();
    // Keep max 40 history steps to conserve mobile memory
    const snapshot: HistorySnapshot = {
      layers: JSON.parse(JSON.stringify(layers)),
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: canvasBackgroundColor,
    };
    set({
      historyPast: [...historyPast.slice(-39), snapshot],
      historyFuture: [],
    });
  },

  undo: () => {
    const { historyPast, historyFuture, layers, canvasWidth, canvasHeight, canvasBackgroundColor } = get();
    if (historyPast.length === 0) return;

    const currentSnapshot: HistorySnapshot = {
      layers: JSON.parse(JSON.stringify(layers)),
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: canvasBackgroundColor,
    };

    const previousSnapshot = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);

    set({
      layers: previousSnapshot.layers,
      canvasWidth: previousSnapshot.width,
      canvasHeight: previousSnapshot.height,
      canvasBackgroundColor: previousSnapshot.backgroundColor,
      historyPast: newPast,
      historyFuture: [currentSnapshot, ...historyFuture],
    });
  },

  redo: () => {
    const { historyPast, historyFuture, layers, canvasWidth, canvasHeight, canvasBackgroundColor } = get();
    if (historyFuture.length === 0) return;

    const currentSnapshot: HistorySnapshot = {
      layers: JSON.parse(JSON.stringify(layers)),
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: canvasBackgroundColor,
    };

    const nextSnapshot = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    set({
      layers: nextSnapshot.layers,
      canvasWidth: nextSnapshot.width,
      canvasHeight: nextSnapshot.height,
      canvasBackgroundColor: nextSnapshot.backgroundColor,
      historyPast: [...historyPast, currentSnapshot],
      historyFuture: newFuture,
    });
  },

  canUndo: () => get().historyPast.length > 0,
  canRedo: () => get().historyFuture.length > 0,

  setSingleImage: (layer, width, height, projectName) => {
    get().pushHistory();
    set({
      canvasWidth: width,
      canvasHeight: height,
      layers: [layer],
      activeLayerId: layer.id,
      zoom: 1,
      pan: { x: 0, y: 0 },
      ...(projectName ? { projectName } : {}),
    });
  },

  addLayer: (layer) => {
    get().pushHistory();
    set((state) => ({
      layers: [...state.layers, layer],
      activeLayerId: layer.id,
    }));
  },

  updateLayer: (id, updates) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? ({ ...l, ...updates } as CanvasLayer) : l)),
    }));
  },

  removeLayer: (id) => {
    get().pushHistory();
    set((state) => {
      const nextLayers = state.layers.filter((l) => l.id !== id);
      const nextActiveId = state.activeLayerId === id ? (nextLayers.length > 0 ? nextLayers[nextLayers.length - 1].id : null) : state.activeLayerId;
      return { layers: nextLayers, activeLayerId: nextActiveId };
    });
  },

  duplicateLayer: (id) => {
    const { layers, pushHistory } = get();
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    pushHistory();
    const cloned: CanvasLayer = {
      ...JSON.parse(JSON.stringify(layer)),
      id: 'layer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: `${layer.name} (Bản sao)`,
      x: layer.x + 20,
      y: layer.y + 20,
    };
    set((state) => ({
      layers: [...state.layers, cloned],
      activeLayerId: cloned.id,
    }));
  },

  reorderLayers: (sourceIndex, destinationIndex) => {
    get().pushHistory();
    set((state) => {
      const newLayers = Array.from(state.layers);
      const [removed] = newLayers.splice(sourceIndex, 1);
      newLayers.splice(destinationIndex, 0, removed);
      return { layers: newLayers };
    });
  },

  setLayers: (layers) => {
    get().pushHistory();
    set({ layers });
  },

  updateActiveImageAdjustments: (adjustments) => {
    const { layers, activeLayerId } = get();
    const activeLayer = layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image');
    if (!activeLayer || activeLayer.type !== 'image') return;

    const imgLayer = activeLayer as ImageLayer;
    const updatedAdjustments = {
      ...imgLayer.adjustments,
      ...adjustments,
    };

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === imgLayer.id
          ? ({
              ...l,
              adjustments: updatedAdjustments,
            } as ImageLayer)
          : l
      ),
    }));
  },

  resetActiveImageAdjustments: () => {
    get().pushHistory();
    const { layers, activeLayerId } = get();
    const activeLayer = layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image');
    if (!activeLayer || activeLayer.type !== 'image') return;

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === activeLayer.id
          ? ({
              ...l,
              adjustments: { ...DEFAULT_ADJUSTMENTS },
              filterId: 'normal',
              filterIntensity: 100,
            } as ImageLayer)
          : l
      ),
    }));
  },

  updateActiveImageBeauty: (beauty) => {
    const { layers, activeLayerId } = get();
    const activeLayer = layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image');
    if (!activeLayer || activeLayer.type !== 'image') return;

    const imgLayer = activeLayer as ImageLayer;
    const currentBeauty = imgLayer.beauty || { ...DEFAULT_BEAUTY_SETTINGS };
    const updatedBeauty = {
      ...currentBeauty,
      ...beauty,
    };

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === imgLayer.id
          ? ({
              ...l,
              beauty: updatedBeauty,
            } as ImageLayer)
          : l
      ),
    }));
  },

  resetActiveImageBeauty: () => {
    get().pushHistory();
    const { layers, activeLayerId } = get();
    const activeLayer = layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image');
    if (!activeLayer || activeLayer.type !== 'image') return;

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === activeLayer.id
          ? ({
              ...l,
              beauty: { ...DEFAULT_BEAUTY_SETTINGS },
            } as ImageLayer)
          : l
      ),
    }));
  },

  updateActiveImageFilter: (filterId, intensity = 100) => {
    const { layers, activeLayerId } = get();
    const activeLayer = layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image');
    if (!activeLayer || activeLayer.type !== 'image') return;

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === activeLayer.id
          ? ({
              ...l,
              filterId,
              filterIntensity: intensity,
            } as ImageLayer)
          : l
      ),
    }));
  },

  updateActiveText: (updates) => {
    const { layers, activeLayerId } = get();
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (!activeLayer || activeLayer.type !== 'text') return;

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === activeLayer.id
          ? ({
              ...l,
              ...updates,
            } as TextLayer)
          : l
      ),
    }));
  },

  brushColor: '#ef4444',
  brushSize: 12,
  brushOpacity: 1,
  isEraser: false,
  eraserMode: 'pixel',
  setBrushColor: (color) => set({ brushColor: color }),
  setBrushSize: (size) => set({ brushSize: size }),
  setBrushOpacity: (opacity) => set({ brushOpacity: opacity }),
  setIsEraser: (isEraser) => set({ isEraser }),
  setEraserMode: (mode) => set({ eraserMode: mode }),

  collageConfig: {
    layout: 'freeform',
    spacing: 12,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    aspectRatio: '1:1',
  },
  setCollageConfig: (config) =>
    set((state) => ({
      collageConfig: { ...state.collageConfig, ...config },
    })),

  historyPast: [],
  historyFuture: [],

  loadProject: (project) => {
    set({
      projectId: project.id,
      projectName: project.name,
      canvasWidth: project.width,
      canvasHeight: project.height,
      canvasBackgroundColor: project.backgroundColor,
      layers: project.layers,
      activeLayerId: project.layers.length > 0 ? project.layers[0].id : null,
      historyPast: [],
      historyFuture: [],
      activeTool: 'none',
    });
  },

  resetProject: () => {
    set({
      projectId: 'proj_' + Date.now(),
      projectName: 'Bản thiết kế mới',
      canvasWidth: 1080,
      canvasHeight: 1080,
      canvasBackgroundColor: '#0f172a',
      layers: [],
      activeLayerId: null,
      historyPast: [],
      historyFuture: [],
      activeTool: 'none',
      zoom: 1,
      pan: { x: 0, y: 0 },
    });
  },

  theme: 'dark',
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: next };
    }),
}));
