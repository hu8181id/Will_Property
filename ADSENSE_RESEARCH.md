# Catatan Kelayakan Google AdSense

## Temuan resmi

Google menyatakan bahwa pendaftar AdSense harus berusia minimal 18 tahun, memiliki konten yang unik, berkualitas, orisinal, dan mampu menarik audiens. Pendaftar juga perlu dapat mengakses kode HTML situs yang diajukan serta mematuhi kebijakan program AdSense.

Sebelum iklan dapat tampil, Google meninjau akun dan situs secara terpisah. Peninjauan akun mencakup detail pembayaran, nomor telepon, dan alamat. Peninjauan situs menilai kepatuhan terhadap kebijakan. Kode publisher AdSense perlu ditempatkan pada situs untuk mendukung peninjauan, baik melalui Auto ads di `head` maupun unit iklan di `body`.

Kebijakan Google melarang klik atau impresi palsu, ajakan untuk mengeklik iklan, sumber traffic yang tidak sah, serta penempatan iklan yang menyerupai navigasi atau mengganggu penggunaan situs. Untuk aplikasi WebView, AdMob/Ad Manager harus memakai Google Mobile Ads SDK dan tetap tunduk pada kebijakan konten yang sama.

## Sumber

1. Google AdSense Help, [Eligibility requirements for AdSense](https://support.google.com/adsense/answer/9724?hl=en-GB).
2. Google AdSense Help, [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en).
3. Google for Developers, [Account approval process](https://developers.google.com/adsense/platforms/transparent/approvals).

## Audit awal Primedeal pada 15 Agustus 2026

Beranda Primedeal memiliki navigasi publik, listing properti, halaman Tentang Kami, kontak WhatsApp, dan tautan footer untuk Kebijakan Privasi serta Syarat & Ketentuan. Namun, tautan Kebijakan Privasi yang terdeteksi di footer mengarah ke halaman 404 pada saat audit. Halaman kebijakan yang dapat diakses dan memuat penjelasan pengumpulan data, cookie, Google Analytics, serta iklan pihak ketiga perlu disiapkan sebelum pengajuan AdSense.
