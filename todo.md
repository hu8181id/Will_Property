# Project TODO - Primedeal Property (Admin Reset Guide)

- [x] Migrasi deployment Vercel, database TiDB Cloud, dan penyimpanan Backblaze B2
- [x] Konfigurasi routing SPA dan tRPC serverless di Vercel
- [x] Implementasi gesture admin tersembunyi (3 ketukan cepat pada logo)
- [x] Migrasi endpoint login admin ke tRPC router (`adminAuth.login`) dan prosedur `adminAuth.checkConfig`
- [x] Panduan reset password admin di Vercel Environment Variables dan Redeploy
- [x] Menjalankan test Vitest lengkap (88 test lulus) dan build produksi sukses

- [ ] Audit implementasi `adminAuth.login` dan pastikan fallback kredensial default aman jika env Vercel belum dimuat oleh runtime serverless
