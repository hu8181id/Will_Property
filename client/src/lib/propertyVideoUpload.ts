import { COOKIE_NAME } from "@shared/const";

export const PROPERTY_VIDEO_CONTENT_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/3gpp",
  "video/3gpp2",
] as const;
export const MAX_PROPERTY_VIDEO_BYTES = 50 * 1024 * 1024;

type UploadResponse = {
  sessionId?: string;
  chunkBytes?: number;
  totalChunks?: number;
  url?: string;
  error?: string;
};

export type PropertyVideoUploadProgress = (percent: number) => void;

const extensionToContentType: Record<string, (typeof PROPERTY_VIDEO_CONTENT_TYPES)[number]> = {
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  webm: "video/webm",
  mov: "video/quicktime",
  qt: "video/quicktime",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
};

export function normalizePropertyVideoContentType(contentType?: string, fileName?: string) {
  const normalized = contentType?.split(";", 1)[0]?.trim().toLowerCase();
  if (normalized && (PROPERTY_VIDEO_CONTENT_TYPES as readonly string[]).includes(normalized)) {
    return normalized as (typeof PROPERTY_VIDEO_CONTENT_TYPES)[number];
  }
  if (!normalized || normalized === "application/octet-stream") {
    const extension = fileName?.split(".").pop()?.trim().toLowerCase();
    return extension ? extensionToContentType[extension] : undefined;
  }
  return undefined;
}

function getResponseMessage(payload: UploadResponse | null, fallback: string) {
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

function getEmergencyAdminKey() {
  if (typeof window === "undefined") return undefined;
  try {
    const paramsKey = new URLSearchParams(window.location.search).get("admin_key");
    if (paramsKey?.trim()) {
      localStorage.setItem("manus-admin-key", paramsKey.trim());
      return paramsKey.trim();
    }
    const stored = localStorage.getItem("manus-admin-key");
    return stored?.trim() || undefined;
  } catch {
    return undefined;
  }
}

function requestHeaders(contentType?: string) {
  const authorization = getSessionAuthorizationHeader();
  const emergencyAdminKey = getEmergencyAdminKey();
  return {
    ...(contentType ? { "Content-Type": contentType } : {}),
    ...(authorization ? { Authorization: authorization } : {}),
    ...(emergencyAdminKey ? { "x-admin-key": emergencyAdminKey } : {}),
  };
}

async function readPayload(response: Response) {
  return response.json().catch(() => null) as Promise<UploadResponse | null>;
}

export async function uploadPropertyVideo(file: File, onProgress?: PropertyVideoUploadProgress) {
  const contentType = normalizePropertyVideoContentType(file.type, file.name);
  if (!contentType) {
    throw new Error("Video harus berformat MP4, WebM, MOV, M4V, atau 3GP.");
  }
  if (file.size <= 0) throw new Error("File video kosong atau tidak dapat dibaca.");
  if (file.size > MAX_PROPERTY_VIDEO_BYTES) throw new Error("Ukuran video maksimal 50 MB.");

  const sessionResponse = await fetch("/api/property-video-upload-sessions", {
    method: "POST",
    credentials: "include",
    headers: requestHeaders("application/json"),
    body: JSON.stringify({ contentType, fileName: file.name, size: file.size }),
  });
  const sessionPayload = await readPayload(sessionResponse);
  if (!sessionResponse.ok || !sessionPayload?.sessionId || !sessionPayload.chunkBytes || !sessionPayload.totalChunks) {
    throw new Error(getResponseMessage(sessionPayload, "Gagal menyiapkan unggah video. Silakan coba lagi."));
  }

  onProgress?.(0);

  for (let index = 0; index < sessionPayload.totalChunks; index += 1) {
    const start = index * sessionPayload.chunkBytes;
    const end = Math.min(file.size, start + sessionPayload.chunkBytes);
    const chunkResponse = await fetch(`/api/property-video-upload-sessions/${sessionPayload.sessionId}/chunks/${index}`, {
      method: "POST",
      credentials: "include",
      headers: requestHeaders(contentType),
      body: file.slice(start, end, contentType),
    });
    const chunkPayload = await readPayload(chunkResponse);
    if (!chunkResponse.ok) {
      throw new Error(getResponseMessage(chunkPayload, "Gagal mengunggah bagian video. Silakan coba lagi."));
    }
    onProgress?.(Math.round(((index + 1) / sessionPayload.totalChunks) * 100));
  }

  const completeResponse = await fetch(`/api/property-video-upload-sessions/${sessionPayload.sessionId}/complete`, {
    method: "POST",
    credentials: "include",
    headers: requestHeaders("application/json"),
    body: "{}",
  });
  const completePayload = await readPayload(completeResponse);
  if (!completeResponse.ok || !completePayload?.url) {
    throw new Error(getResponseMessage(completePayload, "Gagal menyelesaikan unggah video. Silakan coba lagi."));
  }
  return completePayload.url;
}
