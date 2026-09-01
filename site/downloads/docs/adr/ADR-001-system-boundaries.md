# ADR-001: Batas CRM, Platform, dan Billing

## Status

Accepted for MVP baseline.

## Context

Platform AI pendidikan sudah besar dan memiliki domain user serta pembelajaran. Tim membutuhkan CRM terpisah yang berfokus pada salesperson, webinar acquisition, voucher, dan pipeline sekolah. Payment/billing sudah ada dan tidak ingin digabungkan.

## Decision

- CRM memiliki data dan workflow komersial.
- Platform memiliki identity, organization, subscription entitlement, dan akses belajar.
- Billing/payment memiliki invoice, payment, refund, dan reconciliation.
- Sistem terhubung dengan versioned API dan event/webhook.
- Tidak ada shared database.
- Provisioning dan activation selalu diputuskan oleh platform setelah status order/payment valid.

## Rationale

- Mengurangi coupling terhadap platform yang sudah besar.
- Menghindari duplikasi data sensitif dan konflik ownership.
- Memungkinkan jalur individu dan sekolah berkembang berbeda.
- Menjaga payment gateway tetap menjadi concern finansial tersendiri.
- Memungkinkan ekstraksi modul voucher dan integration worker di kemudian hari.

## Alternatives considered

### CRM langsung mengubah database platform

Ditolak karena membuat coupling schema, sulit diaudit, dan berisiko merusak invariant platform.

### CRM menjadi system of record seluruh user

Ditolak karena CRM tidak membutuhkan data pembelajaran dan tidak seharusnya menangani credential atau membership detail.

### Voucher hanya di payment system

Ditolak karena voucher mulai hidup sejak webinar/attendance dan perlu attribution salesperson, bukan hanya potongan harga saat checkout.

### Microservices penuh sejak hari pertama

Ditunda karena menambah operational complexity. Gunakan modular boundary dan API-first contract; ekstraksi dilakukan bila ada alasan load, ownership, atau compliance.

## Consequences

Positif:

- Ownership jelas.
- Evolusi CRM lebih cepat untuk kebutuhan sales.
- Integrasi dapat diobservasi dan di-retry.

Trade-off:

- Status tertentu eventually consistent.
- Perlu external ID mapping dan reconciliation.
- Tim harus memelihara kontrak API/event.

## Guardrails

- Setiap entity cross-system memiliki owner tertulis.
- Semua event memiliki `event_id`, versi, signature, dan correlation ID.
- Semua consumer idempotent.
- Perubahan policy voucher/komisi memerlukan audit dan approval.

