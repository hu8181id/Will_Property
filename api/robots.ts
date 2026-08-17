import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const origin = process.env.PUBLIC_SITE_URL || `https://${req.headers.host || "primedeal-property.vercel.app"}`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  return res.status(200).send(`User-agent: *
Allow: /
Allow: /listing
Allow: /properti
Allow: /kalkulator
Allow: /tentang
Sitemap: ${origin}/sitemap.xml
`);
}
