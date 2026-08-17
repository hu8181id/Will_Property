import { describe, it, expect, vi } from "vitest";

vi.mock("@vercel/blob", () => ({
  del: vi.fn().mockResolvedValue(undefined),
  put: vi.fn().mockResolvedValue({ url: "https://blob.vercel-storage.com/mock.jpg" }),
}));
import * as dbModule from "./db";
import * as notificationModule from "./_core/notification";
import { appRouter } from "./routers";
import { propertyDraftSchema, propertyFilterSchema, reviewDraftSchema, reviewModerationSchema } from "./routers/property";
import { propertyListings } from "../drizzle/schema";
import { createContext, type TrpcContext } from "./_core/context";
import { sdk } from "./_core/sdk";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const validDraft = {
  title: "Rumah Modern Surabaya",
  description: "Hunian modern dengan lokasi strategis dan akses fasilitas lengkap.",
  propertyType: "rumah",
  transactionType: "dijual",
  price: 1500000000,
  location: "Surabaya, Indonesia",
  facilities: ["Garasi", "Taman"],
  images: ["/manus-storage/property-1.jpg"],
  videoUrl: "https://cdn.example.com/property.mp4",
  videoThumbnailUrl: "/manus-storage/property-video-cover.jpg",
  virtualTourUrl: "https://my.matterport.com/show/?m=example",
};

