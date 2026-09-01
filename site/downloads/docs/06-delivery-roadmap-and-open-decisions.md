# Roadmap Delivery dan Open Decisions

## Tahap 0 - Alignment dan contract discovery

- Inventaris API/event existing platform dan billing.
- Tetapkan owner data, glossary, ID strategy, dan status vocabulary.
- Tetapkan Go module, layout `cmd`/`internal`, migration workflow, serta CI baseline.
- Pilih provider webinar awal.
- Kunci policy voucher dan commission.
- Buat OpenAPI/event fixtures serta threat review.

## Tahap 1 - Sales workspace dan webinar

- Bangun binary `crm-api` dan `crm-worker` dengan PostgreSQL connection, health check, logging, dan graceful shutdown.
- Auth/RBAC internal.
- Lead/contact/account dan activity timeline.
- Webinar event/session, public booking, capacity, confirmation, reminder.
- Attendance manual/CSV sebagai baseline.

## Tahap 2 - Campaign dan voucher

- Campaign configuration.
- Issue voucher dari attendee eligible.
- Validation/reserve/redeem/expire/revoke.
- Notification redeem link.
- Dashboard voucher dan audit log.

## Tahap 3 - Individual conversion

- Redeem page di platform.
- Order dan payment handoff.
- Payment webhook, zero-value order, idempotent activation.
- Buyer/beneficiary mapping.
- Commission pending/eligible.

## Tahap 4 - School opportunity dan BOS

- School account dan opportunity stages.
- Proposal/quotation reference.
- Procurement/BOS fields dan approval.
- Invoice handoff dan payment status.
- Provisioning organization setelah policy terpenuhi.

## Tahap 5 - Hardening

- Contract testing di CI.
- Static analysis, race test worker, migration test, dan capacity test untuk public booking/voucher validation.
- Reconciliation dan operational console.
- Provider webinar callback otomatis.
- Reporting read model dan data warehouse export.
- Extraction review: apakah voucher/integration sudah layak menjadi service terpisah.

## Open decisions

1. Provider webinar pertama: Zoom, Google Meet, atau provider internal?
2. Attendance source: manual, CSV, API callback, atau kombinasi?
3. Voucher diberikan saat register atau hanya setelah attended?
4. Apakah satu attendee boleh menerima beberapa voucher dari campaign berbeda?
5. Apakah voucher individu boleh dipakai untuk buyer dan beneficiary yang berbeda?
6. Apakah sekolah perlu multi-stage approval di CRM atau cukup external status?
7. Kapan komisi menjadi eligible: `payment.paid`, setelah masa refund, atau setelah onboarding selesai?
8. Apakah CRM membuat lead dari public booking secara langsung atau melalui anti-duplication queue?
9. Provider billing existing menyediakan webhook yang signed dan event versioned?
10. Apakah platform sudah memiliki order/subscription API yang dapat dipakai tanpa perubahan besar?
11. Standar internal Go apa yang sudah dimiliki tim: router, PostgreSQL driver/query tool, logger, telemetry, dan migration tool?

## Definition of done MVP

- Alur individu dan sekolah berhasil diuji end-to-end di staging.
- Duplicate webhook tidak menggandakan state atau side effect.
- Access activation tidak terjadi sebelum payment/order policy terpenuhi.
- Salesperson dapat menelusuri timeline dari booking sampai conversion.
- Audit log tersedia untuk perubahan sensitif.
- Dashboard operasi menunjukkan delivery failure dan dead-letter item.
- Rollback/replay runbook telah diuji.
