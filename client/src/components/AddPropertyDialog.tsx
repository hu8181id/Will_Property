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
import { Plus, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  date: string;
  description: string;
}

interface AddPropertyDialogProps {
  onAddProperty: (property: Property) => void;
}

export default function AddPropertyDialog({
  onAddProperty,
}: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
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
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.location ||
      !formData.price ||
      !imagePreview
    ) {
      toast.error("Mohon isi semua field yang diperlukan");
      return;
    }

    const newProperty: Property = {
      id: Date.now(),
      title: formData.title,
      location: formData.location,
      price: parseInt(formData.price),
      image: imagePreview,
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
    setImagePreview("");
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
          {/* Upload Foto */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Foto Properti *
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setImagePreview("")}
                  >
                    Ganti Foto
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={32} className="text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Klik untuk upload foto
                    </span>
                    <span className="text-xs text-muted-foreground">
                      atau drag and drop
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
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
