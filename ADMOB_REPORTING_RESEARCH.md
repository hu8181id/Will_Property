# Rujukan Integrasi Laporan AdMob

Penelitian dilakukan 15 Agustus 2026 untuk menentukan opsi ringkasan iklan pada dashboard Primedeal.

## Temuan resmi

Google menyatakan bahwa **AdMob API** dapat mengakses informasi akun secara terprogram dan menghasilkan laporan jaringan (*network report*) serta mediasi. Akses memerlukan project Google dan kredensial **OAuth 2.0**. Scope `https://www.googleapis.com/auth/admob.report` memberikan akses laporan performa iklan dan estimasi pendapatan; scope `https://www.googleapis.com/auth/admob.readonly` memiliki cakupan lebih luas untuk data akun, inventaris, dan laporan.

Laporan jaringan menyediakan performa AdMob yang sama dengan laporan jaringan pada antarmuka AdMob. Contoh metrik yang didokumentasikan mencakup tayangan dan *match rate*; laporan mediasi dapat mencakup klik serta estimasi pendapatan. Data dapat dikelompokkan dengan dimensi seperti aplikasi dan unit iklan.

## Konsekuensi desain

1. Dashboard Primedeal dapat memisahkan **trafik website** dan **trafik APK** dari pencatatan internal tanpa kredensial AdMob tambahan.
2. Menampilkan angka pendapatan, tayangan iklan, klik, atau *match rate* secara otomatis di dashboard membutuhkan OAuth AdMob eksplisit dari pemilik akun. Tidak ada konektor AdMob yang tersedia pada konfigurasi sesi saat penelitian dilakukan.
3. Opsi bebas kredensial yang aman adalah menampilkan ringkasan trafik sumber dan tautan langsung menuju laporan AdMob resmi. Nilai pendapatan tidak boleh dibuat-buat atau disalin manual ke database sebagai pengganti API.

## Sumber

1. [Generate reports — AdMob API](https://developers.google.com/admob/api/v1/reporting)
2. [Reporting — AdMob API](https://developers.google.com/admob/api/v1/report-overview)
