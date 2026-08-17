import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizePropertyVideoContentType, uploadPropertyVideo } from "./propertyVideoUpload";

const { uploadToVercelBlobMock } = vi.hoisted(() => ({
  uploadToVercelBlobMock: vi.fn(),
}));

vi.mock("./vercelBlobClient", () => ({
  uploadToVercelBlob: uploadToVercelBlobMock,
}));

describe("normalizePropertyVideoContentType", () => {
  it("menerima MIME Android dan menghapus parameter codec", () => {
    expect(normalizePropertyVideoContentType("video/mp4; codecs=avc1", "listing.mp4")).toBe("video/mp4");
    expect(normalizePropertyVideoContentType("video/3gpp", "listing.3gp")).toBe("video/3gpp");
    expect(normalizePropertyVideoContentType("video/x-m4v", "listing.m4v")).toBe("video/x-m4v");
  });

  it("menggunakan ekstensi saat browser Android mengirim MIME kosong atau generik", () => {
    expect(normalizePropertyVideoContentType("", "listing.mp4")).toBe("video/mp4");
    expect(normalizePropertyVideoContentType("application/octet-stream", "listing.3gp")).toBe("video/3gpp");
    expect(normalizePropertyVideoContentType(undefined, "listing.mov")).toBe("video/quicktime");
  });

  it("menolak format yang tidak didukung", () => {
    expect(normalizePropertyVideoContentType("video/x-matroska", "listing.mkv")).toBeUndefined();
    expect(normalizePropertyVideoContentType(undefined, "listing.txt")).toBeUndefined();
  });
});

describe("uploadPropertyVideo", () => {
  beforeEach(() => {
    uploadToVercelBlobMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mengunggah video langsung ke Vercel Blob dan meneruskan progres", async () => {
    uploadToVercelBlobMock.mockImplementation(async (_file: File, onProgress?: (percent: number) => void) => {
      onProgress?.(45);
      return "https://media.public.blob.vercel-storage.com/properties/uploads/videos/tur.mp4";
    });
    const file = new File([new Uint8Array([1, 2, 3])], "tur-properti.mp4", { type: "video/mp4" });
    const onProgress = vi.fn();

    await expect(uploadPropertyVideo(file, onProgress)).resolves.toBe("https://media.public.blob.vercel-storage.com/properties/uploads/videos/tur.mp4");
    expect(uploadToVercelBlobMock).toHaveBeenCalledWith(file, expect.any(Function));
    expect(onProgress).toHaveBeenNthCalledWith(1, 45);
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it("mengirim MIME canonical untuk video 3GP dari Android ke Blob", async () => {
    uploadToVercelBlobMock.mockResolvedValue("https://media.public.blob.vercel-storage.com/properties/uploads/videos/tur.3gp");
    const file = new File(["video"], "tur-properti.3gp", { type: "application/octet-stream" });

    await uploadPropertyVideo(file);

    expect(uploadToVercelBlobMock).toHaveBeenCalledWith(expect.objectContaining({ name: "tur-properti.3gp", type: "video/3gpp" }), expect.any(Function));
  });

  it("menampilkan pesan upload Blob saat token client ditolak", async () => {
    uploadToVercelBlobMock.mockRejectedValue(new Error("Vercel Blob: gagal membuat token upload."));
    const file = new File(["video-biner"], "tur-properti.mp4", { type: "video/mp4" });

    await expect(uploadPropertyVideo(file)).rejects.toThrow("gagal membuat token upload");
  });

  it("menolak format video yang tidak didukung sebelum mencoba upload Blob", async () => {
    const file = new File(["video-biner"], "tur-properti.mkv", { type: "video/x-matroska" });

    await expect(uploadPropertyVideo(file)).rejects.toThrow("Video harus berformat");
    expect(uploadToVercelBlobMock).not.toHaveBeenCalled();
  });
});
