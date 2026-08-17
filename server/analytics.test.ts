import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { analyticsDateUtils, dailySummaryInputSchema, pageViewRecordSchema, visitorRecordSchema } from "./routers/analytics";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("analytics dashboard contracts", () => {
  it("membuat rentang tujuh hari berurutan dengan format tanggal stabil", () => {
    const dates = analyticsDateUtils.getDateKeys(7, new Date("2026-08-13T12:00:00.000Z"));
    expect(dates).toHaveLength(7);
    expect(dates.at(-1)).toBe("2026-08-13");
    expect(dates[0]).toBe("2026-08-07");
  });

  it("hanya menerima ID pengunjung anonim berbentuk UUID", () => {
    expect(analyticsDateUtils.isAnonymousVisitorId("20b60b15-d2a0-4246-901f-eb004eb03046")).toBe(true);
    expect(analyticsDateUtils.isAnonymousVisitorId("alamat-email@example.com")).toBe(false);
    const deviceId = "20b60b15-d2a0-4246-901f-eb004eb03046";
    expect(visitorRecordSchema.parse({})).toEqual({});
    expect(visitorRecordSchema.parse({ deviceId })).toEqual({ deviceId });
    expect(pageViewRecordSchema.parse({ contentType: "page", path: "/", contentTitle: "Beranda", deviceId })).toMatchObject({ deviceId });
    expect(() => visitorRecordSchema.parse({ visitorId: "tidak-boleh" })).toThrow();
  });

  it("mendeteksi sumber APK hanya dari penanda user-agent Primedeal yang resmi", () => {
    expect(analyticsDateUtils.getTrafficSourceFromUserAgent("Mozilla/5.0 PrimedealApp/5")).toBe("apk");
    expect(analyticsDateUtils.getTrafficSourceFromUserAgent("Mozilla/5.0 PrimedealApp/1.4.1 (Admin)")).toBe("apk");
    expect(analyticsDateUtils.getTrafficSourceFromUserAgent("Mozilla/5.0 (Android 15; Chrome)")).toBe("website");
    expect(analyticsDateUtils.getTrafficSourceFromUserAgent(undefined)).toBe("unknown");
  });

  it("mempertahankan utilitas fingerprint jaringan lama tanpa menyimpan IP mentah", () => {
    const sharedNetwork = { visitDate: "2026-08-15", networkAddress: "203.0.113.17", secret: "test-secret" };
    const webFingerprint = analyticsDateUtils.createDailyVisitFingerprint({ ...sharedNetwork, visitorId: "20b60b15-d2a0-4246-901f-eb004eb03046" });
    const apkFingerprint = analyticsDateUtils.createDailyVisitFingerprint({ ...sharedNetwork, visitorId: "bfc364af-6eb1-4b31-96e3-5a492a76af49" });
    expect(webFingerprint).toBe(apkFingerprint);
    expect(webFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(webFingerprint).not.toContain("203.0.113.17");
  });

  it("membedakan jaringan atau hari yang berbeda dan memakai cookie anonim bila alamat jaringan tidak tersedia", () => {
    const base = { visitorId: "20b60b15-d2a0-4246-901f-eb004eb03046", secret: "test-secret" };
    const first = analyticsDateUtils.createDailyVisitFingerprint({ ...base, visitDate: "2026-08-15", networkAddress: "203.0.113.17" });
    const anotherNetwork = analyticsDateUtils.createDailyVisitFingerprint({ ...base, visitDate: "2026-08-15", networkAddress: "203.0.113.18" });
    const nextDay = analyticsDateUtils.createDailyVisitFingerprint({ ...base, visitDate: "2026-08-16", networkAddress: "203.0.113.17" });
    const fallback = analyticsDateUtils.createDailyVisitFingerprint({ ...base, visitDate: "2026-08-15" });
    expect(first).not.toBe(anotherNetwork);
    expect(first).not.toBe(nextDay);
    expect(fallback).toMatch(/^[a-f0-9]{64}$/);
  });

  it("menjumlahkan trafik harian per sumber tanpa mengatribusikan riwayat yang tidak diketahui", () => {
    expect(
      analyticsDateUtils.aggregateTrafficBySource(
        ["2026-08-10", "2026-08-11"],
        [
          { visitDate: "2026-08-10", trafficSource: "website", visitors: 3 },
          { visitDate: "2026-08-10", trafficSource: "apk", visitors: 2 },
          { visitDate: "2026-08-10", trafficSource: "unknown", visitors: 1 },
        ],
      ),
    ).toEqual([
      { visitDate: "2026-08-10", websiteVisitors: 3, apkVisitors: 2, unknownVisitors: 1, visitors: 6 },
      { visitDate: "2026-08-11", websiteVisitors: 0, apkVisitors: 0, unknownVisitors: 0, visitors: 0 },
    ]);
  });

  it("menerima metadata halaman atau listing yang aman dan menolak path atau ID listing yang tidak valid", () => {
    expect(pageViewRecordSchema.parse({ contentType: "page", path: "/kalkulator", contentTitle: "Kalkulator KPR" })).toMatchObject({ contentType: "page" });
    expect(pageViewRecordSchema.parse({ contentType: "listing", path: "/listing/9", contentTitle: "Rumah Surabaya", propertyId: 9 })).toMatchObject({ propertyId: 9 });
    expect(() => pageViewRecordSchema.parse({ contentType: "listing", path: "/listing/9", contentTitle: "Rumah" })).toThrow();
    expect(() => pageViewRecordSchema.parse({ contentType: "page", path: "https://bukan-path", contentTitle: "Tidak valid" })).toThrow();
  });

  it("menerima rentang tanggal valid dan menolak periode terbalik atau terlalu panjang", () => {
    expect(dailySummaryInputSchema.parse({ startDate: "2026-08-01", endDate: "2026-08-31" })).toEqual({
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    });
    expect(() => dailySummaryInputSchema.parse({ startDate: "2026-08-31", endDate: "2026-08-01" })).toThrow();
    expect(() => dailySummaryInputSchema.parse({ startDate: "2025-01-01", endDate: "2026-12-31" })).toThrow();
  });

  it("membuat setiap tanggal dalam periode yang dipilih tanpa melewati batas akhir", () => {
    expect(analyticsDateUtils.getDateKeysInRange("2026-08-29", "2026-09-02")).toEqual([
      "2026-08-29",
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
    ]);
  });

  it("melindungi ringkasan pengunjung agar tidak dapat diakses publik", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.analytics.dailySummary()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.analytics.popularContent()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
