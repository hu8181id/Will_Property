import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { propertyDraftSchema, propertyFilterSchema } from "./routers/property";
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
};

describe("property listing contracts", () => {
  it("applies the default transaction type and rejects listings without images", () => {
    const parsed = propertyDraftSchema.parse({ ...validDraft, transactionType: undefined });
    expect(parsed.transactionType).toBe("dijual");
    expect(() => propertyDraftSchema.parse({ ...validDraft, images: [] })).toThrow();
    expect(propertyDraftSchema.parse({ ...validDraft, images: ["1", "2", "3", "4", "5"] }).images).toHaveLength(5);
    expect(() => propertyDraftSchema.parse({ ...validDraft, images: ["1", "2", "3", "4", "5", "6"] })).toThrow();
  });

  it("normalizes the filter contract with a stable default sort", () => {
    expect(propertyFilterSchema.parse({})).toEqual({ sortBy: "terbaru" });
    expect(propertyFilterSchema.parse({ priceMin: 500000000, sortBy: "harga-rendah" })).toMatchObject({
      priceMin: 500000000,
      sortBy: "harga-rendah",
    });
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

  it("protects listing mutations and uploads behind authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.property.create(validDraft)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.property.update({ id: 1, ...validDraft })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.property.delete({ id: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.property.uploadImage({ fileName: "foto.jpg", base64Data: "data:image/jpeg;base64,AA==", contentType: "image/jpeg" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
