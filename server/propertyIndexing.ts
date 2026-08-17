import { asc, eq } from "drizzle-orm";
import { propertyIndexingQueue, propertyListings } from "../drizzle/schema";
import { buildPropertySlug } from "../shared/propertySlug";
import { seoMetadataUtils } from "./seo";
import { getDb } from "./db";

export type PropertyIndexingStatus = "sitemap_ready" | "error";

export function buildPropertyPublicUrl(property: {
  id: number;
  title: string;
  slug?: string | null;
}, origin = process.env.PUBLIC_SITE_URL || "https://primedeal-property.vercel.app") {
  const canonicalOrigin = seoMetadataUtils.resolveCanonicalOrigin(origin);
  const slug = property.slug || buildPropertySlug(property.title, property.id);
  return `${canonicalOrigin}/properti/${encodeURIComponent(slug)}`;
}

/**
 * Upserts one durable record per property. The record means that the URL is
 * publicly reachable and present in the dynamic sitemap; it never claims that
 * Google has already indexed the page.
 */
export async function enqueuePropertyIndexing(property: {
  id: number;
  title: string;
  slug?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database tidak tersedia untuk antrean indexing.");

  const url = buildPropertyPublicUrl(property);
  await db.insert(propertyIndexingQueue).values({
    propertyId: property.id,
    url,
    status: "sitemap_ready",
    attempts: 0,
    lastError: null,
    lastProcessedAt: new Date(),
  }).onDuplicateKeyUpdate({
    set: {
      url,
      status: "sitemap_ready",
      attempts: 0,
      lastError: null,
      lastProcessedAt: new Date(),
    },
  });

  return { propertyId: property.id, url, status: "sitemap_ready" as const };
}

/** Backfills older active listings so the Admin status view is complete. */
export async function ensureActiveListingsIndexingQueue() {
  const db = await getDb();
  if (!db) return 0;
  const listings = await db
    .select({ id: propertyListings.id, title: propertyListings.title, slug: propertyListings.slug })
    .from(propertyListings)
    .where(eq(propertyListings.status, "active"));

  for (const listing of listings) {
    await enqueuePropertyIndexing(listing);
  }
  return listings.length;
}

export async function listPropertyIndexingStatuses() {
  const db = await getDb();
  if (!db) return [];
  await ensureActiveListingsIndexingQueue();
  return db
    .select({
      propertyId: propertyIndexingQueue.propertyId,
      url: propertyIndexingQueue.url,
      status: propertyIndexingQueue.status,
      attempts: propertyIndexingQueue.attempts,
      lastError: propertyIndexingQueue.lastError,
      lastProcessedAt: propertyIndexingQueue.lastProcessedAt,
      updatedAt: propertyIndexingQueue.updatedAt,
      title: propertyListings.title,
      listingStatus: propertyListings.status,
    })
    .from(propertyIndexingQueue)
    .innerJoin(propertyListings, eq(propertyIndexingQueue.propertyId, propertyListings.id))
    .orderBy(asc(propertyIndexingQueue.updatedAt));
}
