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
- [x] Tambahkan URL share unik berbasis ID properti dan fokus otomatis ke listing yang dibagikan.
- [x] Perbaiki fallback share dengan tautan WhatsApp konsisten serta clipboard.
- [x] Verifikasi metadata sosial untuk URL share listing.
- [ ] Implementasikan metadata sosial server-rendered untuk URL listing spesifik.
- [ ] Tambahkan og:image, twitter:image, dan canonical URL berbasis listing.
- [ ] Verifikasi HTML mentah URL listing dan jalankan test/build sebelum checkpoint.
