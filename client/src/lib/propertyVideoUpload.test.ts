import { afterEach, describe, expect, it, vi } from "vitest";
import { COOKIE_NAME } from "@shared/const";
import { uploadPropertyVideo } from "./propertyVideoUpload";

describe("uploadPropertyVideo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("membagi video menjadi beberapa bagian lalu menyelesaikannya melalui server", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ sessionId: "session-1", chunkBytes: 2, totalChunks: 2 }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "/manus-storage/properties/videos/tur.mp4" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File([new Uint8Array([1, 2, 3])], "tur-properti.mp4", { type: "video/mp4" });

    await expect(uploadPropertyVideo(file)).resolves.toBe("/manus-storage/properties/videos/tur.mp4");
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/property-video-upload-sessions",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ contentType: "video/mp4", fileName: "tur-properti.mp4", size: 3 }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/property-video-upload-sessions/session-1/chunks/0",
      expect.objectContaining({ method: "POST", credentials: "include", headers: expect.objectContaining({ "Content-Type": "video/mp4" }) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/property-video-upload-sessions/session-1/chunks/1",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/property-video-upload-sessions/session-1/complete",
      expect.objectContaining({ method: "POST", body: "{}" }),
    );
  });

  it("meneruskan sesi fallback WebView sebagai Bearer token pada semua tahap", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ sessionId: "session-1", chunkBytes: 8, totalChunks: 1 }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "/manus-storage/properties/videos/tur.mp4" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn().mockReturnValue(`${COOKIE_NAME}=token-webview-admin; Path=/; SameSite=None`),
    });
    const file = new File(["video"], "tur-properti.mp4", { type: "video/mp4" });

    await uploadPropertyVideo(file);

    for (const call of fetchMock.mock.calls) {
      expect(call[1]?.headers).toEqual(expect.objectContaining({ Authorization: "Bearer token-webview-admin" }));
    }
  });

  it("menampilkan pesan server saat sesi unggah ditolak", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Ukuran video maksimal 50 MB." }), { status: 413 })));
    const file = new File(["video-biner"], "tur-properti.mp4", { type: "video/mp4" });

    await expect(uploadPropertyVideo(file)).rejects.toThrow("Ukuran video maksimal 50 MB.");
  });
});
