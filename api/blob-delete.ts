import { del } from "@vercel/blob";
import type { IncomingMessage, ServerResponse } from "node:http";

type VercelRequest = IncomingMessage & {
  body?: unknown;
  url?: string;
};

function getUrl(req: VercelRequest) {
  const host = typeof req.headers.host === "string" ? req.headers.host : "primedeal-property.vercel.app";
  const protocol = typeof req.headers["x-forwarded-proto"] === "string"
    ? req.headers["x-forwarded-proto"].split(",")[0].trim()
    : "https";
  return new URL(req.url || "/api/blob-delete", `${protocol}://${host}`);
}

function getAdminKey(req: VercelRequest) {
  const headerValue = req.headers["x-admin-key"];
  const fromHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  return fromHeader || getUrl(req).searchParams.get("admin_key") || "";
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
