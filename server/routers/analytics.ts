import { randomUUID } from "crypto";
import { z } from "zod";
import { getAnonymousDailyVisitSummary, recordAnonymousDailyVisit } from "../db";
import { getSessionCookieOptions } from "../_core/cookies";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

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

export const visitorRecordSchema = z.object({}).strict();

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

  dailySummary: adminProcedure.input(dailySummaryInputSchema.optional()).query(async ({ input }) => {
    const dates = input ? getDateKeysInRange(input.startDate, input.endDate) : getDateKeys(7);
    const startDate = dates[0]!;
    const endDate = dates.at(-1)!;
    const rows = await getAnonymousDailyVisitSummary(startDate, endDate);
    const visitsByDate = new Map(rows.map((row) => [row.visitDate, row.visitors]));
    const days = dates.map((visitDate) => ({ visitDate, visitors: visitsByDate.get(visitDate) ?? 0 }));
    const totalVisitors = days.reduce((total, day) => total + day.visitors, 0);

    return {
      period: { startDate, endDate },
      totalVisitors,
      averageDailyVisitors: Number((totalVisitors / days.length).toFixed(1)),
      days,
    };
  }),
});

export const analyticsDateUtils = { getDateKeys, getDateKeysInRange, getIndonesiaDateKey, isAnonymousVisitorId, isDateKey };
