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

44. Commit `6ab2d62` (`fix: expose tRPC through Vercel web handlers`) sudah dipush ke `Will_Property/main`. Deployment Production baru muncul pada URL `https://primedeal-property-gt8701d65-willproperty.vercel.app` dan masih berstatus **Building** sekitar 26 detik pada pemeriksaan terakhir. Endpoint belum diuji sampai status Ready.

45. Deployment `6ab2d62` berstatus **Ready** pada `https://primedeal-property-gt8701d65-willproperty.vercel.app`, tetapi uji `https://primedeal-property-gt8701d65-willproperty.vercel.app/api/trpc/property.list` menghasilkan **500 FUNCTION_INVOCATION_FAILED**. Vercel menampilkan request ID `iad1::n5jc4-1786873035505-c682be742c6c`; fungsi sudah terdeteksi dan dipanggil, tetapi crash saat runtime. Diagnosis berikutnya perlu membaca Deploy Logs untuk stack trace, terutama context fetch, import ESM, atau koneksi database.

44. Perbaikan struktur Web Handlers tRPC di `api/trpc.ts` dan `api/trpc/[...path].ts` beserta `createFetchContext` berhasil menyelesaikan masalah routing 404 pada Vercel. Pengujian lokal vitest untuk `server/vercel.trpc.test.ts` kini sukses (status 200 dan mengembalikan JSON valid). Saat ini status di Vercel sedang transisi menuju perbaikan `FUNCTION_INVOCATION_FAILED` (error 500) dengan memastikan variabel lingkungan dan penanganan request/cookie kompatibel dengan runtime serverless Vercel.

## 2026-08-16 — Deployment `371319e`

Domain produksi `https://primedeal-property.vercel.app` masih menunjuk ke deployment Ready berbasis commit `6ab2d62` dan menampilkan bundle server sebagai JavaScript mentah. Commit GitHub `371319e` berisi `outputDirectory: dist/public` telah berhasil didorong ke branch `main`; dashboard Vercel menunjukkan deployment baru berstatus `Building`, sehingga domain produksi belum berpindah ke hasil perbaikan saat pemeriksaan terakhir.

Repository GitHub `hu8181id/Will_Property` memiliki riwayat terpisah dari worktree Manus. Perubahan diterapkan pada worktree yang berasal dari `github/main` agar tidak menimpa commit remote yang lebih baru.

Langkah berikutnya: tunggu deployment `371319e` selesai, buka URL deployment preview, lalu verifikasi `Content-Type: text/html`, root page, dan API sebelum memastikan domain produksi sudah berubah.

Pemeriksaan daftar deployment Vercel berikutnya menunjukkan commit `371319e` sudah tercatat sebagai deployment **Production** dengan URL `https://primedeal-property-q8y4fifml-willproperty.vercel.app` sekitar 1 menit setelah push. Status detail Ready/Error perlu diverifikasi pada halaman deployment tersebut sebelum menguji alias domain utama.

Stack trace log Vercel mengonfirmasi penyebab 500: `Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '/var/task/server/routers' is not supported resolving ES modules imported from /var/task/api/trpc/[...path].js`. Perbaikan diterapkan pada worktree GitHub main dengan mengubah import di `api/trpc.ts` dan `api/trpc/[...path].ts` menjadi `../server/routers.ts` dan `../../server/routers.ts`, lalu commit `bd5e1d3` didorong ke branch main. Smoke test setelah 35 detik masih melihat respons 500, sedangkan halaman root sudah HTML; log dashboard perlu di-refresh untuk memastikan apakah respons tersebut berasal dari deployment lama atau build `bd5e1d3`.

Setelah refresh log, Vercel menampilkan dua error 10:07:36: preview `q8y4fifml` masih memakai `ERR_UNSUPPORTED_DIR_IMPORT`, sedangkan alias production memakai `ERR_MODULE_NOT_FOUND` untuk `/var/task/server/routers.ts`; keduanya berasal dari deployment sebelum bundle `7d46e6d`. Belum terlihat entri log untuk request setelah deployment bundle, sehingga perlu memeriksa daftar deployment dan URL deployment `7d46e6d` secara langsung.

