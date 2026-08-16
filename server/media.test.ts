
import { vi, describe, it, expect, afterEach } from "vitest";

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class MockS3Client {
    config: unknown;
    constructor(config: unknown) {
      this.config = config;
    }
  },
  GetObjectCommand: class MockGetObjectCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  },
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import handler from "../api/media";

const mockedGetSignedUrl = vi.mocked(getSignedUrl);

describe("Vercel media proxy", () => {
  afterEach(() => {
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_BUCKET;
    delete process.env.S3_KEY;
    delete process.env.S3_SECRET;
    delete process.env.S3_REGION;
    delete process.env.BUILT_IN_FORGE_API_URL;
    delete process.env.BUILT_IN_FORGE_API_KEY;
    vi.clearAllMocks();
  });

  it("redirects Backblaze media keys to a signed URL without importing server/storage", async () => {
    process.env.S3_ENDPOINT = "https://s3.us-east-005.backblazeb2.com";
    process.env.S3_BUCKET = "primedeal-media";
    process.env.S3_KEY = "test-key";
    process.env.S3_SECRET = "test-secret";
    mockedGetSignedUrl.mockResolvedValue("https://signed.example.com/private-photo.jpg");

    const response = await handler(
      new Request("https://example.com/api/media?path=properties%2Fprivate-photo.jpg"),
    );

    expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
    const command = mockedGetSignedUrl.mock.calls[0]?.[1] as { input: Record<string, string> };
    expect(command.input).toEqual({
      Bucket: "primedeal-media",
      Key: "properties/private-photo.jpg",
    });
    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toBe(
      "https://signed.example.com/private-photo.jpg",
    );
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
  });

  it("extracts a media key from the rewritten manus-storage pathname", async () => {
    process.env.S3_ENDPOINT = "s3.us-east-005.backblazeb2.com";
    process.env.S3_BUCKET = "primedeal-media";
    process.env.S3_KEY = "test-key";
    process.env.S3_SECRET = "test-secret";
    mockedGetSignedUrl.mockResolvedValue("https://signed.example.com/photo.jpg");

    const response = await handler(
      new Request("https://example.com/manus-storage/properties/photo%20one.jpg"),
    );

    expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
    const command = mockedGetSignedUrl.mock.calls[0]?.[1] as { input: Record<string, string> };
    expect(command.input.Key).toBe("properties/photo one.jpg");
    expect(response.status).toBe(307);
  });

  it("falls back to public URL when S3 signing fails", async () => {
    process.env.S3_BUCKET = "primedeal-media";
    process.env.S3_KEY = "test-key";
    process.env.S3_SECRET = "test-secret";
    mockedGetSignedUrl.mockRejectedValue(new Error("Signing failed"));

    const response = await handler(
      new Request("https://example.com/manus-storage/properties/fallback.jpg"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toContain("/manus-storage/properties/fallback.jpg");
  });
});
