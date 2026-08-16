import { describe, expect, it } from "vitest";
import handler from "../api/trpc";

describe("Vercel tRPC Web Handler", () => {
  it("serves property.list through the explicit /api/trpc function", async () => {
    const response = await handler(
      new Request("https://primedeal.example/api/trpc/property.list", {
        method: "GET",
      }),
    );

    expect(response.status).not.toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
