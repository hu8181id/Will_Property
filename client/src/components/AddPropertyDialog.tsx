import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ImagePlus, Loader2, Plus, Sparkles, Star, Upload, X } from "lucide-react";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { generatePropertySeoDraft } from "@/lib/propertySeoTemplate";
import { normalizePropertyVideoContentType } from "@/lib/propertyVideoUpload";

export const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface PropertyFormData {
  id?: number;
  title: string;
  description: string;
  propertyType: string;
  transactionType: string;
  price: string;
  location: string;
  address: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  floor: string;
  tower: string;
  view: string;
  condition: string;
  certificate: string;
  facilities: string;
  videoUrl: string;
  videoThumbnailUrl: string;
  virtualTourUrl: string;
}

export interface SelectedPropertyImage {
  src: string;
  file?: File;
  name?: string;
  contentType?: string;
}

export interface SelectedPropertyVideo {
  file: File;
  name: string;
  contentType: string;
}

export interface PropertyFormSubmit {
  data: PropertyFormData;
  images: SelectedPropertyImage[];
  videoFile?: SelectedPropertyVideo;
  videoThumbnail?: SelectedPropertyImage;
  onVideoUploadProgress?: (percent: number) => void;
}

interface AddPropertyDialogProps {
  onSubmit: (value: PropertyFormSubmit) => Promise<void>;
  initialProperty?: Partial<PropertyFormData> & { id: number; images?: string[] };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
}

const emptyForm: PropertyFormData = {
  title: "",
  description: "",
  propertyType: "rumah",
  transactionType: "dijual",
  price: "",
  location: "",
  address: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  floor: "",
  tower: "",
  view: "",
  condition: "",
  certificate: "",
  facilities: "",
  videoUrl: "",
  videoThumbnailUrl: "",
  virtualTourUrl: "",
};

function dataUrlFromCanvas(canvas: HTMLCanvasElement, type = "image/jpeg") {
  return canvas.toDataURL(type, 0.82);
}

async function compressImage(file: File): Promise<SelectedPropertyImage> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran foto maksimal 10 MB.");
  }

  // 1. Coba upload langsung ke Vercel Blob agar permanen
  try {
    const { uploadToVercelBlob } = await import("@/lib/vercelBlobClient");
    const blobUrl = await uploadToVercelBlob(file);
    if (blobUrl) {
      return {
        src: blobUrl,
        file: undefined, // Sudah terunggah permanen
        name: file.name,
        contentType: file.type || "image/jpeg",
      };
    }
  } catch (blobErr) {
    console.warn("[Vercel Blob Image] Direct blob upload error during selection:", blobErr);
  }

  // 2. Kompresi gambar client-side sebagai fallback canvas
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser tidak mendukung pemrosesan foto.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const dataUrl = dataUrlFromCanvas(canvas);
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const compressedFile = new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
    type: "image/jpeg",
  });
  return {
    src: dataUrl,
    file: compressedFile,
    name: compressedFile.name,
    contentType: compressedFile.type,
  };
}

function propertyToForm(initial?: AddPropertyDialogProps["initialProperty"]): PropertyFormData {
  return {
    ...emptyForm,
    ...initial,
    price: initial?.price ?? "",
    address: initial?.address ?? "",
    area: initial?.area ?? "",
    bedrooms: initial?.bedrooms ?? "",
    bathrooms: initial?.bathrooms ?? "",
    floor: initial?.floor ?? "",
    tower: initial?.tower ?? "",
    view: initial?.view ?? "",
    condition: initial?.condition ?? "",
    certificate: initial?.certificate ?? "",
    facilities: initial?.facilities ?? "",
    videoUrl: initial?.videoUrl ?? "",
    videoThumbnailUrl: initial?.videoThumbnailUrl ?? "",
    virtualTourUrl: initial?.virtualTourUrl ?? "",
  };
}

