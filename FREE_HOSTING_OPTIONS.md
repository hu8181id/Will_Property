# Evaluasi Opsi Hosting Gratis Eksternal untuk Primedeal

Dokumen ini menguraikan opsi hosting mandiri di luar platform Manus, khususnya bagi pengguna yang ingin menjalankan aplikasi Node.js/Express full-stack, database MySQL/TiDB, dan penyimpanan S3 secara gratis atau berbiaya rendah dengan kendali penuh.

## Ringkasan Kebutuhan Sistem Primedeal
1. **Aplikasi Server & Frontend (Full-Stack SSR):** Membutuhkan runtime Node.js (Vite + Express + tRPC + Drizzle).
2. **Database Relasional:** MySQL / TiDB untuk menyimpan listing properti, ulasan, riwayat pengunjung, dan akun admin.
3. **Penyimpanan Berkas (S3 Storage):** Untuk menampung foto properti terkompresi dan video pendek.

---

## Pilihan Platform Hosting Gratis & Terjangkau

| Platform | Jenis Layanan | Kompatibilitas Express/Node | Database Bawaan | Storage S3 / File | Batasan Paket Gratis (Free Tier) |
|---|---|---|---|---|---|
| **Render** | PaaS (Cloud) | Sangat Baik (Native Node.js) | Tidak ada (Harus eksternal) | Tidak ada (Ephemeral disk) | Web service gratis spin-down setelah 15 menit tidak aktif; restart lambat pada kunjungan pertama. |
| **Railway** | PaaS (Modern) | Sangat Baik (Docker / Node) | Plugin MySQL / Postgres | Tidak ada | Memberikan trial / kredit awal kecil, kemudian berbayar (tidak sepenuhnya gratis selamanya). |
| **Fly.io** | PaaS (Container) | Sangat Baik (Docker custom) | Plugin MySQL / Postgres | Tidak ada | Alokasi VM kecil gratis (shared-cpu-1x, 256MB RAM), cocok untuk uji coba ringan. |
| **Vercel / Netlify** | Frontend / Serverless | Terbatas (Hanya Serverless Functions) | Tidak ada | Tidak ada | Sangat bagus untuk statis, tetapi Express/tRPC/WebSocket perlu diubah ke arsitektur serverless (bukan Express standar). |
| **VPS Mandiri (Oracle Free Tier / AWS Free Tier)** | Cloud VM (Ubuntu) | Penuh (Root access, Docker) | MySQL mandiri / TiDB Cloud | S3 / MinIO / Local | Mengharuskan manajemen server sendiri (keamanan, SSL, pembaruan OS). |

---

## Rekomendasi Arsitektur Mandiri Tanpa Bergantung pada Manus

Jika Anda ingin memisahkan layanan agar tetap hidup tanpa Manus:

1. **Hosting Aplikasi (Express + Frontend SSR):**
   - Gunakan **Render** (Web Service gratis) atau **Fly.io** dengan membungkus aplikasi ke Docker container sederhana.
   - Alternatif: VPS gratis Oracle Cloud (Always Free Tier) yang memberikan RAM 1GB–24GB dan kontrol penuh.

2. **Database (MySQL / TiDB):**
   - Gunakan **TiDB Cloud Serverless** (menyediakan free tier yang besar: 5 GiB storage, 50M row reads/writes per bulan) atau **PlanetScale / Supabase** (untuk PostgreSQL).
   - Hubungkan aplikasi melalui variabel lingkungan `DATABASE_URL`.

3. **Storage Gambar & Video (S3):**
   - Karena penyimpanan foto dan video (terutama file video MP4 hingga 33MB) membutuhkan penyimpanan objek S3-compatible, gunakan **Cloudflare R2** (memiliki free tier yang sangat murah/gratis untuk bandwidth egress dan 10GB storage awal) atau **Backblaze B2**.

---

## Kesimpulan & Risiko
Memindahkan aplikasi ke layanan gratis eksternal memerlukan pengaturan manual pada variabel lingkungan (`DATABASE_URL`, `JWT_SECRET`, kredensial S3), konfigurasi domain, serta pengelolaan migrasi database secara mandiri. Panduan teknis lengkap untuk proses tersebut telah disediakan dalam berkas `MIGRATION_GUIDE.md` di proyek Anda.
