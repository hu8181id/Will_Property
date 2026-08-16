import { describe, expect, it } from "vitest";
import { hasEmergencyAdminKey, MAX_PROPERTY_VIDEO_BYTES, validatePropertyVideoUpload } from "./propertyVideoUpload";

describe("validatePropertyVideoUpload", () => {
  it("menerima kunci darurat yang benar melalui query atau header", () => {
    const previousSecret = process.env.ADMIN_SECRET_KEY;
    process.env.ADMIN_SECRET_KEY = "emergency-key-123";
    try {
      expect(hasEmergencyAdminKey({ query: { admin_key: "emergency-key-123" }, headers: {} } as any)).toBe(true);
      expect(hasEmergencyAdminKey({ query: {}, headers: { "x-admin-key": "emergency-key-123" } } as any)).toBe(true);
      expect(hasEmergencyAdminKey({ query: { admin_key: "wrong-key" }, headers: {} } as any)).toBe(false);
    } finally {
      if (previousSecret === undefined) delete process.env.ADMIN_SECRET_KEY;
      else process.env.ADMIN_SECRET_KEY = previousSecret;
    }
  });

  it("menerima MP4 biner yang berada di bawah batas 50 MB", () => {
    expect(validatePropertyVideoUpload("video/mp4", 34_055_487)).toEqual({
      ok: true,
      contentType: "video/mp4",
    });
  });

  it("menolak format atau ukuran video yang tidak aman", () => {
    expect(validatePropertyVideoUpload("application/octet-stream", 100)).toMatchObject({
      ok: false,
      status: 415,
    });
    expect(validatePropertyVideoUpload("video/mp4", MAX_PROPERTY_VIDEO_BYTES + 1)).toMatchObject({
      ok: false,
      status: 413,
    });
  });
});
