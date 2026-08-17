import { upload } from '@vercel/blob/client';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/3gpp', 'video/3gpp2']);

function mediaFolder(contentType: string) {
  if (IMAGE_TYPES.has(contentType)) return 'images';
  if (VIDEO_TYPES.has(contentType)) return 'videos';
  throw new Error('Format media tidak didukung. Gunakan JPG, PNG, WebP, HEIC, MP4, MOV, atau WebM.');
}

function safeFileName(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  return `${crypto.randomUUID()}.${extension}`;
}

function getAdminKey() {
  const key = localStorage.getItem('admin_key')
    || sessionStorage.getItem('admin_key')
    || new URLSearchParams(window.location.search).get('admin_key');
  if (!key) {
    throw new Error('Kunci admin tidak ditemukan. Buka kembali halaman admin menggunakan URL admin_key yang valid.');
  }
  return key;
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
    const contentType = file.type.split(';', 1)[0].toLowerCase();
    const folder = mediaFolder(contentType);
    const adminKey = getAdminKey();
    const blob = await upload(`properties/uploads/${folder}/${safeFileName(file)}`, file, {
      access: 'public',
      handleUploadUrl: `/api/blob-upload-auth?admin_key=${encodeURIComponent(adminKey)}`,
      clientPayload: JSON.stringify({ size: file.size, type: contentType }),
      onUploadProgress: (progress) => {
        if (onProgress && typeof progress.percentage === 'number') onProgress(Math.round(progress.percentage));
      },
    });
    if (!isVercelBlobUrl(blob.url)) throw new Error('Vercel Blob tidak mengembalikan URL publik yang valid.');
    return blob.url;
  } catch (error: any) {
    console.error('[Vercel Blob Client] Direct blob upload failed:', error);
    throw new Error(error?.message || 'Gagal mengunggah ke Vercel Blob. Pastikan BLOB_READ_WRITE_TOKEN sudah dikonfigurasi di Vercel Dashboard.');
  }
}

export async function deleteVercelBlob(url: string): Promise<void> {
  try {
    if (!isVercelBlobUrl(url)) return;
    const adminKey = getAdminKey();
    const response = await fetch(`/api/blob-delete?admin_key=${encodeURIComponent(adminKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.warn('[Vercel Blob Client] Failed to delete blob:', data.error || response.statusText);
    }
  } catch (error) {
    console.warn('[Vercel Blob Client] Error deleting blob:', error);
  }
}
