# Panduan AdMob APK Primedeal

## Ringkasan implementasi

APK **Primedeal Properti 1.2.0** menggunakan satu banner adaptif native di bagian bawah aplikasi Android. Banner berada di luar WebView, sehingga tidak mengubah halaman website maupun menampilkan iklan kepada pengunjung yang membuka website langsung. Format ini dipilih agar pencarian dan detail properti tetap nyaman digunakan.

| Item | Konfigurasi |
|---|---|
| Package Android | `com.primedeal.property` |
| Versi APK | `1.2.0` (versionCode `4`) |
| Format iklan | Banner adaptif di bawah WebView |
| Persetujuan privasi | Google User Messaging Platform (UMP) pada setiap pembukaan APK |
| Iklan build debug | Unit uji resmi Google |
| Iklan build rilis | Unit banner produksi Primedeal |

> Jangan mengetuk iklan produksi milik sendiri atau meminta orang lain mengetuk iklan. Untuk pengembangan dan pengujian gunakan build debug yang memakai unit iklan uji resmi Google.[^banner]

## Persetujuan dan pilihan privasi

Saat aplikasi dibuka, UMP memperbarui informasi persetujuan pengguna. Jika formulir persetujuan diwajibkan berdasarkan wilayah dan konfigurasi AdMob, APK akan menampilkannya sebelum meminta iklan. Bila pengguna perlu diberi akses untuk mengubah pilihan privasi, tautan native **“Pilihan privasi iklan”** muncul di atas banner.

Pesan persetujuan **“Persetujuan Privasi Primedeal”** telah dipublikasikan melalui **AdMob → Privacy & messaging** untuk aplikasi **Primedeal Properti**. UMP mengambil pesan ini dari konfigurasi AdMob yang terkait dengan App ID aplikasi.[^ump]

## Cara melihat pendapatan

1. Buka [AdMob](https://admob.google.com) lalu masuk menggunakan akun pemilik Primedeal.
2. Pilih aplikasi **Primedeal Properti** pada menu **Apps**.
3. Lihat kartu ringkasan pada halaman aplikasi untuk jumlah tayangan, klik, dan estimasi pendapatan.
4. Untuk periode dan rincian yang lebih lengkap, buka **Reports**, pilih rentang tanggal, lalu gunakan metrik seperti *Estimated earnings*, *Impressions*, *Match rate*, dan *eCPM*.
5. Gunakan menu **Payments** untuk meninjau profil pembayaran, ambang pembayaran, serta status pembayaran setelah ada pendapatan yang memenuhi syarat.

Data pendapatan dan metrik tidak selalu muncul seketika. Setelah APK digunakan oleh pengguna nyata, AdMob membutuhkan waktu untuk memproses tayangan. Profil pembayaran pemilik telah dikonfirmasi selesai; tetap gunakan menu **Payments** untuk meninjau ambang dan status pembayaran setelah pendapatan memenuhi syarat.

## Checklist rilis

- [x] App ID AdMob ditambahkan ke AndroidManifest.
- [x] Google Mobile Ads SDK dan UMP SDK ditambahkan ke APK.
- [x] Banner adaptif dipasang secara native, tanpa perubahan iklan pada website.
- [x] Build debug memakai unit iklan uji Google.
- [x] Build rilis memakai unit banner produksi Primedeal.
- [x] APK rilis ditandatangani dengan keystore Primedeal dan diverifikasi dengan Signature Scheme v2 serta v3.
- [ ] Status peninjauan AdMob disetujui oleh Google.
- [x] Pesan persetujuan yang diperlukan telah dipublikasikan di **Privacy & messaging** AdMob.
- [x] Profil pembayaran AdMob dilengkapi oleh pemilik akun.

[^banner]: [Google Mobile Ads SDK — Banner ads](https://developers.google.com/admob/android/banner)
[^ump]: [Google User Messaging Platform — Android](https://developers.google.com/admob/android/privacy)
