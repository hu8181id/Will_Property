import { and, count, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  propertyVideoUploadSessions,
  siteDailyVisits,
  type PropertyVideoUploadSession,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createPropertyVideoUploadSession(input: {
  id: string;
  fileName: string;
  contentType: string;
  totalBytes: number;
  totalChunks: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database tidak tersedia untuk memulai unggah video.");

  await db.insert(propertyVideoUploadSessions).values({
    ...input,
    chunkKeys: {},
  });
}

export async function getPropertyVideoUploadSession(id: string): Promise<PropertyVideoUploadSession | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database tidak tersedia untuk memproses unggah video.");

  const result = await db
    .select()
    .from(propertyVideoUploadSessions)
    .where(eq(propertyVideoUploadSessions.id, id))
    .limit(1);
  return result[0];
}

export async function savePropertyVideoChunkKey(id: string, chunkIndex: number, storageKey: string) {
  const session = await getPropertyVideoUploadSession(id);
  if (!session) return undefined;

  const db = await getDb();
  if (!db) throw new Error("Database tidak tersedia untuk menyimpan bagian video.");
  const chunkKeys = { ...(session.chunkKeys ?? {}), [String(chunkIndex)]: storageKey };
  await db
    .update(propertyVideoUploadSessions)
    .set({ chunkKeys })
    .where(eq(propertyVideoUploadSessions.id, id));
  return { ...session, chunkKeys };
}

export async function setPropertyVideoUploadCompletedUrl(id: string, completedUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database tidak tersedia untuk menyelesaikan unggah video.");

  await db
    .update(propertyVideoUploadSessions)
    .set({ completedUrl })
    .where(eq(propertyVideoUploadSessions.id, id));
}

export async function recordAnonymousDailyVisit(input: { visitDate: string; visitorId: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database tidak tersedia untuk mencatat kunjungan.");

  await db
    .insert(siteDailyVisits)
    .values(input)
    .onDuplicateKeyUpdate({ set: { visitorId: input.visitorId } });
}

export async function getAnonymousDailyVisitSummary(fromDate: string, toDate?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database tidak tersedia untuk membaca statistik pengunjung.");

  const rows = await db
    .select({ visitDate: siteDailyVisits.visitDate, visitors: count() })
    .from(siteDailyVisits)
    .where(toDate ? and(gte(siteDailyVisits.visitDate, fromDate), lte(siteDailyVisits.visitDate, toDate)) : gte(siteDailyVisits.visitDate, fromDate))
    .groupBy(siteDailyVisits.visitDate)
    .orderBy(siteDailyVisits.visitDate);

  return rows.map((row) => ({ visitDate: row.visitDate, visitors: Number(row.visitors) }));
}
