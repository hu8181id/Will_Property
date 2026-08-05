import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface FullscreenGalleryProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
}

export default function FullscreenGallery({
  images,
  open,
  onOpenChange,
  initialIndex = 0,
}: FullscreenGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-screen p-0 bg-black">
        <div className="relative w-full h-screen flex items-center justify-center bg-black">
          {/* Image */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={images[currentIndex]}
              alt={`Gallery ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/20 p-2 rounded-full">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="bg-white/30 hover:bg-white/50 disabled:opacity-50 text-white p-2 rounded transition-colors"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-white px-3 py-2 text-sm font-semibold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="bg-white/30 hover:bg-white/50 disabled:opacity-50 text-white p-2 rounded transition-colors"
            >
              <ZoomIn size={20} />
            </button>
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 right-4 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
