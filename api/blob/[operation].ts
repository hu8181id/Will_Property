import { del } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { IncomingMessage, ServerResponse } from "node:http";

type VercelRequest = IncomingMessage & {
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

const allowedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/3gpp",
  "video/3gpp2",
];

function getUrl(req: VercelRequest) {
  const host = typeof req.headers.host === "string" ? req.headers.host : "primedeal-property.vercel.app";
  const protocol = typeof req.headers["x-forwarded-proto"] === "string"
    ? req.headers["x-forwarded-proto"].split(",")[0].trim()
    : "https";
  return new URL(req.url || "/api/blob", `${protocol}://${host}`);
}

function getAdminKey(req: VercelRequest) {
  const headerValue = req.headers["x-admin-key"];
  const fromHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  return fromHeader || getUrl(req).searchParams.get("admin_key") || "";
}

function getOperation(req: VercelRequest) {
  const value = req.query?.operation;
  const fromQuery = Array.isArray(value) ? value[0] : value;
  if (fromQuery) return fromQuery;
  return getUrl(req).pathname.split("/").filter(Boolean).at(-1) || "";
}

function isAllowedMediaPath(pathname: string) {
  return /^properties\/uploads\/(images|videos)\/[a-f0-9-]+\.[a-z0-9]+$/i.test(pathname);
}

async function readJsonBody(req: VercelRequest): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === "string") return JSON.parse(req.body);
    return req.body;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function handleUploadAuthorization(req: VercelRequest, res: ServerResponse) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    sendJson(res, 500, { error: "Konfigurasi Vercel Blob belum lengkap: BLOB_READ_WRITE_TOKEN belum diset di Vercel Dashboard." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await handleUpload({
      body: body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async pathname => {
        if (!process.env.ADMIN_SECRET_KEY || getAdminKey(req) !== process.env.ADMIN_SECRET_KEY) {
          throw new Error("Unauthorized: invalid admin key for blob upload token");
        }
        if (!isAllowedMediaPath(pathname)) throw new Error("Path upload media tidak valid.");
        return { allowedContentTypes, tokenPayload: JSON.stringify({ uploadedAt: Date.now() }) };
      },
      onUploadCompleted: async ({ blob }) => {
        console.info("[Vercel Blob] Upload completed:", blob.url);
      },
    });
    sendJson(res, 200, result);
  } catch (error) {
    console.error("[Vercel Blob token handler]", error);
    sendJson(res, 400, { error: error instanceof Error ? error.message : "Error handling blob upload" });
  }
}

async function handleDelete(req: VercelRequest, res: ServerResponse) {
  if (!process.env.ADMIN_SECRET_KEY || getAdminKey(req) !== process.env.ADMIN_SECRET_KEY) {
    sendJson(res, 403, { error: "Unauthorized: invalid admin key for blob deletion" });
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    sendJson(res, 500, { error: "BLOB_READ_WRITE_TOKEN not configured" });
    return;
  }

  try {
    const body = await readJsonBody(req) as { url?: unknown };
    if (typeof body.url !== "string") {
      sendJson(res, 400, { error: "Missing blob URL" });
      return;
    }
    const url = new URL(body.url);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".blob.vercel-storage.com")) {
      sendJson(res, 400, { error: "URL Vercel Blob tidak valid" });
      return;
    }
    await del(body.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    sendJson(res, 200, { success: true });
  } catch (error) {
    console.error("[Vercel Blob delete handler]", error);
    sendJson(res, 500, { error: error instanceof Error ? error.message : "Error deleting blob" });
  }
}

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const operation = getOperation(req);
  if (operation === "upload-auth") return handleUploadAuthorization(req, res);
  if (operation === "delete") return handleDelete(req, res);

  sendJson(res, 404, { error: "Operasi Blob tidak ditemukan" });
}
