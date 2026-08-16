# Panduan Penyiapan Layanan Eksternal (TiDB Cloud & Backblaze B2 / Supabase)

Dokumen ini memandu Anda dalam menyiapkan database relasional gratis di **TiDB Cloud Serverless** dan penyimpanan objek S3 gratis tanpa kartu kredit di **Backblaze B2** atau **Supabase Storage** untuk mendukung operasional mandiri aplikasi **Primedeal Properti**.

---

## 1. Penyiapan Database TiDB Cloud (MySQL-Compatible)

TiDB Cloud menyediakan paket gratis (Free Tier) yang mencakup penyimpanan 5 GiB dan 50 juta operasi baca/tulis per bulan tanpa memerlukan kartu kredit [1].

### Langkah Pendaftaran & Konfigurasi:
1. Kunjungi [TiDB Cloud](https://tidbcloud.com/) dan buat akun gratis menggunakan email atau akun Google Anda.
2. Buat klaster baru dengan memilih **Serverless Tier** (pilih wilayah terdekat seperti AWS Singapore atau Tokyo untuk latensi terbaik).
3. Setelah klaster aktif (biasanya memakan waktu 1–2 menit), klik tombol **Connect**.
4. Pilih tipe koneksi **Node.js** atau **Standard MySQL Connection**, lalu buat password dan salin string koneksi (`DATABASE_URL`). Format string akan menyerupai:
   ```env
   mysql://username:password@gateway01.region.tidbcloud.com:4000/sys?ssl={"rejectUnauthorized":true}
   ```
5. Simpan string tersebut dan masukkan ke variabel lingkungan server produksi Anda.
6. Jalankan migrasi skema Drizzle di lingkungan lokal atau server Anda untuk membuat tabel secara otomatis:
   ```bash
   pnpm drizzle-kit push
   ```

---

## 2. Penyiapan Storage Alternatif Tanpa Kartu Kredit (Backblaze B2 / Supabase Storage)

Karena Cloudflare R2 memerlukan metode pembayaran pada beberapa wilayah akun, Anda dapat menggunakan layanan penyimpanan S3-compatible alternatif yang benar-benar **tidak meminta kartu kredit** di awal:

### Opsi A: Backblaze B2 Cloud Storage (10 GB Gratis)
1. Kunjungi [Backblaze B2 Sign Up](https://www.backblaze.com/sign-up/cloud-storage) yang menyediakan 10 GB penyimpanan gratis tanpa kartu kredit [2].
2. Buat bucket baru (atur sebagai *Public* atau *Private* sesuai kebutuhan galeri properti).
3. Buat **Application Key** untuk mendapatkan `KeyID`, `ApplicationKey`, dan `S3 Endpoint` yang kompatibel dengan pustaka AWS S3 di backend aplikasi Anda.

### Opsi B: Supabase Storage (1 GB Gratis)
1. Kunjungi [Supabase](https://supabase.com/) dan buat proyek gratis baru (tidak memerlukan kartu kredit) [3].
2. Masuk ke menu **Storage**, buat bucket baru untuk foto properti.
3. Ambil kredensial API URL dan Service Role / Anon Key dari pengaturan proyek Supabase untuk diintegrasikan ke layanan penyimpanan aplikasi.

---

*Disusun oleh Manus AI untuk kemandirian operasional Primedeal Properti.*

## Referensi
[1] https://docs.pingcap.com/tidbcloud/select-cluster-tier/
[2] https://www.backblaze.com/blog/free-isnt-always-free-a-guide-to-free-cloud-tiers/
[3] https://supabase.com/pricing
