import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { MapPin, Bed, Bath, Ruler, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

interface HomeProperty {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
  beds: number;
  baths: number;
  area: number;
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

function toImages(value: unknown) {
  return Array.isArray(value) ? value.filter((image): image is string => typeof image === "string") : [];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchData, setSearchData] = useState({ location: "", priceMin: "", priceMax: "", type: "" });
  const hasBootstrapped = useRef(false);
  const propertiesQuery = trpc.property.list.useQuery({ sortBy: "terbaru" }, { staleTime: 15_000 });
  const utils = trpc.useUtils();
  const seedDefault = trpc.property.seedDefault.useMutation();
  const migrateLegacy = trpc.property.migrateLegacy.useMutation();

  const properties = useMemo<HomeProperty[]>(() => (propertiesQuery.data ?? []).slice(0, 3).map((property) => {
    const images = toImages(property.images);
    return {
      id: property.id,
      title: property.title,
      location: property.location,
      price: toNumber(property.price),
      image: images[0] || "/manus-storage/property-card-bg_4cd1dc11.png",
      beds: toNumber(property.bedrooms),
      baths: toNumber(property.bathrooms),
      area: toNumber(property.area),
    };
  }), [propertiesQuery.data]);

  useEffect(() => {
    if (propertiesQuery.isLoading || hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    const bootstrap = async () => {
      try {
        const migratedFlag = localStorage.getItem("primedeal_listing_migrated_v1");
        const legacyRaw = localStorage.getItem("primedeal_properties");
        if (!migratedFlag && legacyRaw) {
          const legacyProperties = JSON.parse(legacyRaw);
          if (Array.isArray(legacyProperties) && legacyProperties.length > 0) {
            const result = await migrateLegacy.mutateAsync({ properties: legacyProperties });
            if (result.success) {
              localStorage.setItem("primedeal_listing_migrated_v1", "true");
              localStorage.removeItem("primedeal_properties");
              localStorage.removeItem("primedeal_deleted_ids");
              toast.success(`${result.migrated} listing lama berhasil dimigrasikan.`);
              await utils.property.list.invalidate();
              return;
            }
          }
        }
        if (properties.length === 0) {
          await seedDefault.mutateAsync();
          await utils.property.list.invalidate();
        }
      } catch (error) {
        console.error("[Home Property Bootstrap]", error);
      }
    };

    void bootstrap();
  }, [migrateLegacy, properties.length, propertiesQuery.isLoading, seedDefault, utils.property.list]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchData.location.trim()) params.set("location", searchData.location.trim());
    if (searchData.priceMin) params.set("priceMin", searchData.priceMin);
    if (searchData.priceMax) params.set("priceMax", searchData.priceMax);
    if (searchData.type) params.set("type", searchData.type);
    setLocation(`/listing${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden" style={{ backgroundImage: "url('/manus-storage/hero-background_c7146dac.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent" />
          <div className="container relative z-10"><div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Temukan Rumah Impian Anda</h1>
            <p className="text-lg text-slate-700 mb-8">Jelajahi properti pilihan dengan data listing yang dikelola aman oleh tim Primedeal.</p>
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6 md:p-8"><div className="grid md:grid-cols-4 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label><Input placeholder="Cari lokasi..." value={searchData.location} onChange={(e) => setSearchData({ ...searchData, location: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Harga Minimal</label><Input placeholder="Dari..." type="number" value={searchData.priceMin} onChange={(e) => setSearchData({ ...searchData, priceMin: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Harga Maksimal</label><Input placeholder="Hingga..." type="number" value={searchData.priceMax} onChange={(e) => setSearchData({ ...searchData, priceMax: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Tipe Properti</label><Select value={searchData.type} onValueChange={(value) => setSearchData({ ...searchData, type: value })}><SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger><SelectContent><SelectItem value="rumah">Rumah</SelectItem><SelectItem value="apartemen">Apartemen</SelectItem><SelectItem value="ruko">Ruko</SelectItem><SelectItem value="tanah">Tanah</SelectItem></SelectContent></Select></div>
            </div><Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3">Cari Properti</Button></form>
          </div></div>
        </section>

        <section className="py-16 md:py-24"><div className="container"><div className="mb-12"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Properti Unggulan</h2><p className="text-lg text-muted-foreground">Listing aktif terbaru dengan lokasi strategis dan harga kompetitif.</p></div>
          {propertiesQuery.isLoading ? <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="mr-2 animate-spin" /> Memuat properti...</div> : properties.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Belum ada properti aktif. Tambahkan listing melalui halaman Listing.</div> : <div className="grid md:grid-cols-3 gap-8">{properties.map((property) => <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"><div className="relative overflow-hidden h-64 bg-gray-200"><img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /><div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">{formatPrice(property.price)}</div></div><div className="p-6"><h3 className="text-lg font-bold text-slate-900 mb-2">{property.title}</h3><div className="flex items-center gap-2 text-muted-foreground mb-4"><MapPin size={16} /><span className="text-sm">{property.location}</span></div><div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Bed size={16} />{property.beds} Kamar</span><span className="flex items-center gap-1"><Bath size={16} />{property.baths} Kamar Mandi</span><span className="flex items-center gap-1"><Ruler size={16} />{property.area} m²</span></div><Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => setLocation(`/listing?search=${encodeURIComponent(property.title)}`)}>Lihat Detail <ChevronRight size={16} /></Button></div></Card>)}</div>}
          <div className="text-center mt-12"><Button onClick={() => setLocation("/listing")} className="bg-primary hover:bg-primary/90 text-white px-8 py-3">Lihat Semua Properti</Button></div>
        </div></section>

        <section className="py-16 md:py-24 bg-secondary"><div className="container"><div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Mengapa Memilih Primedeal?</h2><p className="text-lg text-muted-foreground max-w-2xl mx-auto">Kami membantu Anda mengambil keputusan properti dengan proses yang jelas dan data listing yang terkelola.</p></div><div className="grid md:grid-cols-3 gap-8">{[{ title: "Listing Terorganisir", desc: "Informasi properti tersimpan rapi dan dapat diperbarui oleh tim yang berwenang." }, { title: "Tim Profesional", desc: "Tim Primedeal siap membantu Anda memahami pilihan properti dan proses transaksi." }, { title: "Informasi Transparan", desc: "Harga, lokasi, fasilitas, dan foto ditampilkan secara terstruktur untuk memudahkan pencarian." }].map((item) => <div key={item.title} className="bg-white p-8 rounded-lg shadow-sm"><h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3><p className="text-muted-foreground">{item.desc}</p></div>)}</div></div></section>

        <section className="py-16 md:py-24 bg-primary text-white"><div className="container text-center"><h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Menemukan Properti Impian?</h2><p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">Hubungi tim Primedeal dan dapatkan konsultasi properti melalui WhatsApp.</p><Button className="bg-white text-primary hover:bg-blue-50 px-8 py-3 font-semibold" onClick={() => window.open(`https://wa.me/6282230357009?text=${encodeURIComponent("Halo Primedeal, saya ingin berkonsultasi tentang properti.")}`, "_blank")}>Hubungi Kami via WhatsApp</Button></div></section>
      </main>
      <Footer />
    </div>
  );
}
