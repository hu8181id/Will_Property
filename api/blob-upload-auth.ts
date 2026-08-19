import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { IncomingMessage, ServerResponse } from "node:http";

type VercelRequest = IncomingMessage & {
  body?: unknown;
  rawBody?: unknown;
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
  return new URL(req.url || "/api/blob-upload-auth", `${protocol}://${host}`);
}

function getAdminKey(req: VercelRequest) {
  const headerValue = req.headers["x-admin-key"];
  const fromHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const fromQuery = getUrl(req).searchParams.get("admin_key");
  return fromHeader || fromQuery || "";
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

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

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
        if (!isAllowedMediaPath(pathname)) {
          throw new Error("Path upload media tidak valid.");
        }
        return {
          allowedContentTypes,
          tokenPayload: JSON.stringify({ uploadedAt: Date.now() }),
        };
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
