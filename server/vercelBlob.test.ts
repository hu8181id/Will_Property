import { describe, it, expect } from "vitest";
import { normalizeStoredMediaUrl } from "./storage";

describe("Vercel Blob URL Persistence", () => {
  it("preserves Vercel Blob public URLs without converting them to local proxy paths", () => {
    const blobUrl = "https://abc123xyz.public.blob.vercel-storage.com/properties/test-image-12345.jpg";
    const normalized = normalizeStoredMediaUrl(blobUrl);
    expect(normalized).toBe(blobUrl);
  });

  it("preserves standard external http/https image URLs", () => {
    const externalUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2";
    expect(normalizeStoredMediaUrl(externalUrl)).toBe(externalUrl);
  });
});
