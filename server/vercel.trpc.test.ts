import { describe, expect, it } from "vitest";
import handler from "../api/trpc";
import { createFetchContext } from "./_core/context";
import { handleTrpcRequest, type NodeStyleResponse } from "./vercel-trpc";

describe("Vercel tRPC Node Handler", () => {
  it("recognizes admin_key from the full fetch URL", async () => {
    if (!process.env.ADMIN_SECRET_KEY) return;

    const context = await createFetchContext({
      req: new Request(`https://primedeal.example/api/trpc/analytics.dailySummary?admin_key=${encodeURIComponent(process.env.ADMIN_SECRET_KEY)}`),
      resHeaders: new Headers(),
    });

    expect(context.user?.role).toBe("admin");
  });

  it("serves property.list through the Fetch helper with status 200", async () => {
    const response = await handleTrpcRequest(
      new Request("https://primedeal.example/api/trpc/property.list", { method: "GET" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toBeDefined();
  });

  it("writes JSON through a Vercel Node response for a relative request URL", async () => {
    const headers: Record<string, string | string[]> = {};
    let body = "";
    const response: NodeStyleResponse = {
      setHeader(name, value) {
        headers[name.toLowerCase()] = value;
      },
      end(value = "") {
        body = value;
      },
    };

    await handler(
      {
        url: "/api/trpc/property.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%7D%7D%7D",
        method: "GET",
        headers: { host: "primedeal-property.vercel.app", "x-forwarded-proto": "https" },
      } as unknown as Request,
      response,
    );

    expect(response.statusCode).toBe(200);
    expect(headers["content-type"]).toContain("application/json");
    expect(() => JSON.parse(body)).not.toThrow();
  });
});
