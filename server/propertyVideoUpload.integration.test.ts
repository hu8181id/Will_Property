import express from "express";
import type { Server } from "http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  createSession: vi.fn(),
  getSession: vi.fn(),
  saveChunkKey: vi.fn(),
  setCompletedUrl: vi.fn(),
  storagePut: vi.fn(),
  storageGetSignedUrl: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./db", () => ({
  createPropertyVideoUploadSession: mocks.createSession,
  getPropertyVideoUploadSession: mocks.getSession,
  savePropertyVideoChunkKey: mocks.saveChunkKey,
  setPropertyVideoUploadCompletedUrl: mocks.setCompletedUrl,
}));
vi.mock("./storage", () => ({
  storagePut: mocks.storagePut,
  storageGetSignedUrl: mocks.storageGetSignedUrl,
}));

import { registerPropertyVideoUploadRoute } from "./propertyVideoUpload";

describe("property video chunk upload routes", () => {
  let server: Server;
  let baseUrl: string;
  let session: any;

  beforeEach(async () => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    session = undefined;
    mocks.createSession.mockImplementation(async (input) => {
      session = { ...input, chunkKeys: {}, completedUrl: null };
    });
    mocks.getSession.mockImplementation(async () => session);
    mocks.saveChunkKey.mockImplementation(async (_id, index, key) => {
      session.chunkKeys[String(index)] = key;
      return session;
    });
    const app = express();
    registerPropertyVideoUploadRoute(app, { maxBytes: 4, chunkBytes: 2 });
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

  it("membuat sesi admin, menyimpan setiap chunk, lalu menggabungkannya menjadi video listing", async () => {
    mocks.authenticateRequest.mockResolvedValue({ role: "admin" });
    mocks.storagePut
      .mockResolvedValueOnce({ key: "parts/0", url: "/manus-storage/parts/0" })
      .mockResolvedValueOnce({ key: "parts/1", url: "/manus-storage/parts/1" })
      .mockResolvedValueOnce({ key: "properties/videos/final.mp4", url: "/manus-storage/properties/videos/final.mp4" });
    mocks.storageGetSignedUrl
      .mockResolvedValueOnce("data:application/octet-stream;base64,AQI=")
      .mockResolvedValueOnce("data:application/octet-stream;base64,AwQ=");

    const create = await fetch(`${baseUrl}/api/property-video-upload-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "video/mp4", fileName: "tur properti.mp4", size: 4 }),
    });
    expect(create.status).toBe(201);
    const { sessionId } = await create.json();

    for (const [index, body] of [[0, [1, 2]], [1, [3, 4]]] as const) {
      const upload = await fetch(`${baseUrl}/api/property-video-upload-sessions/${sessionId}/chunks/${index}`, {
        method: "POST",
        headers: { "Content-Type": "video/mp4" },
        body: new Uint8Array(body),
      });
      expect(upload.status).toBe(201);
    }

    const complete = await fetch(`${baseUrl}/api/property-video-upload-sessions/${sessionId}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    expect(complete.status).toBe(201);
    await expect(complete.json()).resolves.toEqual({ success: true, url: "/manus-storage/properties/videos/final.mp4" });
    expect(mocks.storagePut).toHaveBeenLastCalledWith(expect.stringMatching(/^properties\/videos\/\d+-tur-properti\.mp4$/), expect.any(Buffer), "video/mp4");
    expect(mocks.setCompletedUrl).toHaveBeenCalledWith(sessionId, "/manus-storage/properties/videos/final.mp4");
  });

  it("menerima admin_key pada sesi dan chunk upload tanpa sesi admin, tetapi menolak request tanpa bypass", async () => {
    const previousSecret = process.env.ADMIN_SECRET_KEY;
    const emergencyKey = "emergency-key-123";
    process.env.ADMIN_SECRET_KEY = emergencyKey;
    mocks.authenticateRequest.mockRejectedValue(new Error("Sesi tidak valid"));
    mocks.storagePut.mockResolvedValue({ key: "parts/0", url: "/manus-storage/parts/0" });

    try {
      const create = await fetch(`${baseUrl}/api/property-video-upload-sessions?admin_key=${encodeURIComponent(emergencyKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: "video/mp4", fileName: "tur-darurat.mp4", size: 4 }),
      });
      expect(create.status).toBe(201);
      const { sessionId } = await create.json();

      const chunk = await fetch(`${baseUrl}/api/property-video-upload-sessions/${sessionId}/chunks/0`, {
        method: "POST",
        headers: { "Content-Type": "video/mp4", "x-admin-key": emergencyKey },
        body: new Uint8Array([1, 2]),
      });
      expect(chunk.status).toBe(201);

      const rejected = await fetch(`${baseUrl}/api/property-video-upload-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: "video/mp4", fileName: "tur-tanpa-key.mp4", size: 4 }),
      });
      expect(rejected.status).toBe(403);
    } finally {
      if (previousSecret === undefined) delete process.env.ADMIN_SECRET_KEY;
      else process.env.ADMIN_SECRET_KEY = previousSecret;
    }
  });

  it("menolak pengguna tanpa sesi admin sebelum membuat sesi upload", async () => {
    mocks.authenticateRequest.mockRejectedValue(new Error("Sesi tidak valid"));
    const response = await fetch(`${baseUrl}/api/property-video-upload-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "video/mp4", fileName: "tur.mp4", size: 4 }),
    });
    expect(response.status).toBe(403);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("menolak format dan ukuran video yang tidak valid", async () => {
    mocks.authenticateRequest.mockResolvedValue({ role: "admin" });
    const formatResponse = await fetch(`${baseUrl}/api/property-video-upload-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "application/octet-stream", fileName: "tur.bin", size: 4 }),
    });
    expect(formatResponse.status).toBe(415);

    const sizeResponse = await fetch(`${baseUrl}/api/property-video-upload-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "video/mp4", fileName: "tur.mp4", size: 5 }),
    });
    expect(sizeResponse.status).toBe(413);
  });

  it("menolak chunk dengan ukuran yang tidak sesuai", async () => {
    mocks.authenticateRequest.mockResolvedValue({ role: "admin" });
    const create = await fetch(`${baseUrl}/api/property-video-upload-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "video/mp4", fileName: "tur.mp4", size: 4 }),
    });
    const { sessionId } = await create.json();
    const response = await fetch(`${baseUrl}/api/property-video-upload-sessions/${sessionId}/chunks/0`, {
      method: "POST",
      headers: { "Content-Type": "video/mp4" },
      body: new Uint8Array([1]),
    });
    expect(response.status).toBe(400);
    expect(mocks.storagePut).not.toHaveBeenCalled();
  });
});

