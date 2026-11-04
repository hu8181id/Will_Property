# Project TODO

- [x] Vercel Blob integration and client uploads
- [x] Admin portal photo deletion button ('X')
- [x] Audit toolchain dan artefak APK sebelumnya
- [x] Membangun wrapper Android resmi untuk Publik dan Admin
- [x] Memvalidasi manifest, DEX, alignment, tanda tangan, dan pemasangan
- [x] Mengunggah APK terverifikasi dan menyerahkan tautan unduhan
- [x] Ganti ikon APK Publik dan Admin dengan logo PrimeDeal
- [x] Bangun ulang, verifikasi, dan unggah APK berikon PrimeDeal
- [x] Tambahkan sistem pencatatan unik pengunjung per perangkat per hari di database & tRPC
- [x] Tambahkan widget statistik pengunjung di dashboard admin dan portal admin
- [x] Perkuat sitemap.xml dinamis, robots.txt, dan meta tags SEO Google untuk setiap listing
- [x] Tambahkan endpoint ping/index otomatis untuk Google Search Indexing
- [x] Tulis test unit vitest dan verifikasi deploy produksi
- [x] Perbaiki routing Vercel untuk sitemap.xml, robots.txt, dan endpoint SEO agar tidak dikembalikan sebagai index.html
- [x] Sesuaikan token google-site-verification dengan properti Search Console yang sedang diverifikasi pengguna (primedeal-jl8furcm.manus.space atau primedeal-property.vercel.app)
- [x] Pasang token Search Console FkfI82d30si2TNkZjZab21eMuP4sOCHpuFeK_x9ncP4 khusus untuk properti Vercel
- [x] Pastikan verifikasi Google Search Console menggunakan token FkfI82d30si2TNkZjZab21eMuP4sOCHpuFeK_x9ncP4 yang aktif pada URL Vercel tanpa tercampur domain Manus
- [x] Pasang file verifikasi google3f40a3ef77242afc.html ke folder public proyek dan verifikasi di Search Console
- [x] Pastikan file verifikasi Google tersedia pada deployment Vercel aktif dan URL /google3f40a3ef77242afc.html tidak lagi 404
- [x] Pastikan dashboard Admin menampilkan jumlah pengunjung unik harian terpisah untuk Website dan APK
- [x] Pastikan deduplikasi menggunakan perangkat yang sama satu kali per hari tanpa menyimpan data pribadi berlebihan
- [x] Otomatiskan kesiapan indexing Google untuk listing baru melalui URL publik, metadata, canonical Vercel, dan sitemap Search Console yang dinamis
- [x] Bangun serta verifikasi APK Admin terbaru dengan User-Agent/sumber traffic Admin yang konsisten
- [x] Uji end-to-end analytics Website/APK, sitemap, listing baru, dan dashboard Admin
- [x] Perbaiki APK Admin agar langsung menyediakan akses yang jelas ke dashboard jumlah pengunjung Website dan APK
- [x] Pastikan rute dashboard analytics di APK membawa admin_key dan menampilkan data terpisah secara nyata
- [x] Bangun serta verifikasi APK Admin perbaikan dengan statistik pengunjung terlihat
- [x] Tambahkan tombol Kelola Listing pada dashboard APK Admin yang membuka halaman manage-listings dengan admin_key
- [x] Bangun dan verifikasi APK Admin terbaru setelah tombol Kelola Listing ditambahkan
- [x] Pastikan deployment Vercel yang dibuka APK memuat dashboard versi terbaru dengan tombol Kelola/Tambah Listing
- [x] Perbaiki layout mobile agar tombol Kelola/Tambah Listing selalu terlihat dan dapat dibuka
- [x] Uji APK Admin pada layar mobile dan verifikasi navigasi ke halaman manage-listings dengan admin_key
- [x] Uji dashboard admin pada viewport mobile dan simpan bukti tombol Tambah / Kelola Listing terlihat tanpa scroll horizontal
- [x] Buka APK Admin terbaru setelah perbaikan dan verifikasi WebView memuat dashboard Vercel serta navigasi manage-listings dengan admin_key
- [x] Perbaiki endpoint live /sitemap.xml yang saat ini terbaca sebagai HTML oleh Google Search Console
- [x] Pastikan deployment Vercel mengirim Content-Type XML dan URL listing publik yang valid
- [x] Uji ulang sitemap live lalu kirim ulang di Google Search Console
- [x] Buka APK Admin terbaru di perangkat Android, ambil screenshot yang memperlihatkan dashboard Vercel dan tombol Tambah / Kelola Listing di dalam WebView
- [x] Verifikasi dari APK bahwa tombol membuka /manage-listings dengan admin_key yang benar, lalu simpan bukti hasilnya di catatan verifikasi atau screenshot
- [x] Otomatiskan kesiapan indexing setiap listing baru masuk ke sitemap dan antrean notifikasi Google
- [x] Tambahkan tabel antrean indexing per listing tanpa mengubah data listing yang ada
- [x] Buat enqueue otomatis saat listing baru dibuat atau diperbarui
- [x] Pastikan sitemap Vercel dan Express selalu mencantumkan semua listing aktif dengan URL kanonis dan lastmod akurat
- [x] Tambahkan endpoint/prosedur Admin untuk melihat status kesiapan sitemap dan antrean indexing
- [x] Tampilkan status indexing di panel Admin tanpa menyatakan Google sudah mengindeks
- [x] Tambahkan pengujian Vitest untuk enqueue, sitemap, dan status indexing
- [x] Jalankan build dan test sebelum checkpoint
- [x] Tambahkan skema tabel lead kontak dan status pengiriman notifikasi WhatsApp agent
- [x] Implementasikan prosedur tRPC untuk mencatat lead dan mengirim notifikasi WhatsApp server-side
- [x] Tambahkan konfigurasi provider WhatsApp dengan secret server-side dan fallback link wa.me
- [x] Buat pengujian Vitest untuk alur tRPC lead dan jalur sukses/gagal pengiriman notifikasi
- [x] Jalankan test dan build awal fitur WhatsApp client-side
- [x] Simpan checkpoint final setelah provider WhatsApp dan pengujian lengkap selesai
- [x] Tambahkan kolom status pengiriman dan error log notifikasi WhatsApp ke tabel property_leads
- [x] Implementasikan modul pengiriman server-side Meta WhatsApp Cloud API dengan fallback aman
- [x] Tambahkan secret handling untuk WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, dan AGENT_WHATSAPP_TO
- [x] Buat unit test Vitest untuk jalur sukses dan gagal pengiriman Meta WhatsApp Cloud API
- [x] Jalankan build dan simpan checkpoint final integrasi WhatsApp Cloud API
- [x] Perbaiki tombol Hubungi di APK yang membuka whatsapp:// dan menyebabkan ERR_UNKNOWN_URL_SCHEME; gunakan URL HTTPS wa.me yang kompatibel dengan WebView dan rilis ulang APK Publik.
- [x] Perbaiki tombol Laporan AdMob di APK Admin agar membuka dashboard AdMob melalui browser eksternal, bukan WebView putih.
- [x] Tambahkan verifikasi teruji untuk klik Buka Laporan AdMob dari dashboard APK Admin.
- [x] Buat unit test robolectric/mock WebView yang menguji pemanggilan Intent external pada onCreateWindow dan shouldOverrideUrlLoading untuk link AdMob.
- [x] Tambahkan test runtime WebView/instrumentasi yang membuktikan klik link AdMob dialihkan ke browser eksternal.
- [x] Dokumentasikan hasil rebuild dan verifikasi runtime APK Admin setelah test klik AdMob lulus.
- [x] Perkuat handler WebView APK Admin untuk alur target=_blank/new-window AdMob lalu rebuild dan verifikasi ulang APK.

