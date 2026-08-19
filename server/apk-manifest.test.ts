import { describe, expect, it } from "vitest";
import { disabledAdminApkManifest, selectLatestAdminApk } from "../api/apk-manifest";

describe("manifest pembaruan APK Admin", () => {
  it("memilih APK Admin dengan versionCode tertinggi dari Vercel Blob", () => {
    const manifest = selectLatestAdminApk([
      {
        pathname: "apps/primedeal/admin/primedeal-admin-v1.4.12-vc21.apk",
        url: "https://abc.public.blob.vercel-storage.com/apps/primedeal/admin/primedeal-admin-v1.4.12-vc21.apk",
      },
      {
        pathname: "apps/primedeal/admin/primedeal-admin-v1.4.13-vc22.apk",
        url: "https://abc.public.blob.vercel-storage.com/apps/primedeal/admin/primedeal-admin-v1.4.13-vc22.apk",
      },
    ]);

    expect(manifest.updateAvailable).toBe(true);
    expect(manifest.versionCode).toBe(22);
    expect(manifest.versionName).toBe("1.4.13");
    expect(manifest.downloadUrl).toContain("vc22.apk");
  });

  it("menonaktifkan update jika tidak ada APK Admin Blob yang valid", () => {
    expect(selectLatestAdminApk([{ pathname: "properties/uploads/images/photo.jpg", url: "https://blob.example/photo.jpg" }])).toEqual(
      disabledAdminApkManifest(),
    );
  });
});
