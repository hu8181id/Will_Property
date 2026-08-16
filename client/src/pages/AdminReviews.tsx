import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Check, Loader2, Star, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const pendingQuery = trpc.property.listPendingReviews.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const moderateReview = trpc.property.moderateReview.useMutation();
  const utils = trpc.useUtils();

  const handleModerate = async (reviewId: number, status: "approved" | "rejected") => {
    try {
      await moderateReview.mutateAsync({ reviewId, status });
      await utils.property.listPendingReviews.invalidate();
      toast.success(status === "approved" ? "Ulasan disetujui dan ditampilkan." : "Ulasan ditolak dan tidak ditampilkan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Status ulasan belum dapat diperbarui.");
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Memeriksa akses admin...</div>;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 grid place-items-center p-6">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">Akses terbatas</h1>
          <p className="mt-2 text-sm text-muted-foreground">Halaman moderasi ulasan hanya dapat diakses oleh admin Primedeal.</p>
          <Button className="mt-6" onClick={() => setLocation("/admin")}>Kembali ke Portal Admin</Button>
        </Card>
      </div>
    );
  }

  const reviews = pendingQuery.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between gap-4 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Primedeal Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Moderasi Rating & Ulasan</h1>
          </div>
          <Button variant="outline" onClick={() => setLocation("/admin")}>
            <ArrowLeft size={16} className="mr-2" /> Portal Admin
          </Button>
        </div>
      </header>

      <main className="container py-10">
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-900">Tinjau sebelum tampil</p>
          <p className="mt-1 text-sm text-amber-800">Ulasan yang dikirim pengunjung masuk ke antrean ini. Hanya ulasan yang Anda setujui yang akan ditampilkan pada halaman properti.</p>
        </div>

        {pendingQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Memuat ulasan...</div>
        ) : pendingQuery.isError ? (
          <Card className="p-8 text-center text-red-700">Ulasan pending belum dapat dimuat. Silakan refresh halaman.</Card>
        ) : reviews.length === 0 ? (
          <Card className="p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-900">Belum ada ulasan yang menunggu moderasi</h2>
            <p className="mt-2 text-sm text-muted-foreground">Antrean akan terisi ketika pengunjung mengirim rating atau ulasan baru.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{review.propertyTitle}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-slate-900">{review.authorName}</p>
                      <ReviewStars rating={review.rating} />
                      <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
                    </div>
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{review.comment}</p>
                  </div>
                  <div className="flex shrink-0 gap-2 md:flex-col">
                    <Button
                      disabled={moderateReview.isPending}
                      onClick={() => handleModerate(review.id, "approved")}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check size={16} className="mr-2" /> Setujui
                    </Button>
                    <Button
                      variant="outline"
                      disabled={moderateReview.isPending}
                      onClick={() => handleModerate(review.id, "rejected")}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <X size={16} className="mr-2" /> Tolak
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
