# Upgrade Sistem Listing Primedeal (Selesai)

- [x] Upgrade proyek ke arsitektur full-stack dengan database TiDB/MySQL dan server Express/tRPC.
- [x] Rancang schema database `property_listings` di Drizzle ORM dan jalankan migrasi SQL.
- [x] Bangun backend tRPC router `property` untuk list, getById, create, update, delete, uploadImage, migrateLegacy, dan seedDefault.
- [x] Hubungkan halaman Listing dan Beranda ke database backend dan hilangkan ketergantungan pada LocalStorage sebagai penyimpanan utama listing.
- [x] Tambahkan dialog edit listing, konfirmasi penghapusan, loading states, validasi Zod, dan filter backend.
- [x] Implementasikan kompresi foto client-side, upload multi-foto hingga 5 gambar, preview grid, penghapusan foto sebelum submit, dan penetapan foto utama.
- [x] Jalankan pemeriksaan tipe TypeScript (`pnpm check`) dan suite pengujian otomatis Vitest (`pnpm test`) dengan seluruh pengujian lulus.

- [x] Ganti seluruh tautan WhatsApp menjadi 082230357009 tanpa tanda hubung dan verifikasi semua CTA.

- [x] Ganti seluruh tautan WhatsApp ke format internasional +6282230357009 dan verifikasi URL 6282230357009.

- [x] Tambahkan optimasi SEO, metadata Open Graph, sitemap, robots.txt, dan fitur bagikan listing untuk jangkauan organik gratis.
- [x] URL share unik berbasis ID properti dan fokus otomatis ke listing yang dibagikan.
- [x] Fallback share dengan tautan WhatsApp konsisten serta clipboard.
- [x] Verifikasi metadata sosial untuk URL share listing.
- [x] Implementasikan metadata sosial server-rendered untuk URL listing spesifik.
- [x] Tambahkan og:image, twitter:image, og:image:alt, dan canonical URL berbasis listing.
- [x] Verifikasi HTML mentah URL listing dan jalankan test/build sebelum checkpoint.
- [x] Perbaiki pemetaan parameter `search` dan rendering deskripsi detail properti saat tombol Detail ditekan dari URL hasil pencarian.
- [x] Optimalkan SEO individual listing agar setiap iklan properti memiliki metadata unik, sitemap dinamis, dan structured data JSON-LD untuk pencarian Google.
- [x] Menyiapkan jadwal pemantauan harian Google Search Console untuk Primedeal
- [x] Tambahkan fitur rating dan ulasan properti berbasis data pengguna dengan validasi, tampilan publik, dan moderasi admin
- [x] Tambahkan pengujian backend dan frontend untuk alur rating serta ulasan
- [x] Perbaiki error dev server yang terdeteksi sebelum checkpoint fitur baru
- [x] Tambahkan tes frontend untuk RatingReview, submit valid/invalid, state loading/error/empty, dan moderasi admin approve/reject
- [x] Tambahkan kolom virtualTourUrl dan videoUrl pada schema property_listings dan jalankan migrasi SQL
- [x] Perbarui form tambah dan edit listing admin agar mendukung input video pendek dan tautan tur 360°
- [x] Tambahkan pemutar video pendek dan tombol tur virtual 360° pada dialog detail properti publik
- [x] Tambahkan unit test backend dan frontend untuk validasi dan rendering media tur virtual
- [x] Tambahkan tes frontend untuk AddPropertyDialog yang memverifikasi input videoUrl, virtualTourUrl, upload file video valid/invalid, dan state hapus video.
- [x] Tambahkan tes frontend untuk Listing yang memverifikasi panel video pendek dan tombol tur 360° muncul saat data tersedia.
- [x] Jadikan seluruh tombol dan kartu pada bagian layanan dapat ditekan dengan aksi navigasi atau CTA yang relevan.
- [x] Perbaiki runtime error optionalMediaUrl sebelum checkpoint tombol layanan.
