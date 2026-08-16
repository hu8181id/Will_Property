# Catatan Verifikasi Vercel

Tanggal pemeriksaan: 16 Agustus 2026.

Proyek Vercel: https://vercel.com/willproperty/primedeal-property
Domain publik: https://primedeal-property.vercel.app

Environment variables yang terlihat di Vercel untuk Production dan Preview: DATABASE_URL, JWT_SECRET, S3_ENDPOINT, S3_BUCKET, S3_KEY, dan S3_SECRET.

Repository awal proyek Vercel adalah hu8181id/primedeal-property. Setelah konfirmasi pengguna, koneksi Git lama diputus dan proyek disambungkan ke hu8181id/Will_Property.

Deployment terbaru dari commit fcf5248 dengan judul “fix: emit production server bundle at dist index” muncul sebagai Error. Halaman deployment: https://primedeal-property-qxpr0uoi1-willproperty.vercel.app/ dan halaman detail build: https://vercel.com/deployments/primedeal-property-qxpr0uoi1-willproperty.vercel.app?redirect=1.

Deployment lama dari commit 844c075 muncul Ready pada deployment primedeal-property-4netrwvno-willproperty.vercel.app. Deployment lama tersebut belum membuktikan source Will_Property berfungsi pada production setelah koneksi repository diganti.

Smoke test lokal setelah perubahan package.json berhasil untuk HTML, robots.txt, sitemap.xml, dan /api/trpc/property.list dengan HTTP 200. Build lokal menghasilkan dist/index.js dan dist/public.

Temuan utama untuk tindak lanjut: deployment Vercel terbaru masih gagal dan detail build perlu dibuka untuk memperoleh pesan error spesifik; jangan menyimpulkan Vercel sudah pulih sebelum deployment baru berstatus Ready dan endpoint publik mengembalikan JSON 200.


Deployment lanjutan dari commit `a0733da` berjudul “fix: let Vercel detect root Node server” sedang berstatus **Building** sekitar 21 detik pada pemeriksaan terakhir. URL sementara: https://primedeal-property-clxntnbp9-willproperty.vercel.app. Deployment ini menghapus blok `functions.server.ts` dari `vercel.json` dan membuat `server.ts` memanggil `server.listen(...)` sesuai pola Node.js server entrypoint Vercel. Status final dan endpoint publik masih harus diverifikasi.


Verifikasi publik setelah deployment `a0733da` berstatus Ready: frontend berhasil dibuka di https://primedeal-property-clxntnbp9-willproperty.vercel.app/ dan judul SEO tampil, tetapi bagian “Memuat properti...” belum selesai. Endpoint https://primedeal-property-clxntnbp9-willproperty.vercel.app/api/trpc/property.list masih mengembalikan **404 NOT_FOUND**. Artinya deteksi root server menghasilkan deployment Ready, tetapi routing API `/api/trpc` belum diarahkan ke handler yang aktif dan perlu diperbaiki sebelum langkah admin/listing dianggap selesai.
