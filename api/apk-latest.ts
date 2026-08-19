import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const origin = process.env.PUBLIC_SITE_URL || `https://${req.headers.host || "primedeal-property.vercel.app"}`;
  const downloadPath = "/downloads/primedeal-admin.apk";
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.status(200).json({
    versionCode: 10,
    versionName: "1.0.10",
    downloadUrl: `${origin}${downloadPath}`,
    sha256: "c0409359671ecf64526c64b9d4790734980da502db1a5be42cae998703bcbe3b",
    releaseNotes: "Pembaruan resmi PrimeDeal v1.4.0 (WhatsAppFix) dengan integrasi WhatsApp eksternal dan stabilisasi Vercel.",
    publishedAt: "2026-08-17T00:00:00.000Z",
  });
}
