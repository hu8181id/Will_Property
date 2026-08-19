export type ApkUpdateManifest = {
  app: "admin";
  updateAvailable: boolean;
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  sha256: string;
  releaseNotes: string;
};

const APP_VERSION_PATTERN = /PrimedealApp\/(\d+)/i;

export function isAndroidWebView(userAgent: string): boolean {
  const normalized = userAgent || "";
  return /Android/i.test(normalized) && (/\bwv\b/i.test(normalized) || APP_VERSION_PATTERN.test(normalized));
}

export function installedApkVersionCode(userAgent: string): number | null {
  const match = APP_VERSION_PATTERN.exec(userAgent || "");
  if (!match) return null;

  const value = Number.parseInt(match[1], 10);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

export function shouldOfferApkUpdate(userAgent: string, manifest: ApkUpdateManifest): boolean {
  if (!manifest.updateAvailable || !isAndroidWebView(userAgent) || !Number.isSafeInteger(manifest.versionCode)) return false;
  const installedVersion = installedApkVersionCode(userAgent) ?? 0;
  return manifest.versionCode > installedVersion;
}

export function isSafeApkDownloadUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.pathname.toLowerCase().endsWith(".apk");
  } catch {
    return false;
  }
}
