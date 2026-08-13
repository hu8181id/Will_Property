import express from "express";
import type { Server } from "http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  storagePut: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({
  sdk: { authenticateRequest: mocks.authenticateRequest },
}));

vi.mock("./storage", () => ({
  storagePut: mocks.storagePut,
}));

import { registerPropertyVideoUploadRoute } from "./propertyVideoUpload";

describe("property video binary upload route", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    mocks.authenticateRequest.mockReset();
    mocks.storagePut.mockReset();
    const app = express();
    registerPropertyVideoUploadRoute(app, { maxBytes: 4 });
    server = await new Promise<Server>((resolve) => {
      const started = app.listen(0, "127.0.0.1", () => resolve(started));
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Server test tidak dapat dimulai.");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  it("menyimpan MP4 biner admin ke storage dan mengembalikan URL video", async () => {
    mocks.authenticateRequest.mockResolvedValue({ role: "admin" });
    mocks.storagePut.mockResolvedValue({ url: "/manus-storage/properties/videos/tur.mp4" });
    const body = new Uint8Array([1, 2, 3, 4]);

    const response = await fetch(`${baseUrl}/api/property-video-upload`, {
      method: "POST",
      headers: {
        "Content-Type": "video/mp4",
        "X-Primedeal-File-Name": encodeURIComponent("tur properti.mp4"),
      },
      body,
    });

    await expect(response.json()).resolves.toEqual({ success: true, url: "/manus-storage/properties/videos/tur.mp4" });
    expect(response.status).toBe(201);
    expect(mocks.storagePut).toHaveBeenCalledWith(
      expect.stringMatching(/^properties\/videos\/\d+-tur-properti\.mp4$/),
      expect.anything(),
      "video/mp4",
    );
    expect(mocks.storagePut.mock.calls[0][1].byteLength).toBe(4);
  });

  it("menolak pengguna tanpa sesi admin sebelum menyimpan video", async () => {
    mocks.authenticateRequest.mockRejectedValue(new Error("Sesi tidak valid"));

    const response = await fetch(`${baseUrl}/api/property-video-upload`, {
      method: "POST",
      headers: { "Content-Type": "video/mp4" },
      body: new Uint8Array([1]),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Hanya admin yang dapat mengunggah video properti." });
    expect(mocks.storagePut).not.toHaveBeenCalled();
  });

  it("menolak Content-Type yang tidak didukung pada endpoint", async () => {
    mocks.authenticateRequest.mockResolvedValue({ role: "admin" });

    const response = await fetch(`${baseUrl}/api/property-video-upload`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: new Uint8Array([1]),
    });

    expect(response.status).toBe(415);
    expect(mocks.storagePut).not.toHaveBeenCalled();
  });

  it("menolak video yang melebihi batas ukuran endpoint", async () => {
    mocks.authenticateRequest.mockResolvedValue({ role: "admin" });

    const response = await fetch(`${baseUrl}/api/property-video-upload`, {
      method: "POST",
      headers: { "Content-Type": "video/mp4" },
      body: new Uint8Array([1, 2, 3, 4, 5]),
    });

    expect(response.status).toBe(413);
    expect(mocks.storagePut).not.toHaveBeenCalled();
  });
});
