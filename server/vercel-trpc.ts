import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./routers.ts";
import { createFetchContext } from "./_core/context";

const endpoint = "/api/trpc";

export function normalizeTrpcRequest(request: Request): Request {
  if (/^https?:\/\//i.test(request.url)) return request;

  const protocol = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost";
  const absoluteUrl = new URL(request.url, `${protocol}://${host}`).toString();

  return new Request(absoluteUrl, request);
}

export function handleTrpcRequest(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint,
    req: normalizeTrpcRequest(request),
    router: appRouter,
    createContext: createFetchContext,
  });
}
