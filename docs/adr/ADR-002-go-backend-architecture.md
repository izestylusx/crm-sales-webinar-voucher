# ADR-002: Backend Go sebagai Modular Monolith

## Status

Accepted for MVP implementation baseline.

## Context

CRM dipisahkan dari platform AI pendidikan dan billing yang sudah ada. Pengguna utama adalah salesperson, sedangkan proses bisnis mencakup lead, webinar, voucher, conversion individu, serta procurement sekolah/BOS. Tim menetapkan Go sebagai bahasa backend dan ingin menjaga MVP sederhana.

## Decision

- Backend produk CRM menggunakan Go.
- MVP dibangun sebagai satu modular monolith dengan satu PostgreSQL database CRM.
- Codebase menghasilkan minimal dua binary: `crm-api` dan `crm-worker`.
- Boundary domain diterapkan melalui package di bawah `internal`, bukan deployment service terpisah.
- Integrasi menggunakan versioned REST API dan event/webhook sesuai ADR-001.
- Perubahan state CRM dan event keluar dijamin dengan transactional outbox.
- Event masuk diproses secara idempotent melalui inbox/delivery record dan worker.
- Kontrak lintas sistem tetap contract-first melalui OpenAPI dan event schema.

## Rationale

- Go cocok untuk API dan worker yang membutuhkan concurrency terkontrol, binary deployment sederhana, dan penggunaan resource yang efisien.
- Modular monolith mempercepat perubahan lintas domain selama discovery MVP.
- Satu database memungkinkan transaction boundary yang jelas untuk voucher dan outbox.
- Package boundary dan adapter interface menjaga kemampuan test serta ekstraksi service di masa depan.
- Dua process memisahkan latency request pengguna dari pekerjaan asynchronous tanpa menambah banyak deployment.

## Alternatives considered

### Microservices Go sejak awal

Ditunda karena menambah deployment, observability, contract, dan distributed transaction overhead sebelum kebutuhan load atau ownership terbukti.

### Satu process untuk API dan seluruh background job

Ditolak sebagai topology produksi karena job lambat atau retry dapat memengaruhi API interaktif. Codebase tetap satu, tetapi process API dan worker dipisah.

### Message broker wajib sejak MVP

Ditunda. PostgreSQL outbox/inbox cukup untuk durability dan volume awal. Broker dapat ditambahkan bila fan-out, throughput, atau jumlah consumer menuntut.

### Shared database dengan platform

Ditolak sesuai ADR-001 karena merusak ownership dan meningkatkan coupling.

## Consequences

Positif:

- Build dan deployment sederhana.
- Business transaction dan event publishing dapat atomik.
- Test lokal dan debugging lintas funnel lebih mudah.
- Tim memiliki satu bahasa dan pola implementasi backend.

Trade-off:

- Boundary package harus dijaga melalui review karena belum dipaksa oleh network boundary.
- API dan worker berbagi release artifact/repository.
- Scaling per domain belum independen sampai modul diekstrak.
- PostgreSQL menjadi dependency utama untuk data dan job durability.

## Guardrails

- Package domain tidak mengakses tabel domain lain secara bebas.
- Tidak ada package global `utils` atau `models` untuk mencampur ownership.
- Network call tidak dijalankan di dalam database transaction.
- Semua goroutine memiliki owner, cancellation, dan concurrency bound.
- Semua mutating integration memakai idempotency key.
- Ekstraksi service harus memiliki evidence load, ownership, compliance, atau deployment independence.

