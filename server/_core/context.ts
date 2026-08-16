import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import * as cookieModule from "cookie";
import type { CookieOptions } from "express";
import type { User } from "../../drizzle/schema";

const serializeCookie = (cookieModule as unknown as {
  serialize: (name: string, value: string, options?: CookieOptions) => string;
}).serialize;
import { sdk } from "./sdk";
import { adminUserFromSession, readAdminSessionFromRequest } from "../adminAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (!user) {
    const adminSession = readAdminSessionFromRequest(opts.req);
    if (adminSession) {
      user = adminUserFromSession(adminSession);
    } else {
      const queryKey = opts.req.query?.admin_key;
      const headerKey = opts.req.headers?.["x-admin-key"];
      const secretKey = process.env.ADMIN_SECRET_KEY;
      if (secretKey && secretKey.length >= 8 && ((queryKey && queryKey === secretKey) || (headerKey && headerKey === secretKey))) {
        user = {
          id: 999999,
          openId: "emergency-admin",
          email: "admin@primedeal.property",
          name: "Emergency Admin",
          loginMethod: "emergency",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };
      }
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

/**
 * Adapter context for Vercel's Web Handler runtime. The routers intentionally
 * keep their Express-shaped context contract, so this provides the small
 * request/response surface they use while writing cookies to Response headers.
 */
export async function createFetchContext(
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> {
  const url = new URL(opts.req.url);
  const headers: Record<string, string | string[] | undefined> = {};
  opts.req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const req = {
    headers,
    protocol: url.protocol.replace(":", ""),
    originalUrl: `${url.pathname}${url.search}`,
    ip: headers["x-forwarded-for"]?.toString().split(",")[0]?.trim(),
    get(name: string) {
      return headers[name.toLowerCase()];
    },
  } as unknown as CreateExpressContextOptions["req"];

  const appendCookie = (
    name: string,
    value: string,
    options?: CookieOptions,
  ) => {
    const maxAge =
      typeof options?.maxAge === "number"
        ? Math.trunc(options.maxAge / 1000)
        : undefined;
    opts.resHeaders.append(
      "Set-Cookie",
      serializeCookie(name, value, {
        ...(options ?? {}),
        ...(maxAge === undefined ? {} : { maxAge }),
      }),
    );
  };

  const res = {
    cookie(name: string, value: string, options?: CookieOptions) {
      appendCookie(name, value, options);
    },
    clearCookie(name: string, options?: CookieOptions) {
      appendCookie(name, "", { ...(options ?? {}), maxAge: 0 });
    },
  } as unknown as CreateExpressContextOptions["res"];

  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (!user) {
    const adminSession = readAdminSessionFromRequest(req);
    if (adminSession) {
      user = adminUserFromSession(adminSession);
    } else {
      const urlParam = req.url ? new URL(req.url, "http://localhost").searchParams.get("admin_key") : null;
      const headerKey = req.headers?.["x-admin-key"];
      const secretKey = process.env.ADMIN_SECRET_KEY;
      if (secretKey && secretKey.length >= 8 && ((urlParam && urlParam === secretKey) || (headerKey && headerKey === secretKey))) {
        user = {
          id: 999999,
          openId: "emergency-admin",
          email: "admin@primedeal.property",
          name: "Emergency Admin",
          loginMethod: "emergency",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };
      }
    }
  }

  return { req, res, user };
}
