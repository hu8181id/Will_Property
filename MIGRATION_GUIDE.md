# Panduan Migrasi Mandiri Primedeal Properti

Dokumen ini menguraikan arsitektur dan langkah-langkah praktis untuk memindahkan aplikasi **Primedeal Properti** (React + Express + tRPC + Drizzle + MySQL/TiDB + S3) dari lingkungan manajemen WebDev saat ini ke infrastruktur mandiri yang sepenuhnya dikontrol oleh Anda, sehingga website tetap hidup dan dapat diakses meskipun masa aktif layanan atau kredit agen berakhir.

---

## 1. Rekomendasi Kombinasi Hosting Gratis & Arsitektur Mandiri

Untuk memindahkan **Primedeal Properti** agar tetap hidup dan independen secara gratis atau berbiaya sangat rendah, berikut adalah kombinasi layanan gratis terbaik yang direkomendasikan berdasarkan hasil evaluasi teknis:

| Komponen Sistem | Layanan Rekomendasi Gratis (Free Tier) | Keunggulan | Catatan Teknis |
|---|---|---|---|
| **Aplikasi (Node.js + Express + Frontend)** | **Render (Web Service)** atau **Oracle Cloud (Always Free VPS)** | Render mudah di-deploy dari Git; Oracle VPS memberikan RAM hingga 24GB dan uptime penuh. | Render mengalami *spin-down* setelah 15 menit tidak aktif (kunjungan pertama agak lambat). VPS membutuhkan pengaturan Nginx & SSL manual. |
| **Database (MySQL / TiDB)** | **TiDB Cloud (Serverless Tier)** | Menyediakan 5 GiB storage gratis dan 50 juta row reads/writes per bulan, kompatibel penuh dengan MySQL/Drizzle. | Mendukung SSL dan koneksi Drizzle ORM secara langsung melalui `DATABASE_URL`. |
| **Storage Media (Foto & Video S3)** | **Cloudflare R2** | Gratis biaya *egress* (bandwidth keluar) dan kapasitas penyimpanan awal 10 GB yang sangat besar untuk foto/video properti. | Kompatibel dengan AWS S3 SDK yang sudah digunakan pada backend Primedeal (`storagePut`/`storageGet`). |

---

## 2. Langkah-Langkah Eksekusi Migrasi

### A. Ekspor Kode Sumber Proyek
1. Unduh seluruh arsip kode proyek dari manajemen WebDev (Menu pojok kanan atas ⋯ → **Download as ZIP**) atau gunakan repository Git yang terhubung.
2. Ekstrak di komputer lokal Anda atau langsung di server VPS tujuan.

### B. Siapkan Database Eksternal (MySQL/TiDB)
1. Buat database baru pada penyedia MySQL mandiri (misalnya TiDB Cloud Serverless atau PlanetScale).
2. Jalankan migrasi skema Drizzle menggunakan perintah berikut setelah mengatur variabel `DATABASE_URL` di file `.env`:
   ```bash
   pnpm install
   pnpm drizzle-kit push
   ```
3. Ekspor data yang sudah ada dari database lama (jika ada) menggunakan `mysqldump` lalu impor ke database baru.

### C. Konfigurasi Variabel Lingkungan (`.env`)
Buat file `.env` di root server produksi dengan variabel wajib berikut:
```env
PORT=3000
NODE_ENV=production
DATABASE_URL="mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}"
JWT_SECRET="rahasia_jwt_anda_yang_kuat"
BUILT_IN_FORGE_API_URL="https://forge.manus.im" # atau ganti dengan S3 mandiri Anda
BUILT_IN_FORGE_API_KEY="token_api_anda"
```

### D. Build dan Jalankan Aplikasi di Server Mandiri
1. Lakukan instalasi dependensi dan build aplikasi:
   ```bash
   pnpm install --frozen-lockfile
   pnpm build
   ```
2. Jalankan server Node.js produksi:
   ```bash
   node dist/server/_core/index.js
   ```
   *(Catatan: Di VPS, gunakan PM2 untuk manajemen proses latar belakang dan Nginx sebagai reverse proxy dengan SSL Let's Encrypt).*

---

## 3. Konsekuensi dan Pengujian Purna-Migrasi

- **Domain:** Arahkan DNS domain kustom Anda (misalnya `primedeal.co.id`) ke alamat IP atau CNAME server hosting mandiri Anda.
- **APK Android:** Jika Anda mendistribusikan APK `com.primedeal.property`, pastikan endpoint manifest pembaruan (`/api/apk-update-manifest.json`) dan base URL WebView di dalam aplikasi Android disesuaikan dengan domain atau URL server mandiri yang baru.
- **Sitemap & SEO:** Perbarui URL sitemap agar mencerminkan domain mandiri baru, lalu lakukan inspeksi ulang pada Google Search Console.

*Disusun oleh Manus AI.*

---

## 4. Prosedur Verifikasi SEO & Cutover Domain Tanpa Downtime

Agar perpindahan server tidak mengganggu peringkat pencarian Google yang telah dibangun:
1. **Biarkan Situs Lama Tetap Aktif:** Pertahankan server Manus aktif selama proses uji coba deploy di Render atau VPS selesai.
2. **Pindahkan Database & Storage Terlebih Dahulu:** Lakukan migrasi data properti ke TiDB Cloud dan pastikan seluruh gambar/video dapat diakses dari storage S3 baru.
3. **Uji Aplikasi di Domain Sementara:** Jalankan aplikasi di URL sementara (misalnya `*.onrender.com`) dan pastikan seluruh fungsi login admin, tambah listing, filter, dan berbagi slug berjalan normal.
4. **Alihkan DNS (Cutover):** Ubah catatan CNAME/A pada registrar domain Anda ke alamat server baru. Karena URL slug permanen (`/properti/[slug]`) dipertahankan secara identik, Googlebot tidak akan mendeteksi tautan rusak.
5. **Kirim Ulang Sitemap di Google Search Console:** Setelah domain baru aktif dan SSL terpasang, periksa file `sitemap.xml` di server baru dan kirimkan ulang (re-submit) di GSC untuk mempercepat perayapan ulang (re-indexing).
