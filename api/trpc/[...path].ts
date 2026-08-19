import { handleTrpcRequest } from "../../server/vercel-trpc.js";

/**
 * Vercel invokes this Node serverless route with a relative req.url. The helper
 * constructs an absolute URL before routing to tRPC's Fetch adapter.
 */
export default function handler(request: Request): Promise<Response> {
  return handleTrpcRequest(request);
}
