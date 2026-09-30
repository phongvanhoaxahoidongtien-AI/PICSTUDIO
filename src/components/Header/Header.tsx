import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sun,
  Moon,
  FolderOpen,
  Share,
  Eye,
  Camera,
  SlidersHorizontal,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { PWAInstallButton } from '../PWA/PWAInstallButton';

interface HeaderProps {
  onOpenProjects: () => void;
  onOpenExport: () => void;
  onOpenCamera?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenProjects, onOpenExport, onOpenCamera }) => {
  const {
    projectName,
    setProjectName,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    setZoom,
    resetZoomPan,
    theme,
    toggleTheme,
    isBeforeAfterActive,
    setIsBeforeAfterActive,
    layers,
  } = useEditorStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);

  const handleFinishEditing = () => {
    setIsEditingName(false);
    if (tempName.trim()) {
      setProjectName(tempName.trim());
    } else {
      setTempName(projectName);
    }
  };

  const hasImage = layers.some((l) => l.type === 'image');

  return (
    <header
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0px))',
      }}
      className="min-h-[calc(3.5rem+env(safe-area-inset-top,0px))] w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 flex items-center z-30 select-none shrink-0"
    >
      <div className="w-full h-14 flex items-center justify-between gap-1 sm:gap-2 px-1 sm:px-3">
        {/* Left: App Logo & Project Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
          <button
            onClick={onOpenProjects}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-slate-200 transition active:scale-95 text-xs font-semibold shrink-0"
            title="Mở thư viện dự án (IndexedDB)"
          >
            <FolderOpen className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Dự án</span>
          </button>

          {/* Project Name */}
          <div className="flex items-center min-w-0">
            {isEditingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleFinishEditing}
                onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                autoFocus
                className="text-xs font-semibold bg-slate-800 text-white rounded-lg px-2 py-0.5 border border-indigo-500 focus:outline-none max-w-[80px] sm:max-w-[160px]"
              />
            ) : (
              <button
                onClick={() => {
                  setTempName(projectName);
                  setIsEditingName(true);
                }}
                className="text-xs font-semibold text-slate-200 hover:text-white truncate max-w-[70px] sm:max-w-[160px] text-left px-1.5 py-0.5 rounded hover:bg-slate-800/50 transition"
                title="Nhấn để đổi tên dự án"
              >
                {projectName}
              </button>
            )}
          </div>

          {/* Quick Camera Open Button (desktop/tablet) */}
          {onOpenCamera && (
            <button
              onClick={onOpenCamera}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-xs shadow-md shadow-pink-500/20 active:scale-95 transition shrink-0"
              title="Mở Camera chụp ảnh đẹp"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Chụp ảnh</span>
            </button>
          )}
        </div>

        {/* Center: Undo, Redo, Before/After & Zoom */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div className="flex items-center bg-slate-800/60 rounded-xl p-0.5 border border-slate-700/50">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition"
              title="Hoàn tác (Undo)"
            >
              <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition"
              title="Làm lại (Redo)"
            >
              <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Before / After hold button */}
          {hasImage && (
            <button
              onMouseDown={() => setIsBeforeAfterActive(true)}
              onMouseUp={() => setIsBeforeAfterActive(false)}
              onMouseLeave={() => setIsBeforeAfterActive(false)}
              onTouchStart={() => setIsBeforeAfterActive(true)}
              onTouchEnd={() => setIsBeforeAfterActive(false)}
              className={`flex items-center gap-1 p-1.5 sm:px-2 rounded-xl border text-xs font-medium transition active:scale-95 ${
                isBeforeAfterActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-white'
              }`}
              title="Nhấn giữ để so sánh ảnh gốc trước và sau khi chỉnh sửa"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">{isBeforeAfterActive ? 'Ảnh gốc' : 'So sánh'}</span>
            </button>
          )}

          {/* Zoom Controls (hidden on small screens, shown on desktop) */}
          <div className="hidden lg:flex items-center bg-slate-800/60 rounded-xl p-0.5 border border-slate-700/50 text-xs text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(0.1, z - 0.15))}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-700/60"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'))}
              className="px-2 py-1 font-mono hover:text-white"
              title="Đặt lại kích thước vừa màn hình"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(4, z + 0.15))}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-700/60"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'))}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-700/60"
              title="Vừa màn hình"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Install PWA, Theme & Export */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <PWAInstallButton />

          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition"
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 active:scale-95 transition shrink-0"
            title="Xuất ảnh thành file hoặc chia sẻ"
          >
            <Share className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Xuất</span>
            <span className="hidden sm:inline">ảnh</span>
          </button>
        </div>
      </div>
    </header>
  );
};
