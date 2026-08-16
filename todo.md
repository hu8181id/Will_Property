# Project TODO - Primedeal Property (All Verified)

- [x] Migrasi deployment Vercel, database TiDB Cloud, dan penyimpanan Backblaze B2
- [x] Konfigurasi routing SPA dan tRPC serverless di Vercel
- [x] Implementasi gesture admin tersembunyi (3 ketukan cepat pada logo)
- [x] Migrasi endpoint login admin ke tRPC router (`adminAuth.login`) dan prosedur `adminAuth.checkConfig`
- [x] Memastikan prinsip keamanan fail-closed pada verifikasi kredensial admin saat environment variables belum terbaca
- [x] Investigasi duplikasi environment variables di Vercel dan pastikan kontrak login menerima kredensial dengan benar tanpa spasi tersembunyi (termasuk trimming password)
- [x] Menjalankan test Vitest lengkap (90 test lulus) dan build produksi sukses
- [x] Buat mekanisme manajemen listing alternatif yang dilindungi secret key rahasia di URL/Header agar pemilik dapat menambah/menghapus listing tanpa login admin Vercel yang gagal
