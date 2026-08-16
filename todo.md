# Project TODO - Primedeal Pro

- [x] Rancang halaman manajemen listing khusus `/manage-listings`
- [x] Hubungkan dengan mutasi tRPC `property.create`, `property.update`, dan `property.delete`
- [x] Sediakan tombol upload foto dan video langsung dengan integrasi S3
- [x] Validasi akses via parameter URL `?admin_key=...` atau sesi admin
- [x] Luluskan seluruh 90 test Vitest dan build produksi Vercel

- [x] Verifikasi route `/manage-listings` dan aturan SPA fallback di `vercel.json` agar tidak menghasilkan 404

- [x] Sinkronkan branch `main` ke repository GitHub yang menjadi sumber deployment Vercel
- [x] Uji `/manage-listings` dan bypass `admin_key` pada domain Vercel setelah deployment selesai
- [x] Verifikasi variabel environment admin dan storage pada project Vercel tanpa membocorkan nilai rahasia

Dengan item yang ditambahkan pada sesi ini, verifikasi route produksi belum dianggap selesai sampai URL Vercel benar-benar memuat halaman manajemen.