Daftar deployment Vercel menunjukkan commit `7d46e6d` berstatus **Production** dengan URL `https://primedeal-property-ljko432rj-willproperty.vercel.app`. Root URL tersebut berhasil merender halaman Primedeal dengan `Content-Type: text/html`, sehingga frontend sudah benar. Saat ini API perlu diuji langsung pada URL deployment baru tersebut; alias `primedeal-property.vercel.app` masih dapat membutuhkan propagasi alias atau deployment baru untuk mengambil fungsi terbaru.

Stack trace terbaru pada deployment `bc1a249` menunjukkan bundle `dist/vercel-trpc.js` sudah berhasil dimuat, tetapi adapter baru gagal di normalisasi request: `TypeError: request.headers.get is not a function at normalizeTrpcRequest`. Vercel mengirim objek request Node-style dengan `headers` sebagai object biasa, bukan Fetch `Headers`. Error `ERR_INVALID_URL` pada deployment `7d46e6d` juga telah digantikan oleh error ini pada alias production, sehingga perbaikan berikutnya harus mengonversi header Node-style ke `Headers` sebelum membuat Fetch `Request`.

Log deployment `c030ad0` menunjukkan warning penting pada request 10:16:31: `default export returned a Response` dan Vercel mengabaikan return value karena signature fungsi saat ini dibaca sebagai Node API `(req, res) => void`. Ini menjelaskan smoke test yang menggantung setelah error header diperbaiki. Solusi berikutnya: ubah kedua default export `api/trpc.ts` dan `api/trpc/[...path].ts` menjadi async Node handlers dua-argumen, jalankan `handleTrpcRequest`, lalu salin status, header, dan body Response ke `res` menggunakan `res.end()`.

## 2026-08-16 — Perbaikan database Vercel

Log production menunjukkan query mencari tabel pada database `sys`, sedangkan tabel Primedeal berada pada database TiDB `JL8fURcMYJD322Xe42KmzM`. Environment variable `DATABASE_URL` pada Vercel Production dan Preview telah diperbarui untuk menunjuk ke database tersebut, dengan endpoint, kredensial, dan SSL tetap sama. Vercel mengonfirmasi pembaruan berhasil dan deployment redeploy telah dibuat. Deployment detail: https://vercel.com/willproperty/primedeal-property/FB8qbfbuEm3MTC28bZQ9DBBPG5wP. Alias produksi perlu diuji setelah deployment berstatus Ready.

## 2026-08-16 — Perbaikan 404 Listing pada deployment 5aeb7e7

Deployment `https://primedeal-property-99oz442cq-willproperty.vercel.app/listing` berhasil memuat halaman Listing Primedeal, bukan 404. Setelah data selesai dimuat, 11 listing dari TiDB tampil. Detail listing pertama berhasil dibuka pada route slug `https://primedeal-property-99oz442cq-willproperty.vercel.app/properti/gunawangsa-manyar-2br-furnished-dekat-unair-its-merr-360001`, lengkap dengan deskripsi, harga, spesifikasi, media virtual tour/video, dan tombol berbagi. Alias produksi `https://primedeal-property.vercel.app` masih perlu diuji setelah propagasi deployment.

## Verifikasi alias produksi — route Listing pulih

Alias produksi `https://primedeal-property.vercel.app/listing` sekarang menampilkan 11 listing dari database TiDB. Tombol detail listing pertama berhasil membuka `https://primedeal-property.vercel.app/properti/gunawangsa-manyar-2br-furnished-dekat-unair-its-merr-360001` tanpa 404; modal detail menampilkan judul, lokasi, harga, spesifikasi, deskripsi, dan media video/virtual tour. Root domain dan route Listing publik sudah terverifikasi.
