import { describe, it, expect, vi } from "vitest";

vi.mock("@vercel/blob", () => ({
  del: vi.fn().mockResolvedValue(undefined),
  put: vi.fn().mockResolvedValue({ url: "https://blob.vercel-storage.com/mock.jpg" }),
}));
vi.mock("./whatsappMeta", () => ({
  sendWhatsAppAgentNotification: vi.fn(),
}));
import * as dbModule from "./db";
import * as whatsappMetaModule from "./whatsappMeta";
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

    expect(propertyDraftSchema.parse(validDraft).videoUrl).toBe("https://cdn.example.com/property.mp4");
    expect(propertyDraftSchema.parse(validDraft).videoThumbnailUrl).toBe("/manus-storage/property-video-cover.jpg");
    expect(propertyDraftSchema.parse(validDraft).virtualTourUrl).toContain("matterport.com");
    expect(() => propertyDraftSchema.parse({ ...validDraft, videoThumbnailUrl: "javascript:alert(1)" })).toThrow();
    expect(() => propertyDraftSchema.parse({ ...validDraft, virtualTourUrl: "javascript:alert(1)" })).toThrow();
  });

  it("normalizes the filter contract with optional filters", () => {
    expect(propertyFilterSchema.parse({})).toEqual({});
    expect(propertyFilterSchema.parse({ minPrice: 500000000, sortBy: "terbaru" })).toMatchObject({
      minPrice: 500000000,
      sortBy: "terbaru",
    });
  });

  it("validates review content", () => {
    expect(reviewDraftSchema.parse({
      propertyId: 7,
      authorName: "  Andi  ",
      rating: 5,
      comment: "  Lokasi sangat strategis.  ",
    })).toMatchObject({ authorName: "Andi", comment: "Lokasi sangat strategis." });
    expect(() => reviewDraftSchema.parse({ propertyId: 7, authorName: "A", rating: 5, comment: "Bagus" })).toThrow();
    expect(() => reviewDraftSchema.parse({ propertyId: 7, authorName: "Andi", rating: 6, comment: "Bagus sekali" })).toThrow();
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

      const statusResult = await appRouter.createCaller(updateContextResult).property.updateStatus({ id: 420001, status: "sold" });
      expect(statusResult).toEqual({ success: true });

      const deleteResult = await appRouter.createCaller(updateContextResult).property.delete({ id: 420001 });
      expect(deleteResult).toEqual({ success: true });
      expect(fakeDb.insert).toHaveBeenCalledTimes(3);
      expect(fakeDb.update).toHaveBeenCalledTimes(3);
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

  describe("WhatsApp lead procedures", () => {
    it("records a lead and persists the Meta delivery status and message id", async () => {
      const insertValues = vi.fn().mockResolvedValue([]);
      const limit = vi.fn().mockResolvedValue([{ id: 450001, title: "Rumah Surabaya" }]);
      const where = vi.fn(() => ({ limit }));
      const from = vi.fn(() => ({ where }));
      const fakeDb = {
        select: vi.fn(() => ({ from })),
        insert: vi.fn(() => ({ values: insertValues })),
      };
      const getDbSpy = vi.spyOn(dbModule, "getDb").mockResolvedValue(fakeDb as any);
      const notifySpy = vi.spyOn(whatsappMetaModule, "sendWhatsAppAgentNotification").mockResolvedValue({
        deliveryStatus: "sent",
        whatsappMessageId: "wamid.test-123",
      });

      try {
        const caller = appRouter.createCaller(createPublicContext());
        const result = await caller.property.recordWhatsAppLead({
          propertyId: 450001,
          visitorId: "visitor-test",
          path: "/properti/rumah-surabaya-450001",
        });

        expect(result).toEqual({
          success: true,
          logged: true,
          propertyId: 450001,
          deliveryStatus: "sent",
        });
        expect(notifySpy).toHaveBeenCalledWith({
          propertyId: 450001,
          propertyTitle: "Rumah Surabaya",
          visitorId: "visitor-test",
          path: "/properti/rumah-surabaya-450001",
        });
        expect(insertValues).toHaveBeenCalledWith(expect.objectContaining({
          propertyId: 450001,
          propertyTitle: "Rumah Surabaya",
          deliveryStatus: "sent",
          deliveryError: null,
          whatsappMessageId: "wamid.test-123",
        }));
      } finally {
        getDbSpy.mockRestore();
        notifySpy.mockRestore();
      }
    });

    it("does not log a lead when the requested property is not active or missing", async () => {
      const insertValues = vi.fn().mockResolvedValue([]);
      const limit = vi.fn().mockResolvedValue([]);
      const where = vi.fn(() => ({ limit }));
      const from = vi.fn(() => ({ where }));
      const fakeDb = {
        select: vi.fn(() => ({ from })),
        insert: vi.fn(() => ({ values: insertValues })),
      };
      const getDbSpy = vi.spyOn(dbModule, "getDb").mockResolvedValue(fakeDb as any);
      const notifySpy = vi.spyOn(whatsappMetaModule, "sendWhatsAppAgentNotification");

      try {
        const caller = appRouter.createCaller(createPublicContext());
        const result = await caller.property.recordWhatsAppLead({ propertyId: 999999 });
        expect(result).toEqual({ success: false, logged: false });
        expect(notifySpy).not.toHaveBeenCalled();
        expect(insertValues).not.toHaveBeenCalled();
      } finally {
        getDbSpy.mockRestore();
        notifySpy.mockRestore();
      }
    });

    it("lists recent leads for an authenticated emergency admin", async () => {
      const previousSecret = process.env.ADMIN_SECRET_KEY;
      const emergencyKey = "lead-test-admin-key";
      process.env.ADMIN_SECRET_KEY = emergencyKey;
      const expectedRows = [{
        id: 1,
        propertyId: 450001,
        propertyTitle: "Rumah Surabaya",
        deliveryStatus: "sent",
        whatsappMessageId: "wamid.test-123",
      }];
      const limit = vi.fn().mockResolvedValue(expectedRows);
      const orderBy = vi.fn(() => ({ limit }));
      const from = vi.fn(() => ({ orderBy }));
      const fakeDb = { select: vi.fn(() => ({ from })) };
      const getDbSpy = vi.spyOn(dbModule, "getDb").mockResolvedValue(fakeDb as any);
      const authenticateRequestSpy = vi.spyOn(sdk, "authenticateRequest").mockRejectedValue(new Error("Tidak ada sesi OAuth"));

      try {
        const ctx = await createContext({
          req: {
            protocol: "https",
            query: { admin_key: emergencyKey },
            headers: {},
          } as TrpcContext["req"],
          res: {} as TrpcContext["res"],
        });
        const result = await appRouter.createCaller(ctx).property.listWhatsAppLeads();
        expect(result).toEqual(expectedRows);
        expect(limit).toHaveBeenCalledWith(50);
      } finally {
        getDbSpy.mockRestore();
        authenticateRequestSpy.mockRestore();
        if (previousSecret === undefined) delete process.env.ADMIN_SECRET_KEY;
        else process.env.ADMIN_SECRET_KEY = previousSecret;
      }
    });
  });
});
