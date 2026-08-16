import { describe, expect, it } from "vitest";
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { normalizeStoredMediaUrl, normalizeStorageEndpoint, storageMediaUrl } from "./storage";

const requiredEnv = ["S3_ENDPOINT", "S3_BUCKET", "S3_KEY", "S3_SECRET"] as const;

describe("Backblaze B2 storage configuration", () => {
  it("normalizes a Backblaze hostname without a URL scheme", () => {
    expect(normalizeStorageEndpoint("s3.us-east-005.backblazeb2.com")).toBe(
      "https://s3.us-east-005.backblazeb2.com",
    );
  });

  it("preserves an HTTPS endpoint and removes trailing slashes", () => {
    expect(normalizeStorageEndpoint("https://s3.us-east-005.backblazeb2.com///")).toBe(
      "https://s3.us-east-005.backblazeb2.com",
    );
  });

  it("creates proxy media URLs instead of exposing a private object URL", () => {
    expect(storageMediaUrl("/properties/room photo.jpg")).toBe(
      "/manus-storage/properties/room%20photo.jpg",
    );
  });

  it("normalizes previously saved Backblaze object URLs to the media proxy", () => {
    const previousEndpoint = process.env.S3_ENDPOINT;
    const previousBucket = process.env.S3_BUCKET;
    process.env.S3_ENDPOINT = "https://s3.us-east-005.backblazeb2.com";
    process.env.S3_BUCKET = "primedeal-media";
    try {
      expect(normalizeStoredMediaUrl(
        "https://s3.us-east-005.backblazeb2.com/primedeal-media/properties/old-photo.jpg",
      )).toBe("/manus-storage/properties/old-photo.jpg");
      expect(normalizeStoredMediaUrl("https://cdn.example.com/photo.jpg")).toBe(
        "https://cdn.example.com/photo.jpg",
      );
    } finally {
      if (previousEndpoint === undefined) delete process.env.S3_ENDPOINT;
      else process.env.S3_ENDPOINT = previousEndpoint;
      if (previousBucket === undefined) delete process.env.S3_BUCKET;
      else process.env.S3_BUCKET = previousBucket;
    }
  });

  it.skipIf(process.env.RUN_EXTERNAL_STORAGE_TESTS !== "1")(
    "authenticates and can inspect the configured private bucket",
    async () => {
      const missing = requiredEnv.filter(key => !process.env[key]);
      expect(missing, `Missing storage environment variables: ${missing.join(", ")}`).toEqual([]);

      const endpoint = process.env.S3_ENDPOINT!;
      const bucket = process.env.S3_BUCKET!;
      const accessKeyId = process.env.S3_KEY!;
      const secretAccessKey = process.env.S3_SECRET!;

      const client = new S3Client({
        region: "us-east-005",
        endpoint,
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
      });

      const response = await client.send(new HeadBucketCommand({ Bucket: bucket }));
      expect(response.$metadata.httpStatusCode).toBe(200);
    },
    30_000,
  );
});

// This test intentionally performs no upload, delete, or public-access change.
// It only verifies that the supplied staging credentials can reach the bucket.
// Set RUN_EXTERNAL_STORAGE_TESTS=1 to opt into the external-network check.
