/**
 * Utility for compressing and resizing images on the client side before saving.
 * Prevents localStorage QuotaExceededError and optimizes page performance.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1080,
  maxHeight: 1080,
  quality: 0.82,
  mimeType: 'image/jpeg',
};

/**
 * Resizes and compresses an image File or Blob down to safe web dimensions.
 * Reduces 5MB-15MB phone camera photos down to ~70KB-120KB.
 */
export async function compressImage(
  fileOrBlob: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // If not in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;

      const img = new Image();
      img.onerror = () => {
        // Only allow SVG passthrough; reject unreadable formats (e.g. unsupported HEIC/corrupt files)
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/svg')) {
          resolve(dataUrl);
          return;
        }
        reject(new Error('Formato de imagem não suportado. Tente uma foto JPG, PNG ou WEBP.'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;
          const maxW = opts.maxWidth || 1080;
          const maxH = opts.maxHeight || 1080;

          // Calculate scaled dimensions keeping aspect ratio
          if (width > maxW || height > maxH) {
            const ratio = Math.min(maxW / width, maxH / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // White background for transparent PNGs converted to JPEG
          if (opts.mimeType === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL(opts.mimeType || 'image/jpeg', opts.quality || 0.82);
          resolve(compressed);
        } catch (canvasErr) {
          console.warn('Canvas compression failed, falling back to original dataUrl:', canvasErr);
          resolve(dataUrl);
        }
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(fileOrBlob);
  });
}