- [x] Perbaiki URL AdMob di dashboard admin agar mengarahkan ke https://apps.admob.com atau konsol langsung yang stabil di browser seluler, serta pastikan pesan instruksi login tersedia jika sesi Google kosong.


- [x] Ganti URL dashboard AdMob dari https://admob.google.com/home/#/apps ke https://apps.admob.com/v2/home atau https://myaccount.google.com untuk memastikan halaman terbuka sempurna di perangkat seluler.


- [x] Pastikan klik tombol Laporan AdMob di APK Admin memicu Intent ACTION_VIEW eksternal secara langsung (tanpa melalui WebView sama sekali) agar terbuka penuh di Chrome Android.


- [x] Pastikan MainActivity di APK Admin mencegat url admob/accounts.grade dengan forceExternalIntent sehingga sama sekali tidak pernah membuka WebView kosong.

- [ ] Siapkan jalur pemulihan APK Admin tanpa pop-up update 404 dan verifikasi pemasangan manual


- [x] Tambahkan normalisasi URL di MainActivity APK Admin sehingga jika URL mengandung admob.google.com atau apps.admob.com, otomatis diganti ke https://apps.admob.com/v2/home sebelum dilempar via Intent ACTION_VIEW.


- [x] Tambahkan kolom status 'status' ('available' / 'sold') pada tabel properties di database.
- [x] Perbarui tRPC router properti agar mendukung pembaruan status terjual oleh admin.
- [x] Tambahkan tombol 'Tandai Terjual' / 'Tersedia' di halaman Kelola Listing admin serta tampilkan badge 'TERJUAL' di halaman publik.
- [x] Rilis APK Admin versi terbaru yang mendukung tombol status Terjual.