export default function AddPropertyDialog({
  onSubmit,
  initialProperty,
  open: controlledOpen,
  onOpenChange,
  triggerLabel = "Tambah Properti",
}: AddPropertyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>(() => propertyToForm(initialProperty));
  const [images, setImages] = useState<SelectedPropertyImage[]>(() =>
    (initialProperty?.images ?? []).map((src) => ({ src })),
  );
  const [videoFile, setVideoFile] = useState<SelectedPropertyVideo | undefined>();
  const [videoThumbnail, setVideoThumbnail] = useState<SelectedPropertyImage | undefined>(() =>
    initialProperty?.videoThumbnailUrl ? { src: initialProperty.videoThumbnailUrl } : undefined,
  );
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(initialProperty?.id);
  const isControlled = controlledOpen !== undefined;
  const open = controlledOpen ?? internalOpen;
  const wasOpenRef = useRef(open);

  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setFormData(propertyToForm(initialProperty));
      setImages((initialProperty?.images ?? []).map((src) => ({ src })));
      setVideoFile(undefined);
      setVideoThumbnail(initialProperty?.videoThumbnailUrl ? { src: initialProperty.videoThumbnailUrl } : undefined);
      setVideoUploadProgress(null);
    }
    wasOpenRef.current = open;
  }, [initialProperty, open]);

  const remainingSlots = useMemo(() => MAX_IMAGES - images.length, [images.length]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    if (files.length > remainingSlots) {
      toast.error(`Maksimal ${MAX_IMAGES} foto per listing.`);
      return;
    }

    try {
      const compressed = await Promise.all(files.map(compressImage));
      setImages((current) => [...current, ...compressed].slice(0, MAX_IMAGES));
    } catch (error) {
      console.error("[Property Image Preparation]", error);
      toast.error(error instanceof Error ? error.message : "Gagal memproses foto.");
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const contentType = normalizePropertyVideoContentType(file.type, file.name);
    if (!contentType) {
      toast.error("Video harus berformat MP4, WebM, MOV, M4V, atau 3GP.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Ukuran video maksimal 50 MB.");
      return;
    }
    setVideoFile({ file, name: file.name, contentType });
    setFormData((current) => ({ ...current, videoUrl: "" }));
  };

  const handleRemoveVideo = () => {
    setVideoFile(undefined);
  };

  const handleVideoThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setVideoThumbnail(compressed);
      setFormData((current) => ({ ...current, videoThumbnailUrl: "" }));
    } catch (error) {
      console.error("[Video Thumbnail Preparation]", error);
      toast.error(error instanceof Error ? error.message : "Gagal memproses thumbnail video.");
    }
  };

  const handleRemoveVideoThumbnail = () => {
    setVideoThumbnail(undefined);
    setFormData((current) => ({ ...current, videoThumbnailUrl: "" }));
  };

  const handleRemoveImage = (index: number) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const makeCover = (index: number) => {
    setImages((current) => {
      const selected = current[index];
      return selected ? [selected, ...current.filter((_, imageIndex) => imageIndex !== index)] : current;
    });
  };

  const handleGenerateSeoDraft = () => {
    setFormData((current) => {
      const draft = generatePropertySeoDraft(current);
      return { ...current, title: draft.title, description: draft.description };
    });
    toast.success("Saran judul dan deskripsi SEO telah diterapkan. Anda masih dapat mengeditnya.");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Nama properti wajib diisi.");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Lokasi wajib diisi.");
      return;
    }
    if (!String(formData.price).trim()) {
      toast.error("Harga wajib diisi.");
      return;
    }
    if (formData.description.trim().length < 10) {
      toast.error("Deskripsi properti minimal 10 karakter.");
      return;
    }
    if (images.length === 0) {
      toast.error("Minimal 1 foto diperlukan untuk listing.");
      return;
    }

    setSubmitting(true);
    setVideoUploadProgress(videoFile ? 0 : null);
    try {
      await onSubmit({ data: formData, images, videoFile, videoThumbnail, onVideoUploadProgress: setVideoUploadProgress });
      setDialogOpen(false);
      if (!isEditing) {
        setFormData(emptyForm);
        setImages([]);
        setVideoFile(undefined);
        setVideoThumbnail(undefined);
      }
    } catch (error) {
      console.error("[Property Form]", error);
      toast.error(error instanceof Error ? error.message : "Listing gagal disimpan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
      setVideoUploadProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus size={18} />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Listing Properti" : "Tambah Properti Baru"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui informasi listing dan kelola foto properti." : "Simpan listing ke database Primedeal dengan maksimal 5 foto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Foto Properti (maksimal {MAX_IMAGES}) *</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
              {images.map((image, index) => (
                <div key={`${image.src}-${index}`} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border">
                  <img src={image.src} alt={`Foto properti ${index + 1}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-1 bottom-1 flex flex-col gap-1">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => makeCover(index)} className="flex-1 rounded bg-black/75 px-1 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {index === 0 ? "Utama" : "Jadikan Utama"}
                      </button>
                      <button type="button" onClick={() => handleRemoveImage(index)} className="rounded bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Hapus foto ${index + 1}`}>
                        <X size={13} />
                      </button>
                    </div>
                    <div className="flex justify-between px-0.5">
                      {index > 0 ? (
                        <button type="button" onClick={() => {
                          setImages((current) => {
                            const next = [...current];
                            const temp = next[index];
                            next[index] = next[index - 1];
                            next[index - 1] = temp;
                            return next;
                          });
                        }} className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          ← Geser
                        </button>
                      ) : <span />}
                      {index < images.length - 1 ? (
                        <button type="button" onClick={() => {
                          setImages((current) => {
                            const next = [...current];
                            const temp = next[index];
                            next[index] = next[index + 1];
                            next[index + 1] = temp;
                            return next;
                          });
                        }} className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          Geser →
                        </button>
                      ) : <span />}
                    </div>
                  </div>
                  {index === 0 && <span className="absolute top-1 left-1 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1"><Star size={10} fill="currentColor" /> Utama</span>}
                </div>
              ))}
            </div>
            {remainingSlots > 0 && (
              <label className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer block hover:border-primary transition-colors">
                <Upload size={28} className="mx-auto mb-2 text-muted-foreground" />
                <span className="text-sm font-medium block">Klik untuk memilih foto</span>
                <span className="text-xs text-muted-foreground">Maksimal 10 MB per foto, tersisa {remainingSlots} slot</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} disabled={submitting} />
              </label>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="field-label" htmlFor="property-title-input">Nama Properti *</label><Input id="property-title-input" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} placeholder="Contoh: Rumah Modern di Surabaya" /></div>
            <div><label className="field-label" htmlFor="property-location-input">Lokasi *</label><Input id="property-location-input" value={formData.location} onChange={(event) => setFormData({ ...formData, location: event.target.value })} placeholder="Surabaya, Indonesia" /></div>
            <div><label className="field-label">Alamat</label><Input value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} placeholder="Alamat lengkap properti" /></div>
            <div><label className="field-label">Harga (Rp) *</label><Input type="number" min="0" value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} placeholder="2500000000" /></div>
            <div><label className="field-label">Tipe Properti</label><select value={formData.propertyType} onChange={(event) => setFormData({ ...formData, propertyType: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="rumah">Rumah</option><option value="apartemen">Apartemen</option><option value="ruko">Ruko</option><option value="tanah">Tanah</option><option value="lainnya">Lainnya</option></select></div>
            <div><label className="field-label">Transaksi</label><select value={formData.transactionType} onChange={(event) => setFormData({ ...formData, transactionType: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="dijual">Dijual</option><option value="disewa">Disewa</option></select></div>
            <div id="seo-template" className="md:col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Sparkles size={16} className="text-primary" /> Template SEO Gratis</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Buat saran judul dan deskripsi dari data properti. Tinjau dan edit hasilnya sebelum menyimpan.</p>
                </div>
                <Button type="button" variant="outline" onClick={handleGenerateSeoDraft} disabled={submitting || (!formData.title.trim() && !formData.location.trim())} className="shrink-0 border-primary/30 bg-white text-primary hover:bg-primary hover:text-white">
                  <Sparkles size={15} className="mr-2" /> Buat Saran SEO Gratis
                </Button>
              </div>
            </div>
            <div><label className="field-label">Luas (m²)</label><Input type="number" min="0" value={formData.area} onChange={(event) => setFormData({ ...formData, area: event.target.value })} /></div>
            <div><label className="field-label">Kamar Tidur</label><Input type="number" min="0" value={formData.bedrooms} onChange={(event) => setFormData({ ...formData, bedrooms: event.target.value })} /></div>
            <div><label className="field-label">Kamar Mandi</label><Input type="number" min="0" value={formData.bathrooms} onChange={(event) => setFormData({ ...formData, bathrooms: event.target.value })} /></div>
            <div><label className="field-label">Lantai / Tower</label><Input value={formData.floor} onChange={(event) => setFormData({ ...formData, floor: event.target.value })} placeholder="Lantai 12 / Tower A" /></div>
            <div><label className="field-label">Kondisi</label><Input value={formData.condition} onChange={(event) => setFormData({ ...formData, condition: event.target.value })} placeholder="Baru / Sangat Baik" /></div>
            <div><label className="field-label">Sertifikat</label><Input value={formData.certificate} onChange={(event) => setFormData({ ...formData, certificate: event.target.value })} placeholder="SHM / HGB" /></div>
            <div className="md:col-span-2"><label className="field-label">Fasilitas</label><Input value={formData.facilities} onChange={(event) => setFormData({ ...formData, facilities: event.target.value })} placeholder="Pisahkan dengan koma, misalnya Kolam Renang, Garasi" /></div>
            <div>
              <label htmlFor="video-url-input" className="field-label">Video Pendek</label>
              <Input id="video-url-input" type="url" value={formData.videoUrl} onChange={(event) => { setVideoFile(undefined); setFormData({ ...formData, videoUrl: event.target.value }); }} placeholder="https://... atau /manus-storage/..." />
              <label className="mt-2 flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary">
                <span>{videoFile ? videoFile.name : "Atau upload video maksimal 50 MB"}</span>
                <Upload size={14} />
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} disabled={submitting} />
              </label>
              {videoFile && <button type="button" onClick={handleRemoveVideo} className="mt-1 text-xs font-medium text-red-600 hover:underline">Hapus video terpilih</button>}
            </div>
            <div><label htmlFor="virtual-tour-input" className="field-label">Tur 360°</label><Input id="virtual-tour-input" type="url" value={formData.virtualTourUrl} onChange={(event) => setFormData({ ...formData, virtualTourUrl: event.target.value })} placeholder="https://my.matterport.com/..." /><p className="mt-1 text-xs text-muted-foreground">Tautan Matterport, Kuula, atau platform tur virtual lain.</p></div>
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="video-thumbnail-input">Thumbnail Video (opsional)</label>
              {videoThumbnail ? (
                <div className="relative h-40 max-w-xs overflow-hidden rounded-xl border bg-slate-100">
                  <img src={videoThumbnail.src} alt="Preview thumbnail video" className="h-full w-full object-cover" />
                  <button type="button" onClick={handleRemoveVideoThumbnail} disabled={submitting} className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white shadow hover:bg-red-700 disabled:opacity-60" aria-label="Hapus thumbnail video"><X size={15} /></button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary" htmlFor="video-thumbnail-input">
                  <ImagePlus size={22} className="text-primary" />
                  <span><strong className="block text-slate-800">Pilih foto sebagai thumbnail video</strong>JPG, PNG, atau WebP; otomatis dikompres.</span>
                  <input id="video-thumbnail-input" type="file" accept="image/*" className="hidden" onChange={handleVideoThumbnailChange} disabled={submitting} />
                </label>
              )}
              <p className="mt-2 text-xs text-muted-foreground">Thumbnail akan tampil sebelum video diputar pada detail properti.</p>
            </div>
            {videoUploadProgress !== null && (
              <div className="md:col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-4" role="status" aria-live="polite">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-primary"><span>Mengunggah video...</span><span>{videoUploadProgress}%</span></div>
                <Progress value={videoUploadProgress} aria-label="Progres unggah video" />
              </div>
            )}
            <div className="md:col-span-2"><label className="field-label" htmlFor="property-description-input">Deskripsi *</label><Textarea id="property-description-input" rows={5} value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Tuliskan deskripsi profesional properti..." /></div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Batal</Button>
            <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white min-w-40">
              {submitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Menyimpan listing...</> : isEditing ? "Simpan Perubahan" : "Simpan Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
