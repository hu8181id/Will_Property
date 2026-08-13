# Panduan Traffic Primedeal

Primedeal menggunakan dua sumber statistik gratis agar pengunjung website dan penggunaan APK dapat dibaca secara terpisah. Website mencatat kunjungan melalui **Google Analytics 4** dengan Measurement ID `G-0QSM3M3WND`. APK versi **1.1.0** menambahkan Firebase Analytics untuk mencatat pembukaan aplikasi dan navigasi halaman WebView tanpa mengirim judul properti, nomor telepon, kata pencarian, atau data pribadi.

| Yang ingin dilihat | Lokasi dashboard | Data utama |
|---|---|---|
| Traffic website | Google Analytics → **Reports** | Pengguna aktif, pengguna baru, sesi, dan halaman yang dibuka |
| Pengguna APK | Firebase Console → proyek **primedeal-propety** → **Analytics** | Pengguna aktif, pembukaan pertama, sesi, durasi keterlibatan, dan event aplikasi |

## Membaca traffic website

1. Buka [Google Analytics](https://analytics.google.com/) dan pilih properti **primedeal-propety**.
2. Buka menu **Laporan → Rekaman real-time** untuk memastikan pengunjung yang sedang aktif.
3. Buka **Laporan → Acquisition** untuk melihat sumber kunjungan dan **Laporan → Engagement → Pages and screens** untuk melihat halaman yang dibuka.

Traffic dari aplikasi WebView juga dapat ikut terlihat sebagai traffic website. Untuk angka penggunaan APK yang khusus, gunakan Firebase Analytics pada langkah berikutnya.

## Membaca pengguna APK

1. Instal APK **Primedeal Properti v1.1.0** yang disediakan bersama pembaruan ini.
2. Buka [Firebase Console](https://console.firebase.google.com/) dan pilih proyek **primedeal-propety**.
3. Jika menu Analytics meminta pengaktifan, buka **Project settings → Integrations → Google Analytics**, lalu hubungkan atau buat properti Google Analytics. Proses ini gratis.
4. Buka **Analytics → Dashboard** untuk melihat pengguna aktif, pembukaan pertama, dan sesi. Untuk melihat aktivitas cepat saat pengujian, gunakan **Analytics → DebugView**.
5. Buka **Analytics → Events** untuk melihat event `primedeal_app_open` (APK dibuka) serta `primedeal_webview_page` (halaman utama, listing, KPR, favorit, tentang kami, atau admin dibuka dari APK).

> Data Analytics dapat membutuhkan waktu beberapa jam sebelum muncul pada laporan reguler. Firebase Analytics juga menghasilkan beberapa event dasar secara otomatis setelah SDK aktif.[1]

## Cara membaca angka secara praktis

| Pertanyaan | Metrik yang digunakan |
|---|---|
| Berapa orang mengunjungi website? | **Users** dan **Sessions** pada Google Analytics 4 |
| Halaman website mana sering dibuka? | **Pages and screens** pada Google Analytics 4 |
| Berapa orang memakai APK? | **Active users**, `first_open`, dan `session_start` pada Firebase Analytics |
| Apakah pengguna APK membuka listing atau KPR? | Event `primedeal_webview_page` pada Firebase Analytics |

## Batasan privasi

Implementasi website hanya mengirim jalur halaman, bukan parameter pencarian. Implementasi APK hanya mengirim kelompok halaman seperti `listing` atau `kpr`. Sistem tidak mengirim nama listing, isi pencarian, nomor WhatsApp, file media, maupun identitas pengguna ke event analitik kustom.

## Referensi

[1] [Firebase — Google Analytics](https://firebase.google.com/docs/analytics)
