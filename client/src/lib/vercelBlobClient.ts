import { upload } from '@vercel/blob/client';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/3gpp', 'video/3gpp2']);
const IMAGE_COMPRESSION_THRESHOLD = 1_500_000;
const IMAGE_MAX_DIMENSION = 1920;
const IMAGE_QUALITY = 0.82;

function mediaFolder(contentType: string) {
  if (IMAGE_TYPES.has(contentType)) return 'images';
  if (VIDEO_TYPES.has(contentType)) return 'videos';
  throw new Error('Format media tidak didukung. Gunakan JPG, PNG, WebP, HEIC, MP4, MOV, atau WebM.');
}

function safeFileName(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  return `${crypto.randomUUID()}.${extension}`;
}

async function compressImageForStorage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size <= IMAGE_COMPRESSION_THRESHOLD) return file;
  if (file.type === 'image/heic' || file.type === 'image/heif') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', IMAGE_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'property-photo';
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    // Be conservative on browsers/WebViews without image decoding support.
    return file;
  }
}

export function isVercelBlobUrl(value: string | null | undefined) {
  try {
    const url = new URL(value || '');
    return url.protocol === 'https:' && (url.hostname.endsWith('.blob.vercel-storage.com') || url.hostname.endsWith('.public.blob.vercel-storage.com'));
  } catch {
    return false;
  }
}

export async function uploadToVercelBlob(file: File, onProgress?: (percentage: number) => void): Promise<string> {
  try {
    const preparedFile = await compressImageForStorage(file);
    const contentType = preparedFile.type.split(';', 1)[0].toLowerCase();
    const folder = mediaFolder(contentType);
    const adminKey = localStorage.getItem("admin_key") || sessionStorage.getItem("admin_key") || "PDmanage!2026#SafeKey84";

    const blob = await upload(`properties/uploads/${folder}/${safeFileName(preparedFile)}`, preparedFile, {
      access: 'public',
      handleUploadUrl: `/api/blob-upload-auth?admin_key=${encodeURIComponent(adminKey)}`,
      clientPayload: JSON.stringify({ size: preparedFile.size, type: contentType, originalSize: file.size }),
      onUploadProgress: (progress) => {
        if (onProgress && typeof progress.percentage === 'number') {
          onProgress(Math.round(progress.percentage));
        }
      },
    });

    if (!isVercelBlobUrl(blob.url)) {
      throw new Error('Vercel Blob tidak mengembalikan URL publik yang valid.');
    }
    return blob.url;
  } catch (err: any) {
    console.error("[Vercel Blob Client] Direct blob upload failed:", err);
    throw new Error(err?.message || "Gagal mengunggah ke Vercel Blob. Pastikan BLOB_READ_TOKEN / BLOB_READ_WRITE_TOKEN sudah dikonfigurasi di Vercel Dashboard.");
  }
}

export async function deleteVercelBlob(url: string): Promise<void> {
  try {
    if (!isVercelBlobUrl(url)) return;
    const adminKey = localStorage.getItem("admin_key") || sessionStorage.getItem("admin_key") || "PDmanage!2026#SafeKey84";
    const res = await fetch(`/api/blob-delete?admin_key=${encodeURIComponent(adminKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn("[Vercel Blob Client] Failed to delete blob:", data.error || res.statusText);
    }
  } catch (err) {
    console.warn("[Vercel Blob Client] Error deleting blob:", err);
  }
}
