import { getDb } from "./server/db.ts";
import { propertyListings } from "./drizzle/schema.ts";
import { buildPropertySlug } from "./shared/propertySlug.ts";
import fs from "node:fs";

async function generate() {
  let listings = [];
  try {
    const db = await getDb();
    if (db) {
      listings = await db.select().from(propertyListings);
    }
  } catch (e) {
    console.error("DB fetch error:", e);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  
  const staticPages = ["", "/listing", "/kalkulator", "/tentang"];
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>https://primedeal-property.vercel.app${page}</loc>\n`;
    xml += `    <changefreq>${page === "" ? "daily" : "weekly"}</changefreq>\n`;
    xml += `    <priority>${page === "" ? "1.0" : "0.8"}</priority>\n`;
    xml += `  </url>\n`;
  }

  for (const l of listings) {
    const slug = buildPropertySlug(l.id, l.title);
    const lastMod = l.updatedAt ? new Date(l.updatedAt).toISOString() : new Date().toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>https://primedeal-property.vercel.app/listing/${slug}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    if (l.imageUrl) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${l.imageUrl.replace(/[<>&'\"]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", "'":"&apos;", '"':"&quot;" }[c] || c))}</image:loc>\n`;
      xml += `      <image:title>${l.title.replace(/[<>&'\"]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", "'":"&apos;", '"':"&quot;" }[c] || c))}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  fs.writeFileSync("/tmp/sitemap_complete.xml", xml);
  console.log("Generated complete sitemap with", listings.length, "listings.");
}
generate();
