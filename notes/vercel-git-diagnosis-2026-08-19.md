
## Bukti deployment production

Halaman Deployments Vercel menampilkan deployment Production terbaru dengan commit `ca15dbb` pada branch `main`; deployment sebelumnya juga berada pada commit lama `6d130e9`, `7fd6b12`, dan seterusnya. Ini cocok dengan screenshot pengguna yang masih memuat UI lama tanpa TERJUAL dan Statistik Pengunjung.

Project Vercel tidak otomatis memakai checkpoint Manus `21edbe95`; repository GitHub yang terhubung memiliki riwayat terpisah. Deployment harus diperbarui dari GitHub `main` atau production branch Vercel harus diubah ke sumber yang memuat kode terbaru.

## Sinkronisasi berhasil dimulai

Setelah merge commit `ab14b7e` didorong ke GitHub `main`, halaman Vercel Deployments menampilkan deployment Production baru pada commit `ab14b7e`. Deployment URL `primedeal-property-h3elzfz5q-willproperty.vercel.app` masih berstatus `Deployment is building` saat dibuka, sehingga UI belum dapat diverifikasi sampai build selesai.

## Hasil deployment pertama

Deployment `ab14b7e` sempat berstatus Building lalu berubah menjadi `Deployment has failed` pada URL `https://primedeal-property-h3elzfz5q-willproperty.vercel.app/`. UI production belum dapat diuji. Langkah berikutnya adalah membaca Build Logs Vercel untuk menemukan error build/runtime yang hanya terjadi pada environment Vercel.

## Deployment kedua

Setelah commit `35f9be1` (`fix: exclude test handlers from Vercel functions`) didorong ke GitHub `main`, Vercel membuat deployment Production baru pada URL `https://primedeal-property-faqks2iwr-willproperty.vercel.app`. Saat pemeriksaan terakhir, statusnya `Building`; deployment sebelumnya `ab14b7e` tetap `Error` karena batas fungsi Hobby. Preview baru harus dipantau sampai Ready sebelum diuji.

Pemeriksaan lanjutan pada halaman Deployments menunjukkan deployment `35f9be1` masih `Building` pada 24–39 detik. Belum ada status Ready/Error baru; jangan mengarahkan APK ke preview ini sebelum build selesai.

Deployment `35f9be1` berubah menjadi `Ready` pada Vercel. URL produksi preview `https://primedeal-property-faqks2iwr-willproperty.vercel.app` kini pada `/manage-listings?admin_key=...` langsung menampilkan header **Panel Manajemen Listing**, tombol **Statistik Pengunjung**, dan **Tambah Listing Baru**. Pada snapshot awal, daftar masih menampilkan `Memuat daftar properti...`; perlu menunggu query tRPC selesai sebelum memeriksa tombol status pada kartu.

Setelah deployment Ready, production `/manage-listings` menunjukkan `✓ Akses Aktif` dan tombol `Statistik Pengunjung`, tetapi query listing gagal: `Unexpected token 'A', "A server e"... is not valid JSON`. Artinya autentikasi admin_key dan UI baru sudah aktif, namun endpoint data properti/tRPC production masih mengembalikan error server plaintext. Karena kartu tidak pernah dirender, TERJUAL belum dapat terlihat.

Uji langsung batch tRPC production dengan header `x-admin-key` menghasilkan HTTP `500`, `content-type: text/plain`, body `A server error has occurred / FUNCTION_INVOCATION_FAILED / iad1::l9j54-1787103629056-b1e645cb643d`. Jadi UI terbaru sudah ter-deploy, tetapi function `/api/trpc` crash sebelum mengembalikan data.

Runtime Logs Vercel mengonfirmasi akar masalah: `Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '/var/task/server/routers' is not supported resolving ES modules imported from /var/task/api/trpc/[...path].js`. Semua request `/api/trpc/*` gagal 500 sebelum router berjalan. Perbaikan harus mengubah import handler menjadi file eksplisit, bukan direktori.

## 2026-08-19 device-flow diagnosis
GitHub device-flow codes repeatedly opened an invalid/not-found activation page, so the code route is abandoned. The sandbox browser is already authenticated as `hu8181id` and can open the direct editor URL for `api/trpc/[...path].ts` on branch `main`: https://github.com/hu8181id/Will_Property/edit/main/api/trpc/%5B...path%5D.ts. The current production source still contains `import { appRouter } from "../../server/routers";`; this directory import is the confirmed Node ESM crash cause. The editor exposes a `div[contenteditable="true"]` role textbox and a visible `Commit changes...` button.
