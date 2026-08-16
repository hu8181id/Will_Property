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
    throw new Error(err?.message || "Gagal mengunggah ke Vercel Blob. Pastikan BLOB_READ_TOKEN / BLOB_READ_WRITE_TOKEN sudah dikonfigurasi di Vercel Dashboard.");
  }
}

export async function deleteVercelBlob(url: string): Promise<void> {
  try {
    if (!url || !url.startsWith("http")) return;
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
