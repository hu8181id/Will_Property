# Catatan Sinkronisasi GitHub

Sumber yang diverifikasi melalui browser:
- Repository: https://github.com/hu8181id/primedeal-property
- Branch target: `main`
- Repository privat milik `hu8181id`.
- Struktur root terlihat memiliki `client/`, `drizzle/`, `patches/`, `server/`, `shared/`, `package.json`, `pnpm-lock.yaml`, `vercel.json`, dan arsip `primedeal_property.zip`.
- Commit terakhir sebelum sinkronisasi: `6b70b28` dengan pesan `Fix Vercel frontend output`.
- Vercel project URL: https://vercel.com/willproperty/primedeal-property
- Pengunggahan `api/[...path].ts` ke folder `api/` telah dimulai melalui GitHub web upload dan tombol Commit changes sudah ditekan; halaman menampilkan `Processing your files…`.

Berkas perbaikan lokal yang masih perlu disinkronkan setelah proses pertama selesai:
- `client/src/components/Header.tsx`
- `server/_core/app.ts`
- `server/_core/index.ts`
- `server/storage.ts`
- `vercel.json`
- `todo.md`

Commit yang sudah berhasil di branch `main`:
- `afbd6af` — `Add Vercel serverless API entrypoint`, membuat folder `api/` dan file `[...path].ts`.
- `2a62c6f` — `Fix Vercel-safe Primedeal logo fallback`, memperbarui `client/src/components/Header.tsx`.
GitHub menunjukkan total 6 commits dan 3 deployments setelah commit kedua.

Upload berikutnya:
- `server/_core/app.ts` sudah berhasil diunggah ke folder yang tepat dan commit `Add Express serverless app factory` sedang diproses di GitHub.

GitHub repository: https://github.com/hu8181id/primedeal-property
- `server/_core/index.ts` sudah berhasil dipilih untuk upload ke folder `server/_core`; commit belum ditekan pada saat catatan ini dibuat.

- `server/_core/index.ts` sudah dikomit dengan ringkasan `Use serverless Express app entrypoint`; GitHub sedang memproses commit.

- `server/storage.ts` sudah diunggah ke folder `server` dan dikomit dengan ringkasan `Use Backblaze B2 storage on Vercel`; GitHub sedang memproses commit.

- `vercel.json` sudah diunggah ke root repository dan dikomit dengan ringkasan `Prioritize Vercel API routes`; GitHub sedang memproses commit.

Sumber eksternal: https://github.com/hu8181id/primedeal-property (branch `main`). Verifikasi halaman repository menunjukkan commit terbaru `c3a244e` dengan pesan `Prioritize Vercel API routes`, total 10 commit; deployment GitHub menunjukkan 7 deployment Production. Commit sebelumnya yang terlihat: `cae6e92` (`Use Backblaze B2 storage on Vercel`), `68f0046` (`Use serverless Express app entrypoint`), serta commit API dan fallback logo.

Verifikasi eksternal: deployment `https://primedeal-property-cj787ghdr-willproperty.vercel.app` berstatus Ready dan halaman beranda memuat fallback logo `P` tanpa ikon rusak. Setelah pemuatan selesai, UI menampilkan `Belum ada properti aktif. Tambahkan listing melalui halaman Listing.`; console browser tidak menunjukkan error. Ini berarti routing API/tRPC sudah hidup, tetapi data listing aktif belum tersedia atau belum tersambung ke database TiDB pada deployment tersebut.

Audit Vercel Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_KEY`, dan `S3_SECRET` semuanya tercantum sebagai Sensitive untuk `Production and Preview`, ditambahkan sekitar 53 menit lalu. Nilai rahasia tidak dibuka atau disalin.


## Verifikasi Vercel 2026-08-16
- Deployment `7m18gtnMJAhdV3yAZEcXSQYSg3ur` berstatus Ready dan mendeteksi fungsi Node.js `/api/[...path]`.
- Uji browser ke `/api/trpc/property.list` menghasilkan `404: NOT_FOUND`.
- Uji curl ke `/api/foo` menghasilkan `500 FUNCTION_INVOCATION_FAILED`, menandakan fungsi terdeteksi tetapi cold-start/import runtime masih gagal.
- Runtime logs Vercel tidak menampilkan error terperinci.
- Dugaan teknis: alias TypeScript `@shared/*` pada jalur backend tidak aman untuk runtime fungsi Vercel; import relatif sedang diterapkan pada `server/routers.ts`, `server/_core/oauth.ts`, `server/_core/sdk.ts`, dan `server/_core/trpc.ts`.
- Sumber routing resmi: https://vercel.com/docs/routing/rewrites

- Commit `464234e` memperbaiki `server/routers.ts` dengan import relatif. Tiga berkas `server/_core/oauth.ts`, `sdk.ts`, dan `trpc.ts` sudah diunggah dan halaman GitHub sedang memproses commit `Fix Vercel backend runtime imports` ke branch `main`.
- Deployment Vercel terakhir mendeteksi fungsi `/api/[...path]`, tetapi cold-start runtime masih gagal; patch import relatif ditujukan untuk mengatasi kegagalan tersebut.

- Deployment terbaru berbasis commit `c88f303` berstatus Ready dan memuat frontend dengan fallback logo `P`; halaman tetap menunggu data listing.
- Uji langsung `https://primedeal-property-29hf7qwtj-willproperty.vercel.app/api/trpc/property.list?input=...` masih menghasilkan `404: NOT_FOUND`, sehingga fungsi catch-all belum dipetakan ke path API publik dengan benar meskipun deployment mendeteksi fungsi.
