# ADR-002: Backend Go sebagai Modular Monolith

## Status

Accepted for Webinar-first MVP.

## Context

Pengguna utama adalah salesperson. Scope MVP kini terbatas pada webinar, public booking, reminder, attendance, dan follow-up. Tim menetapkan Go sebagai bahasa backend dan ingin menghindari overengineering.

## Decision

- Backend produk menggunakan Go.
- MVP dibangun sebagai modular monolith dengan satu PostgreSQL database.
- Codebase menghasilkan `crm-api` dan `crm-worker`.
- Package aktif: auth, webinar, registration, participant, attendance, notification, follow-up, audit, persistence, dan telemetry.
- PostgreSQL job table digunakan untuk reminder/retry.
- Message broker dan microservices tidak menjadi dependency MVP.
- Package voucher, payment, opportunity, school procurement, dan commission tidak dibuat.

## Rationale

- Dua process memisahkan request interaktif dari reminder tanpa memecah repository.
- PostgreSQL transaction cukup untuk capacity, registration, dan notification job.
- Package boundary memudahkan testing dan menjaga scope.
- Deployment tetap sederhana dan dapat dimulai dengan satu instance per process.

## Alternatives considered

### Microservices Go sejak awal

Ditolak karena domain aktif kecil dan operational overhead belum memiliki manfaat.

### Message broker untuk seluruh reminder

Ditunda. PostgreSQL job table cukup untuk volume awal dan mengurangi komponen operasi.

### Satu process API dan worker

Masih mungkin untuk local development, tetapi production menggunakan process terpisah agar pekerjaan reminder tidak mengganggu latency booking.

## Consequences

Positif:

- Implementasi dan deployment sederhana.
- Atomic capacity serta scheduling mudah diuji.
- Scope package mencerminkan MVP yang benar.

Trade-off:

- API dan worker berbagi release repository.
- PostgreSQL menjadi dependency utama untuk data dan job durability.
- Scaling per domain belum independen, tetapi belum dibutuhkan.

## Guardrails

- Semua goroutine memiliki cancellation dan concurrency bound.
- Network call tidak dilakukan di dalam database transaction.
- Duplicate dan capacity invariant dilindungi transaction serta constraint.
- Shared package tidak boleh menjadi tempat business logic campuran.
- Penambahan package post-MVP memerlukan scope decision baru.

