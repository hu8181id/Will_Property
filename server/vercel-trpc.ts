import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./routers.ts";
import { createFetchContext } from "./_core/context";

const endpoint = "/api/trpc";

export function handleTrpcRequest(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint,
    req: request,
    router: appRouter,
    createContext: createFetchContext,
  });
}
