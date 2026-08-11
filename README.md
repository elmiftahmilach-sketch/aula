# Bel Sekolah

Aplikasi jadwal bel sekolah yang dapat dipakai untuk:
- menampilkan jam real-time
- mengatur jadwal bel harian
- otomatis membunyikan alarm sesuai waktu
- menambahkan preset jadwal sekolah
- mengaktifkan notifikasi desktop
- dipakai secara online di browser atau sebagai aplikasi desktop

## Fitur utama
- Jam dan tanggal real-time
- Jadwal bel berbasis hari tertentu
- Preset jadwal sekolah siap pakai
- Tombol uji suara bel
- File audio/video kustom
- Alarm aktif/nonaktif
- Notifikasi desktop browser
- Penyimpanan jadwal lokal dan melalui API server

## Teknologi
- HTML + CSS + JavaScript
- Node.js
- Express
- Electron

## Menjalankan aplikasi lokal

```bash
npm install
npm start
```

Buka browser ke:

```text
http://localhost:3000
```

## Menjalankan versi desktop

```bash
npm install
npm run desktop
```

Aplikasi desktop akan menjalankan server lokal dan membuka tampilan web di jendela Electron.

## Build installer Windows

Pada komputer Windows:

```bash
npm install
npm run build
```

Hasil build akan dibuat di folder `dist` dan siap untuk diinstal.

> Catatan: build installer final `.exe` perlu dijalankan pada sistem Windows karena proses pembungkusan NSIS tidak sepenuhnya tersedia di Linux.

## Deploy online

Project ini sudah siap untuk deployment ke platform seperti Vercel atau Render dengan konfigurasi server dan endpoint API.

### Opsi cepat
- Vercel: cukup push ke GitHub lalu import repository
- Render: gunakan `render.yaml` / struktur Node app yang sudah tersedia

## Struktur project

```text
.
├── app.js
├── desktop.js
├── index.html
├── style.css
├── server.js
├── package.json
├── render.yaml
├── vercel.json
├── README.md
├── data/
│   └── schedules.json
├── api/
├── dist/        (hasil build installer/app)
└── node_modules/
```

## Catatan penggunaan
Aplikasi ini dapat dipakai langsung untuk kebutuhan sekolah dengan jadwal bel otomatis, baik dalam mode online maupun aplikasi desktop.
