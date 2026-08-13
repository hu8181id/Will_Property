import { afterEach, describe, expect, it, vi } from "vitest";
import { COOKIE_NAME } from "@shared/const";
import { uploadPropertyVideo } from "./propertyVideoUpload";

describe("uploadPropertyVideo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mengirim video biner ke endpoint terproteksi tanpa Base64", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "/manus-storage/properties/videos/tur.mp4", uploadUrl: "https://storage.example/upload" }), { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["video-biner"], "tur-properti.mp4", { type: "video/mp4" });

    await expect(uploadPropertyVideo(file)).resolves.toBe("/manus-storage/properties/videos/tur.mp4");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/property-video-upload-ticket",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ contentType: "video/mp4", fileName: "tur-properti.mp4", size: file.size }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
    expect(fetchMock).toHaveBeenLastCalledWith("https://storage.example/upload", expect.objectContaining({ method: "PUT", body: file }));
  });

  it("meneruskan sesi fallback WebView sebagai Bearer token", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "/manus-storage/properties/videos/tur.mp4", uploadUrl: "https://storage.example/upload" }), { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn().mockReturnValue(`${COOKIE_NAME}=token-webview-admin; Path=/; SameSite=None`),
    });
    const file = new File(["video-biner"], "tur-properti.mp4", { type: "video/mp4" });

    await uploadPropertyVideo(file);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/property-video-upload-ticket",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-webview-admin" }),
      }),
    );
  });

  it("menampilkan pesan server saat unggah video ditolak", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Ukuran video maksimal 50 MB." }), { status: 413 })));
    const file = new File(["video-biner"], "tur-properti.mp4", { type: "video/mp4" });

    await expect(uploadPropertyVideo(file)).rejects.toThrow("Ukuran video maksimal 50 MB.");
  });
});
