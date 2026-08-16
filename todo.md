# Project TODO - Primedeal Property (Admin Fail-Closed Fix)

- [x] Migrasi deployment Vercel, database TiDB Cloud, dan penyimpanan Backblaze B2
- [x] Konfigurasi routing SPA dan tRPC serverless di Vercel
- [x] Implementasi gesture admin tersembunyi (3 ketukan cepat pada logo)
- [x] Migrasi endpoint login admin ke tRPC router (`adminAuth.login`) dan prosedur `adminAuth.checkConfig`
- [x] Memastikan prinsip keamanan fail-closed pada verifikasi kredensial admin saat environment variables belum terbaca
- [x] Menjalankan test Vitest lengkap (89 test lulus) dan build produksi sukses

- [ ] Investigasi sinkronisasi commit Vercel dan pastikan route tRPC adminAuth.login terakses benar di produksi
