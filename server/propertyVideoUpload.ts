import express, { type Express } from "express";
import { sdk } from "./_core/sdk";
import { storagePut } from "./storage";

export const PROPERTY_VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;
export const MAX_PROPERTY_VIDEO_BYTES = 50 * 1024 * 1024;

const extensionByContentType: Record<(typeof PROPERTY_VIDEO_CONTENT_TYPES)[number], string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export function validatePropertyVideoUpload(contentType: string | undefined, byteLength: number, maxBytes = MAX_PROPERTY_VIDEO_BYTES) {
  const normalizedContentType = contentType?.split(";", 1)[0]?.trim().toLowerCase();
  if (!normalizedContentType || !PROPERTY_VIDEO_CONTENT_TYPES.includes(normalizedContentType as (typeof PROPERTY_VIDEO_CONTENT_TYPES)[number])) {
    return { ok: false as const, status: 415, message: "Format video harus MP4, WebM, atau MOV." };
  }

  if (!Number.isFinite(byteLength) || byteLength <= 0) {
    return { ok: false as const, status: 400, message: "File video kosong atau tidak dapat dibaca." };
  }

  if (byteLength > maxBytes) {
    return { ok: false as const, status: 413, message: "Ukuran video maksimal 50 MB." };
  }

  return {
    ok: true as const,
    contentType: normalizedContentType as (typeof PROPERTY_VIDEO_CONTENT_TYPES)[number],
  };
}

function safeVideoLabel(value: string | undefined) {
  if (!value) return "video";
  try {
    const decoded = decodeURIComponent(value);
    const withoutExtension = decoded.replace(/\.[^.]+$/, "");
    const label = withoutExtension.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
    return label.slice(0, 80) || "video";
  } catch {
    return "video";
  }
}

export function registerPropertyVideoUploadRoute(app: Express, options: { maxBytes?: number } = {}) {
  const maxBytes = options.maxBytes ?? MAX_PROPERTY_VIDEO_BYTES;
  app.post(
    "/api/property-video-upload",
    express.raw({ type: [...PROPERTY_VIDEO_CONTENT_TYPES], limit: "55mb" }),
    async (req, res) => {
      try {
        let user = null;
        try {
          user = await sdk.authenticateRequest(req);
        } catch {
          user = null;
        }
        if (!user || user.role !== "admin") {
          res.status(403).json({ error: "Hanya admin yang dapat mengunggah video properti." });
          return;
        }

        const validation = validatePropertyVideoUpload(
          req.headers["content-type"],
          Buffer.isBuffer(req.body) ? req.body.byteLength : 0,
          maxBytes,
        );
        if (!validation.ok) {
          res.status(validation.status).json({ error: validation.message });
          return;
        }

        const uploaded = await storagePut(
          `properties/videos/${Date.now()}-${safeVideoLabel(req.header("x-primedeal-file-name"))}.${extensionByContentType[validation.contentType]}`,
          req.body,
          validation.contentType,
        );

        res.status(201).json({ success: true, url: uploaded.url });
      } catch (error) {
        console.error("[Property Video Binary Upload]", error);
        res.status(500).json({ error: "Gagal mengunggah video. Periksa koneksi lalu coba lagi." });
      }
    },
  );
}
