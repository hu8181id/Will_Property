import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Kalkulator() {
  const [hargaProperti, setHargaProperti] = useState(500000000);
  const [uangMuka, setUangMuka] = useState(100000000);
  const [bunga, setBunga] = useState(6.5);
  const [tahun, setTahun] = useState(20);

  const sisaPinjaman = hargaProperti - uangMuka;
  const bulanPinjaman = tahun * 12;
  const bungaBulanan = bunga / 100 / 12;
  const cicilanBulanan =
    sisaPinjaman *
    (bungaBulanan * Math.pow(1 + bungaBulanan, bulanPinjaman)) /
    (Math.pow(1 + bungaBulanan, bulanPinjaman) - 1);

  const totalBayar = cicilanBulanan * bulanPinjaman;
  const totalBunga = totalBayar - sisaPinjaman;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const percentUangMuka = ((uangMuka / hargaProperti) * 100).toFixed(1);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary py-8">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Kalkulator KPR
            </h1>
            <p className="text-muted-foreground">
              Hitung cicilan KPR Anda dengan mudah dan akurat
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-12">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      Parameter Kredit
                    </h3>

                    {/* Harga Properti */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Harga Properti
                      </label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          type="number"
                          value={hargaProperti}
                          onChange={(e) =>
                            setHargaProperti(parseInt(e.target.value) || 0)
                          }
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground py-2 px-3">
                          Rp
                        </span>
                      </div>
                      <Slider
                        value={[hargaProperti]}
                        onValueChange={(value) => setHargaProperti(value[0])}
                        min={100000000}
                        max={5000000000}
                        step={50000000}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        100 Juta - 5 Miliar
                      </p>
                    </div>

                    {/* Uang Muka */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Uang Muka ({percentUangMuka}%)
                      </label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          type="number"
                          value={uangMuka}
                          onChange={(e) =>
                            setUangMuka(
                              Math.min(
                                parseInt(e.target.value) || 0,
                                hargaProperti
                              )
                            )
                          }
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground py-2 px-3">
                          Rp
                        </span>
                      </div>
                      <Slider
                        value={[uangMuka]}
                        onValueChange={(value) => setUangMuka(value[0])}
                        min={0}
                        max={hargaProperti}
                        step={10000000}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Minimum 10% dari harga properti
                      </p>
                    </div>

                    {/* Suku Bunga */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Suku Bunga per Tahun: {bunga.toFixed(2)}%
                      </label>
                      <Slider
                        value={[bunga]}
                        onValueChange={(value) => setBunga(value[0])}
                        min={3}
                        max={12}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        3% - 12% per tahun
                      </p>
                    </div>

                    {/* Tenor */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Tenor Kredit: {tahun} Tahun
                      </label>
                      <Slider
                        value={[tahun]}
                        onValueChange={(value) => setTahun(value[0])}
                        min={5}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        5 - 30 Tahun
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  <Card className="p-6 bg-primary text-white">
                    <h3 className="text-lg font-bold mb-6">Hasil Perhitungan</h3>

                    <div className="space-y-4">
                      <div className="border-b border-blue-400 pb-4">
                        <p className="text-sm text-blue-100 mb-1">
                          Cicilan Bulanan
                        </p>
                        <p className="text-3xl font-bold">
                          {formatCurrency(cicilanBulanan)}
                        </p>
                      </div>

                      <div className="space-y-3 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-100">
                            Harga Properti
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(hargaProperti)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-100">
                            Uang Muka
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(uangMuka)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-100">
                            Sisa Pinjaman
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(sisaPinjaman)}
                          </span>
                        </div>

                        <div className="border-t border-blue-400 pt-3 mt-3 flex justify-between items-center">
                          <span className="text-sm text-blue-100">
                            Total Bunga ({tahun} tahun)
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(totalBunga)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-100">
                            Total Pembayaran
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(totalBayar)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-secondary">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      Informasi Penting
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-700">
                      <li className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>
                          Cicilan di atas adalah estimasi dan dapat berubah
                          sesuai kebijakan bank
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>
                          Belum termasuk biaya administrasi, asuransi, dan pajak
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>
                          Hubungi tim kami untuk konsultasi lebih lanjut
                        </span>
                      </li>
                    </ul>
                  </Card>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3"
                    onClick={() => {
                      const phone = "6281234567890";
                      const message = `Halo Primedeal, saya ingin berkonsultasi tentang KPR untuk properti seharga ${formatCurrency(hargaProperti)}.`;
                      window.open(
                        `https://wa.me/${phone}?text=${encodeURIComponent(
                          message
                        )}`,
                        "_blank"
                      );
                    }}
                  >
                    Konsultasi dengan Tim Kami
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-12 bg-secondary">
          <div className="container">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Tips Mendapatkan KPR Terbaik
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Persiapkan Dokumen",
                  desc: "Siapkan KTP, NPWP, slip gaji, dan laporan keuangan terbaru Anda",
                },
                {
                  title: "Tingkatkan Uang Muka",
                  desc: "Semakin besar uang muka, semakin kecil cicilan bulanan Anda",
                },
                {
                  title: "Bandingkan Suku Bunga",
                  desc: "Bandingkan penawaran dari berbagai bank untuk mendapat bunga terbaik",
                },
              ].map((tip, idx) => (
                <Card key={idx} className="p-6">
                  <h3 className="font-bold text-slate-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
