import { describe, expect, it } from "vitest";
import {
  handleTrpcRequest,
  normalizeTrpcRequest,
} from "./vercel-trpc";

describe("Vercel tRPC Web Handler", () => {
  it("serves property.list through the explicit /api/trpc function", async () => {
    const response = await handleTrpcRequest(
      new Request("https://primedeal.example/api/trpc/property.list", {
        method: "GET",
      }),
    );

    expect(response.status).not.toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  it("normalizes Vercel Node-style requests with relative URLs", () => {
    const normalized = normalizeTrpcRequest({
      url: "/api/trpc/property.list?input=%7B%7D",
      method: "GET",
      headers: {
        host: "primedeal.example",
        "x-forwarded-proto": "https",
      },
    } as unknown as Request);

    expect(normalized.url).toBe(
      "https://primedeal.example/api/trpc/property.list?input=%7B%7D",
    );
    expect(normalized.headers.get("host")).toBe("primedeal.example");
  });
});
