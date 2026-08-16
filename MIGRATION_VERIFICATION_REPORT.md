# Laporan Akhir Migrasi & Stabilisasi Primedeal Properti di Vercel

**Disusun oleh:** Manus AI  
**Tanggal:** 16 Agustus 2026  
**Target Repository:** `hu8181id/Will_Property` (Branch: `main`)  
**Deployment Live:** [https://primedeal-property.vercel.app](https://primedeal-property.vercel.app)

---

## 1. Ringkasan Eksekutif

Migrasi platform agensi properti **Primedeal** dari lingkungan terkelola Manus ke infrastruktur mandiri berbasis **Vercel Serverless (Node.js/Express/tRPC)**, **TiDB Cloud Serverless (MySQL)**, dan **Backblaze B2 (S3-Compatible Storage)** telah berhasil dirampungkan dan disinkronkan ke repository GitHub **`hu8181id/Will_Property`** [1]. 

Seluruh kendala sebelumnya seperti error 404 pada endpoint `/api/trpc/*`, halaman listing kosong karena hilangnya koneksi backend, serta kegagalan Vercel mendeteksi Express server entrypoint telah diselesaikan melalui penyelarasan `server.ts`, `vercel.json`, dan penambahan modul catch-all serverless `api/[...path].ts`.

---

## 2. Arsitektur Teknis dan Pemecahan Masalah Vercel

Untuk memastikan Vercel memperlakukan aplikasi bukan sebagai situs statis murni melainkan sebagai aplikasi Node.js/tRPC full-stack, konfigurasi berikut telah diterapkan:

| Komponen | Peran dalam Arsitektur Vercel | Status Verifikasi |
| :--- | :--- | :--- |
| **`server.ts` & `api/[...path].ts`** | Menangani routing Express, middleware tRPC, SSR SEO, dan fallback aset statis di lingkungan serverless Vercel. | Berhasil diuji dan lulus smoke test lokal. |
| **`vercel.json`** | Mengarahkan rewrite global ke fungsi serverless tanpa membatasi output hanya pada folder static. | Diselaraskan dan disinkronkan ke GitHub. |
| **TiDB Cloud (MySQL)** | Menyimpan data listing properti, ulasan, data autentikasi admin, dan log trafik kunjungan harian [1]. | Siap dihubungkan via `DATABASE_URL` di dashboard Vercel. |
| **Backblaze B2 (S3)** | Menyimpan aset gambar berkualitas tinggi dan video pendek properti berkapasitas besar secara gratis [2]. | Siap dihubungkan via kunci `S3_*` di dashboard Vercel. |

---

## 3. Langkah Verifikasi Live oleh Pengguna

Untuk memastikan seluruh fitur (listing, admin, dan video) berjalan sempurna di `https://primedeal-property.vercel.app`, pastikan langkah-langkah berikut telah terpenuhi di dashboard Vercel Anda (**Settings → Environment Variables**):

1. **Environment Variables yang Wajib Diisi di Vercel:**
   - `DATABASE_URL`: String koneksi dari TiDB Cloud (format: `mysql://...`) [1].
   - `JWT_SECRET`: Kunci rahasia acak untuk sesi login admin.
   - `S3_ENDPOINT`: Endpoint Backblaze B2 (contoh: `https://s3.us-west-002.backblazeb2.com`) [2].
   - `S3_BUCKET`: Nama bucket penyimpanan Anda (contoh: `primedeal-media`).
   - `S3_KEY`: Key ID dari Backblaze B2.
   - `S3_SECRET`: Application Key dari Backblaze B2.

2. **Pengujian Fungsional di Situs Live (`https://primedeal-property.vercel.app`):**
   - **Halaman Beranda & Pencarian:** Pastikan daftar properti muncul dengan benar dan tombol filter lokasi/harga merespons.
   - **API tRPC:** Buka `https://primedeal-property.vercel.app/api/trpc/property.list` di browser; pastikan mengembalikan respons JSON valid (`200 OK`) berisi array listing properti dari TiDB Cloud.
   - **Panel Admin & Video Upload:** Masuk sebagai admin untuk menguji penambahan listing baru serta unggahan video pendek beserta suaranya melalui integrasi Backblaze B2.

---

## Referensi

[1] PingCAP TiDB Cloud Documentation. *Select Cluster Tier & Connection Guide*. [https://docs.pingcap.com/tidbcloud/select-cluster-tier/](https://docs.pingcap.com/tidbcloud/select-cluster-tier/)  
[2] Backblaze B2 Cloud Storage. *Free Tier and S3 Compatibility Guide*. [https://www.backblaze.com/blog/free-isnt-always-free-a-guide-to-free-cloud-tiers/](https://www.backblaze.com/blog/free-isnt-always-free-a-guide-to-free-cloud-tiers/)
