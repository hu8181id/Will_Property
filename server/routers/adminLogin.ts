import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";
import { ADMIN_SESSION_COOKIE, createAdminSession, getAdminCookieOptions, verifyAdminCredentials, recordLoginAttempt, checkAdminConfigStatus } from "../adminAuth.js";
import { TRPCError } from "@trpc/server";

export const adminLoginRouter = router({
  login: publicProcedure
    .input(z.object({ username: z.string().min(1).max(128), password: z.string().min(1).max(256) }))
    .mutation(({ ctx, input }) => {
      const clientIp = String(ctx.req.headers?.["x-forwarded-for"] || "unknown");
      if (!verifyAdminCredentials(input.username, input.password)) {
        recordLoginAttempt(false, input.username, clientIp);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Username atau password admin salah." });
      }
      recordLoginAttempt(true, input.username, clientIp);

      const session = createAdminSession(input.username.trim());
      ctx.res.cookie(
        ADMIN_SESSION_COOKIE,
        session,
        getAdminCookieOptions(ctx.req)
      );
      return { success: true } as const;
    }),
  checkConfig: publicProcedure.query(() => {
    return checkAdminConfigStatus();
  }),
});
