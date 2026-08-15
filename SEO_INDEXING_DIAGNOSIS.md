# Catatan Diagnosis Keterindeksan Google

# Diagnosis Indeksasi Google — Primedeal

**Tanggal pemeriksaan:** 15 Agustus 2026  
**Properti Search Console:** `https://primedeal-jl8furcm.manus.space/`  
**URL contoh yang diperiksa:** `https://primedeal-jl8furcm.manus.space/listing?property=60001`

## Ringkasan

Listing Primedeal **belum dapat diharapkan muncul stabil ketika dicari dengan kata kunci umum** karena Google masih memproses laporan indeks untuk properti ini dan sinyal canonical pada HTML listing sebelumnya menunjuk ke domain lama, bukan ke domain publik yang sedang dibuka. Search Console sudah merekam **2 klik penelusuran web**, sehingga situs bukan sepenuhnya tidak terlihat di Google. Namun, angka itu belum berarti setiap listing sudah diindeks atau dapat meraih posisi tertentu.

> Permintaan crawl tidak menjamin URL langsung masuk indeks atau langsung tampil di hasil penelusuran. Google menyatakan prosesnya dapat memerlukan beberapa hari hingga beberapa minggu dan bergantung pada kualitas serta kegunaan konten. [1]

## Hasil pemeriksaan teknis

| Area | Hasil | Dampak SEO |
|---|---|---|
| `robots.txt` | Dapat diakses, menetapkan `User-agent: *`, mengizinkan halaman publik, dan merujuk sitemap aktif. | Tidak terlihat pemblokiran crawler pada halaman listing publik. |
| Sitemap | `sitemap.xml` berisi halaman penting dan **11 URL listing** berformat `/listing?property=<id>`. | Google memiliki jalur resmi untuk menemukan URL listing. Sitemap adalah sinyal canonical yang lebih lemah daripada `rel="canonical"`. [2] |
| Listing contoh | URL `property=60001` terbuka publik dan menyajikan judul, lokasi, harga, deskripsi, foto, serta detail properti. | Halaman memiliki konten yang dapat dijangkau pengguna dan crawler tanpa login. |
| Search Console | Ringkasan menunjukkan **2 total klik penelusuran web**. Laporan Penyusunan Indeks masih menyatakan **“Memproses data, harap periksa kembali setelah sekitar satu hari.”** | Data cakupan URL belum tersedia untuk menentukan status setiap listing. |
| Metadata server-side sebelum perbaikan | Title, description, Open Graph, dan JSON-LD tersedia. Namun `canonical` serta `og:url` contoh listing menunjuk ke `https://primedeal.manus.space/...`, bukan domain aktif `https://primedeal-jl8furcm.manus.space/...`. | Ini adalah hambatan nyata: `rel="canonical"` merupakan sinyal kuat bagi Google. Ketidaksesuaian dengan domain sitemap dapat membuat sinyal URL terpecah atau Google memilih URL lain. [2] |

## Perbaikan yang telah diterapkan

Generator metadata SEO sekarang membentuk canonical, `og:url`, gambar relatif, dan `url` JSON-LD dengan **domain request publik yang aktif**. Konfigurasi `CANONICAL_ORIGIN`, apabila disediakan saat domain kustom telah digunakan, tetap diprioritaskan. Jika tidak, sistem memakai host publik request dan fallback ke domain Primedeal aktif.

Perbaikan ini menghilangkan referensi canonical lama pada listing baru. Setelah rilis, Google masih perlu merayapi ulang halaman agar dapat melihat metadata yang telah benar. Google menganjurkan canonical self-referential yang konsisten dengan URL yang dipilih di sitemap dan tautan internal. [2]

Verifikasi lokal setelah perubahan menunjukkan URL listing contoh tetap terbuka dan menampilkan detail properti. Pemeriksaan tipe TypeScript, build produksi, serta **60 pengujian Vitest** juga lulus sebelum rilis.

## Mengapa hasil pencarian belum terlihat konsisten

Kondisi saat ini paling masuk akal dijelaskan oleh kombinasi laporan indeks yang masih diproses dan canonical URL lama yang baru diperbaiki. Sitemap serta robots.txt bukan penyebab pemblokiran yang terlihat. Format URL dengan parameter `?property=` sendiri **bukan bukti kegagalan indeksasi**; URL tersebut tetap dapat di-crawl selama unik, tersedia publik, dan memiliki canonical yang konsisten.

