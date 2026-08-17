export const PROPERTY_VIDEO_CONTENT_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/3gpp",
  "video/3gpp2",
] as const;
export const MAX_PROPERTY_VIDEO_BYTES = 50 * 1024 * 1024;
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

export async function uploadPropertyVideo(file: File, onProgress?: PropertyVideoUploadProgress) {
  const contentType = normalizePropertyVideoContentType(file.type, file.name);
  if (!contentType) throw new Error("Video harus berformat MP4, WebM, MOV, M4V, atau 3GP.");
  if (file.size <= 0) throw new Error("File video kosong atau tidak dapat dibaca.");
  if (file.size > MAX_PROPERTY_VIDEO_BYTES) throw new Error("Ukuran video maksimal 50 MB.");

  const { uploadToVercelBlob } = await import("./vercelBlobClient");
  const canonicalFile = file.type === contentType ? file : new File([file], file.name, { type: contentType });
  const blobUrl = await uploadToVercelBlob(canonicalFile, (percent) => onProgress?.(Math.max(1, percent)));
  onProgress?.(100);
  return blobUrl;
}
