import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadPropertyVideo } from "./propertyVideoUpload";
import { uploadToVercelBlob } from "./vercelBlobClient";

vi.mock("./vercelBlobClient", () => ({
  uploadToVercelBlob: vi.fn(),
}));

describe("uploadPropertyVideo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("mengunggah video langsung ke Vercel Blob dan mengembalikan URL permanen", async () => {
    vi.mocked(uploadToVercelBlob).mockResolvedValue("https://store.public.blob.vercel-storage.com/properties/uploads/videos/tur.mp4");
    const file = new File([new Uint8Array([1, 2, 3])], "tur-properti.mp4", { type: "video/mp4" });
    const onProgress = vi.fn();

    await expect(uploadPropertyVideo(file, onProgress)).resolves.toBe("https://store.public.blob.vercel-storage.com/properties/uploads/videos/tur.mp4");
    expect(uploadToVercelBlob).toHaveBeenCalledWith(file, expect.any(Function));
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it("menormalkan MIME kosong berdasarkan ekstensi sebelum mengunggah", async () => {
    vi.mocked(uploadToVercelBlob).mockResolvedValue("https://store.public.blob.vercel-storage.com/properties/uploads/videos/tur.m4v");
    const file = new File(["video"], "tur-properti.m4v", { type: "" });

    await uploadPropertyVideo(file);

    const normalizedFile = vi.mocked(uploadToVercelBlob).mock.calls[0][0];
    expect(normalizedFile.type).toBe("video/x-m4v");
  });

  it("menolak video dengan format atau ukuran yang tidak valid sebelum upload", async () => {
    await expect(uploadPropertyVideo(new File(["not-video"], "dokumen.pdf", { type: "application/pdf" }))).rejects.toThrow("Video harus berformat");
    const tooLarge = new File([new Uint8Array(50 * 1024 * 1024 + 1)], "terlalu-besar.mp4", { type: "video/mp4" });
    await expect(uploadPropertyVideo(tooLarge)).rejects.toThrow("Ukuran video maksimal 50 MB.");
    expect(uploadToVercelBlob).not.toHaveBeenCalled();
  });

  it("meneruskan pesan kegagalan dari Vercel Blob", async () => {
    vi.mocked(uploadToVercelBlob).mockRejectedValue(new Error("Token upload tidak valid"));
    await expect(uploadPropertyVideo(new File(["video"], "tur.mp4", { type: "video/mp4" }))).rejects.toThrow("Token upload tidak valid");
  });
});
