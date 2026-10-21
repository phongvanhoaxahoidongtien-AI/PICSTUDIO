/**
 * TimeMark Camera & Photo Timestamp Engine
 * Complete templates and geolocation utilities matching TimeMark App
 */
import type { TimeMarkConfig, TimeMarkTemplateId, TimeMarkPosition } from '../types';

export const DEFAULT_TIMEMARK_CONFIG: TimeMarkConfig = {
  enabled: false, // OFF by default - only enabled when user explicitly chooses TimeMark
  templateId: 'attendance',
  position: 'bottom-left',
  showDate: true,
  showTime: true,
  showSeconds: true,
  showLunarDate: false,
  showLocation: true,
  showCoordinates: true,
  showAltitude: true,
  showCompass: true,
  showWeather: true,
  showTemperature: true,
  showProjectName: true,
  showAuthor: true,
  showInspectionBadge: true,
  inspectionStatus: 'ĐẠT CHUẨN',
  locationName: 'Trụ sở chính',
  address: 'Đang cập nhật vị trí...',
  latitude: null,
  longitude: null,
  altitude: 18,
  azimuth: 45, // Northeast
  weather: '☀️ Nắng đẹp',
  temperature: '29°C',
  projectName: 'Công việc / Chấm công',
  author: 'Nhân viên hiện trường',
  scale: 1.0,
  textColor: '#ffffff',
  themeColor: '#f59e0b', // Amber / Gold
  bgOpacity: 0.82,
};

export interface TimeMarkTemplateMeta {
  id: TimeMarkTemplateId;
  name: string;
  nameVi: string;
  description: string;
  badgeText: string;
  accentColor: string;
  previewBg: string;
}

export const TIMEMARK_TEMPLATES: TimeMarkTemplateMeta[] = [
  {
    id: 'attendance',
    name: 'Attendance Standard',
    nameVi: 'Chấm công / Điểm danh',
    description: 'Bản mẫu tiêu chuẩn TimeMark: Giờ lớn vàng gold, ngày tháng, vị trí và tọa độ GPS',
    badgeText: 'CHẤM CÔNG',
    accentColor: '#f59e0b',
    previewBg: 'from-amber-600 to-orange-700',
  },
  {
    id: 'survey',
    name: 'Field Engineering',
    nameVi: 'Khảo sát / Công trình',
    description: 'Đầy đủ tọa độ Kinh độ/Vĩ độ, độ cao mét, hướng la bàn, địa chỉ và mã trạm',
    badgeText: 'KHẢO SÁT HIỆN TRƯỜNG',
    accentColor: '#06b6d4',
    previewBg: 'from-cyan-600 to-blue-700',
  },
  {
    id: 'inspection',
    name: 'Quality Inspection',
    nameVi: 'Kiểm tra an toàn / Tuần tra',
    description: 'Con dấu xác nhận an toàn, người kiểm tra, tình trạng đạt chuẩn và thời điểm ghi nhận',
    badgeText: 'ĐÃ KIỂM TRA',
    accentColor: '#10b981',
    previewBg: 'from-emerald-600 to-teal-800',
  },
  {
    id: 'progress',
    name: 'Work Progress Log',
    nameVi: 'Nhật ký thi công / Tiến độ',
    description: 'Ghi lại tiến độ công việc hàng ngày, thời tiết, nhiệt độ và vị trí công trình',
    badgeText: 'TIẾN ĐỘ THI CÔNG',
    accentColor: '#3b82f6',
    previewBg: 'from-blue-600 to-indigo-800',
  },
  {
    id: 'travel',
    name: 'Travel & Lifestyle',
    nameVi: 'Du lịch & Check-in',
    description: 'Thanh lịch hiện đại, kèm thông tin nhiệt độ thời tiết và thành phố check-in',
    badgeText: 'DU LỊCH',
    accentColor: '#ec4899',
    previewBg: 'from-pink-600 to-rose-700',
  },
  {
    id: 'classic',
    name: 'Classic TimeMark Gold',
    nameVi: 'Cổ điển vàng kim',
    description: 'Chữ vàng viền đen sắc nét đặc trưng của TimeMark, rõ nét trên mọi nền ảnh',
    badgeText: 'TIMEMARK',
    accentColor: '#fbbf24',
    previewBg: 'from-yellow-600 to-amber-800',
  },
  {
    id: 'digital',
    name: 'Digital Retro LED',
    nameVi: 'Đồng hồ số LED Film',
    description: 'Dấu ngày giờ điện tử màu cam neon hoài niệm phong cách máy ảnh film cổ điển',
    badgeText: 'DIGITAL DATE',
    accentColor: '#f97316',
    previewBg: 'from-orange-600 to-rose-700',
  },
  {
    id: 'official',
    name: 'Official Certified Seal',
    nameVi: 'Chứng thực / Pháp lý',
    description: 'Khung xác thực văn bản, dấu thời gian pháp lý và địa chỉ hành chính đầy đủ',
    badgeText: 'XÁC THỰC HIỆN TRƯỜNG',
    accentColor: '#ef4444',
    previewBg: 'from-rose-600 to-red-800',
  },
  {
    id: 'minimal',
    name: 'Minimal Clean Pill',
    nameVi: 'Tối giản hiện đại',
    description: 'Pill kính mờ bo tròn sang trọng, giờ trắng tinh tế và vị trí ngắn gọn',
    badgeText: 'MINIMAL',
    accentColor: '#a855f7',
    previewBg: 'from-purple-600 to-slate-800',
  },
  {
    id: 'weather_pro',
    name: 'Weather & Environment',
    nameVi: 'Thời tiết & Môi trường',
    description: 'Hiển thị chi tiết nhiệt độ, độ ẩm, tình trạng khí tượng và định vị GPS ngoài trời',
    badgeText: 'MÔI TRƯỜNG HIỆN TRƯỜNG',
    accentColor: '#0ea5e9',
    previewBg: 'from-sky-600 to-cyan-800',
  },
];

