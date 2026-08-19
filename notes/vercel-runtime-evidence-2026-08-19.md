# Bukti runtime Vercel — 2026-08-19

## Endpoint yang diuji
- URL: https://primedeal-property.vercel.app/api/trpc/property.list
- Deployment Production di dashboard Vercel: status Ready, commit b86d2a3, deployment URL https://primedeal-property-hkmzdiaqf-willproperty.vercel.app
- Hasil endpoint: HTTP 500 FUNCTION_INVOCATION_FAILED.
- Request ID: iad1::dwggd-1787106369241-391e5efc5935

## Log runtime Vercel
- Waktu log: Aug 19 02:26:09.24
- Request: GET /api/trpc/property.list
- Error: Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/routers.ts' imported from /var/task/api/trpc/[...path].js
- Artinya deployment b86d2a3 sudah Ready tetapi handler catch-all masih mengimpor `../../server/routers.ts`, sedangkan runtime Vercel tidak menyediakan file TypeScript mentah tersebut.

## Perbaikan yang sudah dikirim
- Commit GitHub `124a58f` pada branch `main` mengubah impor di `api/trpc.ts` menjadi `../server/routers.js`.
- Handler catch-all `api/trpc/[...path].ts` masih terbuka di editor GitHub dan masih berisi `../../server/routers.ts`; perlu diubah menjadi `../../server/routers.js`, kemudian commit ke `main`.
- Worktree lokal juga sudah diselaraskan pada `api/trpc.ts`, `api/trpc/[...path].ts`, dan `server/vercel-trpc.ts` dengan impor runtime `.js`, tetapi perubahan lokal belum di-checkpoint.

## Catatan akses GitHub
- `gh api` dapat membaca repository tetapi PUT mengembalikan HTTP 403 `Resource not accessible by integration`; commit dilakukan melalui editor web GitHub yang sudah login.

## Log terbaru setelah commit context.js (02:37–02:38 GMT)
Sumber: https://vercel.com/willproperty/primedeal-property/logs
Request: GET https://primedeal-property.vercel.app/api/trpc/property.list
Hasil: HTTP 500 dengan header `x-vercel-error: FUNCTION_INVOCATION_FAILED`.
Pesan runtime aktual: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/shared/const' imported from /var/task/server/routers.js`.
Kesimpulan: import handler `routers.js` dan `context.js` sudah berhasil dilewati; dependency berikutnya yang harus diperbaiki adalah import runtime `../shared/const` pada server/routers.ts dan kemungkinan import runtime lain yang masih tanpa ekstensi. Log lama `/var/task/server/routers.ts` berasal dari deployment sebelumnya.

## Bukti deployment e414199 (19 Agustus 2026)

Sumber detail deployment: https://vercel.com/willproperty/primedeal-property/BwfjMFm5SyUb4VbhGe7Sh3kEEFJT

Deployment e414199 berstatus **Build Failed** dengan `Command "pnpm build" exited with 1`. Deploy Logs menunjukkan perintah yang gagal adalah `esbuild server.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js`, dengan exit status 1. Potongan log yang dapat diekstrak hanya menampilkan wrapper `child_process` dan `ELIFECYCLE`, belum pesan diagnostik esbuild yang sebenarnya. Host deployment `primedeal-property-6l4a9s0ao-willproperty.vercel.app` juga menampilkan halaman deployment error, sehingga belum dapat dipakai untuk uji tRPC.

Sumber remote saat ini sudah memakai `../shared/const.js` di `server/routers.ts`; `server/_core/trpc.ts` masih memiliki type import `./context` tanpa ekstensi. Audit remote juga menemukan banyak import relatif extensionless pada graph server. Karena build production sekarang gagal sebelum fungsi dibuat, perbaikan berikutnya harus terlebih dahulu membuat `pnpm build` lulus di lingkungan Vercel, baru menguji endpoint tRPC.

## Log runtime terbaru setelah pemulihan context.ts (03:04 GMT+7)
- Endpoint: GET /api/trpc/property.list
- Hasil: HTTP 500 FUNCTION_INVOCATION_FAILED.
- Error aktual: `[ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/shared/const' imported from /var/task/server/routers.js`.
- Kesimpulan: Vercel sudah melewati import handler, context, dan routers; masih ada import `shared/const` tanpa ekstensi pada graph runtime yang aktif. Perbaikan harus menormalkan graph server secara menyeluruh dan memastikan deployment berikutnya mengambil commit terbaru.

