export type PublicBlob = {
  url: string;
  pathname: string;
};

export type ApkUpdateManifest = {
  app: "admin";
  updateAvailable: boolean;
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  sha256: string;
  releaseNotes: string;
  publishedAt: string;
};

const APK_PATH_PATTERN = /^apps\/primedeal\/admin\/primedeal-admin-v(\d+(?:\.\d+){1,2})-vc(\d+)\.apk$/i;

export function disabledAdminApkManifest(): ApkUpdateManifest {
  return {
    app: "admin",
    updateAvailable: false,
    versionCode: 0,
    versionName: "",
    downloadUrl: "",
    sha256: "",
    releaseNotes: "Belum ada pembaruan APK Admin yang tersedia.",
    publishedAt: new Date(0).toISOString(),
  };
}

export function selectLatestAdminApk(blobs: PublicBlob[]): ApkUpdateManifest {
  const candidates = blobs
    .map(blob => {
      const match = APK_PATH_PATTERN.exec(blob.pathname);
      if (!match || !/^https:\/\/.+\.apk(?:$|\?)/i.test(blob.url)) return null;
      return {
        versionName: match[1],
        versionCode: Number.parseInt(match[2], 10),
        downloadUrl: blob.url,
      };
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
    .filter(candidate => Number.isSafeInteger(candidate.versionCode) && candidate.versionCode > 0)
    .sort((left, right) => right.versionCode - left.versionCode);

  const latest = candidates[0];
  if (!latest) return disabledAdminApkManifest();

  return {
    app: "admin",
    updateAvailable: true,
    versionCode: latest.versionCode,
    versionName: latest.versionName,
    downloadUrl: latest.downloadUrl,
    sha256: "",
    releaseNotes: "Pembaruan APK Admin PrimeDeal dengan akses Kelola Listing, status TERJUAL, dan statistik pengunjung.",
    publishedAt: new Date().toISOString(),
  };
}
