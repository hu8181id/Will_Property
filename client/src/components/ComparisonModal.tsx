import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Bed, Bath, Ruler, Star } from "lucide-react";

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
  beds: number;
  baths: number;
  area: number;
  rating: number;
  type: string;
}

interface ComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
  onRemove: (id: number) => void;
}

export default function ComparisonModal({
  open,
  onOpenChange,
  properties,
  onRemove,
}: ComparisonModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perbandingan Properti</DialogTitle>
        </DialogHeader>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Pilih minimal 2 properti untuk dibandingkan
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="border border-border rounded-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => onRemove(property.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{property.title}</h3>
                    <p className="text-xs text-muted-foreground">{property.location}</p>
                  </div>

                  <div className="bg-primary/10 p-3 rounded">
                    <p className="text-sm font-bold text-primary">
                      {formatPrice(property.price)}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tipe</span>
                      <span className="font-semibold">{property.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Bed size={14} /> Kamar
                      </span>
                      <span className="font-semibold">{property.beds}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Bath size={14} /> Kamar Mandi
                      </span>
                      <span className="font-semibold">{property.baths}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Ruler size={14} /> Luas
                      </span>
                      <span className="font-semibold">{property.area} m²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Star size={14} /> Rating
                      </span>
                      <span className="font-semibold">{property.rating}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    Lihat Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
