# Bukti Runtime Vercel — 19 Agustus 2026

## Gejala di produksi

`GET https://primedeal-property.vercel.app/api/trpc/property.list?batch=1&input=...` mengembalikan **HTTP 500** dengan `Content-Type: text/plain; charset=utf-8`, bukan JSON. Isi respons dimulai dengan `A server error has occurred` dan kode Vercel `FUNCTION_INVOCATION_FAILED`. Hal ini menimbulkan pesan WebView: `Unexpected token 'A' ... is not valid JSON` pada APK Admin.

## Log Vercel deployment `8w8859o6ovv2yTq3taHL7AmieoV8`

Log runtime menunjukkan kegagalan awal berikut pada rute `/api/trpc/[...path]`:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/_core/trpc'
imported from /var/task/server/routers/adminLogin.js
```

Perbaikan commit `2e36e8f` menambahkan ekstensi `.js` eksplisit pada seluruh impor relatif runtime di `server/` dan `api/`. Setelah deployment commit tersebut, endpoint produksi masih 500; log deployment commit terbaru perlu dibaca ulang untuk menemukan impor/konfigurasi berikutnya yang mungkin masih tidak tersedia di bundle Vercel.

