import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const origin = process.env.PUBLIC_SITE_URL || `https://${req.headers.host || "primedeal-property.vercel.app"}`;
  const downloadPath = "/manus-storage/primedeal-properti-v1.4.0.apk";
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.status(200).json({
    versionCode: 6,
    versionName: "1.4.0",
    downloadUrl: `${origin}${downloadPath}`,
    sha256: "31ed6af368e66fa52e02407dc4535d4809be6920363348490629f26d826d3658",
    releaseNotes: "Pembaruan APK PrimeDeal v1.4.0 dengan ikon resmi, pelacakan pengunjung harian, dan integrasi sitemap Google.",
    publishedAt: "2026-08-17T00:00:00.000Z",
  });
}
