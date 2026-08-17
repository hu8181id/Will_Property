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


- [ ] Pastikan klik tombol Laporan AdMob di APK Admin memicu Intent ACTION_VIEW eksternal secara langsung (tanpa melalui WebView sama sekali) agar terbuka penuh di Chrome Android.

- [x] Pastikan MainActivity di APK Admin mencegat url admob/accounts.grade dengan forceExternalIntent sehingga sama sekali tidak pernah membuka WebView kosong.

