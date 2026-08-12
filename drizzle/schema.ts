import { bigint, index, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
    status: varchar("status", { length: 32 }).notNull().default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    statusIdx: index("property_listings_status_idx").on(table.status),
    createdAtIdx: index("property_listings_created_at_idx").on(table.createdAt),
    locationIdx: index("property_listings_location_idx").on(table.location),
  }),
);

export type PropertyListing = typeof propertyListings.$inferSelect;
export type InsertPropertyListing = typeof propertyListings.$inferInsert;