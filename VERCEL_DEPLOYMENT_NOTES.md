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

Deployment terbaru dari commit `b405a30` terdeteksi Vercel pada URL sementara https://primedeal-property-33z7uhmlu-willproperty.vercel.app/ dan masih berstatus Building sekitar 20 detik saat pemeriksaan terakhir.

Deployment `b405a30` berhasil berstatus Ready di URL https://primedeal-property-33z7uhmlu-willproperty.vercel.app/, tetapi pengujian https://primedeal-property-33z7uhmlu-willproperty.vercel.app/api/trpc/property.list masih mengembalikan **404 NOT_FOUND**. Konfigurasi default dengan `api/[...path].ts` belum membuat fungsi API aktif; diagnosis perlu dilanjutkan pada struktur repository/build Vercel.

Pemeriksaan Vercel Settings (sumber: https://vercel.com/willproperty/primedeal-property/settings/build-and-deployment): Root Directory tampil `./` dengan Include files outside root enabled. Production Overrides untuk deployment `primedeal-property-33z7uhmlu-willproperty.vercel.app` menampilkan Build Command `pnpm build` dan Output Directory `dist/public`. Tidak terlihat Root Directory `client`; fungsi API 404 bukan disebabkan project root yang salah.

Temuan konfigurasi (sumber: https://vercel.com/willproperty/primedeal-property/settings/build-and-deployment): Production Overrides memakai Framework/flow Vite, Build Command `pnpm build`, dan Output Directory `dist/public`; Project Settings juga memakai Framework Preset Vite. Dokumentasi resmi Vercel (https://vercel.com/docs/functions/runtimes/node-js) menyatakan server root dideteksi dari `server.{js,ts,...}` dan harus memanggil `server.listen()` saat module startup. Dokumentasi fungsi API (https://vercel.com/docs/functions/functions-api-reference) menyatakan file di `/api` otomatis menjadi Function jika memakai signature Web Handler/`fetch` atau export HTTP method. Karena API dan root server sama-sama 404 pada deployment, konfigurasi Vite/static override perlu dihilangkan atau diganti ke preset Other sebelum uji ulang.

34. Redeploy Production setelah Framework Preset diubah ke Other dibuat pada https://vercel.com/willproperty/primedeal-property/F68jWx6bc5dCY9ghb5BngcZC3AfP. Sumber tetap commit b405a30 dari Will_Property. URL sementara: https://primedeal-property-hk5vtz23h-willproperty.vercel.app. Status terakhir saat pemeriksaan: Building; instalasi dependensi pnpm masih berjalan sekitar 17 detik. Endpoint API belum diuji pada deployment ini karena build belum selesai.

35. Redeploy F68jWx6bc berstatus **Ready** setelah 46 detik pada https://vercel.com/willproperty/primedeal-property/F68jWx6bc. URL deployment: https://primedeal-property-hk5vtz23h-willproperty.vercel.app dan domain Production tetap https://primedeal-property.vercel.app. Source: Will_Property/main, commit b405a30. Frontend preview berhasil dirender; endpoint API masih perlu diuji pada deployment baru.

36. Audit Build and Deployment menunjukkan **Production Override** deployment F68 masih membaca Build Command `pnpm build` dan Output Directory `dist/public` (field read-only). Project Settings aktif memakai Framework `Other`; Build Command dan Output Directory override berada pada posisi nonaktif dengan nilai default Vercel. Perlu membuat deployment baru setelah Project Settings tersimpan agar override lama tidak dipakai.

37. Saat memilih menu Deployment Actions, aksi koordinat terakhir membuka deployment URL lama `primedeal-property-33z7uhmlu-willproperty.vercel.app` (b405a30), bukan halaman konfirmasi Redeploy. Status redeploy memakai Project Settings belum terkonfirmasi; daftar deployment harus diperiksa ulang.

38. Menu Redeploy berhasil dibuka dan dialog menampilkan opsi pembuatan deployment baru memakai Project Settings terbaru. Tombol `Cancel` dan `Redeploy` terdeteksi di bagian bawah dialog, sedikit di luar viewport saat inspeksi.

39. Deployment Redeploy baru `FCdJMhDDLq4PeAyqthZUgui7zZjm` berstatus **Ready** pada environment **Preview**, dibuat dari branch `main` commit `b405a30` (`Route Vercel API through catch-all function`). URL preview: `https://primedeal-property-6vdjd18hr-willproperty.vercel.app`; alias branch: `https://primedeal-property-git-main-willproperty.vercel.app`. Deployment selesai dalam 51 detik. URL production utama belum otomatis berpindah karena redeploy ini Preview.

40. Commit `909e688` terdeteksi Vercel dan deployment Production baru `7j7j4Me1G5gn7nGgfFiqeRpJmrHh` berstatus **Ready**. URL deployment: `https://primedeal-property-nl1y5f2k0-willproperty.vercel.app`. Commit tersebut hanya menghapus `outputDirectory: dist/public` dari vercel.json.

41. Dokumentasi resmi Vercel `https://vercel.com/docs/functions/runtimes/node-js` menyebut server entrypoint root (`server.ts`) harus memanggil `server.listen()` saat startup agar ditangkap Vercel; fungsi individual di `/api` mengikuti format Web Handler `Request`/`Response` atau export method GET/POST. Dokumentasi `https://vercel.com/docs/functions/functions-api-reference` menyebut semua file di `/api` untuk framework Other dideploy sebagai function, tetapi contoh resmi memakai `api/hello.ts` dengan Web Handler.
42. Deployment Production `7j7j4Me1G5gn7nGgfFiqeRpJmrHh` dari commit `909e688` berstatus Ready, framework `Other`, domain `primedeal-property.vercel.app`, tetapi `https://primedeal-property-nl1y5f2k0-willproperty.vercel.app/api/trpc/property.list` masih HTTP 404 NOT_FOUND. Detail deployment: `https://vercel.com/willproperty/primedeal-property/7j7j4Me1G5gn7nGgfFiqeRpJmrHh`.
43. Hipotesis kerja: handler Express di `api/[...path].ts` diekspor sebagai default Express app mungkin tidak mengikuti Web Handler resmi pada framework Other; perlu handler `/api/index.ts` atau `api/trpc/[...path].ts` yang beradaptasi ke Request/Response, atau gunakan root server capture yang benar-benar terdeteksi.
