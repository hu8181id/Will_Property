import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/routers.ts";
import { createFetchContext } from "../server/_core/context";

const endpoint = "/api/trpc";

export default function handler(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint,
    req: request,
    router: appRouter,
    createContext: createFetchContext,
  });
}
