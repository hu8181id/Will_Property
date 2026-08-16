import { describe, expect, it } from "vitest";
import {
  ADMIN_LOGIN_ENDPOINT,
  createAdminSession,
  getAdminCookieOptions,
  readAdminSessionFromRequest,
  verifyAdminCredentials,
  verifyAdminSession,
} from "./adminAuth";

describe("Admin Authentication & Cookie TTL", () => {
  it("exposes a lightweight login endpoint contract", () => {
    expect(ADMIN_LOGIN_ENDPOINT).toBe("/api/trpc/auth.adminLogin");
  });

  it("verifies correct credentials and rejects incorrect ones", () => {
    const originalUsername = process.env.ADMIN_USERNAME;
    const originalPassword = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_USERNAME = "superadmin";
    process.env.ADMIN_PASSWORD = "secretpassword123";
    process.env.JWT_SECRET = "test-jwt-secret";

    expect(verifyAdminCredentials("superadmin", "secretpassword123")).toBe(true);
    expect(verifyAdminCredentials("superadmin", "wrong")).toBe(false);
    expect(verifyAdminCredentials("other", "secretpassword123")).toBe(false);

    process.env.ADMIN_USERNAME = originalUsername;
    process.env.ADMIN_PASSWORD = originalPassword;
  });

  it("creates a session token and successfully verifies it", () => {
    process.env.JWT_SECRET = "test-jwt-secret";
    const token = createAdminSession("superadmin");
    expect(token).toBeTruthy();

    const payload = verifyAdminSession(token);
    expect(payload).not.toBeNull();
    expect(payload?.username).toBe("superadmin");
    expect(payload?.sub).toBe("vercel-admin");
  });

  it("rejects tampered or expired session tokens", () => {
    process.env.JWT_SECRET = "test-jwt-secret";
    const token = createAdminSession("superadmin");
    const [payloadBase64] = token.split(".");
    const tamperedToken = `${payloadBase64}.invalidsignature`;

    expect(verifyAdminSession(tamperedToken)).toBeNull();
    expect(verifyAdminSession("")).toBeNull();
    expect(verifyAdminSession("malformed.token.structure")).toBeNull();
  });

  it("extracts session from request cookie header correctly", () => {
    process.env.JWT_SECRET = "test-jwt-secret";
    const token = createAdminSession("superadmin");

    const req = {
      headers: {
        cookie: `other_cookie=123; primedeal_admin_session=${token}; another=456`,
      },
    };

    const session = readAdminSessionFromRequest(req);
    expect(session).not.toBeNull();
    expect(session?.username).toBe("superadmin");
  });

  it("configures cookie options with 7 days TTL and correct security flags", () => {
    const options = getAdminCookieOptions({
      protocol: "https",
      headers: { "x-forwarded-proto": "https" },
    });

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.secure).toBe(true);
    expect(options.path).toBe("/");
    expect(options.maxAge).toBe(1000 * 60 * 60 * 24 * 7); // 7 days TTL
  });
});

import { recordLoginAttempt, getAdminLoginSecuritySummary } from "./adminAuth";

describe("Admin Login Audit and Security Summary", () => {
  it("records failed attempts and triggers requiresWarning after 3 failures", () => {
    const initialSummary = getAdminLoginSecuritySummary();
    const startFailed = initialSummary.recentFailedCount;

    recordLoginAttempt(false, "baduser", "127.0.0.1");
    recordLoginAttempt(false, "baduser", "127.0.0.1");
    recordLoginAttempt(false, "baduser", "127.0.0.1");

    const summary = getAdminLoginSecuritySummary();
    expect(summary.recentFailedCount).toBeGreaterThanOrEqual(startFailed + 3);
    expect(summary.requiresWarning).toBe(true);
  });
});

import { verifyAdminCredentials } from "./adminAuth";

describe("Admin Credentials Case Insensitivity", () => {
  it("verifies credentials correctly with different casing and whitespace", () => {
    process.env.ADMIN_USERNAME = "AdminUser";
    process.env.ADMIN_PASSWORD = "SecurePassword123";

    expect(verifyAdminCredentials("  adminuser  ", "SecurePassword123")).toBe(true);
    expect(verifyAdminCredentials("ADMINUSER", "SecurePassword123")).toBe(true);
    expect(verifyAdminCredentials("adminuser", "WrongPassword")).toBe(false);
  });
});
