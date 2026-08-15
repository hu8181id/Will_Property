import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BarChart3, CalendarDays, CircleHelp, ExternalLink, FileText, Globe2, Loader2, RefreshCw, ShieldCheck, Smartphone, Trophy, Users } from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "wouter";

function formatDashboardDate(visitDate: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(`${visitDate}T12:00:00`),
  );
}

function getIndonesiaDateKey(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getPresetRange(days: number) {
  const endDate = getIndonesiaDateKey();
  const start = new Date(`${endDate}T00:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { startDate: start.toISOString().slice(0, 10), endDate };
}

function getRangeDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  return Math.floor((end - start) / 86_400_000) + 1;
}

export default function AdminAnalyticsDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const canViewDashboard = user?.role === "admin";
  const [selectedRange, setSelectedRange] = useState(() => getPresetRange(7));
  const [appliedRange, setAppliedRange] = useState(() => getPresetRange(7));
  const [rangeError, setRangeError] = useState("");
  const summary = trpc.analytics.dailySummary.useQuery(appliedRange, {
    enabled: canViewDashboard,
    refetchInterval: 5 * 60 * 1000,
  });
  const popularContent = trpc.analytics.popularContent.useQuery(appliedRange, {
    enabled: canViewDashboard,
    refetchInterval: 5 * 60 * 1000,
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-36" /><Skeleton className="h-36" /></div>
          <Skeleton className="h-72" />
        </div>
      </main>
    );
  }

  if (!canViewDashboard) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <Card className="mx-auto max-w-lg p-6 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h1 className="text-xl font-bold text-slate-900">Dashboard khusus admin</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Silakan masuk menggunakan akun pemilik Primedeal untuk melihat statistik pengunjung.</p>
          <Button className="mt-6" onClick={() => setLocation("/admin")}>Kembali ke Portal Admin</Button>
        </Card>
      </main>
    );
  }

  const days = summary.data?.days ?? [];
  const maxVisitors = Math.max(...days.map((day) => day.visitors), 1);

  const applyRange = () => {
    if (selectedRange.startDate > selectedRange.endDate) {
      setRangeError("Tanggal mulai tidak boleh setelah tanggal akhir.");
      return;
    }
    if (getRangeDays(selectedRange.startDate, selectedRange.endDate) > 366) {
      setRangeError("Rentang maksimal adalah 366 hari.");
      return;
    }
    setRangeError("");
    setAppliedRange(selectedRange);
  };

  const applyPreset = (days: number) => {
    const range = getPresetRange(days);
    setSelectedRange(range);
    setAppliedRange(range);
    setRangeError("");
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Button variant="outline" size="icon" aria-label="Kembali ke admin" onClick={() => setLocation("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm font-medium text-primary">PRIMEDEAL ADMIN</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Ringkasan Pengunjung</h1>
              <p className="mt-1 text-sm text-slate-600">Kunjungan unik harian yang dipisahkan antara website dan APK Primedeal.</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 self-start" disabled={summary.isFetching || popularContent.isFetching} onClick={() => { void Promise.all([summary.refetch(), popularContent.refetch()]); }}>
            {summary.isFetching || popularContent.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Perbarui
          </Button>
        </header>

        <Card className="border-slate-200 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Filter periode</p>
              <p className="mt-1 text-sm text-slate-500">Pilih tanggal mulai dan akhir untuk melihat kunjungan pada periode tertentu.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => applyPreset(7)}>7 Hari</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => applyPreset(30)}>30 Hari</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => applyPreset(90)}>90 Hari</Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Tanggal mulai
              <Input aria-label="Tanggal mulai" type="date" max={getIndonesiaDateKey()} value={selectedRange.startDate} onChange={(event) => setSelectedRange((range) => ({ ...range, startDate: event.target.value }))} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Tanggal akhir
              <Input aria-label="Tanggal akhir" type="date" max={getIndonesiaDateKey()} value={selectedRange.endDate} onChange={(event) => setSelectedRange((range) => ({ ...range, endDate: event.target.value }))} />
            </label>
            <Button type="button" onClick={applyRange}>Terapkan</Button>
          </div>
          {rangeError && <p role="alert" className="mt-3 text-sm text-red-600">{rangeError}</p>}
        </Card>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className="border-blue-100 bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-blue-100 shadow-lg">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-medium text-blue-100">Total Pengunjung Periode</p><p className="mt-3 text-4xl font-bold">{summary.data?.totalVisitors ?? "—"}</p><p className="mt-2 text-xs text-blue-100">Diperbarui otomatis setiap 5 menit</p></div>
              <Users className="h-9 w-9 text-blue-200" />
            </div>
          </Card>
          <Card className="border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-600">Rata-rata per Hari</p><p className="mt-3 text-4xl font-bold text-slate-900">{summary.data?.averageDailyVisitors ?? "—"}</p><p className="mt-2 text-xs text-slate-500">Pengunjung unik per hari</p></div><CalendarDays className="h-9 w-9 text-primary" /></div>
          </Card>
          <Card className="border-emerald-100 p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-600">Website</p><p className="mt-3 text-4xl font-bold text-slate-900">{summary.data?.websiteVisitors ?? "—"}</p><p className="mt-2 text-xs text-slate-500">Browser dan pengunjung web</p></div><Globe2 className="h-9 w-9 text-emerald-600" /></div>
          </Card>
          <Card className="border-violet-100 p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-600">APK Primedeal</p><p className="mt-3 text-4xl font-bold text-slate-900">{summary.data?.apkVisitors ?? "—"}</p><p className="mt-2 text-xs text-slate-500">Terdeteksi dari aplikasi versi baru</p></div><Smartphone className="h-9 w-9 text-violet-600" /></div>
          </Card>
          <Card className="border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-600">Belum Teridentifikasi</p><p className="mt-3 text-4xl font-bold text-slate-900">{summary.data?.unknownVisitors ?? "—"}</p><p className="mt-2 text-xs text-slate-500">Riwayat sebelum penanda sumber</p></div><CircleHelp className="h-9 w-9 text-slate-500" /></div>
          </Card>
        </div>

        <Card className="mt-6 border-amber-100 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Laporan iklan APK</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Pendapatan, tayangan, dan klik banner hanya tersedia di laporan resmi AdMob. Dashboard ini tidak menyimpan kredensial atau data pendapatan AdMob.</p>
            </div>
            <Button asChild variant="outline" className="gap-2 border-amber-300 bg-white hover:bg-amber-100">
              <a href="https://admob.google.com/home/#/apps" target="_blank" rel="noreferrer">Buka Laporan AdMob <ExternalLink className="h-4 w-4" /></a>
            </Button>
          </div>
        </Card>

        <Card className="mt-6 border-slate-200 p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3"><div className="rounded-lg bg-blue-50 p-2"><BarChart3 className="h-5 w-5 text-primary" /></div><div><h2 className="font-semibold text-slate-900">Tren kunjungan periode terpilih</h2><p className="mt-1 text-sm text-slate-500">{summary.data?.period ? `${formatDashboardDate(summary.data.period.startDate)} – ${formatDashboardDate(summary.data.period.endDate)}` : "Memuat periode..."}. Perangkat atau jaringan yang sama dihitung satu kali dalam satu hari.</p></div></div>
          {summary.isLoading ? (
            <div className="mt-8 grid h-48 grid-cols-7 items-end gap-2"><Skeleton className="h-20" /><Skeleton className="h-32" /><Skeleton className="h-16" /><Skeleton className="h-40" /><Skeleton className="h-24" /><Skeleton className="h-28" /><Skeleton className="h-36" /></div>
          ) : summary.isError ? (
            <p className="mt-8 rounded-lg bg-red-50 p-4 text-sm text-red-700">Statistik belum dapat dimuat. Silakan tekan Perbarui beberapa saat lagi.</p>
          ) : (
            <div className="mt-8 overflow-x-auto border-b border-slate-200 pb-1">
              <div className="flex h-52 min-w-max items-end gap-2 sm:gap-3">
                {days.map((day) => (
                  <div key={day.visitDate} className="flex h-full w-11 flex-none flex-col justify-end text-center sm:w-14">
                    <span className="mb-2 text-xs font-semibold text-slate-700">{day.visitors}</span>
                    <div className="min-h-1 rounded-t-md bg-primary transition-[height] duration-200" style={{ height: `${Math.max((day.visitors / maxVisitors) * 100, day.visitors > 0 ? 4 : 1)}%` }} />
                    <span className="mt-2 truncate text-[10px] text-slate-500 sm:text-xs">{formatDashboardDate(day.visitDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 p-5 shadow-sm">
            <div className="flex items-start gap-3"><div className="rounded-lg bg-blue-50 p-2"><FileText className="h-5 w-5 text-primary" /></div><div><h2 className="font-semibold text-slate-900">Halaman Terpopuler</h2><p className="mt-1 text-sm text-slate-500">Tampilan unik per hari dalam periode terpilih.</p></div></div>
            {popularContent.isLoading ? <div className="mt-5 space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> : popularContent.isError ? <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">Daftar halaman belum dapat dimuat.</p> : popularContent.data?.pages.length ? <ol className="mt-5 divide-y divide-slate-100">{popularContent.data.pages.map((page, index) => <li key={page.path} className="flex items-center gap-3 py-3 first:pt-0"><span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{page.contentTitle}</p><p className="truncate text-xs text-slate-500">{page.path}</p></div><span className="text-sm font-bold text-primary">{page.views}</span></li>)}</ol> : <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Belum ada tampilan halaman pada periode ini.</p>}
          </Card>
          <Card className="border-slate-200 p-5 shadow-sm">
            <div className="flex items-start gap-3"><div className="rounded-lg bg-amber-50 p-2"><Trophy className="h-5 w-5 text-amber-600" /></div><div><h2 className="font-semibold text-slate-900">Listing Terpopuler</h2><p className="mt-1 text-sm text-slate-500">Detail properti yang paling banyak dibuka.</p></div></div>
            {popularContent.isLoading ? <div className="mt-5 space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> : popularContent.isError ? <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">Daftar listing belum dapat dimuat.</p> : popularContent.data?.listings.length ? <ol className="mt-5 divide-y divide-slate-100">{popularContent.data.listings.map((listing, index) => <li key={listing.path} className="flex items-center gap-3 py-3 first:pt-0"><span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-700">{index + 1}</span><div className="min-w-0 flex-1"><a href={`/listing?property=${listing.propertyId}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-primary hover:underline">{listing.contentTitle}</a><p className="truncate text-xs text-slate-500">{listing.views} tampilan unik</p></div><span className="text-sm font-bold text-primary">{listing.views}</span></li>)}</ol> : <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Belum ada detail listing yang dibuka pada periode ini.</p>}
          </Card>
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">Data ini berbeda dari Google Analytics: dashboard mencatat pengunjung harian anonim secara langsung di Primedeal dan tidak menyimpan nama, email, nomor telepon, atau kata pencarian. Riwayat sebelum penandaan APK aktif tetap ditampilkan sebagai sumber tidak teridentifikasi.</p>
      </section>
    </main>
  );
}
