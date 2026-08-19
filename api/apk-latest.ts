import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const origin = process.env.PUBLIC_SITE_URL || `https://${req.headers.host || "primedeal-property.vercel.app"}`;
  const downloadPath = "/downloads/primedeal-properti.apk";
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.status(200).json({
    versionCode: 6,
    versionName: "1.4.0",
    downloadUrl: `${origin}${downloadPath}`,
    sha256: "c0409359671ecf64526c64b9d4790734980da502db1a5be42cae998703bcbe3b",
    releaseNotes: "Pembaruan APK PrimeDeal WhatsAppFix versi model kustom pengguna dengan penanganan intent WhatsApp eksternal.",
    publishedAt: "2026-08-17T00:00:00.000Z",
  });
}
