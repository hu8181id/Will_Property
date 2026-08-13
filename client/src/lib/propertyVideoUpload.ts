import { COOKIE_NAME } from "@shared/const";

export const PROPERTY_VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;
export const MAX_PROPERTY_VIDEO_BYTES = 50 * 1024 * 1024;

type PropertyVideoUploadResponse = {
  url?: string;
  uploadUrl?: string;
  error?: string;
};

function getResponseMessage(payload: PropertyVideoUploadResponse | null, fallback: string) {
  return payload?.error?.trim() || fallback;
}

function getSessionAuthorizationHeader() {
  try {
    const raw = sessionStorage.getItem("manus-cookie");
    if (!raw) return undefined;

    const prefix = `${COOKIE_NAME}=`;
    const pair = raw.split(";").find((item) => item.trim().startsWith(prefix));
    const token = pair?.trim().slice(prefix.length);
    return token ? `Bearer ${token}` : undefined;
  } catch {
    return undefined;
  }
}

export async function uploadPropertyVideo(file: File) {
  if (!(PROPERTY_VIDEO_CONTENT_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("Video harus berformat MP4, WebM, atau MOV.");
  }

  if (file.size <= 0) {
    throw new Error("File video kosong atau tidak dapat dibaca.");
  }

  if (file.size > MAX_PROPERTY_VIDEO_BYTES) {
    throw new Error("Ukuran video maksimal 50 MB.");
  }

  const authorization = getSessionAuthorizationHeader();
  const response = await fetch("/api/property-video-upload-ticket", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body: JSON.stringify({ contentType: file.type, fileName: file.name, size: file.size }),
  });

  const payload = await response.json().catch(() => null) as PropertyVideoUploadResponse | null;
  if (!response.ok || !payload?.url || !payload.uploadUrl) {
    throw new Error(getResponseMessage(payload, "Gagal mengunggah video. Silakan coba lagi."));
  }

  const uploadResponse = await fetch(payload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error("Gagal mengunggah video ke penyimpanan. Periksa koneksi lalu coba lagi.");
  }

  return payload.url;
}
