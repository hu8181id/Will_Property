# Panduan Pembaruan APK Primedeal

## Ringkasan

Primedeal menggunakan pembaruan **gratis dengan persetujuan pengguna**. APK tidak didistribusikan melalui Google Play, sehingga Android tidak mengizinkan aplikasi memasang pembaruan secara diam-diam. Setiap pemasangan atau upgrade selalu memerlukan tindakan pengguna di perangkatnya.

Rilis awal yang memakai alur ini adalah **Primedeal Properti 1.3.0** (`versionCode` 5). Rilis tersebut memeriksa manifest versi saat aplikasi dibuka dan menampilkan dialog pembaruan hanya bila tersedia versi yang lebih baru.

| Komponen | Fungsi |
|---|---|
| `GET /apk/latest.json` | Manifest publik tanpa cache berisi versi, URL APK HTTPS, checksum SHA-256, dan catatan rilis |
| Pemberitahuan website | Menawarkan pembaruan kepada WebView Android lama tanpa ditampilkan di browser umum |
| Pemeriksa native 1.3.0+ | Membaca manifest saat aplikasi dibuka lalu membuka browser sistem hanya setelah pengguna memilih **Unduh pembaruan** |
| APK bertanda tangan | Harus memakai keystore Primedeal yang sama agar Android menganggapnya sebagai upgrade sah |

## Pengguna APK lama

Pengguna versi lama yang membuka Primedeal akan melihat kartu **Pembaruan Primedeal tersedia**. Mereka menekan **Unduh pembaruan**, menunggu unduhan selesai, lalu mengetuk berkas APK dan menyetujui pemasangan Android. Bila Android meminta izin pemasangan dari browser/sumber tersebut, pengguna dapat mengaktifkannya hanya untuk browser yang dipakai dan melanjutkan pemasangan.

> Pengunjung website melalui Chrome atau browser biasa tidak melihat kartu ini. Kartu dibatasi untuk user-agent Android WebView.

## Pemeriksaan aman

Manifest rilis 1.3.0 menyimpan checksum berikut untuk audit distribusi:

```text
SHA-256: f6126cc5dd5cd026cdc7d7978db48c08e714b61d402b11319638104b5c763e25
```

Pemeriksa native menolak manifest yang tidak memiliki versi lebih tinggi, URL APK HTTPS, atau checksum SHA-256 yang valid. Aplikasi **tidak** mengunduh atau memasang sesuatu sendiri.

## Hasil validasi rilis 1.3.0

Pada 15 Agustus 2026, pemilik aplikasi mengonfirmasi bahwa APK Primedeal versi lama berhasil diperbarui ke **1.3.0** melalui alur unduh dan persetujuan pemasangan Android. Validasi ini melengkapi pemeriksaan otomatis web dan Android yang dijalankan sebelum rilis.

## Rilis versi berikutnya

Untuk setiap versi baru, lakukan urutan berikut.

1. Tingkatkan `versionCode` dan `versionName` di `primedeal_apk/app/build.gradle`.
2. Bangun APK rilis dan tandatangani menggunakan `primedeal-upload-keystore.jks` yang sama.
3. Hitung SHA-256 APK.
4. Salin APK ke `/home/ubuntu/webdev-static-assets/`, unggah menggunakan `manus-upload-file --webdev`, lalu catat path `/manus-storage/...` yang dihasilkan.
5. Ubah `versionCode`, `versionName`, `downloadPath`, `sha256`, dan `releaseNotes` pada endpoint `/apk/latest.json` di `server/_core/index.ts`.
6. Jalankan pengujian web dan Android, simpan checkpoint, lalu bagikan APK baru.

Jangan mengubah package `com.primedeal.property` atau menggunakan keystore lain. Keduanya akan membuat Android memperlakukan rilis sebagai aplikasi berbeda, bukan pembaruan.

## Referensi

- [Pembaruan dalam aplikasi Google Play](https://developer.android.com/guide/playcore/in-app-updates) — hanya berlaku untuk aplikasi yang didistribusikan melalui Google Play.
- [Android PackageInstaller](https://developer.android.com/reference/android/content/pm/PackageInstaller) — pemasangan paket tetap berada dalam alur persetujuan Android.
