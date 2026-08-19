import { handleTrpcNodeRequest, type NodeStyleResponse } from "../server/vercel-trpc.js";

export default async function handler(request: Request, response: NodeStyleResponse): Promise<void> {
  await handleTrpcNodeRequest(request, response);
}
