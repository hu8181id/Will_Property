# Catatan Verifikasi Deployment Vercel

- Pada 17 Agustus 2026 sekitar 03:00 UTC, domain `https://primedeal-property.vercel.app/manage-listings` masih memuat bundle `assets/index-CN8j8TDG.js`.
- Bundle tersebut belum memuat string rute `manage-listings` maupun kode `Vercel Blob`; halaman portal admin menampilkan 404 dari aplikasi klien.
- Commit production `9272489` telah berhasil masuk ke GitHub branch `main` dan masih menunggu deployment Vercel aktif pada domain production.

Setelah jeda deployment, portal `manage-listings` aktif kembali dengan akses admin. Bundle yang dilayani berubah menjadi `assets/index-YKZfbGYr.js` dan terverifikasi memuat rute `manage-listings`, endpoint `blob-upload-auth`, serta kode `Vercel Blob`.

Formulir admin production menyediakan tiga input file tersembunyi: input foto multi-file (`accept="image/*"`), input video tunggal (`accept="video/*"`), dan input thumbnail video. Pengujian memakai input foto dan video agar mengikuti alur pengguna sebenarnya.

Pada uji langsung 17 Agustus 2026, pemilihan foto dan video di browser berhasil, tetapi unggah foto berhenti sebelum transfer ke Blob dengan pesan `Vercel Blob: Failed to retrieve the client token`. Video tetap berada pada state form lokal dan belum disimpan ke database. Tidak ada listing baru yang dibuat maupun listing lama yang diubah. Temuan ini menunjukkan endpoint server-generated token belum dilayani dengan benar oleh entrypoint Vercel yang aktif.
