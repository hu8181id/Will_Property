import type { ServerResponse } from "node:http";
import { describe, expect, it } from "vitest";
import handler from "../api/blob/[operation]";

type MockResponse = ServerResponse & { body: string; headers: Record<string, string> };

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

describe("fungsi Blob dinamis Vercel", () => {
  it("menolak method selain POST", async () => {
    const response = createResponse();
    await handler({ method: "GET", headers: {}, query: { operation: "upload-auth" } } as never, response);

    expect(response.statusCode).toBe(405);
    expect(response.body).toContain("Method not allowed");
  });

  it("menolak operasi yang tidak dikenal tanpa memproses token Blob", async () => {
    const response = createResponse();
    await handler({ method: "POST", headers: {}, query: { operation: "unknown" } } as never, response);

    expect(response.statusCode).toBe(404);
    expect(response.body).toContain("Operasi Blob tidak ditemukan");
  });
});
