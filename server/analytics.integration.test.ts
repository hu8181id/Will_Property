import { afterAll, describe, expect, it } from "vitest";
import { and, eq, inArray, or } from "drizzle-orm";
import { siteDailyPageViews, siteDailyVisits } from "../drizzle/schema";
import { getAnonymousDailyVisitSummary, getDb, getPopularContent, recordAnonymousDailyVisit, recordAnonymousPageView } from "./db";

const visitorId = `analytics-test-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const firstDate = "2099-12-30";
const secondDate = "2099-12-31";
const popularDate = "2099-12-29";
const sharedDate = "2099-12-28";
const pageVisitors = [`${visitorId}-page-a`, `${visitorId}-page-b`, `${visitorId}-page-c`];
const sharedDailyFingerprint = `network-${visitorId}`;

afterAll(async () => {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(siteDailyVisits)
    .where(
      or(
        and(inArray(siteDailyVisits.visitDate, [firstDate, secondDate]), eq(siteDailyVisits.visitorId, visitorId)),
        and(eq(siteDailyVisits.visitDate, sharedDate), eq(siteDailyVisits.dailyFingerprint, sharedDailyFingerprint)),
      ),
    );
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

  it("mencatat jaringan yang sama dari website dan APK satu kali serta mempertahankan sumber pertama", async () => {
    const websiteVisitor = `${visitorId}-website`;
    const apkVisitor = `${visitorId}-apk`;
    const before = await getAnonymousDailyVisitSummary(sharedDate);
    const beforeWebsite = before.find((day) => day.visitDate === sharedDate && day.trafficSource === "website")?.visitors ?? 0;
    const beforeApk = before.find((day) => day.visitDate === sharedDate && day.trafficSource === "apk")?.visitors ?? 0;
    await recordAnonymousDailyVisit({ visitDate: sharedDate, visitorId: websiteVisitor, trafficSource: "website", dailyFingerprint: sharedDailyFingerprint });
    await recordAnonymousDailyVisit({ visitDate: sharedDate, visitorId: apkVisitor, trafficSource: "apk", dailyFingerprint: sharedDailyFingerprint });

    const summary = await getAnonymousDailyVisitSummary(sharedDate);
    expect(summary.find((day) => day.visitDate === sharedDate && day.trafficSource === "website")?.visitors).toBe(beforeWebsite + 1);
    expect(summary.find((day) => day.visitDate === sharedDate && day.trafficSource === "apk")?.visitors ?? 0).toBe(beforeApk);
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
