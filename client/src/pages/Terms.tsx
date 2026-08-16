import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-secondary py-10 md:py-14">
          <div className="container max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Ketentuan Penggunaan
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
              Syarat &amp; Ketentuan
            </h1>
            <p className="mt-3 text-muted-foreground">Terakhir diperbarui: 15 Agustus 2026</p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <article className="container max-w-4xl space-y-9 text-slate-700 leading-relaxed">
            <p>
              Dengan menggunakan website Primedeal, Anda menyetujui ketentuan berikut.
              Jika tidak setuju, mohon tidak melanjutkan penggunaan layanan ini.
            </p>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Informasi properti</h2>
              <p className="mt-3">
                Informasi listing disediakan untuk membantu pencarian properti. Harga,
                ketersediaan, spesifikasi, dan informasi pendukung dapat berubah. Pengguna
                wajib melakukan pengecekan langsung serta verifikasi dokumen dan kondisi
                properti sebelum membuat keputusan transaksi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Penggunaan yang diperbolehkan</h2>
              <p className="mt-3">
                Anda dapat menggunakan website untuk mencari informasi properti dan
                menghubungi Primedeal secara wajar. Dilarang mengganggu layanan, mencoba
                mengakses sistem tanpa izin, menyalin data secara massal, atau menggunakan
                website untuk tujuan yang melanggar hukum.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Komunikasi</h2>
              <p className="mt-3">
                Komunikasi melalui formulir atau WhatsApp digunakan untuk menanggapi
                kebutuhan Anda. Mengirimkan informasi tidak otomatis membentuk hubungan
                perjanjian, pemesanan, atau jaminan tersedianya suatu properti.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Hak kekayaan intelektual</h2>
              <p className="mt-3">
                Desain, teks, merek, dan materi website Primedeal dilindungi sesuai hukum
                yang berlaku. Penggunaan kembali materi tanpa izin tertulis tidak
                diperbolehkan, kecuali untuk penggunaan pribadi yang wajar.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Perubahan ketentuan</h2>
              <p className="mt-3">
                Primedeal dapat memperbarui ketentuan ini apabila layanan, kebijakan, atau
                peraturan berubah. Versi terbaru akan ditampilkan pada halaman ini.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Hubungi kami</h2>
              <p className="mt-3">
                Untuk pertanyaan terkait layanan, hubungi Primedeal melalui WhatsApp di{" "}
                <a
                  href="https://wa.me/6282230357009"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  0822-3035-7009
                </a>
                .
              </p>
            </section>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
