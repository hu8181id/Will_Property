import { COOKIE_NAME } from "@shared/const";

export const PROPERTY_VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;
export const MAX_PROPERTY_VIDEO_BYTES = 50 * 1024 * 1024;

type UploadResponse = {
  sessionId?: string;
  chunkBytes?: number;
  totalChunks?: number;
  url?: string;
  error?: string;
};

export type PropertyVideoUploadProgress = (percent: number) => void;

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

function requestHeaders(contentType?: string) {
  const authorization = getSessionAuthorizationHeader();
  return {
    ...(contentType ? { "Content-Type": contentType } : {}),
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

async function readPayload(response: Response) {
  return response.json().catch(() => null) as Promise<UploadResponse | null>;
}

export async function uploadPropertyVideo(file: File, onProgress?: PropertyVideoUploadProgress) {
  if (!(PROPERTY_VIDEO_CONTENT_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("Video harus berformat MP4, WebM, atau MOV.");
  }
  if (file.size <= 0) throw new Error("File video kosong atau tidak dapat dibaca.");
  if (file.size > MAX_PROPERTY_VIDEO_BYTES) throw new Error("Ukuran video maksimal 50 MB.");

  const sessionResponse = await fetch("/api/property-video-upload-sessions", {
    method: "POST",
    credentials: "include",
    headers: requestHeaders("application/json"),
    body: JSON.stringify({ contentType: file.type, fileName: file.name, size: file.size }),
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
      headers: requestHeaders(file.type),
      body: file.slice(start, end, file.type),
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
