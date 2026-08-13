import { describe, expect, it } from "vitest";
import { MAX_PROPERTY_VIDEO_BYTES, validatePropertyVideoUpload } from "./propertyVideoUpload";

describe("validatePropertyVideoUpload", () => {
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
