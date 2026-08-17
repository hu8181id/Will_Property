# Temuan Meta WhatsApp Cloud API — 17 Agustus 2026

## Sumber resmi

- https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
- https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/template-messages/
- https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview

## Temuan yang dipakai untuk desain

Meta mendokumentasikan Cloud API sebagai API programatik untuk mengirim dan menerima pesan melalui WhatsApp Business Platform. Panduan Get Started memuat tahap pembuatan Meta App dengan WhatsApp, penggunaan API, pengiriman dan penerimaan pesan, pengaturan webhook, pembuatan system user, pembuatan access token permanen, dan pengiriman pesan non-template.

Halaman Template messages Meta bertanggal 23 April 2026 menyatakan bahwa halaman tersebut telah dipindahkan ke Template fundamentals. Karena notifikasi agen dikirim dari server tanpa menunggu agen membalas dalam sesi chat yang sedang aktif, integrasi harus mendukung pesan template yang telah disetujui Meta. Implementasi akan menjadikan nama template dan bahasa sebagai konfigurasi server-side, bukan menaruh token atau kredensial di browser.

## Konsekuensi implementasi

PrimeDeal akan menyimpan log status delivery secara terpisah dari lead: queued, sent, failed, atau fallback. Saat konfigurasi API belum lengkap atau provider gagal, tombol web tetap membuka URL wa.me yang sudah ada sehingga calon pembeli tidak kehilangan jalur kontak. Pesan Cloud API akan dikirim hanya jika seluruh secret dan nama template tersedia.
