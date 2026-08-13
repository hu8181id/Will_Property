import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { propertyDraftSchema, propertyFilterSchema, reviewDraftSchema, reviewModerationSchema } from "./routers/property";
import type { TrpcContext } from "./_core/context";

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
});
