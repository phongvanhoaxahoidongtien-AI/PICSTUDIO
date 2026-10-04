/**
 * Cross-platform Gallery & iOS Camera Roll Saving Utility
 * Works seamlessly on iOS Safari/WebKit, Android Chrome, and Desktop.
 */

export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

export interface SaveResult {
  success: boolean;
  method: 'web_share' | 'file_picker' | 'download' | 'ios_manual_save';
  message: string;
}

/**
 * Saves an image Blob/File directly to device Photos / Camera Roll
 */
export async function saveImageToGallery(
  blob: Blob,
  filename: string,
  title = 'Ảnh của bạn'
): Promise<SaveResult> {
  const ios = isIOS();
  // Ensure MIME type is JPEG or PNG for iOS WebKit compatibility
  const mimeType = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const cleanExt = mimeType === 'image/png' ? 'png' : 'jpg';
  const cleanFilename = filename.endsWith(`.${cleanExt}`) ? filename : `${filename}.${cleanExt}`;
  const file = new File([blob], cleanFilename, { type: mimeType });

  // 1. Try Native Web Share API (Primary method for iOS & Android Photos app integration)
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: title,
        text: 'Lưu vào Bộ sưu tập ảnh (Photos / Camera Roll)',
      });
      return {
        success: true,
        method: 'web_share',
        message: 'Đã mở hộp thoại lưu ảnh! Chọn "Lưu hình ảnh" để lưu vào Bộ sưu tập.',
      };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return { success: false, method: 'web_share', message: 'Đã hủy lưu ảnh.' };
      }
      console.warn('Web Share failed, attempting fallback:', err);
    }
  }

  // 2. iOS fallback: When Web Share is cancelled or restricted in iframe
  if (ios) {
    return {
      success: true,
      method: 'ios_manual_save',
      message: 'Chạm giữ ảnh 1 giây và chọn "Lưu vào Ảnh" để lưu vào Cuộn camera của iPhone/iPad.',
    };
  }

  // 3. Android & Desktop fallback: Trigger direct browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  return {
    success: true,
    method: 'download',
    message: 'Đã tải ảnh về thiết bị thành công!',
  };
}
