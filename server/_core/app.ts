import express, { type Express, type Request } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerPropertyVideoUploadRoute } from "../propertyVideoUpload";
import { buildPropertySlug } from "../../shared/propertySlug";

function publicOrigin(req: Request) {
  const configured = process.env.PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  return `${req.protocol}://${req.get("host")}`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character] ?? character);
}

export type AppOptions = {
  includeStaticRoutes?: boolean;
};

/**
 * Creates the Express application without opening a listening socket.
 * This is shared by the local server and Vercel's catch-all serverless function.
 */
export function createApp(options: AppOptions = {}): Express {
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerPropertyVideoUploadRoute(app);

  app.post("/api/blob-upload-auth", async (req, res) => {
    const { handleVercelBlobUploadAuth } = await import("../vercelBlobUpload");
    return handleVercelBlobUploadAuth(req, res);
  });

  app.post("/api/blob-delete", async (req, res) => {
    const { handleVercelBlobDelete } = await import("../vercelBlobUpload");
    return handleVercelBlobDelete(req, res);
  });

  app.get("/robots.txt", (req, res) => {
    const origin = publicOrigin(req);
    res.type("text/plain").send(`User-agent: *
Allow: /
Allow: /listing
Allow: /properti
Allow: /kalkulator
Allow: /tentang
Sitemap: ${origin}/sitemap.xml
`);
  });

  app.get("/sitemap.xml", async (req, res) => {
    const origin = publicOrigin(req);
    try {
      const { getDb } = await import("../db");
      const { propertyListings } = await import("../../drizzle/schema");
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
      res.type("application/xml").send(xml);
    } catch (error) {
      console.error("[Sitemap Error]", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/apk/latest.json", (req, res) => {
    const downloadPath = "/manus-storage/primedeal-properti-v1.3.0_2c9e3fb1.apk";
    const siteOrigin = publicOrigin(req);
    res
      .set("Cache-Control", "no-store, max-age=0")
      .json({
        versionCode: 5,
        versionName: "1.3.0",
        downloadUrl: `${siteOrigin}${downloadPath}`,
        sha256: "f6126cc5dd5cd026cdc7d7978db48c08e714b61d402b11319638104b5c763e25",
        releaseNotes: "Pemeriksaan pembaruan gratis dan notifikasi versi baru yang lebih aman.",
        publishedAt: "2026-08-15T00:00:00.000Z",
      });
  });

  const trpcMiddleware = createExpressMiddleware({
    router: appRouter,
    createContext,
  });

  // Vercel catch-all functions may forward the path with `/api` stripped,
  // while the local Express server receives the full `/api/trpc` path.
  // Support both forms so the same factory works in both environments.
  app.use("/api/trpc", trpcMiddleware);
  app.use("/trpc", trpcMiddleware);

  if (options.includeStaticRoutes) {
    // Imported lazily so the serverless function does not need Vite's dev runtime.
    // The local entrypoint calls serveStatic/setupVite after creating the app.
  }

  return app;
}
