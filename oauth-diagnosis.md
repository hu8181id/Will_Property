# Diagnosis Login Google pada APK

Screenshot pengguna menunjukkan halaman autentikasi Manus berhenti pada pemeriksaan Cloudflare/Turnstile dan tidak kembali ke Primedeal. Audit kode menemukan `client/src/const.ts` mengarahkan OAuth ke portal Manus dan `server/_core/oauth.ts` menggunakan callback `/api/oauth/callback` dengan cookie nonce `__Host-oauth_state`. `MainActivity.java` sebelumnya memuat portal OAuth di embedded WebView, yang rentan diblokir oleh Google OAuth dan Cloudflare Turnstile.

Perbaikan yang diterapkan pada APK: shortcut admin tersembunyi kini membuka `/admin` melalui browser sistem; navigasi ke host `manus.im` juga dialihkan ke browser sistem. WebView tetap digunakan untuk website publik, sedangkan backend tetap memverifikasi login dan role admin. Build Gradle release APK/AAB berhasil, package `com.primedeal.property` dan Firebase Google Services tetap aktif, APK ditandatangani dengan upload keystore Primedeal, dan AAB terverifikasi.

Uji browser live pada `/admin` menunjukkan tombol login membentuk URL `https://manus.im/app-auth` dengan `redirectUri=https://primedeal-jl8furcm.manus.space/api/oauth/callback` yang benar. Portal terlihat memuat lama pada lingkungan browser uji, sehingga perangkat pengguna dapat mengalami pemeriksaan Cloudflare yang tertahan; solusi APK menghindari embedded WebView untuk host OAuth dan memakai browser sistem.
