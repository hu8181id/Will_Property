import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadPropertyVideo } from "./propertyVideoUpload";

describe("uploadPropertyVideo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mengirim video biner ke endpoint terproteksi tanpa Base64", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ url: "/manus-storage/properties/videos/tur.mp4" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["video-biner"], "tur-properti.mp4", { type: "video/mp4" });

    await expect(uploadPropertyVideo(file)).resolves.toBe("/manus-storage/properties/videos/tur.mp4");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/property-video-upload",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: file,
        headers: expect.objectContaining({ "Content-Type": "video/mp4" }),
      }),
    );
  });

  it("menampilkan pesan server saat unggah video ditolak", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Ukuran video maksimal 50 MB." }), { status: 413 })));
    const file = new File(["video-biner"], "tur-properti.mp4", { type: "video/mp4" });

    await expect(uploadPropertyVideo(file)).rejects.toThrow("Ukuran video maksimal 50 MB.");
  });
});