/**
 * Fetch current device GPS coordinates and reverse geocode to Vietnamese address
 */
export async function fetchCurrentLocation(): Promise<{
  address: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  azimuth?: number | null;
}> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        address: 'Hà Nội, Việt Nam',
        locationName: 'Vị trí hiện tại',
        latitude: 21.0285,
        longitude: 105.8542,
        altitude: 15,
        azimuth: 45,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lon = Number(pos.coords.longitude.toFixed(6));
        const alt = pos.coords.altitude ? Math.round(pos.coords.altitude) : 18;
        const heading = pos.coords.heading ? Math.round(pos.coords.heading) : 45;

        try {
          // Reverse geocoding via OpenStreetMap Nominatim with Vietnamese language
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=vi`,
            {
              headers: {
                'User-Agent': 'TimeMark-Photo-Editor/1.0',
              },
            }
          );
          if (resp.ok) {
            const data = await resp.json();
            const addr = data.address || {};
            const road = addr.road || addr.suburb || '';
            const quarter = addr.quarter || addr.suburb || addr.village || '';
            const district = addr.city_district || addr.district || addr.county || '';
            const city = addr.city || addr.state || 'Việt Nam';

            const parts = [road, quarter, district, city].filter(Boolean);
            const formatted = parts.length > 0 ? parts.join(', ') : data.display_name?.slice(0, 80) || 'Việt Nam';
            const locName = road ? road : district || city || 'Địa điểm hiện tại';

            resolve({
              address: formatted,
              locationName: locName,
              latitude: lat,
              longitude: lon,
              altitude: alt,
              azimuth: heading,
            });
            return;
          }
        } catch {
          // Ignore network failure and return coordinates
        }

        resolve({
          address: `Tọa độ: ${lat > 0 ? `${lat}° B` : `${Math.abs(lat)}° N`}, ${lon > 0 ? `${lon}° Đ` : `${Math.abs(lon)}° T`}`,
          locationName: 'Vị trí GPS',
          latitude: lat,
          longitude: lon,
          altitude: alt,
          azimuth: heading,
        });
      },
      () => {
        resolve({
          address: 'Việt Nam (Cấp quyền vị trí để định vị chính xác)',
          locationName: 'Vị trí GPS',
          latitude: 21.0285,
          longitude: 105.8542,
          altitude: 18,
          azimuth: 45,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Approximate Vietnamese Lunar Date calculation
 */
export function getLunarDateString(d: Date): string {
  // Approximate lunar month calculation based on reference new moons
  const baseSolar = new Date(2024, 1, 10).getTime(); // Feb 10 2024 = 1/1 Giáp Thìn
  const diffDays = Math.floor((d.getTime() - baseSolar) / (1000 * 60 * 60 * 24));
  const synodicMonth = 29.53058867;
  const totalLunarMonths = diffDays / synodicMonth;
  const currentMonthCycle = totalLunarMonths - Math.floor(totalLunarMonths);
  const lunarDay = Math.floor(currentMonthCycle * synodicMonth) + 1;
  const lunarMonth = ((Math.floor(totalLunarMonths) + 1) % 12) + 1;
  return `Âm lịch: ${lunarDay < 10 ? '0' + lunarDay : lunarDay}/${lunarMonth < 10 ? '0' + lunarMonth : lunarMonth}`;
}

/**
 * Format date time string
 */
export function getFormattedDateTime(customDate?: string, customTime?: string, withSeconds = true) {
  const now = new Date();
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  let timeStr = '';
  if (customTime) {
    timeStr = customTime;
  } else {
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    timeStr = withSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  }

  let dateStr = '';
  const dayOfWeek = daysOfWeek[now.getDay()];
  if (customDate) {
    dateStr = customDate;
  } else {
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    dateStr = `${dd}/${mm}/${yyyy}`;
  }

  const lunarStr = getLunarDateString(now);

  return { timeStr, dateStr, dayOfWeek, lunarStr };
}

/**
 * Convert compass degrees into Vietnamese direction string
 */
export function getCompassDirection(deg: number): string {
  const dirs = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return `Hướng ${dirs[index]} (${deg}°)`;
}

/**
 * Calculate coordinates for watermark box based on position setting
 */
function calculateWatermarkPosition(
  pos: TimeMarkPosition,
  boxW: number,
  boxH: number,
  canvasW: number,
  canvasH: number,
  margin: number
) {
  let boxX = margin;
  let boxY = canvasH - boxH - margin;

  if (pos === 'bottom-right') {
    boxX = canvasW - boxW - margin;
    boxY = canvasH - boxH - margin;
  } else if (pos === 'top-left') {
    boxX = margin;
    boxY = margin;
  } else if (pos === 'top-right') {
    boxX = canvasW - boxW - margin;
    boxY = margin;
  } else if (pos === 'bottom-center') {
    boxX = Math.round((canvasW - boxW) / 2);
    boxY = canvasH - boxH - margin;
  }

  return { boxX, boxY };
}

/**
 * Draw TimeMark watermark badge onto target canvas context at proportional scale
 */
export function drawTimeMarkWatermark(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  config: TimeMarkConfig
) {
  if (!config.enabled) return;

  const { timeStr, dateStr, dayOfWeek, lunarStr } = getFormattedDateTime(
    config.customDate,
    config.customTime,
    config.showSeconds
  );

  // Proportional base scale (baseline 1000px width)
  const baseDim = Math.min(canvasW, canvasH);
  const scale = (baseDim / 1000) * (config.scale || 1.0);

  ctx.save();
  ctx.textBaseline = 'top';

  const margin = Math.round(28 * scale);
  const paddingX = Math.round(22 * scale);
  const paddingY = Math.round(18 * scale);
  const bgOpacity = config.bgOpacity ?? 0.82;

  const tpl = config.templateId || 'attendance';

  if (tpl === 'attendance') {
    // 1. TimeMark ATTENDANCE / CHẤM CÔNG TIÊU CHUẨN
    const timeFontSize = Math.round(44 * scale);
    const textFontSize = Math.round(17 * scale);
    const badgeFontSize = Math.round(13 * scale);

    const timeFont = `bold ${timeFontSize}px "SF Pro Display", -apple-system, Roboto, sans-serif`;
    const textFont = `500 ${textFontSize}px "SF Pro Text", -apple-system, Roboto, sans-serif`;
    const badgeFont = `bold ${badgeFontSize}px "SF Pro Text", -apple-system, Roboto, sans-serif`;

    const boxW = Math.min(canvasW - margin * 2, Math.round(490 * scale));
    const boxH = Math.round(215 * scale);

    const { boxX, boxY } = calculateWatermarkPosition(config.position, boxW, boxH, canvasW, canvasH, margin);

    // Glass backdrop with border
    ctx.fillStyle = `rgba(15, 23, 42, ${bgOpacity})`;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16 * scale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    ctx.stroke();

    // Top Category Badge
    const badgeText = config.showProjectName ? config.projectName || 'CHẤM CÔNG' : 'CHẤM CÔNG';
    ctx.font = badgeFont;
    const badgeW = ctx.measureText(badgeText).width + 16 * scale;
    const badgeH = 22 * scale;

    ctx.fillStyle = config.themeColor || '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(boxX + paddingX, boxY + paddingY, badgeW, badgeH, 6 * scale);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillText(badgeText, boxX + paddingX + 8 * scale, boxY + paddingY + 4 * scale);

    // Weather pill if enabled
    if (config.showWeather && config.weather) {
      ctx.font = `bold ${13 * scale}px sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(`${config.weather} ${config.temperature}`, boxX + paddingX + badgeW + 12 * scale, boxY + paddingY + 4 * scale);
    }

    // Big Time Text (Yellow Gold or custom text color with drop shadow)
    ctx.font = timeFont;
    ctx.fillStyle = config.textColor || '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4 * scale;
    ctx.shadowOffsetY = 2 * scale;
    ctx.fillText(timeStr, boxX + paddingX, boxY + paddingY + 30 * scale);
    ctx.shadowColor = 'transparent';

    // Date & Day line (and Lunar date if enabled)
    ctx.font = textFont;
    ctx.fillStyle = '#e2e8f0';
    let dateLine = `${dayOfWeek}, ${dateStr}`;
    if (config.showLunarDate) dateLine += ` (${lunarStr})`;
    ctx.fillText(dateLine, boxX + paddingX, boxY + paddingY + 84 * scale);

    // Location Address
    if (config.showLocation && config.address) {
      ctx.font = `400 ${15 * scale}px "SF Pro Text", -apple-system, sans-serif`;
      ctx.fillStyle = '#cbd5e1';
      let displayAddr = config.address;
      if (displayAddr.length > 52) displayAddr = displayAddr.slice(0, 49) + '...';
      ctx.fillText(`📍 ${displayAddr}`, boxX + paddingX, boxY + paddingY + 114 * scale);
    }

    // GPS Coordinates line
    if (config.showCoordinates && config.latitude && config.longitude) {
      ctx.font = `400 ${13 * scale}px "SF Mono", monospace`;
      ctx.fillStyle = '#94a3b8';
      const latStr = config.latitude.toFixed(5);
      const lonStr = config.longitude.toFixed(5);
      ctx.fillText(`GPS: ${latStr}°N, ${lonStr}°E`, boxX + paddingX, boxY + paddingY + 144 * scale);
    }
  } else if (tpl === 'survey') {
    // 2. KHẢO SÁT HIỆN TRƯỜNG / CÔNG TRÌNH
    const boxW = Math.min(canvasW - margin * 2, Math.round(510 * scale));
    const boxH = Math.round(225 * scale);
    const { boxX, boxY } = calculateWatermarkPosition(config.position, boxW, boxH, canvasW, canvasH, margin);

    ctx.fillStyle = `rgba(10, 25, 47, ${bgOpacity})`;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16 * scale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.stroke();

    // Top Tag
    ctx.font = `bold ${12 * scale}px sans-serif`;
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('📐 KHẢO SÁT KỸ THUẬT HIỆN TRƯỜNG', boxX + paddingX, boxY + paddingY);

    // Time & Date in 1 line
    ctx.font = `bold ${32 * scale}px "SF Pro Display", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(timeStr, boxX + paddingX, boxY + paddingY + 22 * scale);

    ctx.font = `500 ${15 * scale}px sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${dayOfWeek}, ${dateStr}`, boxX + paddingX + 180 * scale, boxY + paddingY + 35 * scale);

    // Project Name
    if (config.showProjectName) {
      ctx.font = `600 ${15 * scale}px sans-serif`;
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`🏗️ Dự án: ${config.projectName || 'Công trình xây dựng'}`, boxX + paddingX, boxY + paddingY + 68 * scale);
    }

    // Address
    if (config.showLocation) {
      ctx.font = `400 ${14 * scale}px sans-serif`;
      ctx.fillStyle = '#e2e8f0';
      let addr = config.address || 'Hiện trường';
      if (addr.length > 50) addr = addr.slice(0, 48) + '...';
      ctx.fillText(`📍 Địa điểm: ${addr}`, boxX + paddingX, boxY + paddingY + 96 * scale);
    }

    // Coordinates & Altitude
    ctx.font = `500 ${13 * scale}px "SF Mono", monospace`;
    ctx.fillStyle = '#06b6d4';
    const latStr = config.latitude ? config.latitude.toFixed(6) : '21.028511';
    const lonStr = config.longitude ? config.longitude.toFixed(6) : '105.854122';
    const altStr = config.altitude ? `${config.altitude}m` : '18m';
    const compStr = getCompassDirection(config.azimuth || 45);
    ctx.fillText(`🌐 Tọa độ: ${latStr}°N, ${lonStr}°E  |  Độ cao: ${altStr}`, boxX + paddingX, boxY + paddingY + 126 * scale);
    ctx.fillText(`🧭 ${compStr}  |  Khảo sát viên: ${config.author || 'Kỹ sư'}`, boxX + paddingX, boxY + paddingY + 152 * scale);
  } else if (tpl === 'inspection') {
    // 3. KIỂM TRA AN TOÀN / TUẦN TRA
    const boxW = Math.min(canvasW - margin * 2, Math.round(480 * scale));
    const boxH = Math.round(200 * scale);
    const { boxX, boxY } = calculateWatermarkPosition(config.position, boxW, boxH, canvasW, canvasH, margin);

    ctx.fillStyle = `rgba(6, 78, 59, ${bgOpacity})`;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16 * scale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.stroke();

    // Inspection badge
    const badgeText = `✓ ${config.inspectionStatus || 'ĐÃ KIỂM TRA ĐẠT CHUẨN'}`;
    ctx.font = `bold ${13 * scale}px sans-serif`;
    const bW = ctx.measureText(badgeText).width + 16 * scale;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(boxX + paddingX, boxY + paddingY, bW, 24 * scale, 6 * scale);
    ctx.fill();

    ctx.fillStyle = '#022c22';
    ctx.fillText(badgeText, boxX + paddingX + 8 * scale, boxY + paddingY + 5 * scale);

    // Big Time
    ctx.font = `bold ${38 * scale}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(timeStr, boxX + paddingX, boxY + paddingY + 34 * scale);

    // Date
    ctx.font = `500 ${15 * scale}px sans-serif`;
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(`${dayOfWeek}, ${dateStr}`, boxX + paddingX, boxY + paddingY + 80 * scale);

    // Location & Inspector
    if (config.showLocation) {
      ctx.font = `400 ${14 * scale}px sans-serif`;
      ctx.fillStyle = '#e2e8f0';
      let addr = config.address || 'Hiện trường';
      if (addr.length > 50) addr = addr.slice(0, 48) + '...';
      ctx.fillText(`📍 ${addr}`, boxX + paddingX, boxY + paddingY + 108 * scale);
    }

    ctx.font = `500 ${13 * scale}px sans-serif`;
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText(`👤 Người kiểm tra: ${config.author || 'Cán bộ giám sát'}  |  Hạng mục: ${config.projectName || 'An toàn lao động'}`, boxX + paddingX, boxY + paddingY + 136 * scale);
  } else if (tpl === 'progress') {
    // 4. NHẬT KÝ THI CÔNG / TIẾN ĐỘ CÔNG VIỆC
    const boxW = Math.min(canvasW - margin * 2, Math.round(500 * scale));
    const boxH = Math.round(210 * scale);
    const { boxX, boxY } = calculateWatermarkPosition(config.position, boxW, boxH, canvasW, canvasH, margin);

    ctx.fillStyle = `rgba(15, 23, 42, ${bgOpacity})`;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16 * scale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.stroke();

    // Top Header
    ctx.font = `bold ${13 * scale}px sans-serif`;
    ctx.fillStyle = '#60a5fa';
    ctx.fillText(`📋 NHẬT KÝ THI CÔNG: ${config.projectName || 'Hạng mục kết cấu'}`, boxX + paddingX, boxY + paddingY);

    // Time & Date
    ctx.font = `bold ${36 * scale}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(timeStr, boxX + paddingX, boxY + paddingY + 26 * scale);

    ctx.font = `500 ${15 * scale}px sans-serif`;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`${dayOfWeek}, ${dateStr}  |  ${config.weather} ${config.temperature}`, boxX + paddingX, boxY + paddingY + 74 * scale);

    if (config.showLocation) {
      ctx.font = `400 ${14 * scale}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      let addr = config.address || 'Hiện trường';
      if (addr.length > 50) addr = addr.slice(0, 48) + '...';
      ctx.fillText(`📍 ${addr}`, boxX + paddingX, boxY + paddingY + 104 * scale);
    }

    if (config.showCoordinates && config.latitude && config.longitude) {
      ctx.font = `400 ${12 * scale}px "SF Mono", monospace`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(`GPS: ${config.latitude.toFixed(5)}°N, ${config.longitude.toFixed(5)}°E  |  CB: ${config.author || 'Chỉ huy trưởng'}`, boxX + paddingX, boxY + paddingY + 132 * scale);
    }
  } else if (tpl === 'travel') {
    // 5. DU LỊCH & CHECK-IN
    const boxW = Math.min(canvasW - margin * 2, Math.round(440 * scale));
    const boxH = Math.round(180 * scale);
    const { boxX, boxY } = calculateWatermarkPosition(config.position, boxW, boxH, canvasW, canvasH, margin);

    ctx.fillStyle = `rgba(15, 23, 42, ${bgOpacity * 0.9})`;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 20 * scale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    ctx.stroke();

    ctx.font = `bold ${34 * scale}px "SF Pro Display", sans-serif`;
    ctx.fillStyle = '#f472b6';
    ctx.fillText(timeStr, boxX + paddingX, boxY + paddingY + 8 * scale);

    ctx.font = `600 ${16 * scale}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${dayOfWeek}, ${dateStr}`, boxX + paddingX, boxY + paddingY + 52 * scale);

    ctx.font = `500 ${15 * scale}px sans-serif`;
    ctx.fillStyle = '#fbcfe8';
    ctx.fillText(`${config.weather} ${config.temperature}  •  Check-in`, boxX + paddingX, boxY + paddingY + 80 * scale);

    if (config.showLocation) {
      ctx.font = `400 ${14 * scale}px sans-serif`;
      ctx.fillStyle = '#cbd5e1';
      let addr = config.locationName || config.address || 'Việt Nam';
      if (addr.length > 40) addr = addr.slice(0, 38) + '...';
      ctx.fillText(`📍 ${addr}`, boxX + paddingX, boxY + paddingY + 110 * scale);
    }
  } else if (tpl === 'classic') {
    // 6. CỔ ĐIỂN VÀNG KIM TIMEMARK (Chữ vàng viền bóng đen nổi bật trên mọi phông nền)
    const timeFontSize = Math.round(48 * scale);
    const textFontSize = Math.round(20 * scale);

    const { boxX, boxY } = calculateWatermarkPosition(config.position, 400 * scale, 160 * scale, canvasW, canvasH, margin);

    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 6 * scale;
    ctx.shadowOffsetY = 3 * scale;

    ctx.font = `bold ${timeFontSize}px "SF Pro Display", Impact, sans-serif`;
    ctx.fillStyle = config.textColor || '#fbbf24'; // Yellow Gold
    ctx.fillText(timeStr, boxX, boxY);

    ctx.font = `bold ${textFontSize}px "SF Pro Text", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${dayOfWeek}, ${dateStr}`, boxX, boxY + 56 * scale);

    if (config.showLocation && config.address) {
      ctx.font = `600 ${16 * scale}px sans-serif`;
      ctx.fillStyle = '#fde68a';
      let addr = config.address;
      if (addr.length > 45) addr = addr.slice(0, 42) + '...';
      ctx.fillText(`📍 ${addr}`, boxX, boxY + 86 * scale);
    }

    if (config.showCoordinates && config.latitude && config.longitude) {
      ctx.font = `500 ${14 * scale}px monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`GPS: ${config.latitude.toFixed(4)}°N, ${config.longitude.toFixed(4)}°E`, boxX, boxY + 114 * scale);
    }
    ctx.shadowColor = 'transparent';
  } else if (tpl === 'digital') {
    // 7. ĐỒNG HỒ SỐ LED FILM RETRO (Cam Neon Digital)
    const { boxX, boxY } = calculateWatermarkPosition(config.position, 380 * scale, 120 * scale, canvasW, canvasH, margin);

    ctx.shadowColor = 'rgba(249, 115, 22, 0.7)';
    ctx.shadowBlur = 8 * scale;

    ctx.font = `bold ${42 * scale}px "Courier New", monospace`;
    ctx.fillStyle = '#f97316'; // Neon Orange
    const dateFormatted = dateStr.replace(/\//g, '.');
    ctx.fillText(`'${dateFormatted.slice(2)} ${timeStr}`, boxX, boxY);

    if (config.showLocation && config.address) {
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.fillStyle = '#fdba74';
      let addr = config.locationName || config.address;
      if (addr.length > 36) addr = addr.slice(0, 34) + '...';
      ctx.fillText(addr.toUpperCase(), boxX, boxY + 48 * scale);
    }
    ctx.shadowColor = 'transparent';
  } else if (tpl === 'official') {
    // 8. CHỨNG THỰC PHÁP LÝ / DẤU MỘC ĐỎ
    const boxW = Math.min(canvasW - margin * 2, Math.round(480 * scale));
    const boxH = Math.round(195 * scale);
    const { boxX, boxY } = calculateWatermarkPosition(config.position, boxW, boxH, canvasW, canvasH, margin);

    ctx.fillStyle = `rgba(15, 23, 42, ${bgOpacity})`;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12 * scale);
    ctx.fill();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = Math.max(2, 2.5 * scale);
    ctx.stroke();

    // Red seal stamp text
    ctx.font = `bold ${14 * scale}px sans-serif`;
    ctx.fillStyle = '#ef4444';
    ctx.fillText('🔴 DẤU THỜI GIAN & VỊ TRÍ XÁC THỰC', boxX + paddingX, boxY + paddingY);

    ctx.font = `bold ${32 * scale}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${timeStr}  •  ${dateStr}`, boxX + paddingX, boxY + paddingY + 24 * scale);

    if (config.showLocation) {
      ctx.font = `400 ${14 * scale}px sans-serif`;
      ctx.fillStyle = '#e2e8f0';
      let addr = config.address || 'Hiện trường';
      if (addr.length > 50) addr = addr.slice(0, 48) + '...';
      ctx.fillText(`📍 Vị trí: ${addr}`, boxX + paddingX, boxY + paddingY + 68 * scale);
    }

    if (config.showCoordinates && config.latitude && config.longitude) {
      ctx.font = `400 ${13 * scale}px monospace`;
      ctx.fillStyle = '#fca5a5';
      ctx.fillText(`Tọa độ GPS: ${config.latitude.toFixed(6)}°N, ${config.longitude.toFixed(6)}°E`, boxX + paddingX, boxY + paddingY + 96 * scale);
    }

    ctx.font = `400 ${12 * scale}px sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Chứng thực bởi: ${config.author || 'Hệ thống TimeMark'} | Mã: TM-${Date.now().toString().slice(-6)}`, boxX + paddingX, boxY + paddingY + 124 * scale);
  } else if (tpl === 'minimal') {
    // 9. TỐI GIẢN HIỆN ĐẠI (Pill Kính Mờ)
    const boxW = Math.min(canvasW - margin * 2, Math.round(360 * scale));
    const boxH = Math.round(110 * scale);
    const { boxX, boxY } = calculateWatermarkPosition(config.position, boxW, boxH, canvasW, canvasH, margin);

    ctx.fillStyle = `rgba(15, 23, 42, ${bgOpacity * 0.95})`;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 24 * scale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    ctx.stroke();

    ctx.font = `bold ${32 * scale}px "SF Pro Display", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(timeStr, boxX + paddingX, boxY + paddingY);

    ctx.font = `500 ${14 * scale}px sans-serif`;
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`${dayOfWeek}, ${dateStr}`, boxX + paddingX + 140 * scale, boxY + paddingY + 14 * scale);

    if (config.showLocation) {
      ctx.font = `400 ${13 * scale}px sans-serif`;
      ctx.fillStyle = '#cbd5e1';
      let addr = config.locationName || config.address;
      if (addr.length > 36) addr = addr.slice(0, 34) + '...';
      ctx.fillText(`📍 ${addr}`, boxX + paddingX, boxY + paddingY + 44 * scale);
    }
  } else if (tpl === 'weather_pro') {
    // 10. THỜI TIẾT & MÔI TRƯỜNG CHUYÊN NGHIỆP
    const boxW = Math.min(canvasW - margin * 2, Math.round(480 * scale));
    const boxH = Math.round(195 * scale);
    const { boxX, boxY } = calculateWatermarkPosition(config.position, boxW, boxH, canvasW, canvasH, margin);

    ctx.fillStyle = `rgba(8, 47, 73, ${bgOpacity})`;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16 * scale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.stroke();

    ctx.font = `bold ${13 * scale}px sans-serif`;
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🌤️ BÁO CÁO THỜI TIẾT & MÔI TRƯỜNG HIỆN TRƯỜNG', boxX + paddingX, boxY + paddingY);

    ctx.font = `bold ${36 * scale}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${timeStr}  ${config.temperature}`, boxX + paddingX, boxY + paddingY + 24 * scale);

    ctx.font = `500 ${15 * scale}px sans-serif`;
    ctx.fillStyle = '#bae6fd';
    ctx.fillText(`${dayOfWeek}, ${dateStr}  |  ${config.weather}`, boxX + paddingX, boxY + paddingY + 70 * scale);

    if (config.showLocation) {
      ctx.font = `400 ${14 * scale}px sans-serif`;
      ctx.fillStyle = '#e0f2fe';
      let addr = config.address || 'Hiện trường';
      if (addr.length > 48) addr = addr.slice(0, 45) + '...';
      ctx.fillText(`📍 ${addr}`, boxX + paddingX, boxY + paddingY + 98 * scale);
    }

    ctx.font = `500 ${13 * scale}px "SF Mono", monospace`;
    ctx.fillStyle = '#7dd3fc';
    const altStr = config.altitude ? `${config.altitude}m` : '18m';
    ctx.fillText(`Độ cao: ${altStr}  |  Ghi nhận: ${config.author || 'Chuyên viên quan trắc'}`, boxX + paddingX, boxY + paddingY + 126 * scale);
  }

  ctx.restore();
}
