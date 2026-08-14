# WillProperty — Website Iklan Properti

Website statis tanpa Manus, dengan desain responsif dan integrasi Supabase.

## 1. Supabase
Buat tabel `properties` dengan kolom:
- id
- created_at
- title
- type
- status
- price
- location
- description
- specs
- images

`images` bisa berupa text URL gambar. Jika memakai array/JSON, sesuaikan `app.js`.

## 2. Konfigurasi
Buka `config.js` dan isi:
- SUPABASE_URL = Project URL Supabase
- SUPABASE_ANON_KEY = publishable/anon key

JANGAN memasukkan service_role key ke website.

## 3. Jalankan
Bisa di-host di Vercel, Netlify, GitHub Pages, Cloudflare Pages, atau hosting biasa.
Untuk Vercel/Netlify, upload folder ini atau hubungkan repository GitHub.

## Catatan keamanan
Aktifkan Row Level Security (RLS) di Supabase. Untuk website publik, buat policy SELECT agar listing boleh dibaca publik. Untuk penambahan/edit/hapus listing, lebih aman dibuat lewat halaman admin/server-side, bukan memberikan service_role key ke browser.
