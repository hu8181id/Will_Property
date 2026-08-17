# Verifikasi tombol Tambah / Kelola Listing

- Deployment Vercel live menampilkan tombol `Tambah / Kelola Listing` pada dashboard analytics.
- Klik tombol live membuka `/manage-listings?admin_key=...` dan halaman menampilkan `Tambah Listing Baru`.
- Screenshot viewport 375x812 pada preview proyek menunjukkan tombol selebar layar, terlihat tanpa scroll horizontal, di bawah judul dashboard.
- APK Admin v1.4.3 adalah WebView yang memuat URL Vercel sehingga perubahan tombol web akan tampil setelah WebView dimuat ulang.
- Lingkungan sandbox tidak memiliki `adb` atau perangkat/emulator Android tersambung, sehingga pemasangan dan klik langsung pada APK fisik belum dapat dilakukan di sini; pengguna perlu membuka APK di HP untuk konfirmasi akhir.
