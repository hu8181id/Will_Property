# Temuan Google Indexing untuk Listing Properti

Tanggal: 17 Agustus 2026

## Kesimpulan teknis

Google menyatakan Indexing API hanya dapat digunakan untuk halaman yang memuat `JobPosting` atau `BroadcastEvent` yang tertanam dalam `VideoObject`. Halaman listing real-estate biasa tidak termasuk cakupan resmi API tersebut. Karena itu, PrimeDeal tidak boleh mengirim URL properti ke Indexing API seolah-olah halaman lowongan kerja atau livestream; pendekatan tersebut berisiko ditolak dan dianggap penyalahgunaan.

Untuk halaman properti biasa, metode resmi yang dapat diotomatisasi adalah memastikan URL publik dapat dirayapi, menambahkan halaman ke sitemap dinamis, menjaga `lastmod` akurat, dan mengirim sitemap ke Search Console. Untuk beberapa URL tertentu, permintaan crawl dilakukan melalui URL Inspection Tool. Google menyatakan crawl dapat membutuhkan beberapa hari hingga beberapa minggu, dan permintaan crawl tidak menjamin halaman langsung atau pasti masuk hasil pencarian.

## Sumber resmi

1. Google Search Central, “Indexing API Quickstart”: https://developers.google.com/search/apis/indexing-api/v3/quickstart
2. Google Search Central, “Ask Google to Recrawl Your URLs”: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
3. Google Search Central, “Build and Submit a Sitemap”: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## Implikasi untuk PrimeDeal

Setiap listing baru tetap akan otomatis masuk sitemap pada request berikutnya karena sitemap membaca database aktif. Implementasi yang aman adalah menambahkan status internal `sitemap_ready`/`queued`/`submitted`/`checked` pada antrean indexing milik PrimeDeal, lalu menampilkan status tersebut di Admin. Status internal tidak boleh disebut sebagai jaminan bahwa Google sudah mengindeks URL.
