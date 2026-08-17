import { bigint, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const propertyListings = mysqlTable(
  "property_listings",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 320 }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    propertyType: varchar("propertyType", { length: 64 }).notNull(),
    transactionType: varchar("transactionType", { length: 32 }).notNull().default("dijual"),
    price: bigint("price", { mode: "number" }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    address: varchar("address", { length: 500 }),
    area: int("area"),
    bedrooms: int("bedrooms"),
    bathrooms: int("bathrooms"),
    floor: varchar("floor", { length: 64 }),
    tower: varchar("tower", { length: 64 }),
    view: varchar("view", { length: 128 }),
    condition: varchar("condition", { length: 64 }),
    certificate: varchar("certificate", { length: 128 }),
    facilities: json("facilities").$type<string[]>(),
    images: json("images").$type<string[]>().notNull(),
    videoUrl: varchar("videoUrl", { length: 1000 }),
    videoThumbnailUrl: varchar("videoThumbnailUrl", { length: 1000 }),
    virtualTourUrl: varchar("virtualTourUrl", { length: 1000 }),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    statusIdx: index("property_listings_status_idx").on(table.status),
    createdAtIdx: index("property_listings_created_at_idx").on(table.createdAt),
    locationIdx: index("property_listings_location_idx").on(table.location),
    slugUnique: uniqueIndex("property_listings_slug_unique").on(table.slug),
  }),
);

export type PropertyListing = typeof propertyListings.$inferSelect;
export type InsertPropertyListing = typeof propertyListings.$inferInsert;

/**
 * Internal crawl-discovery queue. This records that a public property URL has
 * been made available through the sitemap; it is not a claim that Google has
 * already indexed the page.
 */
export const propertyIndexingQueue = mysqlTable(
  "property_indexing_queue",
  {
    id: int("id").autoincrement().primaryKey(),
    propertyId: int("propertyId").notNull(),
    url: varchar("url", { length: 1000 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("queued"),
    attempts: int("attempts").notNull().default(0),
    lastError: text("lastError"),
    lastProcessedAt: timestamp("lastProcessedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    propertyIdUnique: uniqueIndex("property_indexing_queue_property_id_unique").on(table.propertyId),
    statusIdx: index("property_indexing_queue_status_idx").on(table.status),
    updatedAtIdx: index("property_indexing_queue_updated_at_idx").on(table.updatedAt),
  }),
);

export type PropertyIndexingQueue = typeof propertyIndexingQueue.$inferSelect;
export type InsertPropertyIndexingQueue = typeof propertyIndexingQueue.$inferInsert;

export const propertyVideoUploadSessions = mysqlTable(
  "property_video_upload_sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    contentType: varchar("contentType", { length: 128 }).notNull(),
    totalBytes: int("totalBytes").notNull(),
    totalChunks: int("totalChunks").notNull(),
    chunkKeys: json("chunkKeys").$type<Record<string, string>>().notNull(),
    completedUrl: varchar("completedUrl", { length: 1000 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    createdAtIdx: index("property_video_upload_sessions_created_at_idx").on(table.createdAt),
  }),
);

export type PropertyVideoUploadSession = typeof propertyVideoUploadSessions.$inferSelect;

export const propertyReviews = mysqlTable(
  "property_reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    propertyId: int("propertyId").notNull(),
    authorName: varchar("authorName", { length: 128 }).notNull(),
    rating: int("rating").notNull(),
    comment: text("comment").notNull(),
    reviewStatus: mysqlEnum("reviewStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    propertyIdIdx: index("property_reviews_property_id_idx").on(table.propertyId),
    statusIdx: index("property_reviews_status_idx").on(table.reviewStatus),
  }),
);

export type PropertyReview = typeof propertyReviews.$inferSelect;
export type InsertPropertyReview = typeof propertyReviews.$inferInsert;

/**
 * Anonymous, deduplicated website visits. The random visitor key is held only
 * in a first-party browser cookie and is never associated with a user account.
 */
export const siteDailyVisits = mysqlTable(
  "site_daily_visits",
  {
    id: int("id").autoincrement().primaryKey(),
    visitDate: varchar("visitDate", { length: 10 }).notNull(),
    visitorId: varchar("visitorId", { length: 64 }).notNull(),
    dailyFingerprint: varchar("dailyFingerprint", { length: 64 }),
    trafficSource: mysqlEnum("trafficSource", ["website", "apk", "unknown"]).notNull().default("unknown"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    visitDateIdx: index("site_daily_visits_visit_date_idx").on(table.visitDate),
    visitDateFingerprintUnique: uniqueIndex("site_daily_visits_date_fingerprint_unique").on(
      table.visitDate,
      table.dailyFingerprint,
    ),
  }),
);

export type SiteDailyVisit = typeof siteDailyVisits.$inferSelect;

/**
 * Anonymous page and listing views. A visitor can contribute one view per
 * content path each day, allowing popularity rankings without personal data.
 */
export const siteDailyPageViews = mysqlTable(
  "site_daily_page_views",
  {
    id: int("id").autoincrement().primaryKey(),
    visitDate: varchar("visitDate", { length: 10 }).notNull(),
    visitorId: varchar("visitorId", { length: 64 }).notNull(),
    contentType: mysqlEnum("contentType", ["page", "listing"]).notNull(),
    path: varchar("path", { length: 256 }).notNull(),
    contentTitle: varchar("contentTitle", { length: 255 }).notNull(),
    propertyId: int("propertyId"),
    trafficSource: mysqlEnum("trafficSource", ["website", "apk", "unknown"]).notNull().default("unknown"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    visitDateIdx: index("site_daily_page_views_visit_date_idx").on(table.visitDate),
    contentDateIdx: index("site_daily_page_views_content_date_idx").on(table.contentType, table.visitDate),
    visitDateVisitorPathUnique: uniqueIndex("site_daily_page_views_date_visitor_path_unique").on(
      table.visitDate,
      table.visitorId,
      table.path,
      table.trafficSource,
    ),
  }),
);

export type SiteDailyPageView = typeof siteDailyPageViews.$inferSelect;
