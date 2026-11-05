import { list } from "@vercel/blob";
import type { Express, Request, Response } from "express";
import { getDb } from "./db.js";
import { propertyListings } from "../drizzle/schema.js";
import { hasEmergencyAdminKey } from "./propertyVideoUpload.js";

function addMediaValue(used: Set<string>, value: unknown) {
  if (typeof value !== "string") return;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      for (const item of parsed) if (typeof item === "string") used.add(item);
    } else if (typeof parsed === "string") {
      used.add(parsed);
    }
  } catch {
    used.add(value);
  }
}

export function registerBlobAuditRoute(app: Express) {
  app.get("/api/blob-audit", async (req: Request, res: Response) => {
    if (!hasEmergencyAdminKey(req)) {
      res.status(403).json({ error: "Hanya admin yang dapat melihat audit Blob." });
      return;
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN tidak tersedia." });
      return;
    }
    try {
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database tidak tersedia." });
        return;
      }
      const listings = await db.select({ images: propertyListings.images, videoUrl: propertyListings.videoUrl, videoThumbnailUrl: propertyListings.videoThumbnailUrl }).from(propertyListings);
      const used = new Set<string>();
      for (const listing of listings) {
        addMediaValue(used, listing.images);
        addMediaValue(used, listing.videoUrl);
        addMediaValue(used, listing.videoThumbnailUrl);
      }

      let cursor: string | undefined;
      let blobCount = 0;
      let totalBytes = 0;
      let orphanCount = 0;
      let orphanBytes = 0;
      const orphanSamples: Array<{ pathname: string; size: number; url: string }> = [];
      do {
        const page = await list({ token: process.env.BLOB_READ_WRITE_TOKEN, cursor, limit: 1000 });
        for (const blob of page.blobs) {
          blobCount += 1;
          totalBytes += blob.size;
          if (!used.has(blob.url)) {
            orphanCount += 1;
            orphanBytes += blob.size;
            if (orphanSamples.length < 100) orphanSamples.push({ pathname: blob.pathname, size: blob.size, url: blob.url });
          }
        }
        cursor = page.cursor;
      } while (cursor);

      res.set("Cache-Control", "no-store").json({
        listingCount: listings.length,
        referencedMediaUrlCount: used.size,
        blobCount,
        totalBytes,
        totalGiB: Number((totalBytes / 1024 / 1024 / 1024).toFixed(3)),
        orphanCount,
        orphanBytes,
        orphanGiB: Number((orphanBytes / 1024 / 1024 / 1024).toFixed(3)),
        orphanSamples,
        note: "Audit read-only. Tidak ada Blob atau listing yang dihapus.",
      });
    } catch (error) {
      console.error("[Blob Audit] Failed:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Audit Blob gagal." });
    }
  });
}
