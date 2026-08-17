import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../server/db";
import { propertyListings } from "../drizzle/schema";
import { seoMetadataUtils } from "../server/seo";
import { buildPropertySlug } from "../shared/propertySlug";

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character] ?? character);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestOrigin = `https://${req.headers.host || "primedeal-property.vercel.app"}`;
  const configuredOrigin = process.env.PUBLIC_SITE_URL?.trim();
  const origin = seoMetadataUtils.resolveCanonicalOrigin(
    configuredOrigin && !configuredOrigin.includes(".manus.space") ? configuredOrigin : requestOrigin,
  );
  try {
    const db = await getDb();
    const listings = db ? await db.select().from(propertyListings) : [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
    const staticPages = ["", "/listing", "/kalkulator", "/tentang"];
    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${escapeXml(`${origin}${page}`)}</loc>\n  </url>\n`;
    }
    for (const listing of listings.filter((item) => item.status === "active")) {
      const slug = listing.slug || buildPropertySlug(listing.title, listing.id);
      const listingUrl = `${origin}/properti/${encodeURIComponent(slug)}`;
      const lastmod = new Date(listing.updatedAt || listing.createdAt || Date.now()).toISOString();
      const images = (Array.isArray(listing.images) ? listing.images : [])
        .filter((image): image is string => typeof image === "string" && /^https?:\/\//i.test(image))
        .slice(0, 10);
      xml += `  <url>\n    <loc>${escapeXml(listingUrl)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
      for (const image of images) {
        xml += `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>\n`;
      }
      xml += "  </url>\n";
    }
    xml += `</urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).send(xml);
  } catch (error) {
    console.error("[Vercel Sitemap Error]", error);
    return res.status(500).send("Error generating sitemap");
  }
}
