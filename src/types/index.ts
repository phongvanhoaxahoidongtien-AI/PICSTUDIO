export type ToolType = 
  | 'none'
  | 'crop'
  | 'adjust'
  | 'filters'
  | 'text'
  | 'collage'
  | 'draw'
  | 'stickers'
  | 'layers'
  | 'export'
  | 'projects';

export interface ImageAdjustments {
  brightness: number;    // -100 to 100
  contrast: number;      // -100 to 100
  saturation: number;    // -100 to 100
  exposure: number;      // -100 to 100
  highlights: number;    // -100 to 100
  shadows: number;       // -100 to 100
  temperature: number;   // -100 to 100 (warm/cool)
  tint: number;          // -100 to 100 (green/magenta)
  sharpness: number;     // 0 to 100
  vignette: number;      // 0 to 100
  clarity: number;       // -100 to 100
  // Levels
  blackPoint: number;    // 0 to 100 (default 0)
  gamma: number;         // 0.2 to 2.5 (default 1.0)
  whitePoint: number;    // 155 to 255 (default 255)
}

export type BlendMode = 
  | 'source-over'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export interface BaseLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;       // 0 to 1
  blendMode: BlendMode;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;      // degrees
  scaleX: number;
  scaleY: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;           // Base64 or Blob URL
  originalWidth: number;
  originalHeight: number;
  adjustments: ImageAdjustments;
  filterId: string;
  filterIntensity: number; // 0 to 100
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '900';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundRadius?: number;
  isGradient?: boolean;
  gradientColors?: [string, string];
}

export interface DrawPoint {
  x: number;
  y: number;
}

export interface DrawPath {
  points: DrawPoint[];
  color: string;
  size: number;
  opacity: number;
  isEraser: boolean;
}

export interface DrawingLayer extends BaseLayer {
  type: 'drawing';
  paths: DrawPath[];
}

export interface StickerLayer extends BaseLayer {
  type: 'sticker';
  stickerId: string;
  category: string;
  svgContent?: string;
}

export type CanvasLayer = ImageLayer | TextLayer | DrawingLayer | StickerLayer;

export interface CropState {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number | null; // null for freeform
}

export interface ProjectMetadata {
  id: string;
  name: string;
  updatedAt: number;
  createdAt: number;
  thumbnail: string;
  width: number;
  height: number;
}

export interface ProjectData extends ProjectMetadata {
  layers: CanvasLayer[];
  backgroundColor: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  category: 'classic' | 'vintage' | 'cinematic' | 'moody' | 'creative';
  adjustments: Partial<ImageAdjustments>;
  colorMatrix?: number[];
  toneMapping?: {
    rCurve?: number[];
    gCurve?: number[];
    bCurve?: number[];
  };
}

export type CollageLayoutType = 
  | 'freeform'
  | 'split-v'
  | 'split-h'
  | 'grid-3-top'
  | 'grid-3-left'
  | 'grid-4'
  | 'grid-6'
  | 'grid-9';

export interface CollageConfig {
  layout: CollageLayoutType;
  spacing: number;
  borderRadius: number;
  backgroundColor: string;
  aspectRatio: '1:1' | '4:5' | '16:9' | '9:16' | '3:4';
}
