import type { ServerResponse } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import handler from "./login";

type MockResponse = ServerResponse & {
  headers: Record<string, string>;
  body: string;
};

function createResponse() {
  const response = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: "",
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body?: string) {
      this.body = body ?? "";
    },
  } as unknown as MockResponse;
  return response;
}

describe("direct Vercel admin login (Node contract)", () => {
  const originalUsername = process.env.ADMIN_USERNAME;
  const originalPassword = process.env.ADMIN_PASSWORD;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.ADMIN_USERNAME = "admin-test";
    process.env.ADMIN_PASSWORD = "password-test-123";
    process.env.JWT_SECRET = "jwt-test-secret";
  });

  afterEach(() => {
    process.env.ADMIN_USERNAME = originalUsername;
    process.env.ADMIN_PASSWORD = originalPassword;
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it("returns a signed session cookie for valid credentials", async () => {
    const response = createResponse();

    await handler(
      {
        method: "POST",
        headers: { "x-forwarded-proto": "https" },
        body: { username: "admin-test", password: "password-test-123" },
      } as never,
      response,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('{"ok":true}');
    const setCookie = response.headers["set-cookie"] || "";
    expect(setCookie).toContain("primedeal_admin_session=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
  });

  it("rejects invalid credentials without issuing a cookie", async () => {
    const response = createResponse();

    await handler(
      {
        method: "POST",
        headers: {},
        body: { username: "admin-test", password: "wrong-password" },
      } as never,
      response,
    );

    expect(response.statusCode).toBe(401);
    expect(response.body).toContain("Username atau password admin salah");
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("rejects non-POST requests", async () => {
    const response = createResponse();

    await handler({ method: "GET", headers: {}, body: {} } as never, response);

    expect(response.statusCode).toBe(405);
    expect(response.headers["allow"]).toBe("POST");
  });
});
