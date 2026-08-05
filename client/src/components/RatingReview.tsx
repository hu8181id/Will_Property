import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface RatingReviewProps {
  propertyId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRating: number;
}

export default function RatingReview({
  propertyId,
  open,
  onOpenChange,
  currentRating,
}: RatingReviewProps) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !comment) {
      toast.error("Mohon isi nama dan komentar");
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      name,
      rating,
      comment,
      date: new Date().toLocaleDateString("id-ID"),
    };

    setReviews([newReview, ...reviews]);
    setName("");
    setComment("");
    setRating(5);
    toast.success("Review berhasil ditambahkan!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rating & Review Properti</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Rating */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Rating Properti Saat Ini</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={
                      i < Math.round(currentRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-primary">{currentRating}</span>
            </div>
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Nama Anda
              </label>
              <Input
                placeholder="Masukkan nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Komentar
              </label>
              <Textarea
                placeholder="Bagikan pengalaman Anda tentang properti ini..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
              Kirim Review
            </Button>
          </form>

          {/* Reviews List */}
          {reviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">Review Terbaru</h3>
              {reviews.map((review) => (
                <div key={review.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
