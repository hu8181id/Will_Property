import { afterEach, describe, expect, it, vi } from "vitest";
import { COOKIE_NAME } from "@shared/const";
import { normalizePropertyVideoContentType, uploadPropertyVideo } from "./propertyVideoUpload";

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
    const onProgress = vi.fn();

    await expect(uploadPropertyVideo(file, onProgress)).resolves.toBe("/manus-storage/properties/videos/tur.mp4");
    expect(onProgress).toHaveBeenNthCalledWith(1, 0);
    expect(onProgress).toHaveBeenNthCalledWith(2, 50);
    expect(onProgress).toHaveBeenNthCalledWith(3, 100);
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

  it("meneruskan admin_key sebagai header bypass pada semua tahap", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ sessionId: "session-1", chunkBytes: 8, totalChunks: 1 }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "/manus-storage/properties/videos/tur.mp4" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState({}, "", "/manage-listings?admin_key=emergency-key-123");
    const file = new File(["video"], "tur-properti.mp4", { type: "video/mp4" });

    await uploadPropertyVideo(file);

    for (const call of fetchMock.mock.calls) {
      expect(call[1]?.headers).toEqual(expect.objectContaining({ "x-admin-key": "emergency-key-123" }));
    }
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

  it("mengirim MIME canonical untuk video 3GP dari Android", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ sessionId: "session-3gp", chunkBytes: 8, totalChunks: 1 }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "/manus-storage/properties/videos/tur.3gp" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["video"], "tur-properti.3gp", { type: "application/octet-stream" });

    await uploadPropertyVideo(file);

    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({ contentType: "video/3gpp", fileName: "tur-properti.3gp", size: 5 }),
    );
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toEqual(
      expect.objectContaining({ "Content-Type": "video/3gpp" }),
    );
  });

  it("menampilkan pesan server saat sesi unggah ditolak", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Ukuran video maksimal 50 MB." }), { status: 413 })));
    const file = new File(["video-biner"], "tur-properti.mp4", { type: "video/mp4" });

    await expect(uploadPropertyVideo(file)).rejects.toThrow("Ukuran video maksimal 50 MB.");
  });
});
