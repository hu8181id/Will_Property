import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";
import sitemapHandler from "../api/sitemap";
import robotsHandler from "../api/robots";

type TestResponse = {
  headers: Record<string, string>;
  statusCode: number;
  body: string;
  setHeader: (name: string, value: string) => TestResponse;
  status: (code: number) => TestResponse;
  send: (body: string) => TestResponse;
};

function createResponse(): TestResponse {
  const response = {
    headers: {},
    statusCode: 200,
    body: "",
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(body: string) {
      this.body = body;
      return this;
    },
  } satisfies TestResponse;
  return response;
}

describe("public SEO endpoints", () => {
  it("canonicalizes preview sitemap URLs to Vercel production and includes active listing metadata", async () => {
    const listing = {
      id: 450123,
      slug: "rumah-modern-surabaya-450123",
      title: "Rumah Modern Surabaya",
      status: "active",
      updatedAt: new Date("2026-08-17T00:00:00.000Z"),
      createdAt: new Date("2026-08-16T00:00:00.000Z"),
      images: ["https://blob.vercel-storage.com/rumah-modern.jpg"],
    };
    const fakeDb = {
      select: vi.fn(() => ({
        from: vi.fn().mockResolvedValue([listing]),
      })),
    };
    vi.mocked(getDb).mockResolvedValue(fakeDb as any);

    const response = createResponse();
    await sitemapHandler({ headers: { host: "preview-branch.vercel.app" } } as any, response as any);

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("application/xml");
    expect(response.headers["cache-control"]).toContain("s-maxage=60");
    expect(response.body).toContain("https://primedeal-property.vercel.app/properti/rumah-modern-surabaya-450123");
    expect(response.body).toContain("<lastmod>2026-08-17T00:00:00.000Z</lastmod>");
    expect(response.body).toContain("https://blob.vercel-storage.com/rumah-modern.jpg");
    expect(response.body).not.toContain("preview-branch.vercel.app");
  });

  it("menyajikan robots.txt dengan sitemap canonical Vercel", async () => {
    const response = createResponse();
    await robotsHandler({ headers: { host: "3000-preview.manus.computer" } } as any, response as any);

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/plain");
    expect(response.body).toContain("Sitemap: https://primedeal-property.vercel.app/sitemap.xml");
    expect(response.body).not.toContain("manus.computer");
  });
});