- [x] Bangun, tandatangani, dan rilis APK Admin versi terbaru dengan dukungan tombol status Terjual.
- [x] Perbaiki APK Admin PrimeDeal yang gagal dipasang di perangkat Android; hasilkan APK rilis yang tervalidasi dan dapat diunduh.
- [ ] Uji instal APK Admin v1.4.11 hasil rebuild pada perangkat Android atau emulator.
- [ ] Simpan bukti verifikasi akhir bahwa APK dapat dipasang dan membuka dashboard admin.
- [ ] Uji instal APK Admin v1.4.13 pada perangkat Android pengguna dan konfirmasi tombol TERJUAL dapat ditekan.
- [ ] Pastikan deployment Vercel yang dipakai APK memuat kontrol TERJUAL dan tombol Statistik Pengunjung, bukan UI lama.
- [ ] Kurangi jumlah file Serverless Functions Vercel menjadi maksimal 12 tanpa menghapus pengujian.
- [ ] Perbaiki error strict TypeScript pada helper upload Blob/video yang memblokir deployment Vercel.
- [ ] Ganti impor direktori server/routers pada handler Vercel menjadi impor file eksplisit agar /api/trpc tidak crash.
- [ ] Ulangi otorisasi GitHub dengan kode perangkat baru setelah kode sebelumnya ditolak.
- [ ] Lanjutkan otorisasi dan commit patch handler tRPC setelah pengguna mengonfirmasi perubahan.
- [ ] Buat dan gunakan kode device GitHub baru yang valid setelah kode sebelumnya gagal.
- [ ] Hentikan device flow yang tidak valid dan gunakan jalur autentikasi repository alternatif tanpa kode berulang.
- [ ] Tambahkan akses TERJUAL dan Statistik Pengunjung yang tetap terlihat pada layar HP tanpa bergantung pada posisi scroll atau dialog.
- [x] Pastikan tombol/status TERJUAL terlihat dan dapat digunakan pada halaman Kelola Listing di APK Admin.
- [x] Tampilkan kontrol TERJUAL secara jelas pada kartu listing dan/atau formulir edit tanpa mengganggu tombol Simpan.
- [x] Pastikan menu statistik pengunjung Website dan APK tetap terlihat serta dapat dibuka dari APK Admin.
- [x] Bersihkan pemanggil tRPC stale pada Listing.tsx agar pemeriksaan TypeScript proyek kembali bersih.
- [x] Selaraskan atau nonaktifkan prosedur review lama di AdminReviews.tsx agar pemeriksaan TypeScript proyek kembali bersih.


- [x] Verifikasi deployment Vercel terbaru dan endpoint /api/trpc/property.list mengembalikan JSON valid
- [ ] Verifikasi produksi menampilkan kontrol TERJUAL dan Statistik Pengunjung pada admin serta badge TERJUAL pada halaman publik
- [ ] Jalankan test/build final dan dokumentasikan hasil uji APK Admin v1.4.13 terhadap deployment Vercel
- [ ] Implementasikan tombol status TERJUAL pada APK Admin / manajemen listing
- [ ] Tampilkan statistik pengunjung Website dan APK di dashboard APK Admin
- [ ] Perbaiki alur instalasi APK agar tidak mengalami error "Aplikasi tidak terinstal"
- [ ] Sinkronkan source GitHub dengan Vercel dan matikan pop-up update yang memicu 404
- [ ] Nonaktifkan pop-up update yang memicu 404 pada APK terpasang

