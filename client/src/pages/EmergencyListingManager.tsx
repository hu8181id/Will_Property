import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Edit, ShieldCheck, Trash2, Video } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddPropertyDialog, { PropertyFormData, PropertyFormSubmit } from "@/components/AddPropertyDialog";
import { trpc } from "@/lib/trpc";
import { uploadPropertyVideo } from "@/lib/propertyVideoUpload";

interface EmergencyProperty {
  id: number;
  title?: string | null;
  location?: string | null;
  price?: number | string | null;
  propertyType?: string | null;
  transactionType?: string | null;
  description?: string | null;
  address?: string | null;
  area?: number | string | null;
  bedrooms?: number | string | null;
  bathrooms?: number | string | null;
  floor?: string | null;
  tower?: string | null;
  view?: string | null;
  condition?: string | null;
  certificate?: string | null;
  facilities?: string[] | null;
  images?: string[] | null;
  videoUrl?: string | null;
  videoThumbnailUrl?: string | null;
  virtualTourUrl?: string | null;
}

function numericValue(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value) : undefined;
  const parsed = Number(String(value ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function textValue(value: string | null | undefined) {
  return value ?? "";
}

function toPayload(data: PropertyFormData, images: string[]) {
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    propertyType: data.propertyType.trim() || "lainnya",
    transactionType: data.transactionType.trim() || "dijual",
    price: numericValue(data.price) ?? 0,
    location: data.location.trim(),
    address: data.address.trim() || undefined,
    area: numericValue(data.area),
    bedrooms: numericValue(data.bedrooms),
    bathrooms: numericValue(data.bathrooms),
    floor: data.floor.trim() || undefined,
    tower: data.tower.trim() || undefined,
    view: data.view.trim() || undefined,
    condition: data.condition.trim() || undefined,
    certificate: data.certificate.trim() || undefined,
    facilities: data.facilities.split(",").map((item) => item.trim()).filter(Boolean),
    images: images.slice(0, 5),
    videoUrl: data.videoUrl.trim() || undefined,
    videoThumbnailUrl: data.videoThumbnailUrl.trim() || undefined,
    virtualTourUrl: data.virtualTourUrl.trim() || undefined,
  };
}

export default function EmergencyListingManager() {
  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    if (variant === "destructive") {
      sonnerToast.error(title, { description });
    } else {
      sonnerToast.success(title, { description });
    }
  };

  const utils = trpc.useUtils();
  const { data: listings, isLoading, error } = trpc.property.list.useQuery();
  const { data: me, isLoading: authLoading } = trpc.auth.me.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<EmergencyProperty | null>(null);

  const createMutation = trpc.property.create.useMutation({
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Listing baru berhasil ditambahkan." });
    },
    onError: (err) => {
      toast({ title: "Gagal menambah listing", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.property.update.useMutation({
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Listing berhasil diperbarui." });
    },
    onError: (err) => {
      toast({ title: "Gagal memperbarui listing", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.property.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Terhapus", description: "Listing berhasil dihapus." });
      void utils.property.list.invalidate();
    },
    onError: (err) => {
      toast({ title: "Gagal menghapus listing", description: err.message, variant: "destructive" });
    },
  });

  const uploadImageMutation = trpc.property.uploadImage.useMutation();

  const urlHasAdminKey = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("admin_key");
  const isAdmin = me?.role === "admin";
  const isAuthorized = isAdmin || urlHasAdminKey;
  const typedListings = (listings ?? []) as EmergencyProperty[];

  const initialProperty = useMemo(() => {
    if (!editingProperty) return undefined;
    return {
      id: editingProperty.id,
      title: textValue(editingProperty.title),
      description: textValue(editingProperty.description),
      propertyType: textValue(editingProperty.propertyType) || "lainnya",
      transactionType: textValue(editingProperty.transactionType) || "dijual",
      price: String(editingProperty.price ?? ""),
      location: textValue(editingProperty.location),
      address: textValue(editingProperty.address),
      area: String(editingProperty.area ?? ""),
      bedrooms: String(editingProperty.bedrooms ?? ""),
      bathrooms: String(editingProperty.bathrooms ?? ""),
      floor: textValue(editingProperty.floor),
      tower: textValue(editingProperty.tower),
      view: textValue(editingProperty.view),
      condition: textValue(editingProperty.condition),
      certificate: textValue(editingProperty.certificate),
      facilities: (editingProperty.facilities ?? []).join(", "),
      videoUrl: textValue(editingProperty.videoUrl),
      videoThumbnailUrl: textValue(editingProperty.videoThumbnailUrl),
      virtualTourUrl: textValue(editingProperty.virtualTourUrl),
      images: editingProperty.images ?? [],
    };
  }, [editingProperty]);

  const uploadSelectedImages = async (images: PropertyFormSubmit["images"]) => {
    const uploaded: string[] = [];
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      if (!image.file) {
        uploaded.push(image.src);
        continue;
      }
      const result = await uploadImageMutation.mutateAsync({
        fileName: image.name || `property-${Date.now()}-${index}.jpg`,
        base64Data: image.src,
        contentType: image.contentType || "image/jpeg",
      });
      uploaded.push(result.url);
    }
    if (uploaded.length === 0) throw new Error("Minimal 1 foto diperlukan untuk listing.");
    return uploaded.slice(0, 5);
  };

  const handleSaveProperty = async ({ data, images, videoFile, videoThumbnail, onVideoUploadProgress }: PropertyFormSubmit) => {
    if (!isAuthorized) throw new Error("Akses admin diperlukan untuk mengelola listing.");

    let imageUrls: string[] = [];
    try {
      imageUrls = await uploadSelectedImages(images);
    } catch (e) {
      // Fallback jika upload gambar via serverless timeout: gunakan preview base64 langsung agar listing tetap tersimpan
      imageUrls = images.map(img => img.src).filter(Boolean).slice(0, 5);
    }

    let thumbnailUrls: string[] = [];
    if (videoThumbnail) {
      try {
        thumbnailUrls = await uploadSelectedImages([videoThumbnail]);
      } catch (e) {
        thumbnailUrls = [videoThumbnail.src];
      }
    }

    let videoUrl = data.videoUrl.trim() || undefined;
    if (videoFile) {
      try {
        const uploadedVideo = await uploadPropertyVideo(videoFile.file, onVideoUploadProgress);
        if (uploadedVideo) videoUrl = uploadedVideo;
      } catch (err) {
        console.warn("Video upload failed or timed out on Vercel, proceeding with listing save without video:", err);
      }
    }

    const payload = toPayload(data, imageUrls);
    if (videoUrl) payload.videoUrl = videoUrl;
    if (thumbnailUrls[0]) payload.videoThumbnailUrl = thumbnailUrls[0];

    if (editingProperty) {
      await updateMutation.mutateAsync({ id: editingProperty.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    setDialogOpen(false);
    setEditingProperty(null);
    await utils.property.list.invalidate();
  };

  const openCreate = () => {
    setEditingProperty(null);
    setDialogOpen(true);
  };

  const openEdit = (property: EmergencyProperty) => {
    setEditingProperty(property);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      <header className="flex items-center justify-between gap-4 bg-blue-600 px-4 py-4 text-white shadow-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="shrink-0 text-white hover:bg-blue-700">
              <ArrowLeft className="mr-1 h-5 w-5" /> Kembali
            </Button>
          </Link>
          <h1 className="flex min-w-0 items-center gap-2 truncate text-base font-bold sm:text-xl">
            <ShieldCheck className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" /> Panel Manajemen Listing
          </h1>
        </div>
        <div className="shrink-0 rounded-full bg-blue-700 px-2 py-1 text-right text-[11px] sm:px-3 sm:text-sm">
          {authLoading ? (
            <span>Memeriksa akses...</span>
          ) : isAuthorized ? (
            <span className="font-semibold text-emerald-200">✓ Akses Aktif</span>
          ) : (
            <span className="font-semibold text-amber-200">Mode Baca Saja</span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {!isAuthorized && (
          <Card className="mb-6 border-amber-300 bg-amber-50 p-4 text-amber-900">
            <h2 className="mb-1 text-lg font-bold">Akses tambah, edit, dan hapus dikunci</h2>
            <p className="text-sm">Buka halaman dengan parameter <code>?admin_key=...</code> sesuai kunci yang tersimpan di Vercel.</p>
          </Card>
        )}

        <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Daftar Properti</h2>
            <p className="text-sm text-slate-600">Kelola listing Primedeal dari HP maupun komputer.</p>
          </div>
          {isAuthorized && (
            <Button type="button" onClick={openCreate} className="w-full bg-emerald-600 text-white shadow hover:bg-emerald-700 sm:w-auto">
              Tambah Listing Baru
            </Button>
          )}
        </div>

        {isAuthorized && (
          <AddPropertyDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingProperty(null);
            }}
            initialProperty={initialProperty}
            onSubmit={handleSaveProperty}
          />
        )}

        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Memuat daftar properti...</div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">Gagal memuat daftar properti.</p>
            <p className="text-sm">{error.message}</p>
          </Card>
        ) : typedListings.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Belum ada listing properti.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {typedListings.map((property) => {
              const image = property.images?.[0];
              return (
                <Card key={property.id} className="flex flex-col justify-between overflow-hidden bg-white shadow-md transition hover:shadow-lg">
                  <div>
                    <div className="relative h-48 bg-slate-200">
                      {image ? <img src={image} alt={textValue(property.title)} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-500">Belum ada foto</div>}
                      {property.videoUrl && <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs text-white shadow"><Video className="h-3 w-3" /> Video</span>}
                      <span className="absolute right-2 top-2 rounded-md bg-slate-900/80 px-2 py-1 text-xs text-white">ID: {property.id}</span>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="line-clamp-2 text-lg font-bold text-slate-800">{textValue(property.title)}</h3>
                      <p className="mb-2 text-sm text-slate-500">{textValue(property.location)}</p>
                      <p className="mb-3 text-lg font-extrabold text-blue-600">Rp {Number(property.price ?? 0).toLocaleString("id-ID")}</p>
                      <div className="flex gap-3 border-t pt-2 text-xs text-slate-600">
                        <span>{property.bedrooms ?? 0} KT</span>
                        <span>{property.bathrooms ?? 0} KM</span>
                        <span>{property.area ?? 0} m²</span>
                        {(property.images?.length ?? 0) > 1 && <span>{property.images?.length}/5 foto</span>}
                      </div>
                    </CardContent>
                  </div>
                  {isAuthorized && (
                    <div className="flex justify-end gap-2 border-t bg-slate-50 p-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(property)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                        <Edit className="h-4 w-4" /> Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Hapus listing \"${property.title ?? "ini"}\"?`)) deleteMutation.mutate({ id: property.id });
                        }}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Trash2 className="h-4 w-4" /> Hapus
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
