import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isGoogleAnalyticsMeasurementId,
  loadGoogleAnalytics,
  trackGoogleAnalyticsPageView,
} from "./googleAnalytics";

describe("Google Analytics 4", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    delete window.gtag;
    delete window.dataLayer;
    vi.restoreAllMocks();
  });

  it("memvalidasi Measurement ID website melalui skrip Google Tag Manager", async () => {
    const measurementId = process.env.VITE_GA_MEASUREMENT_ID;
    expect(isGoogleAnalyticsMeasurementId(measurementId)).toBe(true);

    const response = await fetch(
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId ?? "")}`
    );
    expect(response.ok).toBe(true);
    expect(await response.text()).toContain("gtag");
  }, 20_000);

  it("memuat satu skrip dan menyiapkan antrean event tanpa query pencarian", () => {
    const measurementId = "G-0QSM3M3WND";
    expect(loadGoogleAnalytics(measurementId)).toBe(true);
    expect(document.head.querySelectorAll("script[data-google-analytics-id]")).toHaveLength(1);
    expect(window.dataLayer).toHaveLength(2);

    loadGoogleAnalytics(measurementId);
    expect(document.head.querySelectorAll("script[data-google-analytics-id]")).toHaveLength(1);
  });

  it("mencatat page-view memakai jalur halaman tanpa kata pencarian", () => {
    trackGoogleAnalyticsPageView("/listing");

    const pageView = window.dataLayer?.at(-1);
    expect(pageView).toEqual([
      "event",
      "page_view",
      expect.objectContaining({ page_path: "/listing" }),
    ]);
    expect(JSON.stringify(pageView)).not.toContain("search");
  });
});
