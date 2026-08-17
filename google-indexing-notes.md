# Catatan Rujukan Google Search Central

Tanggal pengambilan: 17 Agustus 2026.

## Sitemap
Sumber resmi: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

Google menjelaskan bahwa sitemap harus menggunakan URL absolut, ditempatkan di root bila ingin mencakup seluruh situs, dan hanya merupakan petunjuk—pengiriman sitemap tidak menjamin URL langsung diindeks. Sitemap dapat dikirim lewat Search Console, Search Console API, atau dideklarasikan di robots.txt. Google merekomendasikan sitemap yang dihasilkan otomatis dari database untuk situs dengan banyak URL. Nilai `lastmod` sebaiknya mencerminkan perubahan signifikan yang benar-benar dapat diverifikasi.

## Indexing API
Sumber resmi: https://developers.google.com/search/apis/indexing-api/v3/quickstart

Google menyatakan Indexing API hanya dapat dipakai untuk halaman yang memiliki `JobPosting` atau livestream video dengan `BroadcastEvent` di dalam `VideoObject`. Listing properti biasa tidak termasuk cakupan tersebut. Karena itu, Primedeal tidak boleh mengklaim atau mengandalkan Indexing API untuk memaksa indexing listing properti. Mekanisme yang sesuai adalah halaman listing publik yang dapat dicrawl, metadata/canonical/structured data yang valid, sitemap dinamis, robots.txt yang menunjuk ke sitemap, serta verifikasi dan pengiriman sitemap melalui Search Console. Indexing API hanya boleh ditambahkan bila konten benar-benar memenuhi kategori Google tersebut dan persyaratan service account/quota.

## Keputusan implementasi
- Pertahankan sitemap dinamis dari database dan robots.txt dengan baris Sitemap.
- Hapus ketergantungan pada endpoint `https://www.google.com/ping?sitemap=...` sebagai mekanisme utama karena sitemap submission/pengambilan Google dikendalikan Google.
- Saat listing dibuat, diperbarui, atau dihapus, pastikan slug, canonical URL, metadata, structured data, dan `lastmod` konsisten; invalidasi cache dapat dilakukan bila ada cache yang digunakan.
- Sediakan status/log SEO internal yang hanya menyatakan URL sudah dimasukkan ke sitemap, bukan menjamin sudah terindeks Google.
