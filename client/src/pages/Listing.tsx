import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Bath, Bed, ChevronLeft, ChevronRight, Edit3, ExternalLink, Globe2, Heart, Loader2, MapPin, PlayCircle, Ruler, Share2, Star, Trash2, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddPropertyDialog, { PropertyFormData, PropertyFormSubmit } from "@/components/AddPropertyDialog";
import ComparisonModal from "@/components/ComparisonModal";
import RatingReview from "@/components/RatingReview";
import { trpc } from "@/lib/trpc";
import { uploadPropertyVideo } from "@/lib/propertyVideoUpload";
import { formatPriceShort } from "@/lib/propertyPrice";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  address?: string | null;
  price: number;
  images: string[];
  image: string;
  beds: number;
  baths: number;
  area: number;
  rating: number;
  type: string;
  transactionType: string;
  condition?: string | null;
  certificate?: string | null;
  floor?: string | null;
  tower?: string | null;
  view?: string | null;
  facilities: string[];
  videoUrl?: string | null;
  videoThumbnailUrl?: string | null;
  virtualTourUrl?: string | null;
  date: string;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

function normalizeProperty(row: any): Property {
  const images = stringArray(row.images);
  const fallback = "/manus-storage/property-card-bg_4cd1dc11.png";
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    address: row.address,
    price: numberValue(row.price),
    images: images.length > 0 ? images : [fallback],
    image: images[0] || fallback,
    beds: numberValue(row.bedrooms),
    baths: numberValue(row.bathrooms),
    area: numberValue(row.area),
    rating: 0,
    type: row.propertyType,
    transactionType: row.transactionType,
    condition: row.condition,
    certificate: row.certificate,
    floor: row.floor,
    tower: row.tower,
    view: row.view,
    facilities: stringArray(row.facilities),
    videoUrl: typeof row.videoUrl === "string" ? row.videoUrl : null,
    videoThumbnailUrl: typeof row.videoThumbnailUrl === "string" ? row.videoThumbnailUrl : null,
    virtualTourUrl: typeof row.virtualTourUrl === "string" ? row.virtualTourUrl : null,
    date: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt ?? ""),
  };
}

function toNumber(value: string | number) {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? Math.round(value) : undefined;
  const cleaned = String(value || "").replace(/[^\d.]/g, "").trim();
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : undefined;
}

function toPayload(data: PropertyFormData, images: string[]) {
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    propertyType: data.propertyType,
    transactionType: data.transactionType,
    price: toNumber(data.price) ?? 0,
    location: data.location.trim(),
    address: data.address.trim() || undefined,
    area: toNumber(data.area),
    bedrooms: toNumber(data.bedrooms),
    bathrooms: toNumber(data.bathrooms),
    floor: data.floor.trim() || undefined,
    tower: data.tower.trim() || undefined,
    view: data.view.trim() || undefined,
    condition: data.condition.trim() || undefined,
    certificate: data.certificate.trim() || undefined,
    facilities: data.facilities.split(",").map((item) => item.trim()).filter(Boolean),
    images,
    videoUrl: data.videoUrl.trim() || undefined,
    videoThumbnailUrl: data.videoThumbnailUrl.trim() || undefined,
    virtualTourUrl: data.virtualTourUrl.trim() || undefined,
  };
}

