# Panduan Penyiapan Layanan Eksternal (TiDB Cloud & Cloudflare R2)

Dokumen ini memandu Anda dalam menyiapkan database relasional gratis di **TiDB Cloud Serverless** dan penyimpanan objek S3 gratis di **Cloudflare R2** untuk mendukung operasional mandiri aplikasi **Primedeal Properti**.

---

## 1. Penyiapan Database TiDB Cloud (MySQL-Compatible)

TiDB Cloud menyediakan paket gratis (Free Tier) yang mencakup penyimpanan 5 GiB dan 50 juta operasi baca/tulis per bulan, sangat memadai untuk agensi properti skala menengah ke atas.

### Langkah Pendaftaran & Konfigurasi:
1. Kunjungi [TiDB Cloud](https://tidbcloud.com/) dan buat akun gratis menggunakan email atau akun Google Anda.
2. Buat klaster baru dengan memilih **Serverless Tier** (pilih wilayah terdekat seperti AWS Singapore atau Tokyo untuk latensi terbaik).
3. Setelah klaster aktif (biasanya memakan waktu 1–2 menit), klik tombol **Connect**.
4. Pilih tipe koneksi **Node.js** atau **Standard MySQL Connection**, lalu salin string koneksi (`DATABASE_URL`). Format string akan menyerupai:
   ```env
   mysql://username:password@gateway01.region.tidbcloud.com:4000/test?ssl={"rejectUnauthorized":true}
   ```
5. Simpan string tersebut dan masukkan ke variabel lingkungan server produksi Anda.
6. Jalankan migrasi skema Drizzle di lingkungan lokal atau server Anda untuk membuat tabel secara otomatis:
   ```bash
   pnpm drizzle-kit push
   ```

---

## 2. Penyiapan Storage Cloudflare R2 (S3-Compatible)

Cloudflare R2 menawarkan penyimpanan objek dengan kapasitas awal yang sangat besar serta **tanpa biaya egress (bandwidth keluar)**, menjadikannya pilihan ideal untuk menampung galeri foto properti dan video pendek.

### Langkah Pendaftaran & Konfigurasi:
1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/) dan pilih menu **R2** di bilah sisi kiri.
2. Klik **Create Bucket**, lalu beri nama bucket Anda (misalnya `primedeal-assets`).
3. Di dalam menu pengaturan bucket, buat **R2 API Token** dengan hak akses *Admin Read & Write* (atau *Object Read & Write*).
4. Salin parameter penting berikut untuk diintegrasikan ke backend Express Anda:
   - **Access Key ID**
   - **Secret Access Key**
   - **S3 Endpoint URL** (berbentuk `https://<account_id>.r2.cloudflarestorage.com`)
5. Sesuaikan variabel lingkungan backend Anda agar mengarah ke endpoint R2 Cloudflare tersebut, sehingga fungsi `storagePut` dan `storageGet` dapat mengunggah dan menampilkan berkas secara transparan.

---

*Disusun oleh Manus AI untuk kemandirian operasional Primedeal Properti.*
