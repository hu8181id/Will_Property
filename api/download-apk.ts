import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host || "primedeal-property.vercel.app";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const directApkUrl = `${protocol}://${host}/downloads/primedeal-admin.apk`;
  
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.redirect(302, directApkUrl);
}
