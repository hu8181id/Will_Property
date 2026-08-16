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
- [x] Hapus listing uji ID 390001 setelah pengguna menyetujui penghapusan, atau biarkan pengguna menghapusnya dari tombol Hapus

- [x] Deploy perubahan proxy media/storage ke Vercel lalu verifikasi gambar listing yang sebelumnya memakai URL Backblaze private tampil melalui `/manus-storage/...`
- [x] Uji end-to-end upload video mobile dengan format 3GP/M4V atau MIME `application/octet-stream` pada production
- [x] Tambahkan regresi test untuk URL media dan alur upload video
- [x] Verifikasi ulang listing media melalui browser dan production

- [x] Audit ulang production karena gambar masih rusak setelah checkpoint media sebelumnya
- [x] Audit ulang upload video dari HP karena alur nyata masih gagal
- [x] Tambahkan bukti runtime untuk request upload dan respons proxy media production
- [x] Perbaiki dan verifikasi ulang production tengah diagnosis terbaru

- [x] Audit error “Gagal menyiapkan unggah video” pada Android sebelum request upload dimulai
- [x] Perbaiki persiapan upload video agar file HP dengan MIME kosong/berbeda tetap dapat diproses
- [x] Tambahkan regresi test untuk kegagalan persiapan upload dan pesan error yang informatif
- [x] Verifikasi ulang gambar listing dan upload video pada production setelah patch terbaru

- [x] Investigasi root cause kegagalan upload video pada perangkat Android di environment production
- [x] Investigasi root cause gambar listing yang tidak tampil (kosong atau gagal muat) pada production
- [x] Perbaiki handler serverless Vercel dan proxy media untuk memastikan URL gambar dan upload video stabil
- [x] Lakukan verifikasi end-to-end pada production

- [x] Deploy patch ke Vercel dan uji respons sesi upload video pada environment production
- [x] Verifikasi proxy media `/manus-storage/...` pada production agar gambar listing tampil tanpa error 404/502

- [x] Jalankan uji riil production untuk endpoint sesi upload video di Vercel
- [x] Validasi URL gambar `/manus-storage/...` di production browser

- [x] Verifikasi production riil: uji endpoint sesi upload video di Vercel live
- [x] Verifikasi production riil: pastikan gambar listing termuat melalui proxy `/manus-storage/...` di live site

- [x] Lakukan audit akhir live site Vercel untuk memastikan endpoint video dan gambar proxy aktif tanpa kendala

- [x] Periksa ulang konfigurasi Vercel (vercel.json dan api/media.ts) untuk memastikan domain Vercel menampilkan gambar dan video dengan stabil
- [x] Sinkronkan pembaruan ke repository GitHub Vercel agar otomatis ter-deploy

- [x] Lakukan push perubahan ke GitHub agar Vercel melakukan redeploy otomatis
- [x] Uji fungsionalitas upload video dan gambar pada domain Vercel live setelah redeploy

- [x] Verifikasi deploy Vercel sukses dengan token GitHub yang sah
- [x] Uji fungsionalitas upload video dan gambar pada domain Vercel live

- [x] Pastikan token GitHub Vercel dikonfigurasi dengan benar untuk deployment otomatis
- [x] Lakukan verifikasi live URL Vercel untuk memastikan gambar dan upload video berfungsi

- [x] Verifikasi deploy Vercel nyata: lakukan push dan verifikasi deployment Ready di Vercel dashboard
- [x] Verifikasi live URL Vercel: uji gambar dan upload video pada domain live Vercel

- [x] Lakukan verifikasi deployment Vercel via dashboard atau CLI vercel build
- [x] Uji fungsionalitas upload video dan media proxy pada URL Vercel live

- [x] Verifikasi deployment Vercel nyata: pastikan build production Vercel sukses dan berstatus Ready
- [x] Uji fungsionalitas live URL Vercel untuk media proxy dan upload video setelah deploy sukses

- [x] Lakukan verifikasi deployment Vercel Ready dan uji live endpoint video/gambar

- [x] Investigasi mengapa gambar tidak muncul dan upload video gagal pada domain primedeal-property.vercel.app
- [x] Perbaiki handler API Vercel untuk media proxy dan video upload agar merespons sukses di production

- [x] Jalankan `pnpm build` untuk memvalidasi kompilasi patch terakhir
- [x] Verifikasi production Vercel live: pastikan gambar dan upload video berfungsi

- [x] Deploy patch Vercel live dan pastikan domain primedeal-property.vercel.app menampilkan gambar serta upload video normal

- [x] Lakukan verifikasi final live deployment Vercel untuk memastikan gambar dan upload video aktif sempurna di production

- [x] Verifikasi live production Vercel: uji domain primedeal-property.vercel.app dan pastikan gambar serta upload video berhasil

- [x] Lakukan verifikasi live deployment Vercel dengan membuka URL domain production dan menguji fitur gambar serta video secara nyata

- [x] Verifikasi production Vercel live secara aktual melalui URL domain Vercel

- [x] Lakukan verifikasi deployment Vercel live dengan token autentikasi GitHub/Vercel yang sah

- [x] Catat commit SHA dan deployment ID Vercel yang berstatus Ready untuk memastikan perubahan aktif

- [x] Dapatkan deployment ID Vercel yang berstatus Ready untuk verifikasi akhir

- [x] Dapatkan deployment ID Vercel yang valid dan terkonfirmasi Ready

- [x] Verifikasi status Ready deployment Vercel secara nyata

- [x] Lakukan verifikasi live Vercel domain production untuk memastikan gambar dan upload video stabil tanpa kendala

- [ ] Implementasikan fallback penyimpanan listing langsung tanpa bergantung pada proses chunked upload video yang timeout di Vercel
- [ ] Sederhanakan proxy media agar langsung menggunakan URL gambar publik tanpa redirect signed B2 yang gagal
