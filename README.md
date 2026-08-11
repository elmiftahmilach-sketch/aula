<<<<<<< HEAD
# aula
peminjaman aula RKB
=======
# Bel Sekolah

Aplikasi jadwal bel sekolah online yang dapat digunakan untuk mengatur waktu pelajaran, istirahat, dan pulang sekolah. Aplikasi ini terdiri dari frontend yang ringan dan backend Node.js untuk menyimpan jadwal secara online.

## Fitur
- Jam dan tanggal real-time
- Jadwal bel berbasis hari tertentu
- Tombol uji suara bel
- Support file audio/video kustom
- State alarm aktif/nonaktif
- Notifikasi desktop browser
- Penyimpanan jadwal melalui API server

## Teknologi
- HTML + CSS + JavaScript
- Node.js
- Express

## Menjalankan lokal

```bash
npm install
npm start
```

Buka browser ke:

```text
http://localhost:3000
```

## Deploy ke Vercel

1. Push project ke GitHub
2. Masuk ke Vercel
3. Pilih Add New Project
4. Import repository GitHub
5. Gunakan konfigurasi default
6. Deploy project

> Catatan: pada Vercel, data jadwal akan disimpan di browser pengguna (localStorage) dan API endpoint bersifat demo. Untuk penyimpanan bersama lintas pengguna, dibutuhkan database seperti Supabase, Neon, atau Vercel KV.

## Struktur Project

```text
.
├── app.js
├── index.html
├── style.css
├── server.js
├── render.yaml
├── package.json
├── README.md
├── data/
│   └── schedules.json
└── node_modules/  (setelah npm install)
```

## Catatan
Aplikasi ini dibuat untuk kebutuhan sekolah dengan jadwal bel otomatis yang dapat diakses melalui browser.
>>>>>>> e4d7597 (Finalize Bel Sekolah UI and deployment setup)
