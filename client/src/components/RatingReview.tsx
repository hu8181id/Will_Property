import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface RatingReviewProps {
  propertyId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRating?: number;
}

function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${value} dari 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
    </div>
  );
}

export default function RatingReview({
  propertyId,
  open,
  onOpenChange,
  currentRating = 0,
}: RatingReviewProps) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const reviewsQuery = trpc.property.listReviews.useQuery(
    { propertyId },
    { enabled: open, staleTime: 15_000 },
  );
  const addReview = trpc.property.addReview.useMutation();
  const utils = trpc.useUtils();
  const reviews = reviewsQuery.data?.reviews ?? [];
  const averageRating = reviewsQuery.data?.averageRating ?? currentRating;
  const reviewCount = reviewsQuery.data?.reviewCount ?? reviews.length;

  const resetForm = () => {
    setName("");
    setComment("");
    setRating(5);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanComment = comment.trim();
    if (cleanName.length < 2 || cleanName.length > 128) {
      toast.error("Nama harus terdiri dari 2–128 karakter.");
      return;
    }
    if (cleanComment.length < 5 || cleanComment.length > 2000) {
      toast.error("Ulasan harus terdiri dari 5–2.000 karakter.");
      return;
    }
    try {
      await addReview.mutateAsync({
        propertyId,
        authorName: cleanName,
        rating,
        comment: cleanComment,
      });
      resetForm();
      toast.success("Ulasan diterima dan menunggu verifikasi tim Primedeal.");
      await utils.property.listReviews.invalidate({ propertyId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ulasan belum dapat dikirim. Silakan coba lagi.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rating & Ulasan Properti</DialogTitle>
          <DialogDescription>
            Bagikan pengalaman Anda secara jujur. Ulasan akan ditinjau admin sebelum tampil kepada publik.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5">
            <p className="text-sm text-muted-foreground mb-2">Rating yang sudah disetujui</p>
            {reviewCount > 0 ? (
              <div className="flex items-center gap-3">
                <Stars value={averageRating} size={24} />
                <span className="text-2xl font-bold text-primary">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({reviewCount} ulasan)</span>
              </div>
            ) : (
              <p className="text-sm text-slate-700">Belum ada rating. Jadilah yang pertama memberikan ulasan.</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border p-5">
            <div>
              <label htmlFor="review-author" className="block text-sm font-semibold text-slate-900 mb-2">
                Nama Anda
              </label>
              <Input
                id="review-author"
                placeholder="Contoh: Andi Pratama"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={128}
                required
              />
            </div>

            <div>
              <p className="block text-sm font-semibold text-slate-900 mb-2">Rating Anda</p>
              <div className="flex gap-1" role="radiogroup" aria-label="Pilih rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} bintang`}
                    onClick={() => setRating(star)}
                    className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Star
                      size={30}
                      className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-comment" className="block text-sm font-semibold text-slate-900 mb-2">
                Ceritakan pengalaman Anda
              </label>
              <Textarea
                id="review-comment"
                placeholder="Tulis ulasan secara jujur dan relevan tentang properti ini..."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                minLength={5}
                maxLength={2000}
                rows={4}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">Ulasan akan diperiksa sebelum ditampilkan kepada publik.</p>
            </div>

            <Button type="submit" disabled={addReview.isPending} className="w-full bg-primary text-white">
              {addReview.isPending ? "Mengirim..." : "Kirim Ulasan"}
            </Button>
          </form>

          <section aria-labelledby="approved-reviews-title" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 id="approved-reviews-title" className="font-bold text-slate-900">Ulasan Terbaru</h3>
              {reviewsQuery.isLoading && <span className="text-xs text-muted-foreground">Memuat...</span>}
            </div>
            {reviewsQuery.isError ? (
              <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Ulasan belum dapat dimuat. Silakan coba lagi.</p>
            ) : reviews.length === 0 && !reviewsQuery.isLoading ? (
              <p className="rounded-lg bg-secondary/60 p-4 text-sm text-muted-foreground">Belum ada ulasan yang disetujui.</p>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{review.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <Stars value={review.rating} size={16} />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{review.comment}</p>
                </article>
              ))
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
