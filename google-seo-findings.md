# Temuan Google SEO — 17 Agustus 2026

## Sitemap
Sumber: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

Google merekomendasikan sitemap berada di root situs dan berisi URL absolut yang ingin muncul di hasil pencarian. Sitemap XML dibatasi hingga 50 MB tidak terkompresi atau 50.000 URL per file. URL yang dicantumkan sebaiknya canonical, dan `<lastmod>` dipakai jika akurat serta mencerminkan perubahan konten utama.

## Indexing API
Sumber: https://developers.google.com/search/apis/indexing-api/v3/using-api

Dokumentasi Indexing API menyatakan API tersebut digunakan untuk memberi tahu Google tentang halaman bertipe `JobPosting` atau `BroadcastEvent` yang tertanam di `VideoObject`. Listing properti biasa tidak otomatis memenuhi syarat untuk Indexing API. Karena itu implementasi aman untuk listing adalah sitemap dinamis, canonical URL, structured data `RealEstateAgent`/`Residence` atau tipe schema yang sesuai, internal linking, dan submit sitemap melalui Search Console. Jika ingin API Indexing, diperlukan verifikasi Search Console, service account, izin, dan eligibility Google; jangan mengklaim bahwa API tersebut menjamin indexing listing.
