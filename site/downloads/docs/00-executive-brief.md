# Executive Brief

## Konteks

Platform utama sudah besar dan melayani murid, guru, orang tua, serta institusi sekolah. Tim ingin memiliki CRM terpisah agar pekerjaan salesperson tidak bercampur dengan domain pembelajaran, identitas, subscription, dan payment.

Pengguna utama CRM adalah salesperson. Admin sales, finance, marketing, dan operator integrasi menjadi pengguna sekunder.

## Keputusan inti

1. CRM menjadi system of record untuk lead, account komersial, aktivitas sales, webinar, campaign, voucher attribution, opportunity, dan komisi.
2. Platform menjadi system of record untuk login, user identity, organisasi sekolah, role, membership, subscription entitlement, dan akses pembelajaran.
3. Payment/Billing tetap menjadi system of record untuk invoice, payment attempt, settlement, refund, dan status finansial.
4. Tidak ada shared database lintas sistem. Integrasi memakai API dan event/webhook dengan external IDs.
5. Funnel individu dan sekolah berbeda setelah voucher diterbitkan.
6. Voucher individu dapat mengantarkan user ke checkout langsung. Voucher sekolah menjadi benefit atau referensi pada opportunity/quotation, bukan jalur checkout individu.
7. Akses platform diaktifkan oleh platform setelah status order/subscription valid; CRM tidak pernah mengaktifkan akses secara langsung.

## Nilai yang ingin dicapai

- Salesperson melihat pekerjaan harian dari satu workspace.
- Pendaftaran webinar, attendance, follow-up, dan voucher dapat dilacak end-to-end.
- Conversion dapat diatribusikan ke salesperson dan campaign secara dapat diaudit.
- Pemisahan sistem dapat dilakukan tanpa migrasi besar atau perubahan langsung pada payment gateway.
- Jalur procurement sekolah yang memakai dana BOS tidak dipaksa mengikuti checkout self-service.

## Batas MVP

### Termasuk

- Login dan RBAC untuk pengguna internal CRM.
- Lead dan contact management ringan.
- Kalender webinar grup dengan kapasitas, booking, reminder, dan attendance.
- Campaign dan penerbitan voucher.
- Validasi, reservation, redemption, expiry, dan revocation voucher.
- Integrasi order, payment status, subscription activation, dan provisioning.
- Opportunity sekolah, proposal/quotation reference, status procurement, dan invoice reference.
- Dashboard salesperson dan audit log.

### Tidak termasuk pada MVP

- Replikasi seluruh data pembelajaran ke CRM.
- Payment gateway baru.
- CRM omnichannel lengkap seperti marketing automation enterprise.
- Perhitungan pajak/akuntansi penuh.
- Self-service procurement sekolah tanpa approval.
- Microservice decomposition yang memaksa operational overhead sejak hari pertama.

## Success criteria MVP

- Salesperson dapat membuat atau membuka lead, mendaftarkan peserta webinar, melihat attendance, dan melakukan follow-up tanpa membuka database platform.
- Peserta yang eligible memperoleh voucher satu kali dengan status lifecycle yang konsisten.
- Pembayaran individu yang berhasil menghasilkan redemption dan aktivasi akun yang idempotent.
- Opportunity sekolah dapat bergerak dari lead sampai `payment_pending` tanpa membuat akun murid/guru prematur.
- Semua event antar-sistem dapat dilacak dengan correlation ID dan event ID.

