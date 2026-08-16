import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getAdminCookieOptions,
  verifyAdminCredentials,
} from "../../server/adminAuth";

export const config = {
  runtime: "nodejs",
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "Allow": "POST",
      },
    });
  }

  let body: Record<string, unknown> = {};
  try {
    const raw = await request.text();
    if (raw) {
      body = JSON.parse(raw);
    }
  } catch {
    return new Response(JSON.stringify({ error: "Format permintaan tidak valid." }), {
      status: 400,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyAdminCredentials(username, password)) {
    return new Response(JSON.stringify({ error: "Username atau password admin salah." }), {
      status: 401,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const session = createAdminSession(username.trim());
  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersObj[key.toLowerCase()] = value;
  });

  const forwardedProto = headersObj["x-forwarded-proto"];
  const protocol = forwardedProto ? forwardedProto.split(",")[0].trim() : "https";

  const cookieOptions = getAdminCookieOptions({
    protocol,
    headers: headersObj,
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

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "set-cookie": cookieValue,
    },
  });
}
