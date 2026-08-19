import { describe, expect, it } from "vitest";
import handler from "../api/trpc";
import { createFetchContext } from "./_core/context";

describe("Vercel tRPC Web Handler", () => {
  it("recognizes admin_key from the full fetch URL", async () => {
    if (!process.env.ADMIN_SECRET_KEY) return;

    const context = await createFetchContext({
      req: new Request(`https://primedeal.example/api/trpc/analytics.dailySummary?admin_key=${encodeURIComponent(process.env.ADMIN_SECRET_KEY)}`),
      resHeaders: new Headers(),
    });

    expect(context.user?.role).toBe("admin");
  });

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
