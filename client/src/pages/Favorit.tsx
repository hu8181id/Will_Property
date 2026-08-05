import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Bed, Bath, Ruler, Star, ChevronRight, Trash2, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
  images?: string[];
  beds: number;
  baths: number;
  area: number;
  rating: number;
  type: string;
  date: string;
  description?: string;
}

export default function Favorit() {
  const [favorites, setFavorites] = useState<Property[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("primedeal_favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    }
  }, []);

  const handleRemoveFavorite = (id: number) => {
    const updated = favorites.filter((fav) => fav.id !== id);
    setFavorites(updated);
    localStorage.setItem("primedeal_favorites", JSON.stringify(updated));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary py-8">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Properti Favorit
            </h1>
            <p className="text-muted-foreground">
              Daftar properti yang Anda simpan untuk referensi nanti
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container">
            {favorites.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-8">
                  Anda memiliki {favorites.length} properti favorit
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favorites.map((property) => (
                    <Card
                      key={property.id}
                      className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group relative"
                    >
                      <div className="relative overflow-hidden h-48 bg-gray-200">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {formatPrice(property.price)}
                        </div>
                        <button
                          onClick={() => handleRemoveFavorite(property.id)}
                          className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          title="Hapus dari favorit"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="p-5">
                        <h3 className="text-base font-bold text-slate-900 mb-2">
                          {property.title}
                        </h3>

                        {property.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {property.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                          <MapPin size={14} />
                          <span className="text-xs">{property.location}</span>
                        </div>

                        <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                          {property.beds > 0 && (
                            <div className="flex items-center gap-1">
                              <Bed size={14} />
                              <span>{property.beds}</span>
                            </div>
                          )}
                          {property.baths > 0 && (
                            <div className="flex items-center gap-1">
                              <Bath size={14} />
                              <span>{property.baths}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Ruler size={14} />
                            <span>{property.area} m²</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold">
                              {property.rating}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 p-0"
                          >
                            Lihat <ChevronRight size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Heart size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Belum Ada Properti Favorit
                </h2>
                <p className="text-muted-foreground mb-6">
                  Mulai tambahkan properti ke favorit dengan mengklik tombol hati di halaman listing
                </p>
                <Link href="/listing">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Jelajahi Properti
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
