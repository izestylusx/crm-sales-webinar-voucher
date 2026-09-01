# CRM Sales, Webinar, dan Voucher

Dokumentasi rancangan untuk memisahkan CRM dari platform AI pendidikan yang sudah berjalan.

## Tujuan

CRM ini membantu salesperson mengelola seluruh funnel pendekatan calon client:

```text
Lead -> Webinar -> Attendance -> Voucher -> Conversion
                              |-> Individu: checkout langsung
                              |-> Sekolah: opportunity, proposal, BOS, invoice
```

CRM bukan pengganti platform pembelajaran dan bukan pengganti payment/billing. CRM menjadi sistem komersial dan sales; platform tetap menjadi sumber kebenaran untuk identitas user, organisasi sekolah, subscription entitlement, dan akses belajar.

Backend produk dirancang berbasis **Go** sebagai modular monolith untuk MVP: satu codebase, satu PostgreSQL database CRM, serta process `crm-api` dan `crm-worker`. Pendekatan ini menjaga implementasi sederhana tanpa mengorbankan batas domain dan kesiapan integrasi.

## Cara membaca dokumentasi

1. [Executive brief](docs/00-executive-brief.md) - ringkasan keputusan dan ruang lingkup.
2. [Architecture vision](docs/01-architecture-vision.md) - visi target, boundary, dan prinsip.
3. [MVP scope and flows](docs/02-mvp-scope-and-flows.md) - fitur salesperson, webinar, voucher, individu, dan sekolah.
4. [Domain model and ownership](docs/03-domain-model-and-ownership.md) - entity, ownership, dan lifecycle.
5. [API and webhook contracts](docs/04-api-webhook-contracts.md) - integrasi synchronous/asynchronous.
6. [Security, observability, operations](docs/05-security-observability-and-operations.md) - kontrol operasional dan reliability.
7. [Roadmap and open decisions](docs/06-delivery-roadmap-and-open-decisions.md) - tahapan delivery dan keputusan yang perlu dikunci.
8. [Go implementation architecture](docs/07-go-implementation-architecture.md) - struktur codebase, runtime, PostgreSQL, outbox, testing, dan deployment Go.
9. [ADR-001: service boundaries](docs/adr/ADR-001-system-boundaries.md) - keputusan batas CRM, platform, dan billing.
10. [ADR-002: Go backend architecture](docs/adr/ADR-002-go-backend-architecture.md) - keputusan modular monolith Go untuk MVP.
11. [Event envelope](contracts/event-envelope.json) - contoh envelope event standar.
12. [Webhook contract](contracts/webhook-openapi.yaml) - kontrak OpenAPI awal untuk endpoint integrasi.
13. [System context diagram](diagrams/system-context.mmd) - source Mermaid untuk konteks sistem.
14. [Go module architecture](diagrams/go-module-architecture.mmd) - source Mermaid untuk package dan deployment Go.
15. [Individual conversion diagram](diagrams/individual-flow.mmd) - source Mermaid untuk jalur self-service.
16. [School procurement diagram](diagrams/school-flow.mmd) - source Mermaid untuk jalur sekolah dan BOS.

Versi ringkas untuk dibagikan lintas fungsi tersedia pada `CRM-Architecture-Vision-MVP.docx`.

## Status

Dokumen ini adalah baseline rancangan MVP dan bahan alignment lintas tim. Nilai bisnis seperti harga paket, durasi voucher, aturan komisi, dan provider webinar masih berupa konfigurasi/keputusan yang perlu dikunci.

## Portal publik

Portal review tim: [https://izestylusx.github.io/crm-sales-webinar-voucher/](https://izestylusx.github.io/crm-sales-webinar-voucher/)

Source repository: [https://github.com/izestylusx/crm-sales-webinar-voucher](https://github.com/izestylusx/crm-sales-webinar-voucher)

Reviewer dapat membuka dokumen dari portal, lalu memakai panel `Team notes` untuk membuat thread feedback GitHub tanpa download/upload.
