import { handleTrpcRequest } from "../dist/vercel-trpc.js";

export default function handler(request: Request): Promise<Response> {
  return handleTrpcRequest(request);
}
