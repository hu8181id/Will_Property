# Verifikasi Ponsel — Template SEO Gratis

**Tanggal verifikasi:** 15 Agustus 2026  
**Viewport:** 375 × 812 px  
**Halaman uji:** `/listing?newListing=1`

## Hasil

Form **Tambah Properti Baru** dapat dibuka pada viewport ponsel melalui parameter `newListing=1` hanya setelah pengguna dikenali sebagai admin. Pengunjung publik tidak menerima kontrol tambah listing, sehingga shortcut ini tidak membuka akses pengelolaan listing tanpa otorisasi.

Form memakai area gulir internal yang menjaga modal tetap berada di layar ponsel. Panel **Template SEO Gratis** ditempatkan setelah data inti properti—judul, lokasi, harga, tipe, dan transaksi—agar admin dapat mengisi konteks minimum sebelum membuat saran. Panel tersebut menggunakan susunan vertikal pada ponsel sehingga deskripsi dan tombol tetap dapat dijangkau tanpa tumpang tindih.

## Perilaku yang Diverifikasi

| Pemeriksaan | Hasil |
|---|---|
| Dialog tambah listing terbuka pada 375 px | Lulus |
| Kontrol template SEO tersedia pada form admin | Lulus |
| Tombol menerapkan judul dan deskripsi hasil template | Lulus melalui test UI |
| Admin dapat mengedit kembali judul hasil template | Lulus melalui test UI |
| Tipe TypeScript dan seluruh test | Lulus: 64 test |
| Build produksi | Lulus |

> Parameter `newListing=1` hanya dipakai sebagai shortcut admin untuk membuka form. Otorisasi tambah, edit, dan hapus listing tetap ditegakkan oleh antarmuka serta prosedur backend admin.
