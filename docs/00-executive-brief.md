# Executive Brief

## Konteks

Platform AI pendidikan sudah besar dan melayani murid, guru, orang tua, serta sekolah. Tim internal membutuhkan alat terpisah bagi salesperson untuk mengatur presentasi produk kepada calon client melalui webinar.

Untuk MVP, kebutuhan paling mendesak bukan voucher atau payment. Fokusnya adalah membuat proses webinar dapat dijadwalkan, dibagikan, diikuti, dan ditindaklanjuti dari satu workspace.

## Keputusan scope

1. Pengguna utama adalah salesperson; sales manager dan admin menjadi pengguna sekunder.
2. MVP berhenti pada follow-up setelah attendance dicatat.
3. Voucher management, payment/billing, subscription activation, opportunity sekolah/BOS, dan commission management dipindahkan ke post-MVP.
4. Tidak ada integrasi payment atau provisioning platform yang diwajibkan pada MVP.
5. Integrasi awal cukup berupa export CSV atau webhook webinar opsional jika memang dibutuhkan consumer internal.
6. Backend menggunakan Go modular monolith dengan PostgreSQL, `crm-api`, dan `crm-worker`.

## Nilai yang ingin dicapai

- Salesperson dapat membuat dan membagikan sesi webinar tanpa proses manual yang tersebar.
- Calon client dapat memilih sesi yang tersedia dan menerima konfirmasi dengan jelas.
- Kapasitas, duplicate registration, pembatalan, dan reschedule ditangani konsisten.
- Reminder dan attendance dapat dipantau dari satu tempat.
- Setelah webinar, salesperson langsung melihat peserta yang perlu di-follow-up.
- Data webinar tetap siap menjadi input voucher pada fase berikutnya tanpa membangun voucher sekarang.

## Termasuk dalam MVP

- Login internal dan role sederhana.
- Webinar event dan session management.
- Public booking page seperti Calendly untuk memilih sesi.
- Capacity check dan duplicate registration policy.
- Confirmation, cancellation, dan reschedule.
- Reminder terjadwal.
- Attendance manual dan import CSV.
- Participant/contact record ringan.
- Follow-up status, task, dan note untuk salesperson.
- Dashboard serta export peserta.
- Audit log untuk perubahan penting.

## Tidak termasuk dalam MVP

- Voucher issuance, validation, reservation, redemption, expiry, atau revocation.
- Checkout, payment webhook, invoice, refund, atau settlement.
- Pembuatan akun dan subscription pada platform pendidikan.
- Opportunity pipeline sekolah dan proses dana BOS.
- Commission calculation.
- Webinar provider integration yang kompleks jika link eksternal sudah cukup.
- Message broker, service mesh, atau microservices penuh.

## Success criteria

- Salesperson dapat membuat, mempublikasikan, dan membagikan webinar.
- Calon client dapat booking tanpa membuat registration ganda atau melewati kapasitas.
- Confirmation dan reminder terkirim dengan status delivery yang terlihat.
- Attendance dapat dicatat atau diimpor dan perubahan memiliki audit trail.
- Salesperson dapat menyaring `attended`, `no_show`, dan peserta yang belum di-follow-up.
- Alur lengkap dari publikasi sesi sampai follow-up lulus pengujian end-to-end.
