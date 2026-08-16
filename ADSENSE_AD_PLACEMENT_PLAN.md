# Rencana Penempatan Iklan Google AdSense

Status: **Ditunda hingga akun AdSense disetujui**. Tidak ada skrip atau placeholder iklan yang ditampilkan sebelum publisher ID tersedia dan persetujuan diterima.

## Prinsip penempatan

- Iklan tidak boleh berada pada hero, formulir pencarian, tombol WhatsApp, kalkulator KPR, modal detail properti, atau dashboard admin.
- Iklan harus diberi jarak visual yang jelas dari tombol aksi dan tidak boleh dibuat menyerupai hasil pencarian atau listing properti.
- Iklan tidak boleh mendorong pengguna untuk mengeklik atau mengganggu akses ke informasi penting sebuah properti.
- Hanya komponen iklan resmi dari AdSense yang akan dipakai setelah disetujui; tidak ada klik, impresi, atau traffic buatan.

## Lokasi yang direncanakan

| Halaman | Lokasi | Batas awal |
|---|---|---:|
| Beranda | Setelah daftar ringkas properti unggulan dan sebelum footer | 1 unit responsif |
| Listing Properti | Setelah setiap 6 kartu properti pada layar lebar; setelah 4 kartu pada ponsel | Maksimal 1 unit per halaman awal |
| Tentang Kami, Privasi, Ketentuan | Tidak ada iklan | 0 |
| Detail properti, Kalkulator KPR, Kontak, Admin | Tidak ada iklan | 0 |

## Langkah setelah persetujuan

1. Simpan publisher ID AdSense sebagai environment variable aman, bukan di kode sumber.
2. Tambahkan unit iklan responsif hanya pada lokasi yang disetujui di atas.
3. Uji layar ponsel dan desktop untuk memastikan iklan tidak menutup konten atau CTA.
4. Tinjau metrik AdSense dan keluhan pengguna secara berkala; hentikan lokasi yang mengganggu pengalaman pengguna.
