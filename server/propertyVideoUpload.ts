import express, { type Express } from "express";
import {
  createPropertyVideoUploadSession,
  getPropertyVideoUploadSession,
  savePropertyVideoChunkKey,
  setPropertyVideoUploadCompletedUrl,
} from "./db";
import { sdk } from "./_core/sdk";
import { storageGetSignedUrl, storagePut } from "./storage";

export const PROPERTY_VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;
export const MAX_PROPERTY_VIDEO_BYTES = 50 * 1024 * 1024;
export const PROPERTY_VIDEO_CHUNK_BYTES = 1024 * 1024;

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

  return { ok: true as const, contentType: normalizedContentType as (typeof PROPERTY_VIDEO_CONTENT_TYPES)[number] };
}

function safeVideoLabel(value: string | undefined) {
  if (!value) return "video";
  const withoutExtension = value.replace(/\.[^.]+$/, "");
  const label = withoutExtension.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return label.slice(0, 80) || "video";
}

async function getAdminUser(req: express.Request) {
  try {
    const user = await sdk.authenticateRequest(req);
    return user?.role === "admin" ? user : null;
  } catch {
    return null;
  }
}

function createVideoStorageKey(contentType: (typeof PROPERTY_VIDEO_CONTENT_TYPES)[number], fileName: string | undefined) {
  return `properties/videos/${Date.now()}-${safeVideoLabel(fileName)}.${extensionByContentType[contentType]}`;
}

function chunkStorageKey(sessionId: string, chunkIndex: number) {
  return `properties/video-upload-parts/${sessionId}/${chunkIndex}.part`;
}

function isValidSessionId(value: string) {
  return /^[a-f0-9-]{36}$/i.test(value);
}

async function requireAdmin(req: express.Request, res: express.Response) {
  if (await getAdminUser(req)) return true;
  res.status(403).json({ error: "Hanya admin yang dapat mengunggah video properti." });
  return false;
}

