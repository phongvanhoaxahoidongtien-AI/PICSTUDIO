import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Compass,
  Calendar,
  CloudSun,
  FileCheck,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Navigation,
  Sliders,
  Building,
  User,
  ShieldCheck,
  Palette,
  Eye,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import {
  TIMEMARK_TEMPLATES,
  fetchCurrentLocation,
  drawTimeMarkWatermark,
  type TimeMarkTemplateMeta,
} from '../../utils/timemark';
import type { TimeMarkTemplateId, TimeMarkPosition, ImageLayer } from '../../types';

export const TimeMarkPanel: React.FC = () => {
  const {
    timeMarkConfig,
    setTimeMarkConfig,
    setActiveTool,
    layers,
    activeLayerId,
    updateLayer,
    pushHistory,
    canvasWidth,
    canvasHeight,
  } = useEditorStore();

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'location' | 'settings'>('templates');

  const activeLayer = (layers.find((l) => l.id === activeLayerId) || layers.find((l) => l.type === 'image')) as ImageLayer | undefined;

  // Auto-fetch GPS location on first mount if address is default or empty
  useEffect(() => {
    // Ensure enabled is true while panel is active
    setTimeMarkConfig({ enabled: true });

    if (
      !timeMarkConfig.address ||
      timeMarkConfig.address === 'Đang cập nhật vị trí...' ||
      timeMarkConfig.latitude === null
    ) {
      handleGetLocation();
    }
  }, []);

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const loc = await fetchCurrentLocation();
      setTimeMarkConfig({
        address: loc.address,
        locationName: loc.locationName,
        latitude: loc.latitude,
        longitude: loc.longitude,
        altitude: loc.altitude,
        azimuth: loc.azimuth ?? 45,
      });
    } catch (e) {
      console.error('Fetch location error:', e);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Burn TimeMark watermark directly into base photo at 100% full real native resolution (NO LAYERS!)
  const handleApplyToPhoto = async () => {
    if (!activeLayer) return;

    const img = new Image();
    if (!activeLayer.src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      const naturalW = img.naturalWidth || activeLayer.originalWidth || activeLayer.width;
      const naturalH = img.naturalHeight || activeLayer.originalHeight || activeLayer.height;

      const canvas = document.createElement('canvas');
      canvas.width = naturalW;
      canvas.height = naturalH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, naturalW, naturalH);

      // Draw TimeMark watermark directly onto base photo canvas
      drawTimeMarkWatermark(ctx, naturalW, naturalH, timeMarkConfig);

      pushHistory();
      const isPng = activeLayer.src.startsWith('data:image/png') || (activeLayer.name && activeLayer.name.endsWith('.png'));
      const newSrc = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.98);

      updateLayer(activeLayer.id, {
        src: newSrc,
        originalWidth: naturalW,
        originalHeight: naturalH,
      });

      // Turn off overlay preview and exit to default viewing mode
      setTimeMarkConfig({ enabled: false });
      setActiveTool('none');

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lumix:fit-to-screen'));
      }, 40);
    };
    img.src = activeLayer.src;
  };

  const positions: { id: TimeMarkPosition; label: string }[] = [
    { id: 'bottom-left', label: 'Góc trái dưới' },
    { id: 'bottom-right', label: 'Góc phải dưới' },
    { id: 'bottom-center', label: 'Ở giữa dưới' },
    { id: 'top-left', label: 'Góc trái trên' },
    { id: 'top-right', label: 'Góc phải trên' },
  ];

  const colorThemes = [
    { label: 'Vàng Gold', color: '#f59e0b' },
    { label: 'Cam Neon', color: '#f97316' },
    { label: 'Xanh Cyan', color: '#06b6d4' },
    { label: 'Xanh Ngọc', color: '#10b981' },
    { label: 'Xanh Dương', color: '#3b82f6' },
    { label: 'Đỏ Chứng Thực', color: '#ef4444' },
    { label: 'Tím Hiện Đại', color: '#a855f7' },
    { label: 'Trắng Tinh Khôi', color: '#ffffff' },
  ];

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 shrink-0 max-h-[42dvh] sm:max-h-[46dvh] overflow-y-auto select-none backdrop-blur-md font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Dấu TimeMark (Thời gian & Vị trí)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                10 Mẫu
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Đầy đủ các bản mẫu chuẩn TimeMark chuyên nghiệp</p>
          </div>
        </div>

        {/* Action Buttons: Cancel & Apply */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTimeMarkConfig({ enabled: false });
              setActiveTool('none');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Đóng bảng TimeMark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl mb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-1.5 rounded-lg transition active:scale-95 ${
            activeTab === 'templates'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Bản mẫu ({TIMEMARK_TEMPLATES.length})
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`flex-1 py-1.5 rounded-lg transition active:scale-95 ${
            activeTab === 'location'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Vị trí & GPS
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-1.5 rounded-lg transition active:scale-95 ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tùy chỉnh & Kiểu
        </button>
      </div>

      {/* Tab 1: Templates Carousel */}
      {activeTab === 'templates' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {TIMEMARK_TEMPLATES.map((tpl) => {
              const isSelected = timeMarkConfig.templateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() =>
                    setTimeMarkConfig({
                      templateId: tpl.id,
                      enabled: true,
                      themeColor: tpl.accentColor,
                    })
                  }
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition active:scale-95 ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/40 shadow-lg'
                      : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-750 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      style={{ backgroundColor: tpl.accentColor }}
                      className="px-2 py-0.5 rounded text-[10px] font-black text-slate-950 uppercase"
                    >
                      {tpl.badgeText}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">{tpl.nameVi}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Location & Geolocation */}
      {activeTab === 'location' && (
        <div className="space-y-2.5 text-xs">
          {/* Quick Refresh GPS button */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-semibold text-white block">Tọa độ GPS thiết bị</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {timeMarkConfig.latitude && timeMarkConfig.longitude
                    ? `${timeMarkConfig.latitude.toFixed(5)}°N, ${timeMarkConfig.longitude.toFixed(5)}°E (${timeMarkConfig.altitude || 18}m)`
                    : 'Chưa có tọa độ'}
                </span>
              </div>
            </div>
            <button
              onClick={handleGetLocation}
              disabled={isLoadingLocation}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition active:scale-95 disabled:opacity-50"
            >
              {isLoadingLocation ? 'Đang dò GPS...' : 'Lấy vị trí'}
            </button>
          </div>

          {/* Editable Address */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Địa chỉ hiển thị trên ảnh (cho phép sửa tùy ý):</span>
            </label>
            <textarea
              rows={2}
              value={timeMarkConfig.address}
              onChange={(e) => setTimeMarkConfig({ address: e.target.value })}
              placeholder="Nhập địa chỉ hoặc vị trí công trình..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Location Name & Project Name */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                <Building className="w-3 h-3 text-indigo-400" />
                <span>Tên địa điểm / Tòa nhà:</span>
              </label>
              <input
                type="text"
                value={timeMarkConfig.locationName}
                onChange={(e) => setTimeMarkConfig({ locationName: e.target.value })}
                placeholder="VD: Trụ sở / Tòa nhà A"
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-emerald-400" />
                <span>Dự án / Hạng mục:</span>
              </label>
              <input
                type="text"
                value={timeMarkConfig.projectName}
                onChange={(e) => setTimeMarkConfig({ projectName: e.target.value })}
                placeholder="VD: Thi công / Chấm công"
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Author / Inspector & Inspection Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                <User className="w-3 h-3 text-pink-400" />
                <span>Người kiểm tra / Cán bộ:</span>
              </label>
              <input
                type="text"
                value={timeMarkConfig.author}
                onChange={(e) => setTimeMarkConfig({ author: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Trạng thái kiểm tra:</span>
              </label>
              <input
                type="text"
                value={timeMarkConfig.inspectionStatus || 'ĐẠT CHUẨN'}
                onChange={(e) => setTimeMarkConfig({ inspectionStatus: e.target.value })}
                placeholder="VD: ĐẠT CHUẨN"
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Weather & Temp */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                <CloudSun className="w-3 h-3 text-amber-400" />
                <span>Thời tiết:</span>
              </label>
              <input
                type="text"
                value={timeMarkConfig.weather}
                onChange={(e) => setTimeMarkConfig({ weather: e.target.value })}
                placeholder="VD: ☀️ Nắng đẹp"
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium">Nhiệt độ:</label>
              <input
                type="text"
                value={timeMarkConfig.temperature}
                onChange={(e) => setTimeMarkConfig({ temperature: e.target.value })}
                placeholder="VD: 29°C"
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Settings & Positions & Scale */}
      {activeTab === 'settings' && (
        <div className="space-y-3 text-xs">
          {/* Watermark Position Selector (All 5 options) */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-300 font-medium">Vị trí hiển thị trên ảnh:</span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {positions.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => setTimeMarkConfig({ position: pos.id })}
                  className={`py-1.5 px-2 rounded-xl border text-center transition active:scale-95 ${
                    timeMarkConfig.position === pos.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
              <Palette className="w-3 h-3 text-amber-400" />
              <span>Màu sắc chủ đề TimeMark:</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {colorThemes.map((c) => (
                <button
                  key={c.color}
                  onClick={() => setTimeMarkConfig({ themeColor: c.color })}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition active:scale-95 whitespace-nowrap ${
                    timeMarkConfig.themeColor === c.color
                      ? 'border-amber-400 bg-slate-800 text-white font-bold'
                      : 'border-slate-700 bg-slate-850 text-slate-300 hover:text-white'
                  }`}
                >
                  <span
                    style={{ backgroundColor: c.color }}
                    className="w-3 h-3 rounded-full border border-white/40"
                  />
                  <span className="text-[11px]">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <input
                type="checkbox"
                checked={timeMarkConfig.showSeconds}
                onChange={(e) => setTimeMarkConfig({ showSeconds: e.target.checked })}
                className="accent-amber-500 rounded"
              />
              <span className="text-slate-300 font-medium">Hiện giây (00:00:00)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <input
                type="checkbox"
                checked={timeMarkConfig.showLunarDate}
                onChange={(e) => setTimeMarkConfig({ showLunarDate: e.target.checked })}
                className="accent-amber-500 rounded"
              />
              <span className="text-slate-300 font-medium">Hiện Âm lịch</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <input
                type="checkbox"
                checked={timeMarkConfig.showWeather}
                onChange={(e) => setTimeMarkConfig({ showWeather: e.target.checked })}
                className="accent-amber-500 rounded"
              />
              <span className="text-slate-300 font-medium">Thời tiết & Độ C</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <input
                type="checkbox"
                checked={timeMarkConfig.showCoordinates}
                onChange={(e) => setTimeMarkConfig({ showCoordinates: e.target.checked })}
                className="accent-amber-500 rounded"
              />
              <span className="text-slate-300 font-medium">Tọa độ GPS Kinh/Vĩ</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <input
                type="checkbox"
                checked={timeMarkConfig.showLocation}
                onChange={(e) => setTimeMarkConfig({ showLocation: e.target.checked })}
                className="accent-amber-500 rounded"
              />
              <span className="text-slate-300 font-medium">Địa chỉ chi tiết</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <input
                type="checkbox"
                checked={timeMarkConfig.showProjectName}
                onChange={(e) => setTimeMarkConfig({ showProjectName: e.target.checked })}
                className="accent-amber-500 rounded"
              />
              <span className="text-slate-300 font-medium">Tên dự án / Công việc</span>
            </label>
          </div>

          {/* Scale Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Tỷ lệ kích thước con dấu:</span>
              <span className="font-mono text-amber-400 font-bold">
                {Math.round((timeMarkConfig.scale || 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.5"
              step="0.05"
              value={timeMarkConfig.scale || 1.0}
              onChange={(e) => setTimeMarkConfig({ scale: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Background Opacity Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Độ đậm nền kính mờ:</span>
              <span className="font-mono text-amber-400 font-bold">
                {Math.round((timeMarkConfig.bgOpacity ?? 0.82) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.98"
              step="0.02"
              value={timeMarkConfig.bgOpacity ?? 0.82}
              onChange={(e) => setTimeMarkConfig({ bgOpacity: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Burn Directly to Photo Action Bar (No layers used!) */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={handleApplyToPhoto}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/25 transition active:scale-95"
          title="Đóng dấu TimeMark cố định vào ảnh gốc độ nét 100%"
        >
          <Check className="w-4 h-4" />
          <span>Đóng dấu lên ảnh (Lưu vào ảnh gốc)</span>
        </button>

        <button
          onClick={() => {
            setTimeMarkConfig({ enabled: false });
            setActiveTool('none');
          }}
          className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition active:scale-95"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};
