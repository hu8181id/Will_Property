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
import { Plus, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  description: string;
}

interface AddPropertyDialogProps {
  onAddProperty: (property: Property) => void;
}

const MAX_IMAGES = 5;

export default function AddPropertyDialog({
  onAddProperty,
}: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    type: "rumah",
    beds: "3",
    baths: "2",
    area: "150",
    description: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      const remainingSlots = MAX_IMAGES - images.length;

      if (newImages.length > remainingSlots) {
        toast.error(
          `Maksimal ${MAX_IMAGES} foto. Anda masih bisa menambah ${remainingSlots} foto.`
        );
        return;
      }

      // Convert files to base64
      newImages.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.location ||
      !formData.price ||
      images.length === 0
    ) {
      toast.error("Mohon isi semua field dan minimal 1 foto diperlukan");
      return;
    }

    const newProperty: Property = {
      id: Date.now(),
      title: formData.title,
      location: formData.location,
      price: parseInt(formData.price),
      image: images[0], // Primary image
      images: images, // All images
      beds: parseInt(formData.beds),
      baths: parseInt(formData.baths),
      area: parseInt(formData.area),
      rating: 5,
      type: formData.type,
      date: new Date().toISOString().split("T")[0],
      description: formData.description,
    };

    onAddProperty(newProperty);

    // Reset form
    setFormData({
      title: "",
      location: "",
      price: "",
      type: "rumah",
      beds: "3",
      baths: "2",
      area: "150",
      description: "",
    });
    setImages([]);
    setOpen(false);

    toast.success("Properti berhasil ditambahkan!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus size={20} />
          Tambah Properti
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Properti Baru</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan properti baru ke listing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload Foto Multiple */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Foto Properti (Maksimal {MAX_IMAGES} foto) *
            </label>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded">
                        Utama
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {images.length < MAX_IMAGES && (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={32} className="text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Klik untuk upload foto
                    </span>
                    <span className="text-xs text-muted-foreground">
                      atau drag and drop (tersisa: {MAX_IMAGES - images.length})
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={images.length >= MAX_IMAGES}
                  />
                </label>
              </div>
            )}

            {images.length >= MAX_IMAGES && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-sm text-blue-700">
                  ✓ Sudah upload {MAX_IMAGES} foto maksimal
                </p>
              </div>
            )}
          </div>

          {/* Nama Properti */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Nama Properti *
            </label>
            <Input
              placeholder="Contoh: Rumah Modern di Pondok Indah"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Lokasi *
            </label>
            <Input
              placeholder="Contoh: Jakarta Selatan"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
          </div>

          {/* Harga */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Harga (Rp) *
            </label>
            <Input
              type="number"
              placeholder="Contoh: 2500000000"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>

          {/* Tipe Properti */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Tipe Properti
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg"
            >
              <option value="rumah">Rumah</option>
              <option value="apartemen">Apartemen</option>
              <option value="ruko">Ruko</option>
              <option value="tanah">Tanah</option>
            </select>
          </div>

          {/* Kamar, Kamar Mandi, Luas */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Jumlah Kamar
              </label>
              <Input
                type="number"
                value={formData.beds}
                onChange={(e) =>
                  setFormData({ ...formData, beds: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Kamar Mandi
              </label>
              <Input
                type="number"
                value={formData.baths}
                onChange={(e) =>
                  setFormData({ ...formData, baths: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Luas (m²)
              </label>
              <Input
                type="number"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Deskripsi Properti
            </label>
            <Textarea
              placeholder="Tuliskan deskripsi lengkap tentang properti ini..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Tambah Properti
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
