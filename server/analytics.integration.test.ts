import { afterAll, describe, expect, it } from "vitest";
import { and, eq, inArray } from "drizzle-orm";
import { siteDailyVisits } from "../drizzle/schema";
import { getAnonymousDailyVisitSummary, getDb, recordAnonymousDailyVisit } from "./db";

const visitorId = `analytics-test-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const firstDate = "2099-12-30";
const secondDate = "2099-12-31";

afterAll(async () => {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(siteDailyVisits)
    .where(and(inArray(siteDailyVisits.visitDate, [firstDate, secondDate]), eq(siteDailyVisits.visitorId, visitorId)));
});

describe("daily visit persistence", () => {
  it("mencatat visitor yang sama sekali saja pada tanggal yang sama", async () => {
    await recordAnonymousDailyVisit({ visitDate: firstDate, visitorId });
    await recordAnonymousDailyVisit({ visitDate: firstDate, visitorId });

    const summary = await getAnonymousDailyVisitSummary(firstDate);
    expect(summary.find((day) => day.visitDate === firstDate)?.visitors).toBe(1);
  });

  it("tetap menghitung visitor yang sama pada tanggal berbeda", async () => {
    await recordAnonymousDailyVisit({ visitDate: secondDate, visitorId });

    const summary = await getAnonymousDailyVisitSummary(firstDate);
    expect(summary.find((day) => day.visitDate === firstDate)?.visitors).toBe(1);
    expect(summary.find((day) => day.visitDate === secondDate)?.visitors).toBe(1);
  });
});
