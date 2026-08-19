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

  it("normalizes a Vercel Node request with a relative URL before serving JSON", async () => {
    const response = await handler({
      url: "/api/trpc/property.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%7D%7D%7D",
      method: "GET",
      headers: { host: "primedeal-property.vercel.app", "x-forwarded-proto": "https" },
    } as unknown as Request);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
