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
    expect(visitorRecordSchema.parse({})).toEqual({});
    expect(() => visitorRecordSchema.parse({ visitorId: "tidak-boleh" })).toThrow();
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
