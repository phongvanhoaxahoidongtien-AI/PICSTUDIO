import React, { useState, useRef, useEffect } from 'react';
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
  MoreVertical,
  Check,
  Smartphone,
  Maximize,
  Edit2,
  Layers,
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
    setPan,
    canvasWidth,
    canvasHeight,
    theme,
    toggleTheme,
    isBeforeAfterActive,
    setIsBeforeAfterActive,
    layers,
  } = useEditorStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isMenuOpen]);

  const handleFinishEditing = () => {
    setIsEditingName(false);
    if (tempName.trim()) {
      setProjectName(tempName.trim());
    } else {
      setTempName(projectName);
    }
  };

  const hasImage = layers.some((l) => l.type === 'image');
  const isZoom100 = Math.abs(zoom - 1) < 0.04;

  const handleToggleZoom = () => {
    if (isZoom100) {
      window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
    } else {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  return (
    <header
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
      className="w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 z-30 select-none shrink-0"
    >
      <div
        style={{
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0px))',
        }}
        className="w-full h-12 sm:h-14 flex items-center justify-between gap-1 sm:gap-2 px-1.5 sm:px-3"
      >
        {/* Left: Project Library & Title */}
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 shrink">
          <button
            onClick={onOpenProjects}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-slate-200 transition active:scale-95 text-xs font-semibold shrink-0"
            title="Mở thư viện dự án (IndexedDB)"
          >
            <FolderOpen className="w-4 h-4 text-indigo-400" />
            <span className="hidden xs:inline">Dự án</span>
          </button>

          {/* Project Name (Truncated cleanly on mobile) */}
          <div className="flex items-center min-w-0">
            {isEditingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleFinishEditing}
                onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                autoFocus
                className="text-xs font-semibold bg-slate-800 text-white rounded-lg px-2 py-0.5 border border-indigo-500 focus:outline-none max-w-[65px] xs:max-w-[100px] sm:max-w-[160px]"
              />
            ) : (
              <button
                onClick={() => {
                  setTempName(projectName);
                  setIsEditingName(true);
                }}
                className="text-xs font-semibold text-slate-200 hover:text-white truncate max-w-[60px] xs:max-w-[95px] sm:max-w-[160px] text-left px-1 py-0.5 rounded hover:bg-slate-800/50 transition"
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
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-xs shadow-md shadow-pink-500/20 active:scale-95 transition shrink-0"
              title="Mở Camera chụp ảnh đẹp"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Chụp ảnh</span>
            </button>
          )}
        </div>

        {/* Center: Undo, Redo, Compare & Quick Zoom */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div className="flex items-center bg-slate-800/70 rounded-xl p-0.5 border border-slate-700/60 shadow-inner">
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
                  : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
              title="Nhấn giữ để so sánh ảnh gốc trước và sau khi chỉnh sửa"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">{isBeforeAfterActive ? 'Ảnh gốc' : 'So sánh'}</span>
            </button>
          )}

          {/* Quick Zoom Mode Pill (Toggles between Fit to Screen & 100% Native Resolution) */}
          <button
            onClick={handleToggleZoom}
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-xl border text-[11px] font-mono transition active:scale-95 ${
              isZoom100
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
            title={isZoom100 ? 'Đang xem 100% kích thước gốc. Bấm để vừa màn hình' : 'Bấm để phóng to 100% kích thước gốc'}
          >
            <span className="hidden sm:inline">{isZoom100 ? '100% Gốc' : 'Vừa'}</span>
            <span>{Math.round(zoom * 100)}%</span>
          </button>

          {/* Zoom stepper (visible on large screen) */}
          <div className="hidden lg:flex items-center bg-slate-800/60 rounded-xl p-0.5 border border-slate-700/50 text-xs text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(0.05, z - 0.15))}
              className="p-1 rounded-lg hover:text-white hover:bg-slate-700/60"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(4, z + 0.15))}
              className="p-1 rounded-lg hover:text-white hover:bg-slate-700/60"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'))}
              className="p-1 rounded-lg hover:text-white hover:bg-slate-700/60"
              title="Vừa màn hình"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Install PWA, Theme & Export */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* PWA Install Button (desktop/tablet only, on mobile it lives inside More menu) */}
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* Theme Toggle (desktop/tablet) */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition"
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Primary Save / Export Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 active:scale-95 transition shrink-0"
            title="Lưu hoặc chia sẻ ảnh chất lượng cao"
          >
            <Share className="w-3.5 h-3.5" />
            <span className="inline">Lưu</span>
          </button>

          {/* Mobile "..." More Menu (Prevents header overflow on mobile & iOS) */}
          <div className="relative sm:hidden" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60 transition active:scale-95 shrink-0"
              title="Tùy chọn khác"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-200">
                {/* Image Resolution Info */}
                <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Kích thước gốc:</span>
                  <span className="font-mono text-indigo-400 font-semibold">{canvasWidth} × {canvasHeight}px</span>
                </div>

                {/* Toggle 100% Native Resolution */}
                <button
                  onClick={() => {
                    handleToggleZoom();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800 text-left transition"
                >
                  <Maximize className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{isZoom100 ? 'Đặt lại vừa màn hình' : 'Xem 100% kích thước gốc'}</p>
                    <p className="text-[10px] text-slate-400">{isZoom100 ? 'Thu nhỏ vừa trọn màn hình' : 'Xem 1:1 chuẩn từng pixel'}</p>
                  </div>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800 text-left transition"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                  <span>{theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
                </button>

                {/* Rename Project */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setTempName(projectName);
                    setIsEditingName(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800 text-left transition"
                >
                  <Edit2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Đổi tên dự án</span>
                </button>

                {/* PWA Install wrapper in Mobile Menu */}
                <div className="pt-1 border-t border-slate-800 mt-1">
                  <div onClick={() => setIsMenuOpen(false)}>
                    <PWAInstallButton />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
