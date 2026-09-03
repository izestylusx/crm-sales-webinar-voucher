# API dan Event Contracts

## Scope kontrak MVP

Kontrak aktif hanya mencakup webinar, booking, attendance, notification status, follow-up, dan export. Endpoint voucher, payment, subscription, dan school provisioning tidak menjadi bagian API MVP.

## Konvensi umum

- Base path: `/v1`.
- Format: JSON UTF-8.
- Timestamp: ISO-8601 UTC; timezone session dikirim sebagai field terpisah.
- Mutating request internal menerima `Idempotency-Key` bila berisiko diulang.
- Semua response menyertakan `request_id`.
- List menggunakan cursor pagination.
- Public token bersifat opaque dan tidak memakai ID database berurutan.

## Internal salesperson API

```text
GET    /v1/me/dashboard
GET    /v1/webinar-events?status=&cursor=
POST   /v1/webinar-events
PATCH  /v1/webinar-events/{event_id}
GET    /v1/webinar-sessions?from=&to=&owner_id=&status=&cursor=
POST   /v1/webinar-events/{event_id}/sessions
PATCH  /v1/webinar-sessions/{session_id}
POST   /v1/webinar-sessions/{session_id}/publish
POST   /v1/webinar-sessions/{session_id}/cancel
GET    /v1/webinar-sessions/{session_id}/registrations?attendance=&follow_up=&cursor=
POST   /v1/webinar-registrations/{registration_id}/attendance
POST   /v1/webinar-sessions/{session_id}/attendance-imports
POST   /v1/webinar-registrations/{registration_id}/follow-ups
PATCH  /v1/follow-ups/{follow_up_id}
GET    /v1/webinar-sessions/{session_id}/export.csv
```

## Public booking API

```text
GET    /v1/public/webinars/{public_token}
POST   /v1/public/webinars/{public_token}/registrations
GET    /v1/public/registrations/{management_token}
POST   /v1/public/registrations/{management_token}/cancel
POST   /v1/public/registrations/{management_token}/reschedule
```

### Booking request

```json
{
  "session_id": "wbs_123",
  "full_name": "Siti Rahma",
  "email": "siti@example.com",
  "phone": "+6281234567890",
  "client_type": "teacher",
  "salesperson_reference": "sp_123",
  "source": "salesperson-link",
  "consent": true
}
```

### Booking response

```json
{
  "registration_id": "wbr_123",
  "status": "confirmed",
  "session": {
    "starts_at": "2026-09-10T03:00:00Z",
    "timezone": "Asia/Jakarta",
    "display_time": "10 September 2026, 10.00 WIB"
  },
  "notification_status": "pending",
  "management_url": "https://crm.example.com/r/opaque-token"
}
```

Error code stabil:

```text
SESSION_NOT_PUBLISHED
SESSION_FULL
DUPLICATE_REGISTRATION
SESSION_CANCELLED
INVALID_MANAGEMENT_TOKEN
RESCHEDULE_TARGET_FULL
VALIDATION_ERROR
RATE_LIMITED
```

## Attendance import

Upload CSV dilakukan dua tahap:

1. `preview`: parsing, column mapping, participant matching, serta error per row.
2. `commit`: hanya row valid yang diterapkan, dengan idempotency key per import batch.

Koreksi manual setelah import menyimpan nilai lama, nilai baru, actor, timestamp, dan reason.

## Notification job

Confirmation dan reminder adalah pekerjaan asynchronous internal. API tidak menunggu provider notification selesai; response booking mengembalikan `notification_status: pending`.

Retry hanya untuk transient failure. Alamat invalid atau opt-out menjadi permanent failure dan tidak dikirim berulang.

## Event/webhook opsional

Jika ada consumer internal yang sudah siap, CRM dapat menerbitkan:

| Event | Trigger | Data minimum |
|---|---|---|
| `webinar.registration.created` | Booking berhasil | registration, session, salesperson, source |
| `webinar.registration.cancelled` | Participant membatalkan | registration, session, reason |
| `webinar.attendee.attended` | Attendance dicatat | registration, participant, session, recorded_at |
| `webinar.attendee.no_show` | No-show dicatat | registration, participant, session |
| `webinar.follow_up.completed` | Follow-up selesai | registration, salesperson, outcome |

Event bersifat **optional extension**, bukan dependency untuk menyelesaikan MVP. Jangan membangun generic event platform bila belum ada consumer.

Jika webhook diaktifkan, envelope membawa `event_id`, `event_type`, `event_version`, `occurred_at`, `producer`, `correlation_id`, `subject`, dan `data`. Delivery menggunakan idempotency, signature, timeout, retry terbatas, dan audit status.

## Contract testing

- OpenAPI validation untuk public dan internal webinar endpoint.
- Test concurrent booking pada session dengan satu kursi tersisa.
- Test duplicate submit dan retry dengan idempotency key.
- Test cancel/reschedule terhadap capacity dan reminder.
- Test CSV preview/commit termasuk row invalid dan import ulang.
- Jika webhook diaktifkan, test signature, duplicate delivery, timeout, dan permanent failure.

