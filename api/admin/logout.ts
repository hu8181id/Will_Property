import type { IncomingMessage, ServerResponse } from "node:http";
import { ADMIN_SESSION_COOKIE } from "../../server/adminAuth.js";

export const config = {
  runtime: "nodejs",
};

export default function handler(request: IncomingMessage, response: ServerResponse) {
  response.statusCode = 200;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.setHeader(
    "set-cookie",
    `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
  );
  response.end(JSON.stringify({ ok: true }));
}
