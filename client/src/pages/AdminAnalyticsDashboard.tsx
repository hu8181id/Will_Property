import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BarChart3, CalendarDays, Loader2, RefreshCw, ShieldCheck, Users } from "lucide-react";
import React from "react";
import { useLocation } from "wouter";

function formatDashboardDate(visitDate: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(`${visitDate}T12:00:00`),
  );
}

export default function AdminAnalyticsDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const canViewDashboard = user?.role === "admin";
  const summary = trpc.analytics.dailySummary.useQuery(undefined, {
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
              <p className="mt-1 text-sm text-slate-600">Kunjungan unik harian dari website Primedeal.</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 self-start" disabled={summary.isFetching} onClick={() => summary.refetch()}>
            {summary.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Perbarui
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-blue-100 bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-blue-100 shadow-lg">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-medium text-blue-100">Pengunjung Hari Ini</p><p className="mt-3 text-4xl font-bold">{summary.data?.today ?? "—"}</p><p className="mt-2 text-xs text-blue-100">Diperbarui otomatis setiap 5 menit</p></div>
              <Users className="h-9 w-9 text-blue-200" />
            </div>
          </Card>
          <Card className="border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-600">Total 7 Hari Terakhir</p><p className="mt-3 text-4xl font-bold text-slate-900">{summary.data?.last7Days ?? "—"}</p><p className="mt-2 text-xs text-slate-500">Pengunjung unik per hari</p></div><CalendarDays className="h-9 w-9 text-primary" /></div>
          </Card>
        </div>

        <Card className="mt-6 border-slate-200 p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3"><div className="rounded-lg bg-blue-50 p-2"><BarChart3 className="h-5 w-5 text-primary" /></div><div><h2 className="font-semibold text-slate-900">Tren kunjungan 7 hari</h2><p className="mt-1 text-sm text-slate-500">Satu orang dihitung satu kali dalam satu hari pada perangkat yang sama.</p></div></div>
          {summary.isLoading ? (
            <div className="mt-8 grid h-48 grid-cols-7 items-end gap-2"><Skeleton className="h-20" /><Skeleton className="h-32" /><Skeleton className="h-16" /><Skeleton className="h-40" /><Skeleton className="h-24" /><Skeleton className="h-28" /><Skeleton className="h-36" /></div>
          ) : summary.isError ? (
            <p className="mt-8 rounded-lg bg-red-50 p-4 text-sm text-red-700">Statistik belum dapat dimuat. Silakan tekan Perbarui beberapa saat lagi.</p>
          ) : (
            <div className="mt-8 grid h-52 grid-cols-7 items-end gap-2 border-b border-slate-200 pb-1 sm:gap-4">
              {days.map((day) => (
                <div key={day.visitDate} className="flex h-full min-w-0 flex-col justify-end text-center">
                  <span className="mb-2 text-xs font-semibold text-slate-700">{day.visitors}</span>
                  <div className="min-h-1 rounded-t-md bg-primary transition-[height] duration-200" style={{ height: `${Math.max((day.visitors / maxVisitors) * 100, day.visitors > 0 ? 4 : 1)}%` }} />
                  <span className="mt-2 truncate text-[10px] text-slate-500 sm:text-xs">{formatDashboardDate(day.visitDate)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">Data ini berbeda dari Google Analytics: dashboard mencatat pengunjung harian anonim secara langsung di Primedeal dan tidak menyimpan nama, email, nomor telepon, atau kata pencarian.</p>
      </section>
    </main>
  );
}
