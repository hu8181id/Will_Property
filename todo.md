# Project TODO - Primedeal Property (Admin Security & Monitoring)

- [x] Migrasi deployment Vercel, database TiDB Cloud, dan penyimpanan Backblaze B2
- [x] Konfigurasi routing SPA dan tRPC serverless di Vercel
- [x] Implementasi gesture admin tersembunyi (3 ketukan cepat pada logo)
- [x] Pembuatan standalone admin login system dengan Environment Variables
- [x] Perbaikan endpoint direct login admin (`api/admin/login.ts`) ke Node.js Vercel serverless handler
- [x] Verifikasi login admin dan penambahan unit test untuk masa berlaku cookie sesi (84 test lulus)
- [x] Tambahkan pencatatan riwayat login admin dan deteksi percobaan gagal berulang (`getAdminLoginSecuritySummary`)
- [x] Tambahkan endpoint logout admin (`/api/admin/logout.ts` & tRPC auth.logout) untuk menghapus sesi secara instan
- [x] Menjalankan test Vitest lengkap dan build produksi sukses
