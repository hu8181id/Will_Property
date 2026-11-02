import { createApp } from "../server/_core/app.js";
import { handleTrpcNodeRequest } from "../server/vercel-trpc.js";
import type { IncomingMessage, ServerResponse } from "node:http";

const app = createApp();

function isTrpcRequest(request: IncomingMessage) {
  const pathname = new URL(
    request.url ?? "/",
    `https://${request.headers.host ?? "localhost"}`,
  ).pathname;
  return pathname === "/api/trpc" || pathname.startsWith("/api/trpc/") ||
    pathname === "/trpc" || pathname.startsWith("/trpc/");
}

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  if (isTrpcRequest(request)) {
    await handleTrpcNodeRequest(request as unknown as Request, response);
    return;
  }

  app(request, response);
}
