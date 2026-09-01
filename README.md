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

## Cara membaca dokumentasi

1. [Executive brief](docs/00-executive-brief.md) - ringkasan keputusan dan ruang lingkup.
2. [Architecture vision](docs/01-architecture-vision.md) - visi target, boundary, dan prinsip.
3. [MVP scope and flows](docs/02-mvp-scope-and-flows.md) - fitur salesperson, webinar, voucher, individu, dan sekolah.
4. [Domain model and ownership](docs/03-domain-model-and-ownership.md) - entity, ownership, dan lifecycle.
5. [API and webhook contracts](docs/04-api-webhook-contracts.md) - integrasi synchronous/asynchronous.
6. [Security, observability, operations](docs/05-security-observability-and-operations.md) - kontrol operasional dan reliability.
7. [Roadmap and open decisions](docs/06-delivery-roadmap-and-open-decisions.md) - tahapan delivery dan keputusan yang perlu dikunci.
8. [ADR-001: service boundaries](docs/adr/ADR-001-system-boundaries.md) - keputusan arsitektur utama.
9. [Event envelope](contracts/event-envelope.json) - contoh envelope event standar.
10. [Webhook contract](contracts/webhook-openapi.yaml) - kontrak OpenAPI awal untuk endpoint integrasi.
11. [System context diagram](diagrams/system-context.mmd) - source Mermaid untuk konteks sistem.
12. [Individual conversion diagram](diagrams/individual-flow.mmd) - source Mermaid untuk jalur self-service.
13. [School procurement diagram](diagrams/school-flow.mmd) - source Mermaid untuk jalur sekolah dan BOS.

Versi ringkas untuk dibagikan lintas fungsi tersedia pada `CRM-Architecture-Vision-MVP.docx`.

## Status

Dokumen ini adalah baseline rancangan MVP dan bahan alignment lintas tim. Nilai bisnis seperti harga paket, durasi voucher, aturan komisi, dan provider webinar masih berupa konfigurasi/keputusan yang perlu dikunci.