## Status deployment setelah pemulihan router/context
Halaman Deployments Vercel menunjukkan commit `e369da4` (pemulihan server/routers.ts) berstatus Build Failed, dan commit `1e83bfd` (pemulihan server/_core/context.ts) juga berstatus Error. Detail e369 menunjukkan `pnpm build` memanggil esbuild `server.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js` lalu exit code 1. Endpoint production tetap 500 sampai deployment Ready baru tersedia.

## Konfigurasi Vercel remote yang diverifikasi
Sumber: https://github.com/hu8181id/Will_Property/blob/main/vercel.json (19 Agustus 2026). `vercel.json` memakai `buildCommand: pnpm build`, `outputDirectory: dist/public`, rewrite `/trpc/:path*` ke `/api/trpc/:path*`, serta rewrite sitemap/robots/APK/media. Jadi error build deployment e369 bukan akibat buildCommand Vercel yang berbeda dari package.json; build lokal dengan script remote yang sama berhasil.

## Audit cache-busted remote setelah commit context.ts

- `server/routers.ts` remote berukuran 2268 byte dan 61 baris; impor `../shared/const.js` sudah benar.
- `server/_core/context.ts` remote berukuran 4562 byte dan 147 baris; file lengkap, berakhir pada `return { req, res, user };` dan kurung penutup fungsi.
- `api/trpc/[...path].ts` remote memakai `../../server/routers.js` dan `../../server/_core/context.js`.
- `api/trpc.ts` remote masih memakai `../server/_core/context` tanpa ekstensi `.js`.
- HEAD branch `main` yang terdeteksi: `6d556003b66effbb0f7f7bdb3f6ca1f9ce44d1ae`.
- Log 03:20 Vercel masih menunjukkan `/var/task/shared/const` tanpa ekstensi; source remote terbaru sudah memakai `.js`, sehingga request tersebut kemungkinan masih berasal dari bundle deployment lama atau build yang belum ter-propagasi.

## Setelah patch root api/trpc.ts

Cache-busted raw GitHub mengonfirmasi `api/trpc.ts` remote kini memakai `../server/_core/context.js`; `server/routers.ts`, `context.ts`, dan catch-all juga sudah memakai ekstensi runtime `.js` sesuai audit sebelumnya. Probe `GET https://primedeal-property.vercel.app/api/trpc/property.list?input=%7B%7D` pada delapan percobaan berturut-turut setelah commit tetap mengembalikan HTTP 500 dengan `x-vercel-error: FUNCTION_INVOCATION_FAILED`. Request ID terakhir: `iad1::xt8mt-1787110675452-09e1295e0191`. Deployment/log Vercel terbaru harus dibaca untuk menentukan apakah masih menjalankan bundle lama, gagal saat build, atau menemukan import lain.

## Log Vercel setelah deployment Ready commit 8809e30

Halaman deployment Vercel `https://vercel.com/willproperty/primedeal-property/deployments?refreshedAt=1787110700` menunjukkan deployment paling baru berstatus **Ready**, commit `8809e30` dengan pesan `fix: exclude test handlers from Vercel functions`, URL `https://primedeal-property-knyn2gc46-willproperty.vercel.app`. Namun probe terhadap URL deployment tersebut dan alias `https://primedeal-property.vercel.app/api/trpc/property.list` tetap HTTP 500 `FUNCTION_INVOCATION_FAILED`.

Log runtime terbaru dari `https://vercel.com/willproperty/primedeal-property/logs?refreshedAt=1787110740` pada 03:38:59 untuk host `primedeal-property-knyn2gc46-willproperty.vercel.app` tetap melaporkan `ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/shared/const' imported from /var/task/server/routers.js`. Ini menunjukkan build Ready masih memuat output server lama/extensionless atau build pipeline menghasilkan import tersebut kembali; source cache-busted `server/routers.ts` di branch main sudah memakai `../shared/const.js`.

## Deployment b48c355

Detail Vercel `https://vercel.com/willproperty/primedeal-property/FWsEVZi4CePKGPSDqH1PrgzBoJpC` menunjukkan source `main`, commit `b48c355` (`Fix import statement for createFetchContext`), domain `primedeal-property-rj6ujgqgr-willproperty.vercel.app`, status **Error**, dan `Command "pnpm build" exited with 1` setelah sekitar 12 detik. Deploy Logs menampilkan clone branch main dan `vercel build`; baris error akhir belum dibaca dan perlu diambil dari bagian bawah log.
