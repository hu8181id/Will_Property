import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Users, Target, Award } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Tentang() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    pesan: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama || !formData.email || !formData.pesan) {
      toast.error("Mohon isi semua field yang diperlukan");
      return;
    }

    const phone = "6281234567890";
    const message = `Halo Primedeal,\n\nNama: ${formData.nama}\nEmail: ${formData.email}\nTelepon: ${formData.telepon}\n\nPesan: ${formData.pesan}`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    setFormData({ nama: "", email: "", telepon: "", pesan: "" });
    toast.success("Pesan Anda akan dikirim via WhatsApp");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary py-8">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Tentang Primedeal
            </h1>
            <p className="text-muted-foreground">
              Mengenal lebih jauh tentang misi dan visi kami
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Siapa Kami?
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Primedeal adalah platform properti terpercaya yang telah melayani ribuan klien dalam mencari properti impian mereka. Dengan pengalaman lebih dari 10 tahun di industri properti, kami memahami kebutuhan Anda.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Tim profesional kami terdiri dari agen properti bersertifikat, konsultan keuangan, dan ahli hukum properti yang siap membantu Anda di setiap langkah perjalanan properti Anda.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Kami berkomitmen untuk memberikan layanan terbaik dengan transparansi penuh dan integritas tinggi dalam setiap transaksi properti.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg h-96 flex items-center justify-center">
                <img
                  src="/manus-storage/hero-background_c7146dac.png"
                  alt="Tentang Primedeal"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Misi Kami
                </h3>
                <p className="text-muted-foreground">
                  Menyediakan platform properti yang mudah digunakan, transparan, dan terpercaya untuk menghubungkan pembeli, penjual, dan investor properti.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Visi Kami
                </h3>
                <p className="text-muted-foreground">
                  Menjadi platform properti nomor satu di Indonesia yang dipercaya oleh jutaan pengguna dalam menemukan, membeli, menjual, dan menginvestasikan properti.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Nilai Kami
                </h3>
                <p className="text-muted-foreground">
                  Integritas, profesionalisme, inovasi, dan kepuasan pelanggan adalah nilai-nilai inti yang kami pegang teguh dalam setiap aspek bisnis kami.
                </p>
              </Card>
            </div>

            {/* Stats */}
            <div className="bg-primary text-white rounded-lg p-12 mb-16">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <p className="text-4xl font-bold mb-2">10+</p>
                  <p className="text-blue-100">Tahun Pengalaman</p>
                </div>
                <div>
                  <p className="text-4xl font-bold mb-2">5000+</p>
                  <p className="text-blue-100">Properti Terjual</p>
                </div>
                <div>
                  <p className="text-4xl font-bold mb-2">50+</p>
                  <p className="text-blue-100">Agen Profesional</p>
                </div>
                <div>
                  <p className="text-4xl font-bold mb-2">100K+</p>
                  <p className="text-blue-100">Pelanggan Puas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Hubungi Kami
                </h2>
                <p className="text-muted-foreground">
                  Punya pertanyaan? Tim kami siap membantu Anda
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex gap-4">
                      <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">
                          Telepon
                        </h4>
                        <p className="text-muted-foreground">
                          +62 812 3456 7890
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Senin - Jumat, 09:00 - 18:00 WIB
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex gap-4">
                      <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">
                          Email
                        </h4>
                        <p className="text-muted-foreground">
                          info@primedeal.com
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Balas dalam 24 jam
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex gap-4">
                      <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">
                          Alamat
                        </h4>
                        <p className="text-muted-foreground">
                          Jl. Sudirman No. 123<br />
                          Jakarta Pusat, 12190
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Contact Form */}
                <Card className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Nama Lengkap *
                      </label>
                      <Input
                        placeholder="Masukkan nama Anda"
                        value={formData.nama}
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        placeholder="email@contoh.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Nomor Telepon
                      </label>
                      <Input
                        placeholder="+62 812 3456 7890"
                        value={formData.telepon}
                        onChange={(e) =>
                          setFormData({ ...formData, telepon: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Pesan *
                      </label>
                      <Textarea
                        placeholder="Tuliskan pesan Anda di sini..."
                        value={formData.pesan}
                        onChange={(e) =>
                          setFormData({ ...formData, pesan: e.target.value })
                        }
                        rows={4}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3"
                    >
                      Kirim Pesan via WhatsApp
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
