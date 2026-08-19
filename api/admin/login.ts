import type { IncomingMessage, ServerResponse } from "node:http";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getAdminCookieOptions,
  recordLoginAttempt,
  verifyAdminCredentials,
} from "../../server/adminAuth";

type VercelRequest = IncomingMessage & {
  body?: unknown;
};

type JsonRecord = Record<string, unknown>;

export const config = {
  runtime: "nodejs",
};

function sendJson(
  response: ServerResponse,
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  for (const [name, value] of Object.entries(headers)) {
    response.setHeader(name, value);
  }
  response.end(JSON.stringify(body));
}

async function readRequestBody(request: VercelRequest): Promise<JsonRecord> {
  if (request.body && typeof request.body === "object") {
    return request.body as JsonRecord;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};

  const parsed: unknown = JSON.parse(raw);
  return parsed && typeof parsed === "object" ? (parsed as JsonRecord) : {};
}

export default async function handler(request: VercelRequest, response: ServerResponse) {
  if (request.method !== "POST") {
    sendJson(response, { error: "Method Not Allowed" }, 405, { Allow: "POST" });
    return;
  }

  let input: JsonRecord;
  try {
    input = await readRequestBody(request);
  } catch {
    sendJson(response, { error: "Format permintaan tidak valid." }, 400);
    return;
  }

  const username = typeof input.username === "string" ? input.username : "";
  const password = typeof input.password === "string" ? input.password : "";

  const headers = request.headers ?? {};
  const clientIp = String(headers["x-forwarded-for"] || "unknown");

  if (!verifyAdminCredentials(username, password)) {
    recordLoginAttempt(false, username, clientIp);
    sendJson(response, { error: "Username atau password admin salah." }, 401);
    return;
  }
  recordLoginAttempt(true, username, clientIp);

  const session = createAdminSession(username.trim());
  const forwardedProto = headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || "https";

  const cookieOptions = getAdminCookieOptions({
    protocol: String(protocol),
    headers,
  });

  const cookieParts = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(session)}`,
    `Max-Age=${Math.floor(cookieOptions.maxAge / 1000)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (cookieOptions.secure) {
    cookieParts.push("Secure");
  }
  const cookieValue = cookieParts.join("; ");

  sendJson(response, { ok: true }, 200, { "set-cookie": cookieValue });
}
