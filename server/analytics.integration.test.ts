import { afterAll, describe, expect, it } from "vitest";
import { and, eq, inArray } from "drizzle-orm";
import { siteDailyPageViews, siteDailyVisits } from "../drizzle/schema";
import { getAnonymousDailyVisitSummary, getDb, getPopularContent, recordAnonymousDailyVisit, recordAnonymousPageView } from "./db";

const visitorId = `analytics-test-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const firstDate = "2099-12-30";
const secondDate = "2099-12-31";
const popularDate = "2099-12-29";
const pageVisitors = [`${visitorId}-page-a`, `${visitorId}-page-b`, `${visitorId}-page-c`];

afterAll(async () => {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(siteDailyVisits)
    .where(and(inArray(siteDailyVisits.visitDate, [firstDate, secondDate]), eq(siteDailyVisits.visitorId, visitorId)));
  await db
    .delete(siteDailyPageViews)
    .where(and(eq(siteDailyPageViews.visitDate, popularDate), inArray(siteDailyPageViews.visitorId, pageVisitors)));
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

describe("popular content persistence", () => {
  it("mendeduplikasi tampilan konten yang sama dan mengurutkan halaman berdasarkan jumlah tampilan", async () => {
    await recordAnonymousPageView({ visitDate: popularDate, visitorId: pageVisitors[0]!, contentType: "page", path: "/kalkulator", contentTitle: "Kalkulator KPR" });
    await recordAnonymousPageView({ visitDate: popularDate, visitorId: pageVisitors[0]!, contentType: "page", path: "/kalkulator", contentTitle: "Kalkulator KPR" });
    await recordAnonymousPageView({ visitDate: popularDate, visitorId: pageVisitors[1]!, contentType: "page", path: "/kalkulator", contentTitle: "Kalkulator KPR" });
    await recordAnonymousPageView({ visitDate: popularDate, visitorId: pageVisitors[2]!, contentType: "page", path: "/tentang", contentTitle: "Tentang Primedeal" });

    const pages = await getPopularContent(popularDate, popularDate, "page");
    expect(pages[0]).toMatchObject({ path: "/kalkulator", views: 2 });
    expect(pages[1]).toMatchObject({ path: "/tentang", views: 1 });
  });

  it("mengembalikan listing populer secara terpisah dari halaman umum", async () => {
    await recordAnonymousPageView({ visitDate: popularDate, visitorId: pageVisitors[0]!, contentType: "listing", path: "/listing/99991", contentTitle: "Listing Uji Populer", propertyId: 99991 });
    const listings = await getPopularContent(popularDate, popularDate, "listing");
    expect(listings[0]).toMatchObject({ path: "/listing/99991", propertyId: 99991, views: 1 });
  });
});
