# ADR-001: Batas CRM, Platform, dan Billing

## Status

Accepted as a cross-system guardrail. Implementation relevance is post-MVP.

## Context

Platform AI pendidikan dan payment/billing sudah berjalan sebagai sistem terpisah. Rancangan awal CRM mencakup webinar, voucher, conversion, dan procurement sekolah. Scope kemudian dipersempit menjadi Webinar-first MVP.

## Decision

- Webinar CRM memiliki event, session, registration, attendance, notification delivery, dan follow-up.
- Existing platform tetap memiliki identity customer, organization, entitlement, dan learning access.
- Billing/payment tetap memiliki invoice, payment, settlement, dan refund.
- Tidak ada shared database.
- Webinar-first MVP tidak melakukan checkout, payment, subscription activation, atau provisioning.
- Ketika integrasi post-MVP diaktifkan, gunakan versioned API/event dan external ID, bukan direct database access.

## Rationale

- Scope MVP dapat selesai tanpa tergantung perubahan platform besar.
- Data sensitif dan financial state tidak perlu disalin ke CRM webinar.
- Boundary tetap jelas ketika voucher dan conversion dibahas kembali.
- Tim dapat memvalidasi proses webinar sebelum berinvestasi pada integrasi yang lebih luas.

## Consequences

Positif:

- Runtime dan testing MVP lebih sederhana.
- Tidak ada distributed workflow payment pada jalur kritis booking.
- Ownership data tetap aman untuk fase selanjutnya.

Trade-off:

- Conversion setelah webinar belum terlacak otomatis.
- Handoff pasca follow-up dilakukan manual atau export sampai fase baru disetujui.
- Kontrak voucher/payment lama bukan bagian baseline aktif.

## Guardrails

- Jangan menambahkan dependency platform/billing untuk menyelesaikan booking atau attendance.
- Jangan menyalin password, entitlement, payment, atau data akademik ke CRM.
- Integrasi baru memerlukan use case, owner, consumer, dan acceptance criteria yang nyata.

