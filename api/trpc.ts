import type { IncomingMessage, ServerResponse } from "node:http";
import { handleTrpcRequest } from "../dist/vercel-trpc.js";

type VercelRequest = IncomingMessage & {
  body?: unknown;
  rawBody?: unknown;
};

export default async function handler(
  req: VercelRequest,
  res: ServerResponse,
): Promise<void> {
  try {
    const response = await handleTrpcRequest(req as unknown as Request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.end(new Uint8Array(await response.arrayBuffer()));
  } catch (error) {
    console.error("[Vercel tRPC handler]", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Internal Server Error");
    }
  }
}
