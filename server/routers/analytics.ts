import { randomUUID } from "crypto";
import { z } from "zod";
import { getAnonymousDailyVisitSummary, recordAnonymousDailyVisit } from "../db";
import { getSessionCookieOptions } from "../_core/cookies";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

export const ANONYMOUS_VISITOR_COOKIE = "primedeal_visitor";
const ANONYMOUS_VISITOR_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

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

export const visitorRecordSchema = z.object({}).strict();

export const analyticsRouter = router({
  recordVisit: publicProcedure.input(visitorRecordSchema).mutation(async ({ ctx }) => {
    const existingVisitorId = readCookie(ctx.req.headers.cookie, ANONYMOUS_VISITOR_COOKIE);
    const visitorId = isAnonymousVisitorId(existingVisitorId) ? existingVisitorId : randomUUID();

    if (visitorId !== existingVisitorId) {
      ctx.res.cookie(ANONYMOUS_VISITOR_COOKIE, visitorId, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: ANONYMOUS_VISITOR_MAX_AGE_MS,
      });
    }

    try {
      await recordAnonymousDailyVisit({ visitDate: getIndonesiaDateKey(new Date()), visitorId });
      return { recorded: true };
    } catch (error) {
      console.warn("[Analytics] Kunjungan tidak dapat dicatat:", error);
      return { recorded: false };
    }
  }),

  dailySummary: adminProcedure.query(async () => {
    const dates = getDateKeys(7);
    const rows = await getAnonymousDailyVisitSummary(dates[0]);
    const visitsByDate = new Map(rows.map((row) => [row.visitDate, row.visitors]));
    const days = dates.map((visitDate) => ({ visitDate, visitors: visitsByDate.get(visitDate) ?? 0 }));

    return {
      today: days.at(-1)?.visitors ?? 0,
      last7Days: days.reduce((total, day) => total + day.visitors, 0),
      days,
    };
  }),
});

export const analyticsDateUtils = { getDateKeys, getIndonesiaDateKey, isAnonymousVisitorId };
