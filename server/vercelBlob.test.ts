import { describe, it, expect } from "vitest";
import { normalizeStoredMediaUrl } from "./storage";
import { isVercelBlobUrl } from "../client/src/lib/vercelBlobClient";

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

  it("identifies only public Vercel Blob URLs for Blob deletion", () => {
    expect(isVercelBlobUrl("https://abc123.public.blob.vercel-storage.com/properties/uploads/images/photo.jpg")).toBe(true);
    expect(isVercelBlobUrl("/manus-storage/properties/legacy-photo.jpg")).toBe(false);
    expect(isVercelBlobUrl("data:image/jpeg;base64,abc")).toBe(false);
  });
});
