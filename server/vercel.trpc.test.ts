import { describe, expect, it } from "vitest";
import handler from "../api/trpc";

describe("Vercel tRPC Web Handler", () => {
  it("serves property.list through the explicit /api/trpc function with status 200", async () => {
    const response = await handler(
      new Request("https://primedeal.example/api/trpc/property.list", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");

    const json = await response.json();
    expect(json).toBeDefined();
  });
});
