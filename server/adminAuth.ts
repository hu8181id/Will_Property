import { createHmac, timingSafeEqual } from "node:crypto";
import type { User } from "../drizzle/schema";

export const ADMIN_LOGIN_ENDPOINT = "/api/trpc/auth.adminLogin";
export const ADMIN_SESSION_COOKIE = "primedeal_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type AdminSessionPayload = {
  sub: "vercel-admin";
  username: string;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function signingKey() {
  return process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || "primedeal-local-admin-key";
}

function sign(value: string) {
  return base64UrlEncode(createHmac("sha256", signingKey()).update(value).digest("base64"));
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminCredentials(username: string, password: string) {
  const configuredUsername = process.env.ADMIN_USERNAME?.trim();
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredUsername || !configuredPassword) return false;
  return safeEqual(username.trim(), configuredUsername) && safeEqual(password, configuredPassword);
}

export function createAdminSession(username: string) {
  const payload: AdminSessionPayload = {
    sub: "vercel-admin",
    username,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAdminSession(token: string | undefined): AdminSessionPayload | null {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSessionPayload;
    if (payload.sub !== "vercel-admin" || !payload.username || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function readCookieHeader(req: { headers?: Record<string, unknown> }) {
  const headers = req.headers ?? {};
  const cookie = headers.cookie ?? headers.Cookie;
  return typeof cookie === "string" ? cookie : "";
}

export function readAdminSessionFromRequest(req: { headers?: Record<string, unknown> }) {
  const token = readCookieHeader(req)
    .split(";")
    .map(part => part.trim())
    .find(part => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);
  return verifyAdminSession(token);
}

export function adminUserFromSession(session: AdminSessionPayload): User {
  const now = new Date();
  return {
    id: 0,
    openId: session.sub,
    name: session.username,
    email: null,
    loginMethod: "vercel-admin",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export function getAdminCookieOptions(req: { protocol?: string; headers?: Record<string, unknown> }) {
  const forwardedProto = req.headers?.["x-forwarded-proto"] ?? req.headers?.["X-Forwarded-Proto"];
  const isSecure = req.protocol === "https" || String(forwardedProto).split(",")[0].trim() === "https";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecure,
    path: "/",
    maxAge: SESSION_TTL_MS,
  };
}

// In-memory security event audit ring buffer for tracking login attempts and failed login alerts
const loginAuditLog: { timestamp: number; success: boolean; username: string; ip?: string }[] = [];
const MAX_AUDIT_LOGS = 100;

export function recordLoginAttempt(success: boolean, username: string, ip = "unknown") {
  loginAuditLog.unshift({ timestamp: Date.now(), success, username, ip });
  if (loginAuditLog.length > MAX_AUDIT_LOGS) {
    loginAuditLog.pop();
  }
}

export function getAdminLoginSecuritySummary() {
  const now = Date.now();
  const recentWindowMs = 1000 * 60 * 15; // 15 minutes
  const recentFailedAttempts = loginAuditLog.filter(
    item => !item.success && now - item.timestamp <= recentWindowMs,
  );
  return {
    totalAttempts: loginAuditLog.length,
    recentFailedCount: recentFailedAttempts.length,
    requiresWarning: recentFailedAttempts.length >= 3,
    lastAttempts: loginAuditLog.slice(0, 10),
  };
}
