# Catatan Routing Express di Vercel

Sumber resmi yang diperiksa pada 16 Agustus 2026:

- https://vercel.com/docs/frameworks/backend/express
- https://vercel.com/docs/functions/runtimes/node-js

Temuan penting:

1. Vercel mendeteksi entrypoint Express di root dengan nama `server.{js,cjs,mjs,ts,cts,mts}` dan mengubah aplikasi Express menjadi satu Vercel Function.
2. Entrypoint Node server root perlu mengekspor aplikasi default atau memanggil `server.listen()` saat startup.
3. Pada Express di Vercel, `express.static()` tidak menjadi jalur CDN utama; aset statis sebaiknya berada di direktori `public/**` pada deployment.
4. Untuk proyek Primedeal, output Vite diarahkan ke `public/` root dan `server.ts` membaca `public/`, sementara `vercel.json` tidak lagi memaksa `outputDirectory: dist/public` yang dapat membuat deployment hanya menjadi static output.

Catatan: perubahan ini harus diuji dengan build lokal, endpoint `/api/trpc/property.list`, dan deployment Vercel sebelum dinyatakan selesai.
