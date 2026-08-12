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
import { Loader2, Plus, Star, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
}

export interface SelectedPropertyImage {
  src: string;
  file?: File;
  name?: string;
  contentType?: string;
}

export interface PropertyFormSubmit {
  data: PropertyFormData;
  images: SelectedPropertyImage[];
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
};

function dataUrlFromCanvas(canvas: HTMLCanvasElement, type = "image/jpeg") {
  return canvas.toDataURL(type, 0.82);
}

async function compressImage(file: File): Promise<SelectedPropertyImage> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran foto maksimal 10 MB sebelum kompresi.");
  }

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
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(initialProperty?.id);
  const isControlled = controlledOpen !== undefined;
  const open = controlledOpen ?? internalOpen;

  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (open) {
      setFormData(propertyToForm(initialProperty));
      setImages((initialProperty?.images ?? []).map((src) => ({ src })));
    }
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

  const handleRemoveImage = (index: number) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const makeCover = (index: number) => {
    setImages((current) => {
      const selected = current[index];
      return selected ? [selected, ...current.filter((_, imageIndex) => imageIndex !== index)] : current;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.location.trim() || !formData.price || formData.description.trim().length < 10) {
      toast.error("Isi judul, lokasi, harga, dan deskripsi minimal 10 karakter.");
      return;
    }
    if (images.length === 0) {
      toast.error("Minimal 1 foto diperlukan untuk listing.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ data: formData, images });
      setDialogOpen(false);
      if (!isEditing) {
        setFormData(emptyForm);
        setImages([]);
      }
    } catch (error) {
      console.error("[Property Form]", error);
      toast.error(error instanceof Error ? error.message : "Listing gagal disimpan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
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
                  <div className="absolute inset-x-1 bottom-1 flex gap-1">
                    <button type="button" onClick={() => makeCover(index)} className="flex-1 rounded bg-black/65 px-1 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {index === 0 ? "Foto Utama" : "Jadikan Utama"}
                    </button>
                    <button type="button" onClick={() => handleRemoveImage(index)} className="rounded bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Hapus foto ${index + 1}`}>
                      <X size={13} />
                    </button>
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
            <div className="md:col-span-2"><label className="field-label">Nama Properti *</label><Input value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} placeholder="Contoh: Rumah Modern di Surabaya" /></div>
            <div><label className="field-label">Lokasi *</label><Input value={formData.location} onChange={(event) => setFormData({ ...formData, location: event.target.value })} placeholder="Surabaya, Indonesia" /></div>
            <div><label className="field-label">Alamat</label><Input value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} placeholder="Alamat lengkap properti" /></div>
            <div><label className="field-label">Harga (Rp) *</label><Input type="number" min="0" value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} placeholder="2500000000" /></div>
            <div><label className="field-label">Tipe Properti</label><select value={formData.propertyType} onChange={(event) => setFormData({ ...formData, propertyType: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="rumah">Rumah</option><option value="apartemen">Apartemen</option><option value="ruko">Ruko</option><option value="tanah">Tanah</option><option value="lainnya">Lainnya</option></select></div>
            <div><label className="field-label">Transaksi</label><select value={formData.transactionType} onChange={(event) => setFormData({ ...formData, transactionType: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="dijual">Dijual</option><option value="disewa">Disewa</option></select></div>
            <div><label className="field-label">Luas (m²)</label><Input type="number" min="0" value={formData.area} onChange={(event) => setFormData({ ...formData, area: event.target.value })} /></div>
            <div><label className="field-label">Kamar Tidur</label><Input type="number" min="0" value={formData.bedrooms} onChange={(event) => setFormData({ ...formData, bedrooms: event.target.value })} /></div>
            <div><label className="field-label">Kamar Mandi</label><Input type="number" min="0" value={formData.bathrooms} onChange={(event) => setFormData({ ...formData, bathrooms: event.target.value })} /></div>
            <div><label className="field-label">Lantai / Tower</label><Input value={formData.floor} onChange={(event) => setFormData({ ...formData, floor: event.target.value })} placeholder="Lantai 12 / Tower A" /></div>
            <div><label className="field-label">Kondisi</label><Input value={formData.condition} onChange={(event) => setFormData({ ...formData, condition: event.target.value })} placeholder="Baru / Sangat Baik" /></div>
            <div><label className="field-label">Sertifikat</label><Input value={formData.certificate} onChange={(event) => setFormData({ ...formData, certificate: event.target.value })} placeholder="SHM / HGB" /></div>
            <div className="md:col-span-2"><label className="field-label">Fasilitas</label><Input value={formData.facilities} onChange={(event) => setFormData({ ...formData, facilities: event.target.value })} placeholder="Pisahkan dengan koma, misalnya Kolam Renang, Garasi" /></div>
            <div className="md:col-span-2"><label className="field-label">Deskripsi *</label><Textarea rows={5} value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Tuliskan deskripsi profesional properti..." /></div>
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
