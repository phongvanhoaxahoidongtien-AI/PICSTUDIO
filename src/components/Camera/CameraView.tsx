import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  RotateCw,
  Zap,
  ZapOff,
  Grid,
  Clock,
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  Layers,
  AlertCircle,
  Scan,
  Calendar,
  BookmarkCheck,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { BeautyLiveControls, type LiveBeautySettings } from './BeautyLiveControls';
import { detectFaces } from '../../utils/faceDetection';
import { applyAdjustments, DEFAULT_ADJUSTMENTS } from '../../utils/imageProcessing';
import { DEFAULT_BEAUTY_SETTINGS } from '../../utils/beautyProcessing';
import { FILTER_PRESETS } from '../../utils/filters';
import {
  applySnowFilter,
  drawSnowArSticker,
  drawSnowTimestamp,
} from '../../utils/snowCameraEffects';
import { saveProject } from '../../services/db';
import type { DetectedFace, ProjectData } from '../../types';

interface CameraViewProps {
  onCapture: (dataUrl: string, width: number, height: number, beautySettings?: LiveBeautySettings) => void;
  onClose: () => void;
  onOpenGallery: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCapture,
  onClose,
  onOpenGallery,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera Settings
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isGridOn, setIsGridOn] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<0 | 3 | 5 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Camera Shooting Mode: 'native' (Default - Pure sharp native camera) vs 'beauty' (Filters/Beauty)
  const [cameraShootingMode, setCameraShootingMode] = useState<'native' | 'beauty'>('native');

  // Auto-Save to Gallery toggle (Default: ON)
  const [autoSaveToGallery, setAutoSaveToGallery] = useState(true);
  const [autoSaveToast, setAutoSaveToast] = useState<string | null>(null);

  // Aspect ratio options
  const [aspectRatio, setAspectRatio] = useState<'3:4' | '9:16' | '1:1'>('3:4');
  const [isTimestampOn, setIsTimestampOn] = useState(false); // Default false for pure photo

  // Live Beauty & Filter state
  const [liveBeauty, setLiveBeauty] = useState<LiveBeautySettings>({
    smooth: 0,
    whiten: 0,
    glow: 0,
    slimFace: 0,
    filterId: 'normal',
    snowFilter: 'none',
    arEffect: 'none',
    presetId: 'natural',
  });
  const [isBeautyControlsOpen, setIsBeautyControlsOpen] = useState(false);

  // Face Detection Box
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const lastDetectTimeRef = useRef<number>(0);

  // Play shutter sound
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // AudioContext unavailable
    }
  }, []);

  // Initialize camera stream at maximum hardware resolution
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setCameraError(null);

    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập Camera trực tiếp.');
      }

      let stream: MediaStream;
      try {
        // Request full native hardware resolution (4K / 1080p full sensor)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 3840, min: 1280 },
            height: { ideal: 2160, min: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback for devices restricting min resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
          },
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check for torch capability on mobile back camera
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.() as Record<string, unknown> | undefined;
        setHasTorch(Boolean(capabilities?.torch));
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Camera access error:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Không thể mở Camera. Vui lòng cấp quyền truy cập Camera trong cài đặt trình duyệt.';
      setCameraError(msg);
      setIsLoading(false);
    }
  }, [facingMode]);

  // Restart camera when facing mode changes
  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !isTorchOn } as unknown as MediaTrackConstraintSet],
        });
        setIsTorchOn(!isTorchOn);
      } catch (e) {
        console.error('Torch error:', e);
      }
    }
  };

  // Flip front/back camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setIsTorchOn(false);
  };

  // Cycle aspect ratio: 3:4 -> 9:16 -> 1:1 -> 3:4
  const toggleAspectRatio = () => {
    setAspectRatio((prev) => (prev === '3:4' ? '9:16' : prev === '9:16' ? '1:1' : '3:4'));
  };

  // Save photo automatically into persistent In-App Gallery (IndexedDB) and Device Downloads/Photos
  const autoSaveCapturedPhoto = async (dataUrl: string, width: number, height: number) => {
    try {
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date().toLocaleDateString('vi-VN');
      const name = `Ảnh chụp ${dateStr} ${timeStr}`;
      const id = 'cam_' + Date.now();

      const project: ProjectData = {
        id,
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        thumbnail: dataUrl,
        width,
        height,
        backgroundColor: '#000000',
        layers: [
          {
            id: 'layer_' + Date.now(),
            name,
            type: 'image',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'source-over',
            src: dataUrl,
            originalWidth: width,
            originalHeight: height,
            x: 0,
            y: 0,
            width,
            height,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            adjustments: { ...DEFAULT_ADJUSTMENTS },
            beauty: { ...DEFAULT_BEAUTY_SETTINGS },
            filterId: 'normal',
            filterIntensity: 100,
          },
        ],
      };

      // 1. Save to persistent in-app album (IndexedDB)
      await saveProject(project);

      // 2. Trigger browser download file
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const filename = `lumix_${Date.now()}.jpg`;

      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setAutoSaveToast('Đã chụp & tự động lưu vào Bộ sưu tập ảnh!');
      setTimeout(() => setAutoSaveToast(null), 3500);
    } catch (err) {
      console.error('Auto save error:', err);
    }
  };

  // Render camera frames with dynamic aspect ratio and optional effects
  useEffect(() => {
    let animId: number;

    const renderFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const vW = video.videoWidth;
        const vH = video.videoHeight;

        if (vW > 0 && vH > 0) {
          // Calculate aspect ratio crop rectangle
          let sx = 0, sy = 0, sWidth = vW, sHeight = vH;
          let targetW = vW, targetH = vH;

          if (aspectRatio === '1:1') {
            const minDim = Math.min(vW, vH);
            sx = Math.round((vW - minDim) / 2);
            sy = Math.round((vH - minDim) / 2);
            sWidth = minDim;
            sHeight = minDim;
            targetW = minDim;
            targetH = minDim;
          } else if (aspectRatio === '3:4') {
            const targetRatio = 3 / 4;
            if (vW / vH > targetRatio) {
              sWidth = Math.round(vH * targetRatio);
              sHeight = vH;
              sx = Math.round((vW - sWidth) / 2);
              sy = 0;
            } else {
              sWidth = vW;
              sHeight = Math.round(vW / targetRatio);
              sx = 0;
              sy = Math.round((vH - sHeight) / 2);
            }
            targetW = sWidth;
            targetH = sHeight;
          } else if (aspectRatio === '9:16') {
            const targetRatio = 9 / 16;
            if (vW / vH > targetRatio) {
              sWidth = Math.round(vH * targetRatio);
              sHeight = vH;
              sx = Math.round((vW - sWidth) / 2);
              sy = 0;
            } else {
              sWidth = vW;
              sHeight = Math.round(vW / targetRatio);
              sx = 0;
              sy = Math.round((vH - sHeight) / 2);
            }
            targetW = sWidth;
            targetH = sHeight;
          }

          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.save();

            // Mirror front camera for natural selfie view
            if (facingMode === 'user') {
              ctx.translate(targetW, 0);
              ctx.scale(-1, 1);
            }

            // Draw cropped base video frame
            ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
            ctx.restore();

            // Only apply beauty passes and overlays when in 'beauty' mode
            if (cameraShootingMode === 'beauty') {
              // 1. Live beauty pass (Whitening + Soft Glow + Live Skin Smooth)
              if (liveBeauty.whiten > 0 || liveBeauty.glow > 0 || liveBeauty.smooth > 0) {
                ctx.save();
                if (liveBeauty.whiten > 0 || liveBeauty.glow > 0) {
                  const whitenAlpha = (liveBeauty.whiten / 100) * 0.22;
                  const glowAlpha = (liveBeauty.glow / 100) * 0.18;
                  ctx.globalCompositeOperation = 'screen';
                  ctx.fillStyle = `rgba(255, 245, 248, ${(whitenAlpha + glowAlpha).toFixed(2)})`;
                  ctx.fillRect(0, 0, targetW, targetH);
                }

                if (liveBeauty.smooth > 0) {
                  const smoothAlpha = (liveBeauty.smooth / 100) * 0.35;
                  ctx.globalCompositeOperation = 'soft-light';
                  ctx.globalAlpha = smoothAlpha;
                  ctx.filter = `blur(${Math.max(2, Math.round(targetW / 360))}px)`;
                  ctx.drawImage(canvas, 0, 0);
                }
                ctx.restore();
              }

              // 2. Live Color Filters
              if (liveBeauty.snowFilter && liveBeauty.snowFilter !== 'none') {
                applySnowFilter(ctx, targetW, targetH, liveBeauty.snowFilter);
              }

              // 3. Generic Filters Preset
              if (liveBeauty.filterId !== 'normal') {
                const preset = FILTER_PRESETS.find((f) => f.id === liveBeauty.filterId);
                if (preset) {
                  applyAdjustments(ctx, targetW, targetH, {
                    brightness: preset.adjustments.brightness || 0,
                    contrast: preset.adjustments.contrast || 0,
                    saturation: preset.adjustments.saturation || 0,
                    exposure: preset.adjustments.exposure || 0,
                    highlights: preset.adjustments.highlights || 0,
                    shadows: preset.adjustments.shadows || 0,
                    temperature: preset.adjustments.temperature || 0,
                    tint: preset.adjustments.tint || 0,
                    sharpness: 0,
                    vignette: preset.adjustments.vignette || 0,
                    clarity: 0,
                    blackPoint: 0,
                    gamma: 1.0,
                    whitePoint: 255,
                  }, 0.85);
                }
              }

              // 4. Live AR Face Stickers
              if (liveBeauty.arEffect && liveBeauty.arEffect !== 'none') {
                drawSnowArSticker(ctx, targetW, targetH, liveBeauty.arEffect, detectedFaces[0]);
              }

              // 5. Date/Timestamp Watermark
              if (isTimestampOn) {
                drawSnowTimestamp(ctx, targetW, targetH);
              }
            }

            // Periodic Face Detection (every 280ms)
            const now = Date.now();
            if (now - lastDetectTimeRef.current > 280) {
              lastDetectTimeRef.current = now;
              detectFaces(canvas, targetW, targetH)
                .then((faces) => setDetectedFaces(faces))
                .catch(() => {});
            }
          }
        }
      }

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [facingMode, liveBeauty, aspectRatio, isTimestampOn, detectedFaces, cameraShootingMode]);

  // Capture Trigger with Timer and Sound
  const triggerCapture = () => {
    if (countdown !== null) return;

    if (timerSeconds > 0) {
      setCountdown(timerSeconds);
      let remaining = timerSeconds;

      const timerId = setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
          setCountdown(remaining);
        } else {
          clearInterval(timerId);
          setCountdown(null);
          executeSnapshot();
        }
      }, 1000);
    } else {
      executeSnapshot();
    }
  };

  // Perform snapshot at 100% full hardware sensor resolution
  const executeSnapshot = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
      onCapture(dataUrl, canvas.width, canvas.height, cameraShootingMode === 'native' ? undefined : liveBeauty);
      return;
    }

    // Haptic feedback & shutter sound
    if ('vibrate' in navigator) {
      navigator.vibrate?.([60]);
    }
    playShutterSound();

    // Shutter flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const vW = video.videoWidth;
    const vH = video.videoHeight;

    let sx = 0, sy = 0, sWidth = vW, sHeight = vH;
    if (aspectRatio === '1:1') {
      const minDim = Math.min(vW, vH);
      sx = Math.round((vW - minDim) / 2);
      sy = Math.round((vH - minDim) / 2);
      sWidth = minDim;
      sHeight = minDim;
    } else if (aspectRatio === '3:4') {
      const targetRatio = 3 / 4;
      if (vW / vH > targetRatio) {
        sWidth = Math.round(vH * targetRatio);
        sHeight = vH;
        sx = Math.round((vW - sWidth) / 2);
        sy = 0;
      } else {
        sWidth = vW;
        sHeight = Math.round(vW / targetRatio);
        sx = 0;
        sy = Math.round((vH - sHeight) / 2);
      }
    } else if (aspectRatio === '9:16') {
      const targetRatio = 9 / 16;
      if (vW / vH > targetRatio) {
        sWidth = Math.round(vH * targetRatio);
        sHeight = vH;
        sx = Math.round((vW - sWidth) / 2);
        sy = 0;
      } else {
        sWidth = vW;
        sHeight = Math.round(vW / targetRatio);
        sx = 0;
        sy = Math.round((vH - sHeight) / 2);
      }
    }

    // Dedicated high-resolution offscreen canvas at full hardware sensor resolution
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = sWidth;
    snapCanvas.height = sHeight;
    const snapCtx = snapCanvas.getContext('2d');
    if (!snapCtx) return;

    snapCtx.imageSmoothingEnabled = true;
    snapCtx.imageSmoothingQuality = 'high';
    snapCtx.save();

    if (facingMode === 'user') {
      snapCtx.translate(sWidth, 0);
      snapCtx.scale(-1, 1);
    }
    snapCtx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
    snapCtx.restore();

    if (cameraShootingMode === 'beauty') {
      if (liveBeauty.snowFilter && liveBeauty.snowFilter !== 'none') {
        applySnowFilter(snapCtx, sWidth, sHeight, liveBeauty.snowFilter);
      }
      if (isTimestampOn) {
        drawSnowTimestamp(snapCtx, sWidth, sHeight);
      }
    }

    const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.98);

    if (autoSaveToGallery) {
      autoSaveCapturedPhoto(dataUrl, sWidth, sHeight);
    }

    onCapture(dataUrl, sWidth, sHeight, cameraShootingMode === 'native' ? undefined : liveBeauty);
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-black z-50 flex flex-col justify-between select-none overflow-hidden font-sans">
      {/* Hidden Video Feed Source */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className="hidden"
      />

      {/* Screen Shutter Flash Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-200" />
      )}

      {/* Auto-Save Toast Notification */}
      {autoSaveToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-500/95 text-white font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{autoSaveToast}</span>
        </div>
      )}

      {/* Top Floating Controls Bar */}
      <div
        style={{
          paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))',
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
        }}
        className="relative z-30 px-3 sm:px-4 pb-2 flex flex-col gap-2 bg-gradient-to-b from-black/90 via-black/50 to-transparent"
      >
        <div className="flex items-center justify-between">
          {/* Back to Editor */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 active:scale-95 transition"
            title="Quay lại trình chỉnh sửa"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Center Mode Switcher: Ảnh gốc sắc nét vs Làm đẹp */}
          <div className="flex items-center bg-black/60 rounded-full p-0.5 border border-white/20 backdrop-blur-md">
            <button
              onClick={() => {
                setCameraShootingMode('native');
                setIsBeautyControlsOpen(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition active:scale-95 ${
                cameraShootingMode === 'native'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Ảnh gốc sắc nét
            </button>
            <button
              onClick={() => {
                setCameraShootingMode('beauty');
                setIsBeautyControlsOpen(true);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition active:scale-95 ${
                cameraShootingMode === 'beauty'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Làm đẹp
            </button>
          </div>

          {/* Flip Camera */}
          <button
            onClick={handleFlipCamera}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 active:scale-95 transition"
            title="Đổi camera trước / sau"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-bar: Auto-Save Toggle, Aspect Ratio, Flash, Grid, Timer */}
        <div className="flex items-center justify-between overflow-x-auto py-0.5 scrollbar-none">
          {/* Auto-Save to Gallery Toggle */}
          <button
            onClick={() => setAutoSaveToGallery((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition active:scale-95 border ${
              autoSaveToGallery
                ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-md shadow-emerald-600/20'
                : 'bg-black/60 border-white/20 text-slate-400 hover:text-white'
            }`}
            title="Bật/Tắt tự động lưu ảnh vào Bộ sưu tập khi chụp"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Tự lưu BST: {autoSaveToGallery ? 'BẬT' : 'TẮT'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Aspect Ratio Toggle (3:4, 9:16, 1:1) */}
            <button
              onClick={toggleAspectRatio}
              className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-bold hover:bg-black/80 active:scale-95 transition"
              title="Đổi tỉ lệ khung hình (3:4, 9:16, 1:1)"
            >
              {aspectRatio}
            </button>

            {/* Date/Timestamp Toggle */}
            <button
              onClick={() => setIsTimestampOn((t) => !t)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md border text-xs font-semibold transition active:scale-95 ${
                isTimestampOn
                  ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                  : 'bg-black/60 border-white/20 text-slate-300 hover:text-white'
              }`}
              title="Dấu ngày giờ trên ảnh"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>

            {/* Torch / Flash */}
            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`p-1.5 rounded-full backdrop-blur-md border transition active:scale-95 ${
                  isTorchOn
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                    : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
                }`}
                title="Bật/Tắt đèn Flash"
              >
                {isTorchOn ? <Zap className="w-3.5 h-3.5 fill-current" /> : <ZapOff className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Grid Overlay Toggle */}
            <button
              onClick={() => setIsGridOn((g) => !g)}
              className={`p-1.5 rounded-full backdrop-blur-md border transition active:scale-95 ${
                isGridOn
                  ? 'bg-pink-600 border-pink-400 text-white'
                  : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
              }`}
              title="Bật/Tắt lưới 3x3"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            {/* Timer Countdown Toggle */}
            <button
              onClick={() =>
                setTimerSeconds((t) => (t === 0 ? 3 : t === 3 ? 5 : t === 5 ? 10 : 0))
              }
              className={`flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md border text-xs font-semibold transition active:scale-95 ${
                timerSeconds > 0
                  ? 'bg-pink-600 border-pink-400 text-white'
                  : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
              }`}
              title="Hẹn giờ chụp ảnh"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timerSeconds === 0 ? '0s' : `${timerSeconds}s`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport & Canvas */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black">
        {cameraError ? (
          <div className="p-6 max-w-sm mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl text-center text-white space-y-3 z-30">
            <div className="p-3 w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold">Không thể mở Camera</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={startCamera}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Thử lại Camera
              </button>
              <button
                onClick={onOpenGallery}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                Chọn ảnh từ máy
              </button>
              <button
                onClick={onClose}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Quay lại Trình sửa ảnh
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Live Camera Canvas with dynamic aspect ratio */}
            <canvas
              ref={canvasRef}
              className={`max-h-full max-w-full block shadow-2xl transition-all duration-300 ${
                aspectRatio === '1:1'
                  ? 'aspect-square object-contain'
                  : aspectRatio === '9:16'
                  ? 'aspect-[9/16] object-contain'
                  : 'aspect-[3/4] object-contain'
              }`}
            />

            {/* Grid 3x3 Overlay */}
            {isGridOn && (
              <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div />
              </div>
            )}

            {/* Face Autofocus Reticle Box */}
            {detectedFaces.map((face, index) => {
              const canvas = canvasRef.current;
              if (!canvas || canvas.width === 0 || canvas.height === 0) return null;

              const leftPct = (face.x / canvas.width) * 100;
              const topPct = (face.y / canvas.height) * 100;
              const widthPct = (face.width / canvas.width) * 100;
              const heightPct = (face.height / canvas.height) * 100;

              return (
                <div
                  key={index}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                  }}
                  className="absolute pointer-events-none z-20 transition-all duration-150 ease-out"
                >
                  <div className="w-full h-full border border-pink-400/80 rounded-2xl relative shadow-lg shadow-pink-500/25">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-pink-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-pink-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-pink-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-pink-400" />
                  </div>
                </div>
              );
            })}

            {/* Big Countdown Number Display */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-xs">
                <span className="text-8xl sm:text-9xl font-black text-white drop-shadow-2xl animate-ping duration-1000">
                  {countdown}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Camera Controls & Shutter */}
      <div
        style={{
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
        }}
        className="relative z-30 px-4 pt-2 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col items-center"
      >
        {/* Floating Live Beauty & Filters Toolbar (When in beauty mode) */}
        {cameraShootingMode === 'beauty' && (
          <BeautyLiveControls
            settings={liveBeauty}
            onChange={(updates) => setLiveBeauty((prev) => ({ ...prev, ...updates }))}
            isOpen={isBeautyControlsOpen}
            onToggleOpen={() => setIsBeautyControlsOpen((o) => !o)}
          />
        )}

        {/* Shutter row */}
        <div className="w-full max-w-md flex items-center justify-between px-4 sm:px-8 mt-1">
          {/* Gallery Button */}
          <button
            onClick={onOpenGallery}
            className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 transition active:scale-95"
            title="Chọn ảnh từ thiết bị"
          >
            <ImageIcon className="w-6 h-6 text-indigo-400" />
            <span className="text-[10px] font-medium text-slate-300">Thư viện</span>
          </button>

          {/* Big Shutter Button */}
          <button
            onClick={triggerCapture}
            disabled={isLoading || Boolean(cameraError)}
            className="group relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 border-4 border-white/80 hover:border-white transition active:scale-90 flex items-center justify-center shadow-2xl shadow-indigo-600/40"
            title="Chụp ảnh gốc sắc nét"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 group-hover:scale-95 transition flex items-center justify-center shadow-inner">
              <Camera className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </button>

          {/* Switch to Editor Button */}
          <button
            onClick={onClose}
            className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 transition active:scale-95"
            title="Chuyển sang Chỉnh sửa ảnh"
          >
            <Layers className="w-6 h-6 text-pink-400" />
            <span className="text-[10px] font-medium text-slate-300">Sửa ảnh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
