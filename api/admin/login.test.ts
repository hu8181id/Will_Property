import { afterEach, beforeEach, describe, expect, it } from "vitest";
import handler from "./login";

describe("direct Vercel admin login (Web Request contract)", () => {
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
    const request = new Request("https://primedeal-property.vercel.app/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-proto": "https",
      },
      body: JSON.stringify({ username: "admin-test", password: "password-test-123" }),
    });

    const response = await handler(request);
    const bodyText = await response.text();

    expect(response.status).toBe(200);
    expect(bodyText).toBe('{"ok":true}');
    const setCookie = response.headers.get("set-cookie") || "";
    expect(setCookie).toContain("primedeal_admin_session=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
  });

  it("rejects invalid credentials without issuing a cookie", async () => {
    const request = new Request("https://primedeal-property.vercel.app/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ username: "admin-test", password: "wrong-password" }),
    });

    const response = await handler(request);
    const bodyText = await response.text();

    expect(response.status).toBe(401);
    expect(bodyText).toContain("Username atau password admin salah");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("rejects non-POST requests", async () => {
    const request = new Request("https://primedeal-property.vercel.app/api/admin/login", {
      method: "GET",
    });

    const response = await handler(request);

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
  });
});
