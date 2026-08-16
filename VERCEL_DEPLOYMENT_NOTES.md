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
