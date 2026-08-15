import { Download, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type ApkUpdateManifest,
  isSafeApkDownloadUrl,
  shouldOfferApkUpdate,
} from "@/lib/apkUpdate";

const UPDATE_ENDPOINT = "/apk/latest.json";

export default function ApkUpdateNotice() {
  const [update, setUpdate] = useState<ApkUpdateManifest | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (sessionStorage.getItem("primedeal-apk-update-dismissed") || !/Android/i.test(userAgent)) return;

    let active = true;
    fetch(UPDATE_ENDPOINT, { cache: "no-store" })
      .then(response => (response.ok ? response.json() : null))
      .then((manifest: ApkUpdateManifest | null) => {
        if (!active || !manifest || !isSafeApkDownloadUrl(manifest.downloadUrl)) return;
        if (shouldOfferApkUpdate(userAgent, manifest)) setUpdate(manifest);
      })
      .catch(() => {
        // Kegagalan jaringan tidak boleh menghambat halaman properti.
      });

    return () => {
      active = false;
    };
  }, []);

  if (!update || dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem("primedeal-apk-update-dismissed", "true");
    setDismissed(true);
  };

  return (
    <section
      aria-label="Pembaruan aplikasi tersedia"
      className="fixed inset-x-3 top-3 z-[100] mx-auto max-w-md rounded-2xl border border-blue-200 bg-white p-4 shadow-xl"
      data-testid="apk-update-notice"
    >
      <button
        type="button"
        aria-label="Tutup pemberitahuan pembaruan"
        className="absolute right-3 top-3 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 active:scale-95"
        onClick={dismiss}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3 pr-6">
        <div className="mt-0.5 rounded-xl bg-blue-100 p-2 text-blue-700">
          <RefreshCw className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Pembaruan Primedeal tersedia</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Versi {update.versionName} siap dipasang. Android akan meminta persetujuan Anda sebelum memperbarui aplikasi.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href={update.downloadUrl}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-[0.97]"
            >
              <Download className="h-4 w-4" />
              Unduh pembaruan
            </a>
            <button type="button" className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline" onClick={dismiss}>
              Nanti
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