describe("property listing contracts", () => {
  it("applies the default transaction type and rejects listings without images", () => {
    const parsed = propertyDraftSchema.parse({ ...validDraft, transactionType: undefined });
    expect(parsed.transactionType).toBe("dijual");
    expect(() => propertyDraftSchema.parse({ ...validDraft, images: [] })).toThrow();
    expect(propertyDraftSchema.parse({ ...validDraft, images: ["1", "2", "3", "4", "5"] }).images).toHaveLength(5);
    expect(() => propertyDraftSchema.parse({ ...validDraft, images: ["1", "2", "3", "4", "5", "6"] })).toThrow();
    expect(propertyDraftSchema.parse(validDraft).videoUrl).toBe("https://cdn.example.com/property.mp4");
    expect(propertyDraftSchema.parse(validDraft).videoThumbnailUrl).toBe("/manus-storage/property-video-cover.jpg");
    expect(propertyDraftSchema.parse(validDraft).virtualTourUrl).toContain("matterport.com");
    expect(() => propertyDraftSchema.parse({ ...validDraft, videoThumbnailUrl: "javascript:alert(1)" })).toThrow();
    expect(() => propertyDraftSchema.parse({ ...validDraft, virtualTourUrl: "javascript:alert(1)" })).toThrow();
  });

  it("normalizes the filter contract with a stable default sort", () => {
    expect(propertyFilterSchema.parse({})).toEqual({ sortBy: "terbaru" });
    expect(propertyFilterSchema.parse({ priceMin: 500000000, sortBy: "harga-rendah" })).toMatchObject({
      priceMin: 500000000,
      sortBy: "harga-rendah",
    });
  });

  it("validates review content and moderation status", () => {
    expect(reviewDraftSchema.parse({
      propertyId: 7,
      authorName: "  Andi  ",
      rating: 5,
      comment: "  Lokasi sangat strategis.  ",
    })).toMatchObject({ authorName: "Andi", comment: "Lokasi sangat strategis." });
    expect(() => reviewDraftSchema.parse({ propertyId: 7, authorName: "A", rating: 5, comment: "Bagus" })).toThrow();
    expect(() => reviewDraftSchema.parse({ propertyId: 7, authorName: "Andi", rating: 6, comment: "Bagus sekali" })).toThrow();
    expect(reviewModerationSchema.parse({ reviewId: 1, status: "approved" }).status).toBe("approved");
    expect(() => reviewModerationSchema.parse({ reviewId: 1, status: "pending" })).toThrow();
  });

  it("returns a public listing array without exposing technical errors", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.property.list({ sortBy: "terbaru" });
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("title");
      expect(result[0]).toHaveProperty("images");
    }
  });

  it("protects listing mutations and uploads behind admin authorization", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.property.create(validDraft)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.property.update({ id: 1, ...validDraft })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.property.delete({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.property.uploadImage({ fileName: "foto.jpg", base64Data: "data:image/jpeg;base64,AA==", contentType: "image/jpeg" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.property.uploadVideo({ fileName: "tur.mp4", base64Data: "data:video/mp4;base64,AA==", contentType: "video/mp4" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("protects review moderation behind admin authorization", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.property.listPendingReviews()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.property.moderateReview({ reviewId: 1, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows querying property indexing status through admin authorization", async () => {
    const emergencyKey = "emergency-regression-key";
    process.env.ADMIN_SECRET_KEY = emergencyKey;
    const innerJoin = vi.fn().mockResolvedValue([
      {
        propertyId: 450001,
        url: "https://primedeal-property.vercel.app/properti/rumah-surabaya-450001",
        status: "sitemap_ready",
        attempts: 0,
        lastError: null,
        lastProcessedAt: new Date(),
        updatedAt: new Date(),
        title: "Rumah Surabaya",
        listingStatus: "active",
      },
    ]);
    const orderBy = vi.fn(() => innerJoin());
    const fromMock = vi.fn((table: any) => {
      if (table === propertyListings || String(table).includes("property_listings")) {
        return { where: vi.fn().mockResolvedValue([]) };
      }
      return { innerJoin: vi.fn(() => ({ orderBy })) };
    });
    const fakeDb = {
      select: vi.fn(() => ({ from: fromMock })),
    };
    const getDbSpy = vi.spyOn(dbModule, "getDb").mockResolvedValue(fakeDb as any);
    const authenticateRequestSpy = vi.spyOn(sdk, "authenticateRequest").mockRejectedValue(new Error("No session"));

    const request = {
      protocol: "https",
      query: { admin_key: emergencyKey },
      headers: {},
    } as TrpcContext["req"];

    try {
      const ctx = await createContext({ req: request, res: {} as TrpcContext["res"] });
      const caller = appRouter.createCaller(ctx);
      const statuses = await caller.property.indexingStatus();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject({ propertyId: 450001, status: "sitemap_ready" });
    } finally {
      getDbSpy.mockRestore();
      authenticateRequestSpy.mockRestore();
    }
  });

  it("allows property create, update, and delete through admin_key/x-admin-key without an OAuth session", async () => {
    const previousSecret = process.env.ADMIN_SECRET_KEY;
    const emergencyKey = "emergency-regression-key";
    process.env.ADMIN_SECRET_KEY = emergencyKey;

    const insertValues = vi.fn();
    const insertOnDuplicateKeyUpdate = vi.fn().mockResolvedValue([]);
    const insertBuilder: any = {
      values: insertValues,
      onDuplicateKeyUpdate: insertOnDuplicateKeyUpdate,
      then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
        Promise.resolve([{ insertId: 420001 }]).then(resolve, reject),
    };
    insertValues.mockReturnValue(insertBuilder);
    const updateWhere = vi.fn().mockResolvedValue([]);
    const updateSet = vi.fn(() => ({ where: updateWhere }));
    const deleteWhere = vi.fn().mockResolvedValue([]);
    const selectLimit = vi.fn().mockResolvedValue([{ id: 420001, images: ["https://example.com/img1.jpg"], videoUrl: null, videoThumbnailUrl: null }]);
    const selectWhere = vi.fn(() => ({ limit: selectLimit }));
    const selectFrom = vi.fn(() => ({ where: selectWhere }));
    const fakeDb = {
      insert: vi.fn(() => insertBuilder),
      update: vi.fn(() => ({ set: updateSet })),
      delete: vi.fn(() => ({ where: deleteWhere })),
      select: vi.fn(() => ({ from: selectFrom })),
    };
    const getDbSpy = vi.spyOn(dbModule, "getDb").mockResolvedValue(fakeDb as any);
    const notifyOwnerSpy = vi.spyOn(notificationModule, "notifyOwner").mockResolvedValue(undefined);
    const authenticateRequestSpy = vi.spyOn(sdk, "authenticateRequest").mockRejectedValue(new Error("Tidak ada sesi OAuth"));

    const createRequest = {
      protocol: "https",
      query: { admin_key: emergencyKey },
      headers: {},
    } as TrpcContext["req"];
    const updateRequest = {
      protocol: "https",
      query: {},
      headers: { "x-admin-key": emergencyKey },
    } as TrpcContext["req"];

    try {
      const createContextResult = await createContext({ req: createRequest, res: {} as TrpcContext["res"] });
      const updateContextResult = await createContext({ req: updateRequest, res: {} as TrpcContext["res"] });
      expect(createContextResult.user).toMatchObject({ loginMethod: "emergency", role: "admin" });
      expect(updateContextResult.user).toMatchObject({ loginMethod: "emergency", role: "admin" });
      expect(authenticateRequestSpy).toHaveBeenCalledTimes(2);

      const createResult = await appRouter.createCaller(createContextResult).property.create(validDraft);
      expect(createResult).toMatchObject({ success: true, id: 420001 });

      const updateResult = await appRouter.createCaller(updateContextResult).property.update({ id: 420001, ...validDraft });
      expect(updateResult).toEqual({ success: true });

      const deleteResult = await appRouter.createCaller(updateContextResult).property.delete({ id: 420001 });
      expect(deleteResult).toEqual({ success: true });
      expect(fakeDb.insert).toHaveBeenCalledTimes(3);
      expect(fakeDb.update).toHaveBeenCalledTimes(2);
      expect(fakeDb.delete).toHaveBeenCalledTimes(2);
      expect(notifyOwnerSpy).toHaveBeenCalledTimes(1);
    } finally {
      getDbSpy.mockRestore();
      notifyOwnerSpy.mockRestore();
      authenticateRequestSpy.mockRestore();
      if (previousSecret === undefined) delete process.env.ADMIN_SECRET_KEY;
      else process.env.ADMIN_SECRET_KEY = previousSecret;
    }
  });
});
