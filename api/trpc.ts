import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/routers.js";
import { createFetchContext } from "../server/_core/context.js";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
const endpoint = "/api/trpc";
export default function handler(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint,
    req: request,
    router: appRouter,
    createContext: createFetchContext,
  });
}
