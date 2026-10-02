import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Send,
  MessageCircle,
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
  const appTitle = 'Lumix Studio - Trình Chụp & Chỉnh Sửa Ảnh Đẹp PWA Offline';
  const shareText =
    'Trải nghiệm Lumix Studio - Ứng dụng chụp ảnh làm đẹp Snow, chỉnh màu Windows Photos và vẽ bút mượt mà 100% offline!';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = appUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appTitle,
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const socialLinks = [
    {
      name: 'Facebook',
      bg: 'bg-[#1877F2] hover:bg-[#166fe5]',
      icon: (
        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`,
    },
    {
      name: 'Zalo',
      bg: 'bg-[#0068FF] hover:bg-[#0057d6]',
      icon: (
        <span className="font-bold text-xs text-white tracking-tighter">Zalo</span>
      ),
      url: `https://zalo.me/share?url=${encodeURIComponent(appUrl)}`,
    },
    {
      name: 'Telegram',
      bg: 'bg-[#229ED9] hover:bg-[#1d8bc0]',
      icon: <Send className="w-4 h-4 text-white" />,
      url: `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Twitter / X',
      bg: 'bg-black hover:bg-neutral-800 border border-neutral-700',
      icon: (
        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Chia sẻ ứng dụng</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">Giới thiệu cho bạn bè cùng chụp & chỉnh sửa ảnh đẹp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Offline & Riêng tư</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Cài đặt PWA trên máy</span>
          </div>
        </div>

        {/* Copy Link Box */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-semibold">Liên kết ứng dụng:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 select-all focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition active:scale-95 shadow-md ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã chép!' : 'Chép link'}</span>
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-400 font-medium animate-in fade-in">
              Đã sao chép liên kết vào bộ nhớ tạm! Bạn có thể dán vào Zalo, Messenger hoặc gửi bạn bè.
            </p>
          )}
        </div>

        {/* Social Share Grid */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-300 font-semibold">Chia sẻ nhanh qua mạng xã hội:</label>
          <div className="grid grid-cols-4 gap-2">
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold transition active:scale-95 shadow-md ${s.bg}`}
              >
                {s.icon}
                <span className="text-[11px] text-white">{s.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Native System Share & QR Toggle */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-pink-600/25 active:scale-95 transition"
            title="Mở menu chia sẻ hệ thống trên điện thoại (AirDrop, Bluetooth, v.v.)"
          >
            <Share2 className="w-4 h-4" />
            <span>Chia sẻ hệ thống</span>
          </button>

          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-xs active:scale-95 transition"
            title="Quét mã QR để mở trên điện thoại"
          >
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>{showQR ? 'Đóng mã QR' : 'Mã QR quét app'}</span>
          </button>
        </div>

        {/* QR Code Container */}
        {showQR && (
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-900 shadow-xl animate-in zoom-in-95">
            <p className="text-xs font-bold mb-2 text-center text-slate-800">
              Quét bằng Camera điện thoại để mở ứng dụng:
            </p>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(appUrl)}`}
                alt="QR Code ứng dụng"
                className="w-40 h-40"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Hoạt động mượt mà trên cả iPhone (Safari) và Android (Chrome).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
