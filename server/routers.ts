import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getAdminCookieOptions,
  verifyAdminCredentials,
} from "./adminAuth";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { analyticsRouter } from "./routers/analytics";
import { propertyRouter } from "./routers/property";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  analytics: analyticsRouter,
  property: propertyRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    adminLogin: publicProcedure
      .input(z.object({ username: z.string().min(1).max(128), password: z.string().min(1).max(256) }))
      .mutation(({ ctx, input }) => {
        if (!verifyAdminCredentials(input.username, input.password)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Username atau password admin salah." });
        }

        ctx.res.cookie(
          ADMIN_SESSION_COOKIE,
          createAdminSession(input.username.trim()),
          getAdminCookieOptions(ctx.req),
        );
        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(ADMIN_SESSION_COOKIE, { ...getAdminCookieOptions(ctx.req), maxAge: 0 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
