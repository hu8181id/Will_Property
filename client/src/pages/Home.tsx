import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { MapPin, Bed, Bath, Ruler, Star, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  description?: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchData, setSearchData] = useState({
    location: "",
    priceMin: "",
    priceMax: "",
    type: "",
  });
  const [properties, setProperties] = useState<Property[]>([]);

  // Default properties
  const defaultProperties: Property[] = [
    {
      id: 1,
      title: "Rumah Modern di Pondok Indah",
      location: "Jakarta Selatan",
      price: 2500000000,
      image: "/manus-storage/property-card-bg_4cd1dc11.png",
      beds: 4,
      baths: 3,
      area: 250,
      rating: 4.8,
      type: "Rumah",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Apartemen Mewah Senayan",
      location: "Jakarta Pusat",
      price: 1800000000,
      image: "/manus-storage/modern-living-room_54b09ea3.png",
      beds: 3,
      baths: 2,
      area: 180,
      rating: 4.9,
      type: "Apartemen",
      date: "2024-01-14",
    },
    {
      id: 3,
      title: "Rumah Nyaman di Bintaro",
      location: "Jakarta Selatan",
      price: 1200000000,
      image: "/manus-storage/property-showcase_99ecec32.png",
      beds: 3,
      baths: 2,
      area: 150,
      rating: 4.7,
      type: "Rumah",
      date: "2024-01-13",
    },
  ];

  useEffect(() => {
    // Load data dari localStorage
    const savedCustomProperties = localStorage.getItem("primedeal_properties");
    const savedDeletedIds = localStorage.getItem("primedeal_deleted_ids");
    
    let customProperties: Property[] = [];
    let deletedIds: number[] = [];
    
    if (savedCustomProperties) {
      try {
        customProperties = JSON.parse(savedCustomProperties);
      } catch (error) {
        console.error("Error loading custom properties:", error);
      }
    }
    
    if (savedDeletedIds) {
      try {
        deletedIds = JSON.parse(savedDeletedIds);
      } catch (error) {
        console.error("Error loading deleted IDs:", error);
      }
    }
    
    // Gabungkan default properties (yang tidak dihapus) dengan custom properties
    const filteredDefaults = defaultProperties.filter(
      (p) => !deletedIds.includes(p.id)
    );
    setProperties([...filteredDefaults, ...customProperties]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/listing");
  };

  // Format price helper
  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return (price / 1000000000).toFixed(1) + "M";
    } else if (price >= 1000000) {
      return (price / 1000000).toFixed(1) + "Jt";
    }
    return price.toString();
  };

  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Pembeli Properti",
      text: "Primedeal membuat proses pencarian rumah menjadi sangat mudah. Tim mereka sangat profesional dan responsif.",
      rating: 5,
    },
    {
      name: "Siti Nurhaliza",
      role: "Penjual Properti",
      text: "Layanan Primedeal luar biasa! Properti saya terjual dalam waktu singkat dengan harga yang memuaskan.",
      rating: 5,
    },
    {
      name: "Ahmad Wijaya",
      role: "Investor Properti",
      text: "Platform yang sangat membantu untuk investasi properti. Data lengkap dan analisis yang akurat.",
      rating: 4.8,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative py-20 md:py-32 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden"
          style={{
            backgroundImage: `url('/manus-storage/hero-background_c7146dac.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent" />
          <div className="container relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Temukan Rumah Impian Anda
              </h1>
              <p className="text-lg text-slate-700 mb-8">
                Jelajahi ribuan properti pilihan dengan harga terbaik dan lokasi strategis di seluruh Indonesia.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Lokasi
                    </label>
                    <Input
                      placeholder="Cari lokasi..."
                      value={searchData.location}
                      onChange={(e) =>
                        setSearchData({ ...searchData, location: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Harga Minimal
                    </label>
                    <Input
                      placeholder="Dari..."
                      type="number"
                      value={searchData.priceMin}
                      onChange={(e) =>
                        setSearchData({ ...searchData, priceMin: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Harga Maksimal
                    </label>
                    <Input
                      placeholder="Hingga..."
                      type="number"
                      value={searchData.priceMax}
                      onChange={(e) =>
                        setSearchData({ ...searchData, priceMax: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipe Properti
                    </label>
                    <Select value={searchData.type} onValueChange={(value) =>
                      setSearchData({ ...searchData, type: value })
                    }>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rumah">Rumah</SelectItem>
                        <SelectItem value="apartemen">Apartemen</SelectItem>
                        <SelectItem value="ruko">Ruko</SelectItem>
                        <SelectItem value="tanah">Tanah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
                >
                  Cari Properti
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Properti Unggulan
              </h2>
              <p className="text-lg text-muted-foreground">
                Pilihan properti terbaik dengan lokasi strategis dan harga kompetitif
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {properties.map((property) => (
                <Card
                  key={property.id}
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                >
                  <div className="relative overflow-hidden h-64 bg-gray-200">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Rp {formatPrice(property.price)}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {property.title}
                    </h3>

                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin size={16} />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed size={16} />
                        <span>{property.beds} Kamar</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath size={16} />
                        <span>{property.baths} Kamar Mandi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler size={16} />
                        <span>{property.area} m²</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold">{property.rating}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80"
                      >
                        Lihat Detail <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={() => setLocation("/listing")}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
              >
                Lihat Semua Properti
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Mengapa Memilih Primedeal?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Kami berkomitmen memberikan layanan terbaik untuk kebutuhan properti Anda
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Properti Terverifikasi",
                  desc: "Semua properti telah melalui verifikasi ketat untuk memastikan keaslian data",
                },
                {
                  title: "Tim Profesional",
                  desc: "Tim ahli kami siap membantu Anda 24/7 dengan konsultasi properti gratis",
                },
                {
                  title: "Harga Transparan",
                  desc: "Tidak ada biaya tersembunyi, semua harga ditampilkan dengan jelas",
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-8 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Testimoni Klien Kami
              </h2>
              <p className="text-lg text-muted-foreground">
                Kepuasan pelanggan adalah prioritas utama kami
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.floor(testimonial.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>

                  <p className="text-slate-700 mb-4 italic">"{testimonial.text}"</p>

                  <div>
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Menemukan Properti Impian?
            </h2>
            <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
              Hubungi tim Primedeal hari ini dan dapatkan konsultasi properti gratis dari para ahli kami
            </p>
            <Button
              className="bg-white text-primary hover:bg-blue-50 px-8 py-3 font-semibold"
              onClick={() => {
                const phone = "082230357009";
                const message =
                  "Halo Primedeal, saya ingin berkonsultasi tentang properti.";
                window.open(
                  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
                  "_blank"
                );
              }}
            >
              Hubungi Kami via WhatsApp
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
