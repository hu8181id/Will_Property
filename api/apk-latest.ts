import { list } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { disabledAdminApkManifest, selectLatestAdminApk } from "../server/apk-manifest.js";

const ADMIN_APK_PREFIX = "apps/primedeal/admin/";

function isAdminApkRequest(userAgent: string | string[] | undefined) {
  const value = Array.isArray(userAgent) ? userAgent[0] : userAgent || "";
  return /PrimedealApp\/[^\s]+\s+\(Admin\)/i.test(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (!isAdminApkRequest(req.headers["user-agent"]) || !process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json(disabledAdminApkManifest());
  }

  try {
    const { blobs } = await list({ prefix: ADMIN_APK_PREFIX, limit: 100 });
    return res.status(200).json(selectLatestAdminApk(blobs));
  } catch (error) {
    console.error("[APK manifest] Vercel Blob lookup failed", error);
    return res.status(200).json(disabledAdminApkManifest());
  }
}
