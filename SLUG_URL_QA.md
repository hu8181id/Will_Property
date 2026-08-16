# Verifikasi URL Slug Listing

Tanggal verifikasi: 15 Agustus 2026.

## Rute yang diuji

| URL | Hasil |
|---|---|
| `/properti/gunawangsa-manyar-2br-furnished-dekat-unair-its-merr-360001` | Membuka detail listing Gunawangsa Manyar 2BR dengan konten, galeri, dan CTA yang benar. |
| `/listing?property=360001` | Tetap membuka detail listing yang sama untuk menjaga tautan lama yang telah dibagikan dan diindeks. |

## Perangkat dan regresi SEO

- **Desktop 1280 × 720:** kedua URL menampilkan detail listing yang sama tanpa error.
- **Ponsel 375 × 812:** URL slug dan URL lama sudah diverifikasi sebelumnya dan tetap responsif.
- **Sitemap:** URL aktif diterbitkan sebagai `/properti/[slug]`.
- **Canonical dan JSON-LD:** diuji agar memakai URL slug yang sama.
- **Validasi teknis:** pemeriksaan TypeScript dan 70 test Vitest lulus.

Canonical tidak menjanjikan posisi pencarian, tetapi memberi Google URL utama yang konsisten ketika halaman lama dan baru memuat listing yang sama.
