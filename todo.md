# Project TODO - Primedeal Property (Admin Config & Session Management)

- [x] Migrasi deployment Vercel, database TiDB Cloud, dan penyimpanan Backblaze B2
- [x] Konfigurasi routing SPA dan tRPC serverless di Vercel
- [x] Implementasi gesture admin tersembunyi (3 ketukan cepat pada logo)
- [x] Migrasi endpoint login admin ke tRPC router (`adminAuth.login`) dan prosedur `adminAuth.checkConfig`
- [x] Penambahan indikator peringatan konfigurasi otomatis di halaman `/admin` jika `ADMIN_USERNAME` atau `ADMIN_PASSWORD` belum terpasang di Vercel Production (tanpa membocorkan data rahasia)
- [x] Menjalankan test Vitest lengkap (88 test lulus) dan build produksi sukses
