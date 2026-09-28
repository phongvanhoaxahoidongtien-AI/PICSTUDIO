import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Clock,
  X,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { getAllProjects, saveProject, deleteProject, getProject } from '../../services/db';
import type { ProjectMetadata, ProjectData } from '../../types';
import { generateSampleImage } from '../../utils/sampleImages';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewCanvas: () => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  onNewCanvas,
}) => {
  const {
    projectId,
    projectName,
    canvasWidth,
    canvasHeight,
    canvasBackgroundColor,
    layers,
    loadProject,
    resetProject,
  } = useEditorStore();

  const [savedProjects, setSavedProjects] = useState<ProjectMetadata[]>([]);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const fetchProjects = async () => {
    try {
      const list = await getAllProjects();
      setSavedProjects(list);
    } catch (err) {
      console.error('Failed to load projects from IndexedDB:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const handleSaveCurrent = async () => {
    try {
      // Create thumbnail from canvas element if available
      let thumbnail = '';
      const existingCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      if (existingCanvas) {
        thumbnail = existingCanvas.toDataURL('image/jpeg', 0.5);
      } else {
        thumbnail = generateSampleImage('landscape');
      }

      const projectData: ProjectData = {
        id: projectId,
        name: projectName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        thumbnail,
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: canvasBackgroundColor,
        layers,
      };

      await saveProject(projectData);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2500);
      await fetchProjects();
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  const handleOpenProject = async (id: string) => {
    try {
      const proj = await getProject(id);
      if (proj) {
        loadProject(proj);
        onClose();
      }
    } catch (err) {
      console.error('Failed to open project:', err);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteProject(id);
      await fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleCreateNew = () => {
    resetProject();
    onNewCanvas();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Quản lý Dự án (IndexedDB)</h3>
              <p className="text-xs text-slate-400">Lưu trữ 100% offline trên thiết bị của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar: Save current & New project */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveCurrent}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition"
          >
            {isSavedRecently ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Đã lưu vào máy!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu dự án hiện tại</span>
              </>
            )}
          </button>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Tạo mới</span>
          </button>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {savedProjects.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-dashed border-slate-800 bg-slate-800/20">
              <p className="text-xs text-slate-400 mb-2">Chưa có dự án nào được lưu.</p>
              <p className="text-[11px] text-slate-500">
                Nhấn &quot;Lưu dự án hiện tại&quot; ở trên để lưu lại tiến trình chỉnh sửa của bạn vào bộ nhớ trình duyệt!
              </p>
            </div>
          ) : (
            savedProjects.map((p) => {
              const dateStr = new Date(p.updatedAt).toLocaleDateString('vi-VN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenProject(p.id)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-indigo-500/60 transition cursor-pointer group"
                >
                  {/* Thumbnail & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition">
                        {p.name}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span>{p.width}×{p.height}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteProject(p.id, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition"
                    title="Xóa dự án"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
