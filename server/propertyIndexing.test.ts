import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";
import { buildPropertyPublicUrl, enqueuePropertyIndexing } from "./propertyIndexing";

const getDbMock = vi.mocked(getDb);

describe("property indexing discovery queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds a stable Vercel canonical URL from a listing slug", () => {
    expect(buildPropertyPublicUrl({ id: 450001, title: "Rumah Lama", slug: "rumah-baru-450001" }, "https://preview-branch.vercel.app"))
      .toBe("https://primedeal-property.vercel.app/properti/rumah-baru-450001");
  });

  it("upserts a listing as sitemap-ready without claiming Google indexed it", async () => {
    const onDuplicateKeyUpdate = vi.fn().mockResolvedValue([]);
    const values = vi.fn(() => ({ onDuplicateKeyUpdate }));
    const fakeDb = { insert: vi.fn(() => ({ values })) };
    getDbMock.mockResolvedValue(fakeDb as any);

    const result = await enqueuePropertyIndexing({
      id: 450001,
      title: "Rumah Modern Surabaya",
      slug: "rumah-modern-surabaya-450001",
    });

    expect(result).toMatchObject({
      propertyId: 450001,
      url: "https://primedeal-property.vercel.app/properti/rumah-modern-surabaya-450001",
      status: "sitemap_ready",
    });
    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      propertyId: 450001,
      status: "sitemap_ready",
      attempts: 0,
      lastError: null,
      lastProcessedAt: expect.any(Date),
    }));
    expect(onDuplicateKeyUpdate).toHaveBeenCalledWith(expect.objectContaining({
      set: expect.objectContaining({ status: "sitemap_ready", attempts: 0, lastError: null }),
    }));
  });
});
