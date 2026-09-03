# Roadmap Delivery dan Open Decisions

## Tahap 0 - Scope dan fondasi

- Kunci Webinar-first MVP sebagai baseline aktif.
- Tetapkan field wajib booking, duplicate policy, capacity policy, dan timezone behavior.
- Pilih strategi auth internal dan role awal.
- Tetapkan Go module, layout `cmd`/`internal`, migration workflow, dan CI.
- Pilih kanal confirmation/reminder awal.
- Buat OpenAPI serta acceptance test fixtures.

## Tahap 1 - Webinar dan session management

- `crm-api`, PostgreSQL connection, migration, health check, logging, dan graceful shutdown.
- Auth/RBAC internal.
- Webinar event dan session CRUD.
- Publish/cancel session dan public booking token.
- Dashboard webinar salesperson.

## Tahap 2 - Public booking

- Public session page dan form registration.
- Atomic capacity check.
- Duplicate registration policy.
- Confirmation state dan management link.
- Cancellation dan reschedule.
- Rate limit, validation, dan audit.

## Tahap 3 - Reminder, attendance, dan follow-up

- `crm-worker` dan notification job.
- Confirmation/reminder delivery serta retry.
- Attendance manual dan CSV preview/commit.
- Filter attended/no-show.
- Follow-up task, note, due date, owner, dan outcome.
- Export CSV.

## Tahap 4 - Hardening MVP

- Concurrency test untuk capacity.
- Load test public booking.
- Race test worker dan migration test.
- Runbook serta operational dashboard.
- Retention/deletion policy.
- End-to-end test dari publish sampai follow-up.

## Post-MVP, belum dijadwalkan

1. Webinar provider callback otomatis.
2. Outbound webhook/event ke sistem internal.
3. Voucher management.
4. Individual checkout dan payment integration.
5. Subscription activation pada platform pendidikan.
6. School opportunity, proposal, procurement, dan dana BOS.
7. Commission management.

Urutan post-MVP harus ditentukan kembali berdasarkan hasil penggunaan webinar, bukan dianggap otomatis.

## Open decisions MVP

1. Apakah satu public page menampilkan beberapa session atau satu link per session?
2. Field booking mana yang wajib: email, telepon, institusi, role, atau kombinasi?
3. Duplicate ditentukan berdasarkan email, telepon, atau keduanya?
4. Apakah salesperson dapat mengubah capacity setelah session published?
5. Kanal awal: email saja, WhatsApp, atau keduanya?
6. Jadwal reminder default dan batas resend manual?
7. Attendance MVP: manual saja atau manual + CSV?
8. Apakah calon client boleh reschedule sendiri sampai batas waktu tertentu?
9. Siapa yang dapat melihat seluruh participant lintas salesperson?
10. Berapa lama data participant yang tidak conversion disimpan?
11. Apakah existing SSO dapat dipakai tanpa perubahan besar?
12. Standar internal Go apa yang sudah tersedia untuk router, PostgreSQL, logging, telemetry, dan migration?

## Definition of done MVP

- Salesperson dapat membuat, publish, dan membagikan session.
- Public booking aman dari overbooking dan duplicate submit.
- Participant dapat cancel/reschedule sesuai policy.
- Confirmation dan reminder memiliki delivery status serta retry.
- Attendance manual/CSV konsisten dan dapat dikoreksi dengan audit.
- Salesperson dapat menyelesaikan follow-up dan export peserta.
- Role/team scope bekerja sesuai acceptance test.
- Dashboard operasi menunjukkan booking error dan notification backlog.
- Tidak ada runtime dependency pada voucher, payment, billing, subscription, atau provisioning.
