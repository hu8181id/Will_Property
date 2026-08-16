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

### Opsi A: Backblaze B2 Cloud Storage (10 GB Gratis Tanpa Kartu Kredit)
1. Kunjungi [Backblaze B2 Cloud Storage](https://www.backblaze.com/cloud-storage) dan buat akun gratis (Free Tier mencakup 10 GB penyimpanan dan *egress* gratis tanpa meminta kartu kredit) [2].
2. Masuk ke dashboard, pilih **B2 Cloud Storage** → **Buckets** → **Create a Bucket**.
3. Beri nama bucket (misalnya `primedeal-media`), setel visibilitas ke **Public** agar foto properti dapat diakses publik, lalu klik buat.
4. Buka menu **App Keys** → **Add a New Application Key**. Beri izin akses ke bucket `primedeal-media` dengan tipe *Read and Write*.
5. Simpan `keyID`, `applicationKey`, dan endpoint S3 (misalnya `https://s3.us-west-002.backblazeb2.com`) ke variabel lingkungan aplikasi Anda (`S3_ENDPOINT`, `S3_KEY`, `S3_SECRET`, `S3_BUCKET`).

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


---

## 3. Menjalankan Migrasi Skema Drizzle ke TiDB Cloud secara Aman

Untuk memindahkan struktur tabel dan data ke database TiDB Cloud tanpa mengganggu operasional situs Manus yang sedang berjalan:
1. Di komputer lokal atau terminal Anda, salin string koneksi dari TiDB Cloud dan atur ke variabel lingkungan:
   ```bash
   export DATABASE_URL="mysql://username:password@gateway01.region.tidbcloud.com:4000/sys?ssl={\"rejectUnauthorized\":true}"
   ```
2. Jalankan perintah migrasi skema Drizzle untuk membuat seluruh tabel (`users`, `properties`, `analytics`, `reviews`, dll.) secara otomatis di TiDB Cloud:
   ```bash
   pnpm drizzle-kit push
   ```
3. Verifikasi melalui panel SQL Editor di TiDB Cloud bahwa tabel-tabel utama telah terbentuk sempurna.


---

## 4. Checklist Keamanan Migrasi Database & Environment Variables Produksi

Sebelum Anda menjalankan perintah migrasi atau melakukan *deploy* ke Render:

### A. Daftar Environment Variables Lengkap untuk Produksi (`render.yaml` / `.env`)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="mysql://username:password@gateway01.region.tidbcloud.com:4000/sys?ssl={\"rejectUnauthorized\":true}"
JWT_SECRET="hasil_generate_random_string_yang_panjang_dan_aman"
# Jika menggunakan Backblaze B2 S3-Compatible Storage:
S3_ENDPOINT="https://s3.us-west-002.backblazeb2.com"
S3_BUCKET="primedeal-media"
S3_KEY="your_backblaze_key_id"
S3_SECRET="your_backblaze_application_key"
```

### B. Prosedur Keamanan Mutlak (Mencegah Salah Target Database)
1. **Verifikasi URL Target**: Pastikan variabel `DATABASE_URL` yang Anda gunakan menunjuk ke hostname TiDB Cloud Anda (`gateway01...tidbcloud.com`), **bukan** ke string koneksi lokal atau string database platform Manus.
2. **Isolasi Data**: Website Primedeal di platform Manus akan terus berjalan normal dan tidak terpengaruh selama Anda tidak mengubah environment variables di panel Manus. Migrasi hanya akan mengisi tabel-tabel di klaster TiDB Cloud baru Anda.
3. **Uji Coba Staging**: Selalu jalankan uji build lokal (`pnpm build`) dan jalankan aplikasi secara lokal dengan variabel TiDB Cloud baru (`PORT=3000 pnpm start`) untuk memastikan seluruh koneksi database dan query Drizzle merespons dengan benar sebelum mengaktifkan domain publik baru.
