import "dotenv/config";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createApp } from "./server/_core/app";
import { injectSeoMetadata } from "./server/seo";
import { getDb } from "./server/db";
import { propertyListings } from "./drizzle/schema";
import { seoMetadataUtils } from "./server/seo";
import { buildPropertySlug } from "./shared/propertySlug";

const app = createApp();
const distPath = path.resolve(process.cwd(), "dist", "public");

if (!fs.existsSync(distPath)) {
  console.error(`[Vercel server] Build directory not found: ${distPath}`);
}

app.get("/sitemap.xml", async (req, res) => {
  try {
    const requestOrigin = `https://${req.headers.host || "primedeal-property.vercel.app"}`;
    const configuredOrigin = process.env.PUBLIC_SITE_URL?.trim();
    const origin = seoMetadataUtils.resolveCanonicalOrigin(
      configuredOrigin && !configuredOrigin.includes(".manus.space") ? configuredOrigin : requestOrigin,
    );

    let listings = [];
    try {
      const db = await getDb();
      if (db) {
        listings = await db.select().from(propertyListings);
      }
    } catch (dbErr) {
      console.error("[Sitemap DB Warning]", dbErr);
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
    
    const staticPages = ["", "/listing", "/kalkulator", "/tentang"];
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${origin}${page}</loc>\n`;
      xml += `    <changefreq>${page === "" ? "daily" : "weekly"}</changefreq>\n`;
      xml += `    <priority>${page === "" ? "1.0" : "0.8"}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const listing of listings) {
      const slug = buildPropertySlug(listing.id, listing.title);
      const lastMod = listing.updatedAt ? new Date(listing.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${origin}/listing/${slug}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      if (listing.imageUrl) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(listing.imageUrl)}</image:loc>\n`;
        xml += `      <image:title>${escapeXml(listing.title)}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(xml);
  } catch (err) {
    console.error("[Sitemap Error]", err);
    res.status(500).send("Error generating sitemap");
  }
});

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;"
  }[c] ?? c));
}

app.get("/robots.txt", (req, res) => {
  const requestOrigin = `https://${req.headers.host || "primedeal-property.vercel.app"}`;
  const configuredOrigin = process.env.PUBLIC_SITE_URL?.trim();
  const origin = seoMetadataUtils.resolveCanonicalOrigin(
    configuredOrigin && !configuredOrigin.includes(".manus.space") ? configuredOrigin : requestOrigin,
  );
  const txt = `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.status(200).send(txt);
});

app.use(express.static(distPath));

app.use("*", async (req, res, next) => {
  try {
    const templatePath = path.join(distPath, "index.html");
    const template = await fs.promises.readFile(templatePath, "utf-8");
    const decoratedTemplate = await injectSeoMetadata(
      template,
      req.originalUrl,
      `${req.protocol}://${req.get("host")}`
    );
    res
      .status(200)
      .set({ "Content-Type": "text/html", "Cache-Control": "no-cache" })
      .send(decoratedTemplate);
  } catch (error) {
    next(error);
  }
});

const server = createServer(app);
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
server.listen(port, () => {
  console.log(`[Primedeal server] Listening on port ${port}`);
});

export { app };
export default app;
