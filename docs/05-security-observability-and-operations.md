# Security, Observability, dan Operasi

## Security baseline

### Identity dan authorization

- Gunakan SSO/OIDC untuk pengguna internal bila identity provider perusahaan tersedia.
- Role minimum: `salesperson`, `sales_manager`, `marketing_host`, dan `crm_admin`.
- Salesperson hanya melihat session, participant, dan follow-up miliknya atau team scope yang diberikan.
- Manager/admin dapat reassign owner; perubahan tercatat pada audit log.

### Public booking protection

- Public session dan management link memakai opaque random token, bukan sequential ID.
- Rate limit berdasarkan kombinasi IP, token, dan identifier participant.
- Batasi payload, normalisasi email/telepon, dan validasi server-side.
- Gunakan honeypot sebagai baseline; aktifkan CAPTCHA bila metrics menunjukkan abuse.
- Meeting URL tidak dikirim dalam public session listing dan tidak ditulis pada log.
- Cancel/reschedule memerlukan management token yang disimpan sebagai hash.

### Data protection

- Encrypt traffic dan storage sesuai standar platform.
- Redact email, telepon, management token, dan meeting URL dari log.
- Pisahkan consent komunikasi dari status attendance.
- Tetapkan retention dan deletion policy participant sebelum production.
- Jangan menyimpan password platform, payment data, atau data akademik.

## Observability

### Structured log

```text
timestamp
level
service
request_id
actor_id
session_id
registration_id
job_id
outcome
error_code
duration_ms
```

### Business metrics

- Published session dan available capacity.
- Registration, cancellation, dan reschedule count.
- Attendance rate dan no-show rate.
- Confirmation/reminder delivery rate.
- Follow-up pending, overdue, contacted, dan closed.
- Registration source serta salesperson attribution.

### Technical metrics

- API latency p50/p95/p99 dan error rate.
- Booking conflict, duplicate, rate-limit, dan full-session count.
- Notification queue lag, attempts, failure, dan oldest pending job.
- CSV import success/error row count.
- Database pool usage dan slow query count.

## Reliability patterns

- Capacity check dan registration insert dilakukan atomik.
- Unique constraint mencegah duplicate registration sesuai policy.
- Notification job menggunakan lease/locking agar tidak diproses dua worker.
- Retry memakai exponential backoff dengan jitter dan retry budget.
- Cancellation membatalkan reminder pending secara idempotent.
- Graceful degradation: booking tetap tersimpan bila notification provider sementara gagal.
- Reconciliation job memeriksa registration confirmed yang tidak memiliki notification job atau attendance result setelah session selesai.

Transactional outbox hanya diperlukan jika webhook eksternal diaktifkan. Untuk reminder internal, PostgreSQL `notification_job` sudah cukup.

## Baseline operasi Go

- `context.Context` membawa cancellation dan deadline sampai query serta outbound notification call.
- Semua HTTP client memiliki timeout, connection reuse, dan response size limit.
- Worker menggunakan bounded concurrency; setiap goroutine memiliki owner dan jalur shutdown.
- API dan worker mendukung graceful shutdown dengan deadline.
- Error response memakai code stabil tanpa stack trace atau detail database.
- Endpoint `/health/live`, `/health/ready`, dan `/metrics` hanya tersedia sesuai kebijakan jaringan.
- Debug/profiling endpoint tidak diekspos ke internet.
- CI menjalankan formatting, static analysis, unit/integration test, build kedua binary, dan race test worker.

## Runbook minimum

1. Session overbooked atau capacity mismatch.
2. Duplicate registration lolos policy.
3. Confirmation/reminder gagal atau backlog meningkat.
4. Session dibatalkan setelah reminder dikirim.
5. CSV attendance salah mapping atau salah session.
6. Timezone/display time berbeda antara dashboard dan notification.
7. Public booking spam atau management token abuse.

Setiap runbook berisi indikator, query/dashboard, tindakan aman, cara koreksi, dan kebutuhan audit trail.