Karena listing baru sering berubah dan situs masih mengumpulkan sinyal penelusuran, hasil dapat berbeda antar kata kunci, lokasi pengguna, bahasa, dan waktu. Tidak ada bukti dari pemeriksaan ini bahwa domain `manus.space` secara otomatis tidak dapat mendapat peringkat. Ketika nanti berpindah ke domain kustom, canonical perlu diubah secara konsisten sekali saja melalui `CANONICAL_ORIGIN`, sitemap, dan redirect domain lama bila tersedia.

## Observasi pencarian non-merek — Gunawangsa Manyar

Pada 15 Agustus 2026, pencarian tanpa nama merek untuk **“Gunawangsa Manyar 2BR Furnished dekat Unair ITS Merr”** memperlihatkan hasil dari portal properti dan marketplace mapan, termasuk OLX, Pinhome, Brighton, Properti1, serta Rumah123. Listing Primedeal tidak terlihat pada kumpulan hasil awal yang diperiksa.

Temuan ini menjelaskan mengapa menambahkan kata **“Primedeal”** membuat pencarian lebih mudah menemukan situs: kata tersebut adalah penanda merek yang jauh lebih khusus dan kompetisinya rendah. Sebaliknya, pencarian tanpa merek adalah kata kunci transaksi yang kompetitif dan saat ini diperebutkan oleh beberapa portal dengan koleksi halaman, riwayat, serta sinyal rujukan yang lebih banyak. Status **“URL ada di Google”** memastikan kelayakan muncul, tetapi tidak menjanjikan posisi untuk kata kunci tertentu. [3]

Perbaikan yang aman bukan menumpuk kata kunci atau membuat klaim yang tidak dapat dibuktikan. Setiap listing sebaiknya menyebut tipe transaksi, nama proyek, jumlah kamar, kondisi unit, luas, lokasi, landmark yang memang relevan, dan harga aktual secara natural pada judul serta paragraf pertama. Konten berbeda yang membantu pembeli memahami unit memberi Google lebih banyak konteks dibandingkan template deskripsi yang sama pada banyak halaman. [1]

## Langkah yang dapat dilakukan sekarang

| Urutan | Tindakan | Hasil yang diharapkan |
|---|---|---|
| 1 | Tunggu rilis perbaikan canonical, lalu buka **Search Console → Inspeksi URL** dan masukkan URL listing lengkap, misalnya `https://primedeal-jl8furcm.manus.space/listing?property=60001`. | Melihat status indeks, canonical yang dipilih Google, dan alasan jika URL tidak dapat diindeks. [3] |
| 2 | Pilih **Uji URL aktif**. Jika hasilnya dapat diindeks, pilih **Minta Pengindeksan** untuk beberapa listing prioritas saja, misalnya 3–5 listing terbaru atau paling lengkap. | Meminta Google merayapi ulang URL pascaperbaikan. Ada kuota; pengajuan berulang untuk URL sama tidak membuat crawl lebih cepat. [1] |
| 3 | Di Search Console, pastikan sitemap `https://primedeal-jl8furcm.manus.space/sitemap.xml` sudah berstatus berhasil diproses. | Mempertahankan jalur penemuan untuk seluruh listing. [1] |
| 4 | Bagikan URL canonical listing melalui WhatsApp, media sosial, atau profil bisnis yang relevan; gunakan URL lengkap tanpa variasi domain lain. | Membantu pengguna dan crawler menemukan URL yang sama; tautan internal dan eksternal yang konsisten memperjelas pilihan canonical. [2] |
| 5 | Lengkapi setiap iklan dengan judul spesifik, harga aktual, lokasi jelas, spesifikasi, foto asli, dan deskripsi unik yang informatif. | Meningkatkan kualitas halaman bagi calon pembeli dan kelayakan evaluasi Google, tanpa menjanjikan posisi pencarian. [1] [3] |

## Batasan yang penting

Inspeksi URL aktif hanya menunjukkan bahwa Google dapat mengakses halaman saat diuji; hasil tersebut tidak menjamin halaman akan diindeks. Bahkan status “URL ada di Google” juga berarti halaman **memenuhi syarat** untuk tampil, bukan jaminan posisi atau kemunculan pada setiap pencarian. [3] Karena itu, hindari mengirim permintaan indeks berulang kali pada URL yang sama dan evaluasi ulang laporan halaman setelah Google selesai memproses data.

## Referensi

[1]: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl "Google Search Central — Ask Google to recrawl your URLs"
[2]: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls "Google Search Central — How to specify a canonical URL"
[3]: https://support.google.com/webmasters/answer/9012289?hl=id "Bantuan Google Search Console — Alat Inspeksi URL"
