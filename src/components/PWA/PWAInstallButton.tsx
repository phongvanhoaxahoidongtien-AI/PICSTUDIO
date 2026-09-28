import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-xs font-semibold shadow-md hover:opacity-90 active:scale-95 transition"
        title="Cài đặt ứng dụng vào màn hình chính"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Cài app</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-400/40 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-xs font-medium transition active:scale-95"
          title="Cài đặt lên iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Cài trên iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                    L
                  </div>
                  <h3 className="text-base font-bold text-white">Cài đặt Lumix Studio trên iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Bước 1:</span> Nhấn biểu tượng <strong>Chia sẻ (Share)</strong> ở thanh công cụ Safari phía dưới màn hình.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <PlusSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Bước 2:</span> Cuộn xuống và chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong>.
                  </div>
                </div>

                <p className="text-xs text-slate-400 italic">
                  💡 Sau khi thêm, bạn có thể mở Lumix Studio bất cứ lúc nào, toàn màn hình và dùng 100% offline không cần mạng!
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop install guidance button if not standalone
  return (
    <button
      onClick={() => {
        alert("Để cài đặt trên máy tính: Nhấn biểu tượng cài đặt ở thanh địa chỉ trình duyệt Chrome/Edge hoặc menu dấu 3 chấm -> 'Cài đặt Lumix Studio'.");
      }}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 text-xs font-medium transition"
    >
      <Download className="w-3.5 h-3.5 text-indigo-400" />
      <span>Cài PWA</span>
    </button>
  );
};
