# CRM Webinar Management

Dokumentasi rancangan **Webinar-first MVP** untuk membantu salesperson mengelola calon client dari undangan sampai follow-up setelah webinar.

## Fokus MVP

```text
Webinar dibuat -> Sesi dipublikasikan -> Calon client booking
               -> Konfirmasi dan reminder -> Attendance
               -> Follow-up salesperson
```

Voucher management, payment integration, subscription activation, opportunity sekolah, proses dana BOS, dan commission management **dipending ke post-MVP**. Keputusan boundary lama tetap disimpan sebagai referensi agar pengembangan berikutnya tidak mencampur database CRM, platform pendidikan, dan billing.

Backend produk tetap dirancang dengan **Go** sebagai modular monolith: satu codebase, satu PostgreSQL database, serta process `crm-api` dan `crm-worker`. `crm-api` menangani dashboard dan booking, sedangkan `crm-worker` menangani reminder dan pekerjaan terjadwal.

## Dokumen aktif

1. [Executive brief](docs/00-executive-brief.md) - keputusan scope webinar-first.
2. [Architecture vision](docs/01-architecture-vision.md) - boundary dan arsitektur target MVP.
3. [MVP scope and flows](docs/02-mvp-scope-and-flows.md) - fitur, journey, state, dan acceptance criteria.
4. [Domain model and ownership](docs/03-domain-model-and-ownership.md) - entity inti webinar dan data ownership.
5. [API and webhook contracts](docs/04-api-webhook-contracts.md) - API booking, attendance, follow-up, dan event opsional.
6. [Security, observability, operations](docs/05-security-observability-and-operations.md) - guardrail operasional MVP.
7. [Roadmap and open decisions](docs/06-delivery-roadmap-and-open-decisions.md) - urutan delivery dan keputusan yang perlu dikunci.
8. [Go implementation architecture](docs/07-go-implementation-architecture.md) - struktur Go, database, worker, testing, dan deployment.
9. [ADR-001: system boundaries](docs/adr/ADR-001-system-boundaries.md) - boundary platform dan billing untuk fase berikutnya.
10. [ADR-002: Go backend architecture](docs/adr/ADR-002-go-backend-architecture.md) - modular monolith Go.
11. [ADR-003: webinar-first MVP](docs/adr/ADR-003-webinar-first-mvp.md) - keputusan resmi penundaan voucher.

Kontrak dan diagram aktif:

- [Webinar OpenAPI](contracts/webinar-openapi.yaml)
- [Webinar event envelope](contracts/event-envelope.json)
- [System context](diagrams/system-context.mmd)
- [Webinar journey](diagrams/webinar-flow.mmd)
- [Go module architecture](diagrams/go-module-architecture.mmd)

Diagram conversion individu dan sekolah tetap tersedia di repository sebagai **referensi post-MVP**, bukan komitmen delivery saat ini.

Versi ringkas lintas fungsi tersedia pada `CRM-Architecture-Vision-MVP.docx`.

## Status

Baseline aktif: Webinar-first MVP. Keputusan utama yang masih terbuka adalah provider/link webinar, aturan kapasitas dan duplicate registration, kanal reminder, metode attendance, serta data wajib pada form booking.

## Portal publik

Portal review tim: [https://izestylusx.github.io/crm-sales-webinar-voucher/](https://izestylusx.github.io/crm-sales-webinar-voucher/)

Source repository: [https://github.com/izestylusx/crm-sales-webinar-voucher](https://github.com/izestylusx/crm-sales-webinar-voucher)

Reviewer dapat membaca dokumen dan meninggalkan catatan melalui panel `Team notes` tanpa proses download-upload.
