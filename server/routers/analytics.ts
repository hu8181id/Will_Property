import { createHmac, randomUUID } from "crypto";
import { z } from "zod";
import {
  getAnonymousDailyVisitSummary,
  getPopularContent,
  recordAnonymousDailyVisit,
  recordAnonymousPageView,
} from "../db";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import type { TrafficSource } from "../db";

export const ANONYMOUS_VISITOR_COOKIE = "primedeal_visitor";
const ANONYMOUS_VISITOR_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DASHBOARD_RANGE_DAYS = 366;

function getIndonesiaDateKey(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getDateKeys(days: number, now = new Date()) {
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return getIndonesiaDateKey(date);
  });
}

function getDateKeysInRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

function isDateKey(value: string) {
  if (!DATE_KEY_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function readCookie(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return undefined;
  return cookieHeader
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function isAnonymousVisitorId(value: string | undefined): value is string {
  return Boolean(value && /^[a-f0-9-]{36}$/i.test(value));
}

export function getTrafficSourceFromUserAgent(userAgent: string | undefined): TrafficSource {
  if (!userAgent) return "unknown";
  return /PrimedealApp\/\d+/i.test(userAgent) ? "apk" : "website";
}

function getClientNetworkAddress(req: { ip?: string; headers: Record<string, string | string[] | undefined> }) {
  const forwarded = req.headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (forwardedValue?.split(",")[0]?.trim() || req.ip || "").slice(0, 128);
}

/**
 * Returns a daily, irreversible HMAC. Raw IP addresses, user agents, and device
 * identifiers are never stored. A network value lets Chrome and the APK on the
 * same connection share one daily visit; the first source seen remains assigned.
 */
export function createDailyVisitFingerprint(input: {
  visitDate: string;
  visitorId: string;
  networkAddress?: string;
  secret?: string;
}) {
  const identity = input.networkAddress?.trim() ? `network:${input.networkAddress.trim()}` : `cookie:${input.visitorId}`;
  const secret = input.secret || ENV.cookieSecret || "primedeal-local-analytics";
  return createHmac("sha256", secret).update(`${input.visitDate}|${identity}`).digest("hex");
}

export function aggregateTrafficBySource(
  dates: string[],
  rows: Array<{ visitDate: string; trafficSource: TrafficSource; visitors: number }>,
) {
  const values = new Map<string, Record<TrafficSource, number>>();
  for (const row of rows) {
    const current = values.get(row.visitDate) ?? { website: 0, apk: 0, unknown: 0 };
    current[row.trafficSource] += row.visitors;
    values.set(row.visitDate, current);
  }

  return dates.map((visitDate) => {
    const sources = values.get(visitDate) ?? { website: 0, apk: 0, unknown: 0 };
    return {
      visitDate,
      websiteVisitors: sources.website,
      apkVisitors: sources.apk,
      unknownVisitors: sources.unknown,
      visitors: sources.website + sources.apk + sources.unknown,
    };
  });
}

const contentViewSchema = z
  .object({
    contentType: z.enum(["page", "listing"]),
    path: z
      .string()
      .min(1)
      .max(256)
      .refine(
        (value) => value.startsWith("/") && !value.includes("//") && !value.includes(".."),
        "Path konten tidak valid.",
      ),
    contentTitle: z.string().trim().min(1).max(255),
    propertyId: z.number().int().positive().optional(),
  })
  .superRefine(({ contentType, propertyId }, ctx) => {
    if (contentType === "listing" && !propertyId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID listing diperlukan.", path: ["propertyId"] });
    }
    if (contentType === "page" && propertyId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Halaman umum tidak memakai ID listing.", path: ["propertyId"] });
    }
  });

export const visitorRecordSchema = z.object({ page: contentViewSchema.optional() }).strict();
export const pageViewRecordSchema = contentViewSchema;

export const dailySummaryInputSchema = z
  .object({
    startDate: z.string().refine(isDateKey, "Tanggal mulai tidak valid."),
    endDate: z.string().refine(isDateKey, "Tanggal akhir tidak valid."),
  })
  .superRefine(({ startDate, endDate }, ctx) => {
    if (startDate > endDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tanggal mulai tidak boleh setelah tanggal akhir.", path: ["startDate"] });
      return;
    }

    if (getDateKeysInRange(startDate, endDate).length > MAX_DASHBOARD_RANGE_DAYS) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Rentang maksimal adalah 366 hari.", path: ["endDate"] });
    }
  });

export const analyticsRouter = router({
  recordVisit: publicProcedure.input(visitorRecordSchema).mutation(async ({ ctx, input }) => {
    const existingVisitorId = readCookie(ctx.req.headers.cookie, ANONYMOUS_VISITOR_COOKIE);
    const visitorId = isAnonymousVisitorId(existingVisitorId) ? existingVisitorId : randomUUID();

    if (visitorId !== existingVisitorId) {
      ctx.res.cookie(ANONYMOUS_VISITOR_COOKIE, visitorId, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: ANONYMOUS_VISITOR_MAX_AGE_MS,
      });
    }

    try {
      const visitDate = getIndonesiaDateKey(new Date());
      const trafficSource = getTrafficSourceFromUserAgent(ctx.req.headers["user-agent"]);
      const dailyFingerprint = createDailyVisitFingerprint({
        visitDate,
        visitorId,
        networkAddress: getClientNetworkAddress(ctx.req),
      });
      await recordAnonymousDailyVisit({ visitDate, visitorId, trafficSource, dailyFingerprint });
      if (input.page) await recordAnonymousPageView({ visitDate, visitorId, trafficSource, ...input.page });
      return { recorded: true };
    } catch (error) {
      console.warn("[Analytics] Kunjungan tidak dapat dicatat:", error);
      return { recorded: false };
    }
  }),

  recordPageView: publicProcedure.input(pageViewRecordSchema).mutation(async ({ ctx, input }) => {
    const existingVisitorId = readCookie(ctx.req.headers.cookie, ANONYMOUS_VISITOR_COOKIE);
    const visitorId = isAnonymousVisitorId(existingVisitorId) ? existingVisitorId : randomUUID();

    if (visitorId !== existingVisitorId) {
      ctx.res.cookie(ANONYMOUS_VISITOR_COOKIE, visitorId, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: ANONYMOUS_VISITOR_MAX_AGE_MS,
      });
    }

    try {
      await recordAnonymousPageView({
        visitDate: getIndonesiaDateKey(new Date()),
        visitorId,
        trafficSource: getTrafficSourceFromUserAgent(ctx.req.headers["user-agent"]),
        ...input,
      });
      return { recorded: true };
    } catch (error) {
      console.warn("[Analytics] Tampilan konten tidak dapat dicatat:", error);
      return { recorded: false };
    }
  }),

  dailySummary: adminProcedure.input(dailySummaryInputSchema.optional()).query(async ({ input }) => {
    const dates = input ? getDateKeysInRange(input.startDate, input.endDate) : getDateKeys(7);
    const startDate = dates[0]!;
    const endDate = dates.at(-1)!;
    const rows = await getAnonymousDailyVisitSummary(startDate, endDate);
    const days = aggregateTrafficBySource(dates, rows);
    const totalVisitors = days.reduce((total, day) => total + day.visitors, 0);
    const websiteVisitors = days.reduce((total, day) => total + day.websiteVisitors, 0);
    const apkVisitors = days.reduce((total, day) => total + day.apkVisitors, 0);
    const unknownVisitors = days.reduce((total, day) => total + day.unknownVisitors, 0);

    return {
      period: { startDate, endDate },
      totalVisitors,
      websiteVisitors,
      apkVisitors,
      unknownVisitors,
      averageDailyVisitors: Number((totalVisitors / days.length).toFixed(1)),
      days,
    };
  }),

  popularContent: adminProcedure.input(dailySummaryInputSchema.optional()).query(async ({ input }) => {
    const dates = input ? getDateKeysInRange(input.startDate, input.endDate) : getDateKeys(7);
    const startDate = dates[0]!;
    const endDate = dates.at(-1)!;
    const [pages, listings] = await Promise.all([
      getPopularContent(startDate, endDate, "page"),
      getPopularContent(startDate, endDate, "listing"),
    ]);

    return { period: { startDate, endDate }, pages, listings };
  }),
});

export const analyticsDateUtils = {
  getDateKeys,
  getDateKeysInRange,
  getIndonesiaDateKey,
  isAnonymousVisitorId,
  isDateKey,
  getTrafficSourceFromUserAgent,
  createDailyVisitFingerprint,
  aggregateTrafficBySource,
};
