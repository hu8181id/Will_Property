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

- [x] Perbaiki tombol Tambah Listing Baru dan form unggah agar dapat dibuka serta disubmit di perangkat seluler
- [x] Perbaiki pemilihan file foto dan video pada halaman manajemen listing
- [x] Tambahkan dukungan maksimal 5 foto per listing dengan preview dan validasi ukuran/tipe file
- [x] Tambahkan atau perbarui test Vitest untuk alur multi-foto dan upload media
- [x] Uji ulang halaman produksi `/manage-listings` setelah deployment

- [x] Tambahkan test Vitest yang benar-benar memilih beberapa foto, menampilkan preview, membatasi maksimal 5 foto, serta menghapus dan mengubah foto utama
- [x] Tambahkan test helper video untuk memastikan header `x-admin-key` dikirim saat URL mengandung `admin_key`
- [x] Tambahkan test server untuk memastikan endpoint video menerima bypass `ADMIN_SECRET_KEY` selain sesi admin biasa

- [x] Tambahkan integration test endpoint upload video yang memakai `admin_key` atau `x-admin-key` tanpa sesi admin, lalu pastikan request tanpa bypass tetap ditolak

- [x] Sinkronkan `EmergencyListingManager.tsx` dan `AddPropertyDialog.tsx` versi multi-foto terbaru ke repository GitHub Vercel
- [x] Verifikasi ulang atribut `multiple` dan batas 5 foto pada URL production setelah deployment baru

- [x] Perbaiki error `You do not have required permission (10002)` saat menyimpan listing dari URL admin_key
- [x] Pastikan mutasi property create/update/delete meneruskan dan memvalidasi bypass `admin_key` secara konsisten
- [x] Tambahkan regresi test untuk penyimpanan listing tanpa sesi OAuth tetapi dengan admin_key
- [x] Uji ulang simpan listing pada deployment Vercel setelah perbaikan

- [x] Normalisasi `S3_ENDPOINT` agar otomatis memakai `https://` ketika environment Vercel berisi hostname Backblaze tanpa skema
- [x] Tambahkan regresi test untuk endpoint Backblaze `s3.us-east-005.backblazeb2.com` tanpa skema
- [x] Uji ulang upload foto dan simpan listing setelah deployment perbaikan storage

- [x] Tambahkan test tRPC/server untuk `property.create` tanpa sesi OAuth tetapi dengan `admin_key`/`x-admin-key`, serta penolakan tanpa bypass
- [x] Tambahkan test regresi serupa untuk `property.update` dan `property.delete` agar bypass admin_key konsisten
- [ ] Hapus listing uji ID 390001 setelah pengguna menyetujui penghapusan, atau biarkan pengguna menghapusnya dari tombol Hapus

- [ ] Deploy perubahan proxy media/storage ke Vercel lalu verifikasi gambar listing yang sebelumnya memakai URL Backblaze private tampil melalui `/manus-storage/...`
- [ ] Uji end-to-end upload video mobile dengan format 3GP/M4V atau MIME `application/octet-stream` pada production
- [x] Tambahkan regresi test untuk URL media dan alur upload video
- [ ] Verifikasi ulang listing media melalui browser dan build production
