# Online Portal

Portal review ringan tersedia di `server.js` dan folder `public/`.

## Jalankan lokal

Dari folder proyek:

```powershell
node server.js
```

Buka `http://localhost:4173`.

## Menyalakan proteksi notes

Tanpa environment variable, endpoint notes dapat ditulis oleh siapa pun yang dapat mengakses server. Untuk deployment online, set token edit:

```powershell
$env:DOCS_EDIT_TOKEN = "ganti-dengan-token-kuat"
node server.js
```

Read-only tetap terbuka. Reviewer memasukkan token melalui tombol `Edit access`; token hanya disimpan di localStorage browser tersebut.

## Deploy sederhana

Portal ini tidak memerlukan database atau build step. Upload folder proyek ke server yang memiliki Node.js, expose port `4173` melalui HTTPS/reverse proxy, dan persist folder `data/` agar notes tidak hilang ketika proses restart.

Untuk penggunaan tim, pasang basic auth/SSO di reverse proxy. Token notes adalah guardrail MVP, bukan pengganti identity system enterprise.

## Deploy dengan Docker

```bash
docker build -t crm-docs-portal .
docker run -d --name crm-docs-portal \
  -p 4173:4173 \
  -e DOCS_EDIT_TOKEN="ganti-dengan-token-kuat" \
  -v crm-docs-data:/app/data \
  crm-docs-portal
```

Pasang HTTPS/reverse proxy di depan container dan arahkan domain internal tim ke port `4173`.

## Catatan desain

- Markdown source tetap menjadi sumber isi dokumentasi.
- `notes.json` adalah penyimpanan file yang sengaja sederhana untuk review MVP.
- Mermaid di-render di browser; diagram source tetap dapat diunduh dari sidebar.
- Tidak ada shared database, CMS, atau framework frontend besar.
