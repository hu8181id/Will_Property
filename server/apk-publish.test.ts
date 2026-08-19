import type { ServerResponse } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@vercel/blob", () => ({ put: vi.fn() }));

import { put } from "@vercel/blob";
import handler from "../api/apk-publish";

type MockResponse = ServerResponse & { body: string; headers: Record<string, string> };
const mockedPut = vi.mocked(put);

function createResponse() {
  return {
    statusCode: 200,
    body: "",
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body?: string) {
      this.body = body ?? "";
    },
  } as unknown as MockResponse;
}

describe("publikasi APK Admin", () => {
  afterEach(() => {
    delete process.env.ADMIN_SECRET_KEY;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    vi.clearAllMocks();
  });

  it("menolak kunci Admin yang salah", async () => {
    const response = createResponse();
    await handler({ method: "POST", headers: { "x-admin-key": "salah" }, body: {} } as never, response);

    expect(response.statusCode).toBe(403);
  });

  it("mempublikasikan APK valid memakai kunci Admin fallback", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = "blob-test-token";
    mockedPut.mockResolvedValue({
      pathname: "apps/primedeal/admin/primedeal-admin-v1.4.13-vc13.apk",
      url: "https://store.public.blob.vercel-storage.com/apps/primedeal/admin/primedeal-admin-v1.4.13-vc13.apk",
    } as never);
    const response = createResponse();
    const apkBase64 = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]).toString("base64");

    await handler({
      method: "POST",
      headers: { "x-admin-key": "PDmanage!2026#SafeKey84" },
      body: { versionCode: 13, versionName: "1.4.13", apkBase64 },
    } as never, response);

    expect(response.statusCode).toBe(201);
    expect(response.body).toContain("primedeal-admin-v1.4.13-vc13.apk");
    expect(mockedPut).toHaveBeenCalledWith(
      "apps/primedeal/admin/primedeal-admin-v1.4.13-vc13.apk",
      expect.any(Buffer),
      expect.objectContaining({ access: "public", contentType: "application/vnd.android.package-archive" }),
    );
  });
});
