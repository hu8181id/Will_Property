import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./routers.ts";
import { createFetchContext } from "./_core/context";

const endpoint = "/api/trpc";

type NodeStyleRequest = {
  url?: string;
  method?: string;
  headers?:
    | Headers
    | Record<string, string | string[] | undefined>;
  body?: unknown;
  rawBody?: unknown;
};

function readHeader(
  headers: NodeStyleRequest["headers"],
  name: string,
): string | undefined {
  if (!headers) return undefined;
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }
  const record = headers as Record<string, string | string[] | undefined>;
  const value = record[name.toLowerCase()] ?? record[name];
  return Array.isArray(value) ? value[0] : value;
}

function toFetchHeaders(
  headers: NodeStyleRequest["headers"],
): Headers {
  const result = new Headers();
  if (!headers) return result;
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    headers.forEach((value, key) => result.set(key, value));
    return result;
  }
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      result.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  return result;
}

function toFetchBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return body;
  if (body instanceof Uint8Array) return body as unknown as BodyInit;
  return JSON.stringify(body);
}

export function normalizeTrpcRequest(request: Request): Request {
  if (typeof Request !== "undefined" && request instanceof Request) {
    if (/^https?:\/\//i.test(request.url)) return request;
  }

  const nodeRequest = request as unknown as NodeStyleRequest;
  const headers = toFetchHeaders(nodeRequest.headers);
  const protocol =
    readHeader(nodeRequest.headers, "x-forwarded-proto") ?? "https";
  const host =
    readHeader(nodeRequest.headers, "x-forwarded-host") ??
    readHeader(nodeRequest.headers, "host") ??
    "localhost";
  const relativeUrl = nodeRequest.url ?? endpoint;
  const absoluteUrl = new URL(relativeUrl, `${protocol}://${host}`).toString();
  const method = (nodeRequest.method ?? "GET").toUpperCase();
  const rawBody = nodeRequest.body ?? nodeRequest.rawBody;
  const body = method === "GET" || method === "HEAD" ? undefined : toFetchBody(rawBody);

  return new Request(absoluteUrl, {
    method,
    headers,
    body,
  });
}

export function handleTrpcRequest(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint,
    req: normalizeTrpcRequest(request),
    router: appRouter,
    createContext: createFetchContext,
  });
}
