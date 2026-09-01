# GitHub Pages Portal

Portal publik memakai GitHub Pages sebagai hosting statis dan GitHub Issues melalui Utterances sebagai tempat notes/review.

## Mengapa ini pilihan yang tepat untuk MVP

- Tidak perlu menjalankan server Node atau database.
- Setiap perubahan dokumentasi cukup melalui commit/pull request.
- GitHub Pages otomatis melakukan deploy setelah merge ke `main`/`master`.
- Reviewer dapat membaca link publik dan meninggalkan komentar langsung pada halaman dokumen.
- Notes menjadi issue/comment GitHub sehingga ada author, timestamp, history, dan notification.

## Setup satu kali di GitHub

1. Buat repository **public** baru, misalnya `crm-sales-webinar-voucher`.
2. Push isi folder proyek ini ke branch `main`.
3. Buka `Settings -> Pages` dan pilih `GitHub Actions` sebagai source.
4. Buka `Settings -> Actions -> General` dan pastikan workflow diizinkan berjalan.
5. Buka `https://utteranc.es/`, install Utterances GitHub App pada repository tersebut, atau ikuti prompt saat komentar pertama dibuka.
6. Setelah workflow sukses, URL muncul di tab `Settings -> Pages` dan pada summary workflow deployment.

URL project Pages umumnya berbentuk:

```text
https://<github-user>.github.io/<repository-name>/
```

## Alur update dokumentasi

1. Edit file Markdown di folder `docs/`.
2. Commit dan push, atau buat pull request.
3. GitHub Actions menjalankan `scripts/build-static-site.js`.
4. Folder `site/` diunggah sebagai artifact dan dipublikasikan ke Pages.
5. Reviewer membuka link yang sama; notes tetap berada di GitHub Issues.

## Catatan akses review

Konten dapat dibaca publik. Untuk meninggalkan note, reviewer perlu login GitHub karena komentar disimpan sebagai GitHub Issue comment. Ini lebih aman dan lebih mudah diaudit daripada endpoint notes anonim.

Jika repository belum dikonfigurasi, portal tetap dapat dibuka tetapi area review akan menampilkan instruksi setup, bukan widget komentar.

## Local preview

```powershell
$env:DOCS_REPO = "owner/repository"
node scripts/build-static-site.js
node server.js
```

Static files akan tersedia melalui server yang sama di `http://localhost:4173/site/` atau dapat dibuka dengan static file server apa pun.

