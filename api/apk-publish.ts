import { put } from "@vercel/blob";
import { put } from "@vercel/blob";
import type { IncomingMessage, ServerResponse } from "node:http";

type VercelRequest = IncomingMessage & {
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

type ApkPublishPayload = {
  app?: unknown;
  versionCode?: unknown;
  versionName?: unknown;
  apkBase64?: unknown;
};

const MAX_APK_BYTES = 4_000_000;
const APK_TARGETS = {
  admin: { prefix: "apps/primedeal/admin/", filename: "primedeal-admin" },
  public: { prefix: "apps/primedeal/public/", filename: "primedeal-public" },
} as const;

function getUrl(req: VercelRequest) {
  const host = typeof req.headers.host === "string" ? req.headers.host : "primedeal-property.vercel.app";
  const protocol = typeof req.headers["x-forwarded-proto"] === "string"
    ? req.headers["x-forwarded-proto"].split(",")[0].trim()
    : "https";
  return new URL(req.url || "/api/apk-publish", `${protocol}://${host}`);
}

function getAdminKey(req: VercelRequest) {
  const headerValue = req.headers["x-admin-key"];
  const fromHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  return fromHeader || getUrl(req).searchParams.get("admin_key") || "";
}

function getExpectedAdminKey() {
  return process.env.ADMIN_SECRET_KEY || "PDmanage!2026#SafeKey84";
}

async function readJsonBody(req: VercelRequest): Promise<ApkPublishPayload> {
  if (req.body !== undefined) {
    if (typeof req.body === "string") return JSON.parse(req.body) as ApkPublishPayload;
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString("utf8")) as ApkPublishPayload;
    return req.body as ApkPublishPayload;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? (JSON.parse(raw) as ApkPublishPayload) : {};
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store, max-age=0");
  res.end(JSON.stringify(payload));
}

function decodeApk(value: unknown) {
  if (typeof value !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) {
    throw new Error("Data APK tidak valid.");
  }
  const bytes = Buffer.from(value, "base64");
  const looksLikeZip = bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  if (!looksLikeZip || bytes.length > MAX_APK_BYTES) throw new Error("Berkas APK tidak valid atau melebihi batas publikasi.");
  return bytes;
}

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (getAdminKey(req) !== getExpectedAdminKey()) {
    sendJson(res, 403, { error: "Unauthorized" });
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    sendJson(res, 500, { error: "Vercel Blob belum dikonfigurasi." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const app = body.app === undefined ? "admin" : body.app;
    if (app !== "admin" && app !== "public") {
      throw new Error("Target APK tidak valid.");
    }
    const versionCode = Number(body.versionCode);
    const versionName = typeof body.versionName === "string" ? body.versionName.trim() : "";
    if (!Number.isSafeInteger(versionCode) || versionCode < 1 || versionCode > 1_000_000 || !/^\d+(?:\.\d+){1,2}$/.test(versionName)) {
      throw new Error("Versi APK tidak valid.");
    }

    const apkBytes = decodeApk(body.apkBase64);
    const target = APK_TARGETS[app];
    const pathname = `${target.prefix}${target.filename}-v${versionName}-vc${versionCode}.apk`;
    const blob = await put(pathname, apkBytes, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/vnd.android.package-archive",
    });

    sendJson(res, 201, { app, pathname: blob.pathname, url: blob.url, size: apkBytes.length });
  } catch (error) {
    sendJson(res, 400, { error: error instanceof Error ? error.message : "Gagal mempublikasikan APK." });
  }
}