- [x] Push rilis distribusi APK Admin ke GitHub setelah konektor memiliki izin tulis
- [x] Unggah APK Admin tervalidasi ke Vercel Blob yang sudah terhubung dan aktifkan manifest khusus Admin
- [ ] Verifikasi tautan unduhan Vercel, manifest Android Admin, serta pemasangan manual APK
- [x] Konsolidasikan endpoint serverless Vercel hingga maksimal 12 fungsi dan deploy ulang rilis APK
- [x] Validasi APK Admin 1.4.14 dari Vercel Blob: checksum, MIME, package, versionCode 23, dan sertifikat sama dengan APK Admin 1.4.0
- [ ] Konfirmasi pemasangan APK Admin 1.4.14 pada perangkat Android pengguna dan uji dashboard, Statistik Pengunjung, serta TERJUAL
- [x] Diagnosa respons Vercel non-JSON pada pemuatan daftar properti di APK Admin
- [x] Perbaiki endpoint listing/API produksi lalu verifikasi WebView APK menerima JSON valid
- [ ] Uji ulang APK Admin setelah deploy fix tRPC dan simpan bukti bahwa halaman listing di WebView berhasil dimuat tanpa error non-JSON
- [ ] Verifikasi pada perangkat Android bahwa APK Admin menampilkan daftar properti, Statistik Pengunjung, dan kontrol TERJUAL setelah perbaikan endpoint produksi
- [x] Selaraskan manifest pembaruan APK Admin antara rute /apk/latest.json dan endpoint Vercel yang dipakai aplikasi
- [x] Uji /apk/latest.json dengan User-Agent APK Admin dan verifikasi manifest Blob v1.4.14 aktif
- [ ] Rekonsiliasi source manifest legacy pada proyek Manus dengan repository GitHub yang menjadi sumber deployment Vercel
- [x] Inventarisasi APK Publik bertanda tangan kompatibel lalu unggah ke Vercel Blob
- [x] Verifikasi URL APK Publik Vercel mengirim MIME Android package dan dapat diunduh

- [x] Buat ikon aplikasi PrimeDeal ringkas dari simbol gedung emas tanpa teks dan nomor WhatsApp
- [x] Integrasikan ikon PrimeDeal ke APK Admin v1.4.15 dengan sertifikat pembaruan yang kompatibel
- [ ] Integrasikan ikon PrimeDeal ke paket APK Publik pada rilis yang sertifikat pembaruannya kompatibel

- [x] Buat tiga screenshot promosi Android yang menunjukkan ikon PrimeDeal ringkas
- [ ] Kirim tiga screenshot PrimeDeal kepada pengguna untuk dipilih atau digunakan
- [x] Verifikasi tiga screenshot PrimeDeal selesai tergenerate tanpa gagal dan tinjau tampilan ikon kecilnya
- [x] Evaluasi kebutuhan pembuatan ulang screenshot setelah dokumentasi visual lengkap
- [x] Dokumentasikan inspeksi visual tiga screenshot dan keterbacaan ikon PrimeDeal kecil pada setiap variasi
- [x] Regenerasi screenshot bila ikon PrimeDeal kecil tidak terlihat jelas pada salah satu variasi

- [ ] Buat feature image landscape PrimeDeal untuk banner promosi aplikasi
- [ ] Kirimkan feature image PrimeDeal kepada pengguna

- [x] Buat feature image PrimeDeal JPG berukuran 1024 × 500 piksel untuk Google Play Store
- [x] Verifikasi ukuran dan format feature image Play Store sebelum pengiriman

- [x] Buat ulang feature image PrimeDeal dengan tulisan besar dan jelas untuk tampilan kecil
- [x] Kirimkan feature image PrimeDeal versi tulisan besar kepada pengguna

- [x] Periksa status indeks Google, robots.txt, sitemap, dan akses crawler pada domain Vercel PrimeDeal
- [x] Sampaikan penyebab halaman belum tampil pada hasil pencarian awal beserta langkah aman berikutnya

- [x] Susun prioritas SEO PrimeDeal untuk meningkatkan peluang peringkat Google
- [x] Sampaikan rencana tindakan SEO bertahap yang dapat dijalankan pengguna

- [x] Ubah ikon PrimeDeal yang diberikan pengguna menjadi PNG 512 × 512 piksel
- [ ] Kirimkan file ikon PrimeDeal 512 × 512 piksel kepada pengguna
- [ ] Perbaiki dialog “Pembaruan PrimeDeal tersedia” agar menghormati manifest `updateAvailable: false`, validasi build, dan deploy ke Vercel
