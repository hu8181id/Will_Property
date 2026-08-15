import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-secondary py-10 md:py-14">
          <div className="container max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Transparansi Data
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
              Kebijakan Privasi
            </h1>
            <p className="mt-3 text-muted-foreground">Terakhir diperbarui: 15 Agustus 2026</p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <article className="container max-w-4xl space-y-9 text-slate-700 leading-relaxed">
            <p>
              Primedeal menghargai privasi Anda. Kebijakan ini menjelaskan data yang
              digunakan ketika Anda mengakses website kami, mencari properti, atau
              menghubungi kami melalui formulir dan WhatsApp.
            </p>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Informasi yang dikumpulkan</h2>
              <p className="mt-3">
                Saat Anda menghubungi Primedeal, kami dapat menerima nama, nomor telepon,
                dan isi pesan yang Anda kirimkan secara sukarela. Kami juga mencatat
                statistik penggunaan website secara agregat untuk memahami halaman dan
                listing yang diminati, tanpa menampilkan identitas pribadi Anda di
                dashboard admin.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Penggunaan data</h2>
              <p className="mt-3">
                Informasi digunakan untuk menanggapi pertanyaan Anda, membantu kebutuhan
                properti, menjaga keamanan layanan, dan meningkatkan pengalaman website.
                Primedeal tidak menjual informasi kontak Anda kepada pihak lain.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Analitik, cookie, dan iklan</h2>
              <p className="mt-3">
                Website ini menggunakan Google Analytics untuk memahami penggunaan secara
                terukur. Teknologi seperti cookie dapat digunakan oleh layanan analitik
                atau, apabila iklan Google diaktifkan di masa mendatang, oleh mitra iklan
                untuk menyajikan dan mengukur iklan. Anda dapat mengelola cookie melalui
                pengaturan browser. Kebijakan Google tersedia di{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  Kebijakan Privasi Google
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Penyimpanan dan keamanan</h2>
              <p className="mt-3">
                Kami menerapkan langkah yang wajar untuk melindungi data yang diproses
                melalui layanan ini. Data disimpan selama diperlukan untuk tujuan layanan,
                keamanan, atau kewajiban yang berlaku.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Kontak privasi</h2>
              <p className="mt-3">
                Untuk pertanyaan atau permintaan terkait data pribadi, hubungi Primedeal
                melalui WhatsApp di{" "}
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
