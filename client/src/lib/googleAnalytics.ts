type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: GtagFunction;
  }
}

const GOOGLE_ANALYTICS_ID_PATTERN = /^G-[A-Z0-9]{6,}$/;

export function isGoogleAnalyticsMeasurementId(value: string | undefined | null): value is string {
  return Boolean(value && GOOGLE_ANALYTICS_ID_PATTERN.test(value.trim()));
}

export function getGoogleAnalyticsMeasurementId(): string | null {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  return isGoogleAnalyticsMeasurementId(measurementId) ? measurementId : null;
}

export function loadGoogleAnalytics(measurementId = getGoogleAnalyticsMeasurementId()): boolean {
  if (typeof window === "undefined" || typeof document === "undefined" || !measurementId) {
    return false;
  }

  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

  const selector = `script[data-google-analytics-id="${measurementId}"]`;
  if (!document.head.querySelector(selector)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.googleAnalyticsId = measurementId;
    document.head.appendChild(script);
  }

  return true;
}

export function trackGoogleAnalyticsPageView(pagePath: string): void {
  const measurementId = getGoogleAnalyticsMeasurementId();
  if (!loadGoogleAnalytics(measurementId) || !window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: pagePath || "/",
    page_location: window.location.origin + (pagePath || "/"),
    page_title: document.title,
  });
}
