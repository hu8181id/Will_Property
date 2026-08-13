import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { analyticsDateUtils, visitorRecordSchema } from "./routers/analytics";
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

  it("melindungi ringkasan pengunjung agar tidak dapat diakses publik", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.analytics.dailySummary()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
