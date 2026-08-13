# Rujukan Implementasi Analitik Primedeal

## Firebase Analytics untuk Android

Dokumentasi Firebase menyatakan bahwa Google Analytics tersedia tanpa biaya, mengumpulkan sejumlah event serta properti pengguna secara otomatis setelah SDK ditambahkan, dan statistiknya dapat dilihat melalui Firebase Console.

Sumber: https://firebase.google.com/docs/analytics

## Firebase Analytics dalam Android WebView

Untuk event yang berasal dari halaman di dalam WebView, Firebase mendokumentasikan pola JavaScript interface yang meneruskan event ke SDK Android. Interface tersebut harus dipasang dengan `addJavascriptInterface`, sedangkan event aplikasi native juga dapat dicatat langsung melalui Firebase Analytics.

Sumber: https://firebase.google.com/docs/analytics/webview

## Dependensi Android

Panduan setup Firebase untuk Android merekomendasikan Firebase Android BoM bersama dependensi `com.google.firebase:firebase-analytics` agar SDK Analytics aktif pada aplikasi yang telah memiliki `google-services.json` dan plugin Google Services.

Sumber: https://firebase.google.com/docs/android/setup
