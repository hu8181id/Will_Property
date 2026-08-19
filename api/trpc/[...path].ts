import { handleTrpcNodeRequest, type NodeStyleResponse } from "../../server/vercel-trpc.js";

/** Vercel Node serverless entrypoint for all tRPC procedures. */
export default async function handler(request: Request, response: NodeStyleResponse): Promise<void> {
  await handleTrpcNodeRequest(request, response);
}
