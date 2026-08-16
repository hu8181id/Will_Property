import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../server/storage", () => ({
  storageGetSignedUrl: vi.fn(),
}));

import handler from "./media";
import { storageGetSignedUrl } from "../server/storage";

function createResponse() {
  const headers = new Map<string, string>();
  return {
    headers,
    statusCode: 200,
    body: "",
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string) {
      headers.set(name, value);
    },
    end(body?: string) {
      this.body = body ?? "";
    },
  };
}

describe("Vercel media proxy", () => {
  afterEach(() => {
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_BUCKET;
    delete process.env.S3_KEY;
    delete process.env.S3_SECRET;
    vi.clearAllMocks();
  });

  it("redirects Backblaze media keys to a signed URL", async () => {
    process.env.S3_ENDPOINT = "https://s3.us-east-005.backblazeb2.com";
    process.env.S3_BUCKET = "primedeal-media";
    process.env.S3_KEY = "test-key";
    process.env.S3_SECRET = "test-secret";
    vi.mocked(storageGetSignedUrl).mockResolvedValue("https://signed.example.com/private-photo.jpg");
    const response = createResponse();

    await handler({ query: { path: "properties/private-photo.jpg" } }, response);

    expect(storageGetSignedUrl).toHaveBeenCalledWith("properties/private-photo.jpg");
    expect(response.statusCode).toBe(307);
    expect(response.headers.get("Location")).toBe("https://signed.example.com/private-photo.jpg");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
  });

  it("rejects a missing media path", async () => {
    const response = createResponse();

    await handler({ query: {} }, response);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe("Missing media path");
  });
});
