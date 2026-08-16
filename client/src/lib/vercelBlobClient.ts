import { upload } from '@vercel/blob/client';

export async function uploadToVercelBlob(file: File, onProgress?: (percentage: number) => void): Promise<string> {
  try {
    const adminKey = localStorage.getItem("admin_key") || sessionStorage.getItem("admin_key") || "PDmanage!2026#SafeKey84";
    
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: `/api/blob-upload-auth?admin_key=${encodeURIComponent(adminKey)}`,
      clientPayload: JSON.stringify({ size: file.size, type: file.type }),
      onUploadProgress: (progress) => {
        if (onProgress && typeof progress.percentage === 'number') {
          onProgress(Math.round(progress.percentage));
        }
      },
    });

    return blob.url;
  } catch (err: any) {
    console.error("[Vercel Blob Client] Direct blob upload failed:", err);
    throw new Error(err?.message || "Gagal mengunggah ke Vercel Blob. Pastikan BLOB_READ_WRITE_TOKEN sudah dikonfigurasi di Vercel Dashboard -> Settings -> Environment Variables.");
  }
}
