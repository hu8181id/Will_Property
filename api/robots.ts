import type { VercelRequest, VercelResponse } from "@vercel/node";

import { seoMetadataUtils } from "../server/seo";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const requestOrigin = `https://${req.headers.host || "primedeal-property.vercel.app"}`;
  const configuredOrigin = process.env.PUBLIC_SITE_URL?.trim();
  const origin = seoMetadataUtils.resolveCanonicalOrigin(
    configuredOrigin && !configuredOrigin.includes(".manus.space") ? configuredOrigin : requestOrigin,
  );
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.status(200).send(`User-agent: *
Allow: /
Allow: /listing
Allow: /properti
Allow: /kalkulator
Allow: /tentang
Sitemap: ${origin}/sitemap.xml
`);
}
