# Panduan Traffic Primedeal

Primedeal menggunakan beberapa sumber statistik gratis agar pengunjung website, penggunaan APK, dan performa iklan dapat dibaca secara tepat. Website mencatat kunjungan melalui **Google Analytics 4** dengan Measurement ID `G-0QSM3M3WND`. APK versi **1.3.0** menambahkan penanda sumber untuk membedakan kunjungan WebView APK pada ringkasan admin, selain Firebase Analytics yang mencatat pembukaan aplikasi serta navigasi halaman tanpa mengirim judul properti, nomor telepon, kata pencarian, atau data pribadi.

| Yang ingin dilihat | Lokasi dashboard | Data utama |
|---|---|---|
| Traffic website | Google Analytics → **Reports** | Pengguna aktif, pengguna baru, sesi, dan halaman yang dibuka |
| Pengguna APK | Firebase Console → proyek **primedeal-propety** → **Analytics** | Pengguna aktif, pembukaan pertama, sesi, durasi keterlibatan, dan event aplikasi |
| Ringkasan sumber Primedeal | **/admin/dashboard** | Pengunjung unik website, APK, serta riwayat yang belum dapat diatribusikan |
| Iklan banner APK | AdMob → **Aplikasi → Primedeal Properti** atau **Laporan** | Tayangan, klik, *match rate*, dan estimasi pendapatan |

## Ringkasan website dan APK di dashboard admin

Masuk sebagai admin lalu buka **`/admin/dashboard`**. Kartu **Website** menghitung kunjungan dari browser biasa. Kartu **APK Primedeal** menghitung kunjungan yang datang dari WebView APK dengan penanda versi resmi. Kartu **Belum Teridentifikasi** menyimpan data historis sebelum penanda APK tersedia, sehingga angka tersebut tidak boleh diasumsikan sebagai website atau APK.

Penghitungan ini menggunakan pengenal anonim harian dan tidak sama persis dengan Google Analytics maupun Firebase. Satu perangkat dapat dihitung sekali per hari untuk setiap sumber trafik. Gunakan filter tanggal untuk melihat tren setelah APK 1.3.0 mulai digunakan.

Bagian **Laporan iklan APK** pada dashboard admin membuka laporan resmi AdMob. Pendapatan dan metrik iklan sengaja tidak disalin ke database Primedeal karena opsi dashboard yang dipilih tidak meminta atau menyimpan kredensial AdMob.

## Membaca traffic website

1. Buka [Google Analytics](https://analytics.google.com/) dan pilih properti **primedeal-propety**.
2. Buka menu **Laporan → Rekaman real-time** untuk memastikan pengunjung yang sedang aktif.
3. Buka **Laporan → Acquisition** untuk melihat sumber kunjungan dan **Laporan → Engagement → Pages and screens** untuk melihat halaman yang dibuka.

Traffic dari aplikasi WebView juga dapat ikut terlihat sebagai traffic website. Untuk angka penggunaan APK yang khusus, gunakan Firebase Analytics pada langkah berikutnya.

## Membaca pengguna APK

1. Instal APK **Primedeal Properti v1.3.0** atau versi lebih baru yang disediakan bersama pembaruan ini.
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
