import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const origin = process.env.PUBLIC_SITE_URL || `https://${req.headers.host || "primedeal-property.vercel.app"}`;
  const downloadPath = "/downloads/primedeal-properti.apk";
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.status(200).json({
    versionCode: 11,
    versionName: "1.4.0",
    downloadUrl: `${origin}${downloadPath}`,
    sha256: "e24a5f57a7f9f6933a1c5bcbd47f1ebeabff124f1726321cd68b322971602a5f",
    releaseNotes: "Pembaruan resmi PrimeDeal v1.4.0 (WhatsAppFix) dengan integrasi WhatsApp eksternal dan stabilisasi Vercel.",
    publishedAt: "2026-08-17T00:00:00.000Z",
  });
}
