import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Bed, Bath, Ruler, Star, ChevronRight, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddPropertyDialog from "@/components/AddPropertyDialog";

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
  description?: string;
}

export default function Listing() {
  const [filters, setFilters] = useState({
    priceMin: "",
    priceMax: "",
    type: [] as string[],
    beds: [] as string[],
  });

  const [sortBy, setSortBy] = useState("terbaru");
  const [customProperties, setCustomProperties] = useState<Property[]>([]);

  // Load properties dari local storage
  useEffect(() => {
    const savedProperties = localStorage.getItem("primedeal_properties");
    if (savedProperties) {
      try {
        setCustomProperties(JSON.parse(savedProperties));
      } catch (error) {
        console.error("Error loading properties:", error);
      }
    }
  }, []);

  // Save properties ke local storage
  useEffect(() => {
    localStorage.setItem("primedeal_properties", JSON.stringify(customProperties));
  }, [customProperties]);

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
      type: "rumah",
      date: "2024-01-15",
      description: "Rumah modern dengan desain minimalis, lokasi strategis di Pondok Indah dengan akses mudah ke berbagai fasilitas.",
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
      type: "apartemen",
      date: "2024-01-14",
      description: "Apartemen mewah dengan pemandangan kota, fasilitas lengkap termasuk gym, kolam renang, dan keamanan 24 jam.",
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
      type: "rumah",
      date: "2024-01-13",
      description: "Rumah nyaman di area Bintaro yang berkembang, dekat dengan sekolah dan pusat perbelanjaan.",
    },
    {
      id: 4,
      title: "Ruko Komersial di Kelapa Gading",
      location: "Jakarta Utara",
      price: 3500000000,
      image: "/manus-storage/property-card-bg_4cd1dc11.png",
      beds: 2,
      baths: 2,
      area: 200,
      rating: 4.6,
      type: "ruko",
      date: "2024-01-12",
      description: "Ruko komersial dengan lokasi strategis, cocok untuk bisnis retail atau kantor.",
    },
    {
      id: 5,
      title: "Tanah Luas di Cisarua",
      location: "Bogor",
      price: 800000000,
      image: "/manus-storage/modern-living-room_54b09ea3.png",
      beds: 0,
      baths: 0,
      area: 500,
      rating: 4.5,
      type: "tanah",
      date: "2024-01-11",
      description: "Tanah luas dengan pemandangan alam yang indah, ideal untuk investasi atau pembangunan resort.",
    },
    {
      id: 6,
      title: "Apartemen Studio Thamrin City",
      location: "Jakarta Pusat",
      price: 900000000,
      image: "/manus-storage/property-showcase_99ecec32.png",
      beds: 1,
      baths: 1,
      area: 45,
      rating: 4.8,
      type: "apartemen",
      date: "2024-01-10",
      description: "Apartemen studio modern dengan lokasi premium di pusat kota, sempurna untuk profesional muda.",
    },
  ];

  const allProperties = [...defaultProperties, ...customProperties];

  const handleAddProperty = (newProperty: Property) => {
    setCustomProperties([...customProperties, newProperty]);
  };

  const handleDeleteProperty = (id: number) => {
    setCustomProperties(customProperties.filter((p) => p.id !== id));
  };

  const filteredProperties = allProperties
    .filter((prop) => {
      const priceMin = filters.priceMin ? parseInt(filters.priceMin) : 0;
      const priceMax = filters.priceMax ? parseInt(filters.priceMax) : Infinity;

      if (prop.price < priceMin || prop.price > priceMax) return false;

      if (filters.type.length > 0 && !filters.type.includes(prop.type))
        return false;

      if (filters.beds.length > 0) {
        const beds = filters.beds.map((b) => parseInt(b));
        if (!beds.includes(prop.beds)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "harga-rendah") return a.price - b.price;
      if (sortBy === "harga-tinggi") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const toggleFilter = (
    filterType: "type" | "beds",
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary py-8">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Listing Properti
            </h1>
            <p className="text-muted-foreground">
              Temukan properti impian Anda dari ribuan pilihan terbaik
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1">
                <div className="bg-secondary rounded-lg p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">
                    Filter Properti
                  </h3>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Rentang Harga
                    </label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Harga minimal"
                        value={filters.priceMin}
                        onChange={(e) =>
                          setFilters({ ...filters, priceMin: e.target.value })
                        }
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Harga maksimal"
                        value={filters.priceMax}
                        onChange={(e) =>
                          setFilters({ ...filters, priceMax: e.target.value })
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Tipe Properti
                    </label>
                    <div className="space-y-2">
                      {["rumah", "apartemen", "ruko", "tanah"].map((type) => (
                        <div key={type} className="flex items-center gap-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={filters.type.includes(type)}
                            onCheckedChange={() => toggleFilter("type", type)}
                          />
                          <label
                            htmlFor={`type-${type}`}
                            className="text-sm text-slate-700 capitalize cursor-pointer"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Beds Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Jumlah Kamar
                    </label>
                    <div className="space-y-2">
                      {["1", "2", "3", "4"].map((beds) => (
                        <div key={beds} className="flex items-center gap-2">
                          <Checkbox
                            id={`beds-${beds}`}
                            checked={filters.beds.includes(beds)}
                            onCheckedChange={() => toggleFilter("beds", beds)}
                          />
                          <label
                            htmlFor={`beds-${beds}`}
                            className="text-sm text-slate-700 cursor-pointer"
                          >
                            {beds} Kamar
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      setFilters({
                        priceMin: "",
                        priceMax: "",
                        type: [],
                        beds: [],
                      })
                    }
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>

              {/* Properties Grid */}
              <div className="lg:col-span-3">
                {/* Sort Options & Add Button */}
                <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                  <p className="text-muted-foreground">
                    Menampilkan {filteredProperties.length} properti
                  </p>
                  <div className="flex gap-3 items-center flex-wrap">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-border rounded-lg text-sm"
                    >
                      <option value="terbaru">Terbaru</option>
                      <option value="harga-rendah">Harga: Rendah ke Tinggi</option>
                      <option value="harga-tinggi">Harga: Tinggi ke Rendah</option>
                      <option value="rating">Rating Tertinggi</option>
                    </select>
                    <AddPropertyDialog onAddProperty={handleAddProperty} />
                  </div>
                </div>

                {/* Properties */}
                {filteredProperties.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    {filteredProperties.map((property) => (
                      <Card
                        key={property.id}
                        className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group relative"
                      >
                        <div className="relative overflow-hidden h-48 bg-gray-200">
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {formatPrice(property.price)}
                          </div>
                          {/* Delete button untuk properti yang baru ditambahkan */}
                          {customProperties.some((p) => p.id === property.id) && (
                            <button
                              onClick={() => handleDeleteProperty(property.id)}
                              className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                              title="Hapus properti"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="text-base font-bold text-slate-900 mb-2">
                            {property.title}
                          </h3>

                          {property.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {property.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <MapPin size={14} />
                            <span className="text-xs">{property.location}</span>
                          </div>

                          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                            {property.beds > 0 && (
                              <div className="flex items-center gap-1">
                                <Bed size={14} />
                                <span>{property.beds}</span>
                              </div>
                            )}
                            {property.baths > 0 && (
                              <div className="flex items-center gap-1">
                                <Bath size={14} />
                                <span>{property.baths}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Ruler size={14} />
                              <span>{property.area} m²</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-semibold">
                                {property.rating}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/80 p-0"
                            >
                              Lihat <ChevronRight size={14} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      Tidak ada properti yang sesuai dengan filter Anda
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() =>
                        setFilters({
                          priceMin: "",
                          priceMax: "",
                          type: [],
                          beds: [],
                        })
                      }
                    >
                      Reset Filter
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
