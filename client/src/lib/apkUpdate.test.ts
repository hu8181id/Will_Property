import { describe, expect, it } from "vitest";
import {
  installedApkVersionCode,
  isAndroidWebView,
  isSafeApkDownloadUrl,
  shouldOfferApkUpdate,
} from "./apkUpdate";

const manifest = {
  app: "admin" as const,
  updateAvailable: true,
  versionCode: 5,
  versionName: "1.3.0",
  downloadUrl: "https://downloads.example.test/primedeal-properti-v1.3.0.apk",
  sha256: "a".repeat(64),
  releaseNotes: "Pembaruan aman",
};

describe("pembaruan APK Primedeal", () => {
  it("mengenali WebView Android dan versi Primedeal yang mengirim penanda aplikasi", () => {
    const userAgent = "Mozilla/5.0 (Linux; Android 14; Pixel; wv) AppleWebKit/537.36 PrimedealApp/4";
    expect(isAndroidWebView(userAgent)).toBe(true);
    expect(installedApkVersionCode(userAgent)).toBe(4);
    expect(shouldOfferApkUpdate(userAgent, manifest)).toBe(true);
  });

  it("menawarkan pembaruan ke WebView lama tanpa penanda versi", () => {
    const legacyWebView = "Mozilla/5.0 (Linux; Android 13; wv) AppleWebKit/537.36 Version/4.0 Chrome/120 Mobile Safari/537.36";
    expect(installedApkVersionCode(legacyWebView)).toBeNull();
    expect(shouldOfferApkUpdate(legacyWebView, manifest)).toBe(true);
  });

  it("tidak menampilkan notifikasi pada browser biasa atau APK yang sudah terbaru", () => {
    const browser = "Mozilla/5.0 (Linux; Android 14) Chrome/122 Mobile Safari/537.36";
    const latestApp = "Mozilla/5.0 (Linux; Android 14; wv) PrimedealApp/5";
    expect(isAndroidWebView(browser)).toBe(false);
    expect(shouldOfferApkUpdate(browser, manifest)).toBe(false);
    expect(shouldOfferApkUpdate(latestApp, manifest)).toBe(false);
  });

  it("tidak menawarkan tautan saat rilis dinonaktifkan oleh manifest", () => {
    expect(shouldOfferApkUpdate("Mozilla/5.0 (Linux; Android 14; wv) PrimedealApp/4 (Admin)", {
      ...manifest,
      updateAvailable: false,
    })).toBe(false);
  });

  it("menerima hanya tautan unduhan APK HTTPS", () => {
    expect(isSafeApkDownloadUrl(manifest.downloadUrl)).toBe(true);
    expect(isSafeApkDownloadUrl("http://downloads.example.test/file.apk")).toBe(false);
    expect(isSafeApkDownloadUrl("https://downloads.example.test/file.zip")).toBe(false);
  });
});