export function registerPropertyVideoUploadRoute(app: Express, options: { maxBytes?: number; chunkBytes?: number } = {}) {
  const maxBytes = options.maxBytes ?? MAX_PROPERTY_VIDEO_BYTES;
  const chunkBytes = options.chunkBytes ?? PROPERTY_VIDEO_CHUNK_BYTES;

  app.post("/api/property-video-upload-sessions", express.json({ limit: "16kb" }), async (req, res) => {
    try {
      if (!await requireAdmin(req, res)) return;
      const input = req.body as { contentType?: string; fileName?: string; size?: unknown } | undefined;
      const validation = validatePropertyVideoUpload(input?.contentType, Number(input?.size), maxBytes);
      if (!validation.ok) {
        res.status(validation.status).json({ error: validation.message });
        return;
      }

      const sessionId = crypto.randomUUID();
      const totalChunks = Math.ceil(Number(input?.size) / chunkBytes);
      await createPropertyVideoUploadSession({
        id: sessionId,
        fileName: input?.fileName?.slice(0, 255) || "video",
        contentType: validation.contentType,
        totalBytes: Number(input?.size),
        totalChunks,
      });

      res.status(201).json({ sessionId, chunkBytes, totalChunks });
    } catch (error) {
      console.error("[Property Video Chunk Session]", error);
      res.status(500).json({ error: "Gagal menyiapkan unggah video. Periksa koneksi lalu coba lagi." });
    }
  });

  app.post(
    "/api/property-video-upload-sessions/:sessionId/chunks/:chunkIndex",
    express.raw({ type: [...PROPERTY_VIDEO_CONTENT_TYPES], limit: `${Math.ceil(chunkBytes / 1024 / 1024) + 1}mb` }),
    async (req, res) => {
      try {
        if (!await requireAdmin(req, res)) return;
        const { sessionId, chunkIndex: chunkIndexValue } = req.params;
        const chunkIndex = Number(chunkIndexValue);
        if (!isValidSessionId(sessionId) || !Number.isInteger(chunkIndex) || chunkIndex < 0) {
          res.status(400).json({ error: "Sesi atau nomor bagian video tidak valid." });
          return;
        }

        const session = await getPropertyVideoUploadSession(sessionId);
        if (!session) {
          res.status(404).json({ error: "Sesi unggah video tidak ditemukan. Pilih ulang video lalu coba lagi." });
          return;
        }
        if (session.completedUrl) {
          res.status(409).json({ error: "Unggah video ini sudah selesai." });
          return;
        }
        if (chunkIndex >= session.totalChunks) {
          res.status(400).json({ error: "Nomor bagian video di luar batas." });
          return;
        }

        const validation = validatePropertyVideoUpload(req.headers["content-type"], session.totalBytes, maxBytes);
        if (!validation.ok || validation.contentType !== session.contentType) {
          res.status(415).json({ error: "Format bagian video tidak cocok dengan file yang dipilih." });
          return;
        }

        const body = Buffer.isBuffer(req.body) ? req.body : undefined;
        const expectedBytes = Math.min(chunkBytes, session.totalBytes - chunkIndex * chunkBytes);
        if (!body || body.byteLength !== expectedBytes) {
          res.status(400).json({ error: "Ukuran bagian video tidak sesuai. Silakan pilih ulang video." });
          return;
        }

        const uploaded = await storagePut(chunkStorageKey(sessionId, chunkIndex), body, "application/octet-stream");
        await savePropertyVideoChunkKey(sessionId, chunkIndex, uploaded.key);
        res.status(201).json({ success: true, chunkIndex });
      } catch (error) {
        console.error("[Property Video Chunk Upload]", error);
        res.status(500).json({ error: "Gagal mengunggah bagian video. Periksa koneksi lalu coba lagi." });
      }
    },
  );

  app.post("/api/property-video-upload-sessions/:sessionId/complete", express.json({ limit: "4kb" }), async (req, res) => {
    try {
      if (!await requireAdmin(req, res)) return;
      const { sessionId } = req.params;
      if (!isValidSessionId(sessionId)) {
        res.status(400).json({ error: "Sesi unggah video tidak valid." });
        return;
      }

      const session = await getPropertyVideoUploadSession(sessionId);
      if (!session) {
        res.status(404).json({ error: "Sesi unggah video tidak ditemukan. Pilih ulang video lalu coba lagi." });
        return;
      }
      if (session.completedUrl) {
        res.status(200).json({ success: true, url: session.completedUrl });
        return;
      }

      const orderedChunkKeys = Array.from({ length: session.totalChunks }, (_, index) => session.chunkKeys?.[String(index)]);
      if (orderedChunkKeys.some((key) => !key)) {
        res.status(409).json({ error: "Belum semua bagian video terunggah. Periksa koneksi lalu coba lagi." });
        return;
      }

      const chunks: Buffer[] = [];
      for (const key of orderedChunkKeys) {
        const signedUrl = await storageGetSignedUrl(key!);
        const chunkResponse = await fetch(signedUrl);
        if (!chunkResponse.ok) throw new Error(`Bagian video tidak dapat dibaca (${chunkResponse.status}).`);
        chunks.push(Buffer.from(await chunkResponse.arrayBuffer()));
      }
      const videoBuffer = Buffer.concat(chunks);
      if (videoBuffer.byteLength !== session.totalBytes) {
        res.status(409).json({ error: "Ukuran video hasil unggah tidak sesuai. Pilih ulang video lalu coba lagi." });
        return;
      }

      const uploaded = await storagePut(createVideoStorageKey(session.contentType as (typeof PROPERTY_VIDEO_CONTENT_TYPES)[number], session.fileName), videoBuffer, session.contentType);
      await setPropertyVideoUploadCompletedUrl(sessionId, uploaded.url);
      res.status(201).json({ success: true, url: uploaded.url });
    } catch (error) {
      console.error("[Property Video Chunk Complete]", error);
      res.status(500).json({ error: "Gagal menyelesaikan unggah video. Periksa koneksi lalu coba lagi." });
    }
  });
}
