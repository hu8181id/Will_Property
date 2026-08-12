import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Bed, Bath, Ruler, Trash2, Heart, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
}

export default function Favorit() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const query = trpc.property.list.useQuery({ sortBy: "terbaru" }, { staleTime: 15_000 });

  useEffect(() => {
    try {
      const ids = localStorage.getItem("primedeal_favorites_ids");
      if (ids) {
        const parsed = JSON.parse(ids);
        if (Array.isArray(parsed)) setFavoriteIds(parsed.filter((id): id is number => typeof id === "number"));
        return;
      }

      const legacy = localStorage.getItem("primedeal_favorites");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed)) {
          const migratedIds = parsed.map((property) => property?.id).filter((id): id is number => typeof id === "number");
          setFavoriteIds(migratedIds);
          localStorage.setItem("primedeal_favorites_ids", JSON.stringify(migratedIds));
          localStorage.removeItem("primedeal_favorites");
        }
      }
    } catch (error) {
      console.error("[Favorites Load]", error);
    }
  }, []);

  const favoriteProperties = useMemo(() => (query.data ?? []).filter((property) => favoriteIds.includes(property.id)), [favoriteIds, query.data]);

  const handleRemoveFavorite = (id: number) => {
    const updated = favoriteIds.filter((favoriteId) => favoriteId !== id);
    setFavoriteIds(updated);
    localStorage.setItem("primedeal_favorites_ids", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-secondary py-8"><div className="container"><h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Properti Favorit</h1><p className="text-muted-foreground">Daftar properti aktif yang Anda simpan untuk referensi.</p></div></section>
        <section className="py-12"><div className="container">
          {query.isLoading ? <div className="flex justify-center py-16 text-muted-foreground"><Loader2 className="mr-2 animate-spin" /> Memuat favorit...</div> : favoriteProperties.length > 0 ? <><p className="text-muted-foreground mb-8">Anda memiliki {favoriteProperties.length} properti favorit</p><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{favoriteProperties.map((property) => { const images = Array.isArray(property.images) ? property.images : []; const image = images[0] || "/manus-storage/property-card-bg_4cd1dc11.png"; return <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow group"><div className="relative overflow-hidden h-48 bg-gray-200"><img src={image} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /><div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">{formatPrice(Number(property.price))}</div><button onClick={() => handleRemoveFavorite(property.id)} className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg" title="Hapus dari favorit"><Trash2 size={16} /></button></div><div className="p-5"><h3 className="text-base font-bold text-slate-900 mb-2">{property.title}</h3><p className="text-xs text-muted-foreground mb-3 line-clamp-2">{property.description}</p><div className="flex items-center gap-2 text-muted-foreground mb-3"><MapPin size={14} /><span className="text-xs">{property.location}</span></div><div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Bed size={14} />{property.bedrooms ?? 0}</span><span className="flex items-center gap-1"><Bath size={14} />{property.bathrooms ?? 0}</span><span className="flex items-center gap-1"><Ruler size={14} />{property.area ?? 0} m²</span></div></div></Card>; })}</div></> : <div className="text-center py-16"><Heart size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" /><h2 className="text-2xl font-bold text-slate-900 mb-2">Belum Ada Properti Favorit</h2><p className="text-muted-foreground mb-6">Mulai simpan properti melalui tombol hati di halaman Listing.</p><Link href="/listing"><Button className="bg-primary hover:bg-primary/90 text-white">Jelajahi Properti</Button></Link></div>}
        </div></section>
      </main>
      <Footer />
    </div>
  );
}