export default function Listing() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [filters, setFilters] = useState({ priceMin: "", priceMax: "", type: [] as string[], beds: [] as string[], transactionType: "semua" });
  const [sortBy, setSortBy] = useState<"terbaru" | "harga-rendah" | "harga-tinggi">("terbaru");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageIndices, setImageIndices] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [comparison, setComparison] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [reviewProperty, setReviewProperty] = useState<Property | null>(null);
  const hasBootstrapped = useRef(false);
  const sharedPropertyHandled = useRef(false);
  const sharedPropertyId = typeof window !== "undefined" ? Number(new URLSearchParams(window.location.search).get("property")) : NaN;

  const queryInput = useMemo(() => ({
    search: searchQuery.trim() || undefined,
    propertyType: filters.type.length === 1 ? filters.type[0] : undefined,
    transactionType: filters.transactionType === "semua" ? undefined : filters.transactionType,
    priceMin: toNumber(filters.priceMin),
    priceMax: toNumber(filters.priceMax),
    bedrooms: filters.beds.length > 0 ? Math.min(...filters.beds.map(Number)) : undefined,
    sortBy,
  }), [filters, searchQuery, sortBy]);

  const propertiesQuery = trpc.property.list.useQuery(queryInput, { staleTime: 15_000 });
  const utils = trpc.useUtils();
  const seedDefault = trpc.property.seedDefault.useMutation();
  const migrateLegacy = trpc.property.migrateLegacy.useMutation();
  const uploadImage = trpc.property.uploadImage.useMutation();
  const createProperty = trpc.property.create.useMutation();
  const updateProperty = trpc.property.update.useMutation();
  const deleteProperty = trpc.property.delete.useMutation();
  const { mutate: recordPageView } = trpc.analytics.recordPageView.useMutation();

  const properties = useMemo(() => (propertiesQuery.data ?? []).map(normalizeProperty), [propertiesQuery.data]);
  const comparisonProperties = properties.filter((property) => comparison.includes(property.id));

  useEffect(() => {
    if (!selectedProperty) return;
    recordPageView({
      contentType: "listing",
      path: `/listing/${selectedProperty.id}`,
      contentTitle: selectedProperty.title,
      propertyId: selectedProperty.id,
    });
  }, [recordPageView, selectedProperty]);

  useEffect(() => {
    if (!Number.isFinite(sharedPropertyId) || sharedPropertyId <= 0 || properties.length === 0 || sharedPropertyHandled.current) return;
    const sharedProperty = properties.find((property) => property.id === sharedPropertyId);
    if (!sharedProperty) return;
    sharedPropertyHandled.current = true;
    setSelectedProperty(sharedProperty);
    window.setTimeout(() => {
      document.getElementById(`property-${sharedProperty.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.success(`Listing "${sharedProperty.title}" siap dilihat.`);
    }, 150);
  }, [properties, sharedPropertyId]);

  useEffect(() => {
    const sharedProperty = properties.find((property) => property.id === sharedPropertyId);
    if (!sharedProperty || typeof document === "undefined") return;
    const shareUrl = `${window.location.origin}/listing?property=${sharedProperty.id}`;
    const shareDescription = `${sharedProperty.title} di ${sharedProperty.location}. Harga ${formatPrice(sharedProperty.price)}. Lihat detail listing Primedeal Properti.`;
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    const metaValues = [
      ["name", "description", shareDescription],
      ["property", "og:title", sharedProperty.title],
      ["property", "og:description", shareDescription],
      ["property", "og:url", shareUrl],
      ["name", "twitter:title", sharedProperty.title],
      ["name", "twitter:description", shareDescription],
    ] as const;
    document.title = `${sharedProperty.title} | Primedeal Properti`;
    metaValues.forEach(([attribute, key, value]) => {
      const element = document.querySelector(`meta[${attribute}="${key}"]`);
      element?.setAttribute("content", value);
    });
    return () => {
      document.title = originalTitle;
      document.querySelector('meta[name="description"]')?.setAttribute("content", originalDescription);
    };
  }, [properties, sharedPropertyId]);

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("primedeal_favorites_ids");
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (error) {
      console.error("[Favorites Load]", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("primedeal_favorites_ids", JSON.stringify(favorites));
    } catch (error) {
      console.error("[Favorites Save]", error);
    }
  }, [favorites]);

  useEffect(() => {
    if (propertiesQuery.isLoading || hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    const migrateOrSeed = async () => {
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
          } else {
            localStorage.setItem("primedeal_listing_migrated_v1", "true");
            localStorage.removeItem("primedeal_properties");
          }
        }

        if (properties.length === 0) {
          await seedDefault.mutateAsync();
          await utils.property.list.invalidate();
        }
      } catch (error) {
        console.error("[Property Bootstrap]", error);
        toast.error("Data listing belum dapat dimuat. Silakan coba lagi.");
      }
    };

    void migrateOrSeed();
  }, [migrateLegacy, properties.length, propertiesQuery.isLoading, seedDefault, utils.property.list]);

  const handleToggleFavorite = (id: number) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleToggleComparison = (id: number) => {
    setComparison((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) {
        toast.info("Maksimal 3 properti dapat dibandingkan.");
        return current;
      }
      return [...current, id];
    });
  };

  const uploadSelectedImages = async (images: PropertyFormSubmit["images"]) => {
    const uploaded: string[] = [];
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      if (!image.file) {
        uploaded.push(image.src);
        continue;
      }
      const result = await uploadImage.mutateAsync({
        fileName: image.name || `property-${Date.now()}-${index}.jpg`,
        base64Data: image.src,
        contentType: image.contentType || "image/jpeg",
      });
      uploaded.push(result.url);
    }
    return uploaded;
  };

  const uploadSelectedVideo = async (videoFile: PropertyFormSubmit["videoFile"], onProgress?: PropertyFormSubmit["onVideoUploadProgress"]) => {
    if (!videoFile) return undefined;
    return uploadPropertyVideo(videoFile.file, onProgress);
  };

  const handleSaveProperty = async ({ data, images, videoFile, videoThumbnail, onVideoUploadProgress }: PropertyFormSubmit) => {
    try {
      const imageUrls = await uploadSelectedImages(images);
      const thumbnailUrls = videoThumbnail ? await uploadSelectedImages([videoThumbnail]) : [];
      const videoUrl = await uploadSelectedVideo(videoFile, onVideoUploadProgress);
      const payload = toPayload(data, imageUrls);
      if (videoUrl) payload.videoUrl = videoUrl;
      if (thumbnailUrls[0]) payload.videoThumbnailUrl = thumbnailUrls[0];
      if (editingProperty) {
        await updateProperty.mutateAsync({ id: editingProperty.id, ...payload });
        toast.success("Listing berhasil diperbarui.");
        setEditingProperty(null);
      } else {
        await createProperty.mutateAsync(payload);
        toast.success("Listing berhasil ditambahkan.");
      }
      await utils.property.list.invalidate();
    } catch (error) {
      console.error("[Property Save]", error);
      throw new Error(error instanceof Error ? error.message : "Listing gagal disimpan. Silakan coba lagi.");
    }
  };

  const handleDeleteProperty = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus listing ini?")) return;
    setDeletingId(id);
    try {
      await deleteProperty.mutateAsync({ id });
      setComparison((current) => current.filter((item) => item !== id));
      setFavorites((current) => current.filter((item) => item !== id));
      await utils.property.list.invalidate();
      toast.success("Listing berhasil dihapus.");
    } catch (error) {
      console.error("[Property Delete]", error);
      toast.error("Listing gagal dihapus. Silakan coba lagi.");
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (property: Property) => {
    setEditingProperty(property);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
  const toggleFilter = (filterType: "type" | "beds", value: string) => setFilters((current) => ({ ...current, [filterType]: current[filterType].includes(value) ? current[filterType].filter((item) => item !== value) : [...current[filterType], value] }));
  const resetFilters = () => setFilters({ priceMin: "", priceMax: "", type: [], beds: [], transactionType: "semua" });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-secondary py-8"><div className="container"><h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Listing Properti</h1><p className="text-muted-foreground">Data listing tersimpan aman di database Primedeal.</p></div></section>
        <section className="py-12"><div className="container"><div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1"><div className="bg-secondary rounded-lg p-6 sticky top-24"><h3 className="text-lg font-bold text-slate-900 mb-6">Filter Properti</h3>
            <div className="mb-6"><label className="block text-sm font-semibold text-slate-900 mb-3">Rentang Harga</label><div className="space-y-2"><Input type="number" placeholder="Harga minimal" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })} /><Input type="number" placeholder="Harga maksimal" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })} /></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold text-slate-900 mb-3">Transaksi</label><select value={filters.transactionType} onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="semua">Semua</option><option value="dijual">Dijual</option><option value="disewa">Disewa</option></select></div>
            <div className="mb-6"><label className="block text-sm font-semibold text-slate-900 mb-3">Tipe Properti</label><div className="space-y-2">{["rumah", "apartemen", "ruko", "tanah", "lainnya"].map((type) => <div key={type} className="flex items-center gap-2"><Checkbox id={`type-${type}`} checked={filters.type.includes(type)} onCheckedChange={() => toggleFilter("type", type)} /><label htmlFor={`type-${type}`} className="text-sm text-slate-700 capitalize cursor-pointer">{type}</label></div>)}</div></div>
            <div className="mb-6"><label className="block text-sm font-semibold text-slate-900 mb-3">Minimal Kamar</label><div className="space-y-2">{["1", "2", "3", "4"].map((beds) => <div key={beds} className="flex items-center gap-2"><Checkbox id={`beds-${beds}`} checked={filters.beds.includes(beds)} onCheckedChange={() => toggleFilter("beds", beds)} /><label htmlFor={`beds-${beds}`} className="text-sm text-slate-700 cursor-pointer">{beds}+ Kamar</label></div>)}</div></div>
            <Button variant="outline" className="w-full" onClick={resetFilters}>Reset Filter</Button>
          </div></aside>

          <div className="lg:col-span-3">

            <div className="mb-8"><Input placeholder="Cari berdasarkan nama, lokasi, atau deskripsi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <div className="flex justify-between items-center mb-8 gap-4 flex-wrap"><p className="text-muted-foreground">Menampilkan {properties.length} properti</p><div className="flex gap-3 items-center flex-wrap"><select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="px-4 py-2 border border-border rounded-lg text-sm"><option value="terbaru">Terbaru</option><option value="harga-rendah">Harga: Rendah ke Tinggi</option><option value="harga-tinggi">Harga: Tinggi ke Rendah</option></select>{isAdmin && <AddPropertyDialog onSubmit={handleSaveProperty} />}</div></div>

            {propertiesQuery.isLoading ? <div className="grid md:grid-cols-2 gap-6"><div className="h-80 rounded-xl bg-secondary animate-pulse" /><div className="h-80 rounded-xl bg-secondary animate-pulse" /></div> : propertiesQuery.isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center"><p className="font-semibold text-red-800">Listing belum dapat dimuat.</p><p className="text-sm text-red-700 mt-2">Silakan refresh halaman dan coba lagi.</p><Button className="mt-4" onClick={() => propertiesQuery.refetch()}>Coba Lagi</Button></div> : properties.length === 0 ? <div className="text-center py-20"><p className="text-lg font-semibold text-slate-900">Belum ada listing yang sesuai.</p><Button variant="outline" className="mt-4" onClick={resetFilters}>Reset Filter</Button></div> : <div className="grid md:grid-cols-2 gap-6">{properties.map((property) => { const imageIndex = imageIndices[property.id] ?? 0; return <Card id={`property-${property.id}`} key={property.id} className="overflow-hidden group hover:shadow-xl transition-shadow"><div className="relative h-64 bg-gray-200"><img src={property.images[imageIndex] || property.image} alt={property.title} className="w-full h-full object-cover" /><button type="button" onClick={() => handleToggleFavorite(property.id)} className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow" aria-label="Simpan favorit"><Heart size={18} className={favorites.includes(property.id) ? "fill-red-500 text-red-500" : "text-slate-600"} /></button>{isAdmin && <button type="button" onClick={() => handleDeleteProperty(property.id)} disabled={deletingId === property.id} className="absolute top-3 left-3 bg-red-600/90 rounded-full p-2 text-white shadow disabled:cursor-wait disabled:opacity-70" aria-label="Hapus listing">{deletingId === property.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>}{property.images.length > 1 && <><button type="button" onClick={() => setImageIndices((current) => ({ ...current, [property.id]: (imageIndex - 1 + property.images.length) % property.images.length }))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={18} /></button><button type="button" onClick={() => setImageIndices((current) => ({ ...current, [property.id]: (imageIndex + 1) % property.images.length }))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={18} /></button><span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">{imageIndex + 1}/{property.images.length}</span></>}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900 line-clamp-2">{property.title}</h3><div className="flex items-center gap-1 text-sm text-muted-foreground mt-2"><MapPin size={14} />{property.location}</div></div><span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold capitalize text-primary">{property.transactionType}</span></div><p className="text-lg font-bold text-primary mt-4">{formatPriceShort(property.price)}</p><p className="text-sm text-muted-foreground mt-2 line-clamp-2">{property.description}</p><div className="mt-3"><Button variant="outline" size="sm" className="w-full text-primary border-primary/30 hover:bg-primary/5" onClick={() => setSelectedProperty(property)}>Lihat Detail Lengkap</Button></div><div className="flex items-center gap-3 text-xs text-muted-foreground mt-4"><span className="flex items-center gap-1"><Bed size={14} />{property.beds}</span><span className="flex items-center gap-1"><Bath size={14} />{property.baths}</span><span className="flex items-center gap-1"><Ruler size={14} />{property.area} m²</span><span className="flex items-center gap-1 ml-auto">{property.rating > 0 ? <><Star size={14} className="fill-yellow-400 text-yellow-400" />{property.rating.toFixed(1)}</> : "Belum ada rating"}</span></div>                        <div className="flex items-center justify-between mt-5 pt-4 border-t"><label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer"><Checkbox checked={comparison.includes(property.id)} onCheckedChange={() => handleToggleComparison(property.id)} /> Bandingkan</label><div className="flex gap-2"><Button variant="outline" size="sm" title="Bagikan ke WhatsApp / Salin Link" onClick={() => {
                          const shareUrl = `${window.location.origin}/listing?property=${property.id}`;
                          const shareText = `*${property.title}*\nLokasi: ${property.location}\nHarga: ${formatPrice(property.price)}\nTipe: ${property.transactionType.toUpperCase()} - ${property.type}\nKamar: ${property.beds} KT | ${property.baths} KM | Luas: ${property.area} m²\n\nLihat listing ini di Primedeal Properti: ${shareUrl}`;
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                          if (navigator.share) {
                            navigator.share({ title: property.title, text: shareText, url: shareUrl }).catch(() => {});
                          } else {
                            const shareWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                            if (!shareWindow) {
                              navigator.clipboard.writeText(shareUrl).then(() => toast.success("Link listing berhasil disalin ke clipboard!")).catch(() => toast.error("Link belum dapat disalin. Silakan coba lagi."));
                            }
                          }
                        }}><Share2 size={14} /></Button>{isAdmin && <Button variant="outline" size="sm" onClick={() => openEdit(property)}><Edit3 size={14} className="mr-1" /> Edit</Button>}</div></div></div></Card>; })}</div>}
          </div>
        </div></div></section>
      </main>
      <Footer />
      <ComparisonModal open={showComparison} onOpenChange={setShowComparison} properties={comparisonProperties} onRemove={handleToggleComparison} />
      {comparison.length > 0 && <button type="button" onClick={() => setShowComparison(true)} className="fixed bottom-5 right-5 z-30 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-xl">Bandingkan ({comparison.length})</button>}
      {editingProperty && <AddPropertyDialog open onOpenChange={(open) => { if (!open) setEditingProperty(null); }} initialProperty={{ id: editingProperty.id, title: editingProperty.title, description: editingProperty.description, propertyType: editingProperty.type, transactionType: editingProperty.transactionType, price: String(editingProperty.price), location: editingProperty.location, address: editingProperty.address ?? "", area: String(editingProperty.area), bedrooms: String(editingProperty.beds), bathrooms: String(editingProperty.baths), floor: editingProperty.floor ?? "", tower: editingProperty.tower ?? "", view: editingProperty.view ?? "", condition: editingProperty.condition ?? "", certificate: editingProperty.certificate ?? "", facilities: editingProperty.facilities.join(", "), videoUrl: editingProperty.videoUrl ?? "", videoThumbnailUrl: editingProperty.videoThumbnailUrl ?? "", virtualTourUrl: editingProperty.virtualTourUrl ?? "", images: editingProperty.images }} onSubmit={handleSaveProperty} />}
      {reviewProperty && (
        <RatingReview
          propertyId={reviewProperty.id}
          open
          onOpenChange={(open) => { if (!open) setReviewProperty(null); }}
          currentRating={reviewProperty.rating}
        />
      )}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button type="button" onClick={() => setSelectedProperty(null)} className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 text-slate-700" aria-label="Tutup detail">✕</button>
            <div className="mb-4">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">{selectedProperty.transactionType} - {selectedProperty.type}</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">{selectedProperty.title}</h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><MapPin size={16} />{selectedProperty.location} {selectedProperty.address ? `(${selectedProperty.address})` : ""}</div>
            </div>
            <div className="relative h-72 bg-gray-200 rounded-xl overflow-hidden mb-6">
              <img src={selectedProperty.images[imageIndices[selectedProperty.id] ?? 0] || selectedProperty.image} alt={selectedProperty.title} className="w-full h-full object-cover" />
              {selectedProperty.images.length > 1 && (
                <>
                  <button type="button" onClick={() => setImageIndices((current) => ({ ...current, [selectedProperty.id]: ((imageIndices[selectedProperty.id] ?? 0) - 1 + selectedProperty.images.length) % selectedProperty.images.length }))} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow"><ChevronLeft size={18} /></button>
                  <button type="button" onClick={() => setImageIndices((current) => ({ ...current, [selectedProperty.id]: ((imageIndices[selectedProperty.id] ?? 0) + 1) % selectedProperty.images.length }))} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow"><ChevronRight size={18} /></button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">{(imageIndices[selectedProperty.id] ?? 0) + 1} / {selectedProperty.images.length}</span>
                </>
              )}
            </div>
            {(selectedProperty.videoUrl || selectedProperty.virtualTourUrl) && (
              <section className="mb-6 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4" aria-labelledby="virtual-exploration-title">
                <div className="mb-4 flex items-center gap-2">
                  <Globe2 size={20} className="text-primary" />
                  <div>
                    <h3 id="virtual-exploration-title" className="font-semibold text-slate-900">Eksplorasi Virtual</h3>
                    <p className="text-xs text-muted-foreground">Lihat suasana properti sebelum menjadwalkan kunjungan.</p>
                  </div>
                </div>
                {selectedProperty.videoUrl && (
                  <div className="overflow-hidden rounded-xl border bg-black">
                    <video controls preload="metadata" poster={selectedProperty.videoThumbnailUrl || selectedProperty.image} className="max-h-80 w-full" aria-label={`Video pendek ${selectedProperty.title}`}>
                      <source src={selectedProperty.videoUrl} />
                      Browser Anda tidak mendukung pemutar video.
                    </video>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 text-xs text-muted-foreground"><Video size={14} /> Video pendek properti</div>
                  </div>
                )}
                {selectedProperty.virtualTourUrl && (
                  <Button asChild variant="outline" className="mt-3 w-full border-primary/30 text-primary hover:bg-primary/5">
                    <a href={selectedProperty.virtualTourUrl} target="_blank" rel="noopener noreferrer">
                      <PlayCircle size={16} className="mr-2" /> Buka Tur 360° <ExternalLink size={14} className="ml-auto" />
                    </a>
                  </Button>
                )}
              </section>
            )}
            <div className="grid grid-cols-2 gap-x-5 gap-y-4 rounded-xl bg-secondary/60 p-4 sm:grid-cols-4">
              <div className="col-span-2 min-w-0 sm:col-span-1"><p className="text-xs text-muted-foreground">Harga</p><p className="break-words text-xl font-bold leading-tight text-primary sm:text-lg">{formatPrice(selectedProperty.price)}</p></div>
              <div><p className="text-xs text-muted-foreground">Kamar Tidur</p><p className="text-base font-semibold text-slate-900">{selectedProperty.beds} KT</p></div>
              <div><p className="text-xs text-muted-foreground">Kamar Mandi</p><p className="text-base font-semibold text-slate-900">{selectedProperty.baths} KM</p></div>
              <div><p className="text-xs text-muted-foreground">Luas Bangunan</p><p className="text-base font-semibold text-slate-900">{selectedProperty.area} m²</p></div>
            </div>
            {(selectedProperty.floor || selectedProperty.tower || selectedProperty.condition || selectedProperty.certificate || selectedProperty.view) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-6 pb-6 border-b">
                {selectedProperty.tower && <div><span className="text-muted-foreground">Tower:</span> <span className="font-medium">{selectedProperty.tower}</span></div>}
                {selectedProperty.floor && <div><span className="text-xs text-muted-foreground">Lantai:</span> <span className="font-medium">{selectedProperty.floor}</span></div>}
                {selectedProperty.condition && <div><span className="text-xs text-muted-foreground">Kondisi:</span> <span className="font-medium">{selectedProperty.condition}</span></div>}
                {selectedProperty.certificate && <div><span className="text-xs text-muted-foreground">Sertifikat:</span> <span className="font-medium">{selectedProperty.certificate}</span></div>}
                {selectedProperty.view && <div><span className="text-xs text-muted-foreground">View:</span> <span className="font-medium">{selectedProperty.view}</span></div>}
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Deskripsi Lengkap Iklan</h3>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-secondary/30 p-4 rounded-xl">{selectedProperty.description}</p>
            </div>
            {selectedProperty.facilities && selectedProperty.facilities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Fasilitas Properti</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.facilities.map((facility, idx) => (
                    <span key={idx} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-slate-750">{facility}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-6 rounded-xl border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-slate-900">Bagikan pengalaman Anda</h3>
                  <p className="text-xs text-muted-foreground mt-1">Rating dan ulasan ditampilkan setelah diverifikasi tim Primedeal.</p>
                </div>
                <Button variant="outline" className="border-primary/30 text-primary" onClick={() => { setReviewProperty(selectedProperty); setSelectedProperty(null); }}>
                  <Star size={16} className="mr-2" /> Lihat Rating & Ulasan
                </Button>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button className="flex-1 bg-primary text-white" onClick={() => {
                const message = `Halo Primedeal, saya tertarik dengan listing "${selectedProperty.title}" (${formatPrice(selectedProperty.price)}) di ${selectedProperty.location}. Mohon informasi lebih lanjut.`;
                window.open(`https://wa.me/6282230357009?text=${encodeURIComponent(message)}`, "_blank");
              }}>Hubungi WhatsApp Agen</Button>
              <Button variant="outline" onClick={() => setSelectedProperty(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
