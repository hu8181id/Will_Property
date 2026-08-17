import { getDb } from "./server/db.ts";
import { propertyListings } from "./drizzle/schema.ts";
import fs from "node:fs";

function slugify(id, title) {
  const cleanTitle = (title || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${id}-${cleanTitle || "properti"}`;
}

async function run() {
  let listings = [];
  try {
    const db = await getDb();
    if (db) {
      listings = await db.select().from(propertyListings);
    }
  } catch (e) {
    console.error("DB error:", e);
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
    const slug = slugify(l.id, l.title);
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
  fs.writeFileSync("/home/ubuntu/primedeal_property/client/public/sitemap.xml", xml);
  console.log("Built sitemap with", listings.length, "listings.");
}
run();
