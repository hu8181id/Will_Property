import { handleTrpcRequest } from "../server/vercel-trpc.js";

export default function handler(request: Request): Promise<Response> {
  return handleTrpcRequest(request);
}
