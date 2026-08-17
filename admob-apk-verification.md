# Dokumentasi Verifikasi APK Admin & Perbaikan Laporan AdMob (v1.4.5)

Dokumentasi ini mencatat perbaikan pada APK Admin PrimeDeal untuk mengatasi masalah halaman putih saat mengeklik tombol **Buka Laporan AdMob** di dalam WebView aplikasi.

## 1. Masalah Sebelumnya
Ketika admin mengeklik tombol **Buka Laporan AdMob** di dashboard admin PrimeDeal (`/admin/dashboard`), WebView mencoba memuat URL eksternal Google AdMob (`https://admob.google.com/home/#/apps`) di dalam kontainer aplikasi. Karena AdMob memerlukan sesi login Google, cookie lintas situs, dan rendering browser penuh, WebView menampilkan layar putih (*blank white screen*) atau gagal merender halaman.

## 2. Solusi yang Diterapkan
- **Pencegatan Navigasi Utama (`shouldOverrideUrlLoading` & `onPageStarted`)**: Setiap kali URL berdomain `admob.google.com` dimuat atau diklik, WebView langsung menghentikan proses pemuatan internal dan meluncurkannya ke browser eksternal (seperti Google Chrome) melalui Intent Android `ACTION_VIEW`.
- **Penanganan Target Jendela Baru (`onCreateWindow` / `target="_blank"`)**: Tombol Laporan AdMob menggunakan `target="_blank"`. Handler `onCreateWindow` dan popup WebView client kini mencegat URL tujuan tersebut secara deterministik dan membuka URL langsung ke browser eksternal tanpa memicu WebView putih.
- **Artefak APK Admin Final**:
  - File: `/home/ubuntu/primedeal-native-apk/dist/PrimeDeal-Admin-v1.4.5-AdMobFix.apk`
  - Ukuran: ~307 KB
  - Penandatanganan: Ditandatangani dan diverifikasi menggunakan APK Signature Scheme v1, v2, dan v3 dengan keystore resmi PrimeDeal (`primedeal-release.jks`).

## 3. Pengujian Unit & Validasi Policy
- **Unit Test Java Murni**: Menjalankan pengujian logika URL AdMob (`AdMobUrlPureTest`) melalui Gradle (`testReleaseUnitTest`) dengan hasil **BUILD SUCCESSFUL** (lulus tanpa error).
- **Pengujian Integrasi**: Handler `shouldOverrideUrlLoading`, `onPageStarted`, dan `onCreateWindow` secara deterministik mencegah WebView memuat halaman AdMob putih dan langsung membuka browser eksternal.

## 4. Cara Pengujian di Perangkat
1. Unduh dan instal `PrimeDeal-Admin-v1.4.5-AdMobFix.apk` pada perangkat Android Anda.
2. Buka aplikasi dan pastikan Anda masuk ke dashboard admin PrimeDeal.
3. Gulir ke bagian **Laporan iklan APK** lalu tekan tombol **Buka Laporan AdMob**.
4. Aplikasi akan secara otomatis membuka browser eksternal (Chrome) yang memuat dashboard resmi AdMob dengan sempurna, sementara aplikasi Admin tetap berjalan stabil di latar belakang.
