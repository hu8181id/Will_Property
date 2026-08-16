import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit, ShieldCheck, ArrowLeft, Video, Upload, CheckCircle2 } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { Link } from "wouter";

export default function EmergencyListingManager() {
  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    if (variant === 'destructive') {
      sonnerToast.error(title, { description });
    } else {
      sonnerToast.success(title, { description });
    }
  };

  const utils = trpc.useUtils();
  const { data: listings, isLoading, error } = trpc.property.list.useQuery();
  const { data: me, isLoading: authLoading } = trpc.auth.me.useQuery();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("dijual - rumah");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("1");
  const [area, setArea] = useState("72");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const createMutation = trpc.property.create.useMutation({
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Listing baru berhasil ditambahkan!" });
      setShowAddModal(false);
      resetForm();
      utils.property.list.invalidate();
    },
    onError: (err) => {
      toast({ title: "Gagal Menambah", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.property.update.useMutation({
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Listing berhasil diperbarui!" });
      setShowAddModal(false);
      setEditingId(null);
      resetForm();
      utils.property.list.invalidate();
    },
    onError: (err) => {
      toast({ title: "Gagal Memperbarui", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.property.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Terhapus", description: "Listing berhasil dihapus." });
      utils.property.list.invalidate();
    },
    onError: (err) => {
      toast({ title: "Gagal Menghapus", description: err.message, variant: "destructive" });
    },
  });

  const uploadImageMutation = trpc.property.uploadImage.useMutation();
  const uploadVideoMutation = trpc.property.uploadVideo.useMutation();

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setPrice("");
    setType("dijual - rumah");
    setBedrooms("2");
    setBathrooms("1");
    setArea("72");
    setDescription("");
    setImageUrl("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80");
    setVideoUrl("");
    setEditingId(null);
  };

  const handleOpenEdit = (prop: any) => {
    setEditingId(prop.id);
    setTitle(prop.title || "");
    setLocation(prop.location || "");
    setPrice(String(prop.price || ""));
    setType(prop.propertyType || "dijual - rumah");
    setBedrooms(String(prop.bedrooms || 2));
    setBathrooms(String(prop.bathrooms || 1));
    setArea(String(prop.area || 72));
    setDescription(prop.description || "");
    setImageUrl(prop.images?.[0] || "");
    setVideoUrl(prop.videoUrl || "");
    setShowAddModal(true);
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("File tidak dapat dibaca."));
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVideo: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64Data = await fileToBase64(file);
      const result = isVideo
        ? await uploadVideoMutation.mutateAsync({
            fileName: file.name,
            base64Data,
            contentType: file.type as "video/mp4" | "video/webm" | "video/quicktime",
          })
        : await uploadImageMutation.mutateAsync({
            fileName: file.name,
            base64Data,
            contentType: file.type,
          });

      if (!result.url) throw new Error("Server tidak mengembalikan URL media.");
      if (isVideo) {
        setVideoUrl(result.url);
        toast({ title: "Upload Video Berhasil", description: "File video siap disimpan." });
      } else {
        setImageUrl(result.url);
        toast({ title: "Upload Foto Berhasil", description: "URL foto utama diperbarui." });
      }
    } catch (err: any) {
      toast({ title: "Upload Gagal", description: err.message || "Terjadi kesalahan upload", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      location,
      price: Number(price) || 0,
      propertyType: type,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      area: Number(area) || 36,
      description,
      images: [imageUrl],
      videoUrl: videoUrl ? videoUrl : undefined,
      videoThumbnailUrl: undefined,
      virtualTourUrl: undefined,
      transactionType: type.toLowerCase().includes("sewa") ? "disewa" : "dijual",
      facilities: [],
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isAdmin = me && me.role === 'admin';
  const urlHasAdminKey = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("admin_key");
  const isAuthorized = isAdmin || urlHasAdminKey;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
              <ArrowLeft className="w-5 h-5 mr-1" /> Kembali
            </Button>
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> Panel Manajemen Darurat Listing
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm bg-blue-700 px-3 py-1 rounded-full">
          {authLoading ? (
            <span>Memeriksa akses...</span>
          ) : isAuthorized ? (
            <span className="text-emerald-200 font-semibold flex items-center gap-1">✓ Akses Kontrol Aktif</span>
          ) : (
            <span className="text-amber-200 font-semibold">⚠️ Mode Baca Saja (Tambahkan ?admin_key=...)</span>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!isAuthorized && (
          <Card className="mb-6 bg-amber-50 border-amber-300 text-amber-900 p-4">
            <h3 className="font-bold text-lg mb-1">Akses Tambah & Hapus Dikunci</h3>
            <p className="text-sm">
              Untuk mengaktifkan tombol Tambah, Edit, dan Hapus, buka halaman ini dengan menyertakan parameter <code>?admin_key=...</code> pada URL browser Anda (sesuai <code>ADMIN_SECRET_KEY</code> yang diset di Vercel).
            </p>
          </Card>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Daftar Properti</h2>
            <p className="text-slate-600 text-sm">Kelola properti Primedeal dengan aman dan cepat.</p>
          </div>
          {isAuthorized && (
            <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow">
              <Plus className="w-5 h-5" /> Tambah Listing Baru
            </Button>
          )}
        </div>

        {/* Modal / Form Tambah atau Edit */}
        {showAddModal && isAuthorized && (
          <Card className="mb-8 border-2 border-emerald-500 shadow-xl bg-white">
            <CardHeader className="bg-emerald-50 border-b">
              <CardTitle className="text-emerald-800 flex items-center justify-between">
                <span>{editingId ? "Edit Listing Properti" : "Formulir Tambah Listing Properti"}</span>
                <Button variant="ghost" size="sm" onClick={() => { setShowAddModal(false); resetForm(); }}>Tutup</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Judul Iklan</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Apartemen Gunawangsa Manyar 2BR" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lokasi</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Manyar, Surabaya" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Harga (Rupiah)</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="300000000" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe Properti</label>
                  <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="dijual - rumah / disewa - apartemen" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kamar Tidur</label>
                  <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kamar Mandi</label>
                  <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Luas (m²)</label>
                  <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="36" />
                </div>
                
                {/* Upload Foto */}
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <Upload className="w-4 h-4 text-emerald-600" /> Unggah Foto Utama
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, false)} disabled={uploading} />
                  </div>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Atau ketik URL foto..." className="mt-2 text-xs" />
                </div>

                {/* Upload Video */}
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <Video className="w-4 h-4 text-blue-600" /> Unggah Video Pendek (Opsional)
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input type="file" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, true)} disabled={uploading} />
                  </div>
                  <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Atau ketik URL video..." className="mt-2 text-xs" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Deskripsi Lengkap</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Jelaskan fasilitas, keunggulan dekat kampus/jalan utama..." required />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>Batal</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {uploading ? "Mengunggah..." : createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tayangkan Listing"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Daftar Listing */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Memuat daftar properti...</div>
        ) : error ? (
          <Card className="p-6 bg-red-50 text-red-700 border-red-200">
            <p className="font-semibold">Gagal memuat daftar properti:</p>
            <p className="text-sm">{error.message}</p>
          </Card>
        ) : listings?.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Belum ada listing properti.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings?.map((prop: any) => (
              <Card key={prop.id} className="overflow-hidden bg-white shadow-md hover:shadow-lg transition flex flex-col justify-between">
                <div>
                  <div className="relative h-48 bg-slate-200">
                    <img src={prop.images?.[0] || imageUrl} alt={prop.title} className="w-full h-full object-cover" />
                    {prop.videoUrl && (
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow">
                        <Video className="w-3 h-3" /> Video
                      </span>
                    )}
                    <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded-md">
                      ID: {prop.id}
                    </span>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{prop.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{prop.location}</p>
                    <p className="text-blue-600 font-extrabold text-lg mb-3">
                      Rp {Number(prop.price).toLocaleString("id-ID")}
                    </p>
                    <div className="flex gap-3 text-xs text-slate-600 border-t pt-2">
                      <span>{prop.bedrooms} KT</span>
                      <span>{prop.bathrooms} KM</span>
                      <span>{prop.area} m²</span>
                    </div>
                  </CardContent>
                </div>
                {isAuthorized && (
                  <div className="p-3 bg-slate-50 border-t flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(prop)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Hapus listing "${prop.title}"?`)) {
                          deleteMutation.mutate({ id: prop.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
