import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div className="fixed bottom-24 right-4 z-40 pointer-events-none flex flex-col gap-2 items-end">
      {!isOnline ? (
        <div className="flex items-center gap-2 rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-lg border border-amber-400/40 animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Chế độ Ngoại tuyến (Offline 100%)</span>
        </div>
      ) : (
        <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-emerald-400 border border-emerald-500/20 shadow-md">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Xử lý cục bộ bảo mật 100%</span>
        </div>
      )}
    </div>
  );
};
