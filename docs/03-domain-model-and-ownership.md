# Domain Model dan Data Ownership

## Entity inti MVP

| Entity | Owner | Catatan |
|---|---|---|
| `crm_user` | CRM | Salesperson, manager, marketing/host, admin |
| `webinar_event` | CRM | Topik/template webinar yang dapat memiliki beberapa session |
| `webinar_session` | CRM | Jadwal konkret, timezone, host, capacity, meeting URL, status |
| `participant` | CRM | Data kontak minimum calon client untuk booking dan follow-up |
| `webinar_registration` | CRM | Booking participant ke satu session |
| `attendance_record` | CRM | Status kehadiran, source, actor, timestamp |
| `notification_job` | CRM | Confirmation/reminder/cancellation delivery dan retry |
| `follow_up_task` | CRM | Owner, due date, status, note, outcome |
| `audit_log` | CRM | Perubahan session, registration, attendance, dan ownership |
| `integration_delivery` | CRM, optional | Hanya dibuat jika event/webhook eksternal benar-benar diaktifkan |

Entity `voucher`, `voucher_redemption`, `opportunity`, `quotation_reference`, `commission_record`, order, dan payment tidak dibuat pada schema MVP.

## Model webinar session

```text
webinar_session
- id
- webinar_event_id
- public_token
- title_override (nullable)
- host_user_id
- starts_at_utc
- ends_at_utc
- timezone
- capacity
- meeting_url_encrypted
- status
- published_at (nullable)
- cancelled_at (nullable)
- cancellation_reason (nullable)
- created_at / updated_at
```

`starts_at_utc` dan `ends_at_utc` menjadi nilai perhitungan. `timezone` disimpan untuk display dan komunikasi kepada participant.

## Model participant dan registration

```text
participant
- id
- full_name
- email_normalized (nullable)
- phone_normalized (nullable)
- client_type (student_parent, teacher, school, other)
- consent_at
- created_at / updated_at
```

```text
webinar_registration
- id
- webinar_session_id
- participant_id
- salesperson_id
- source
- campaign_reference (nullable)
- status
- management_token_hash
- registered_at
- cancelled_at (nullable)
- rescheduled_from_registration_id (nullable)
- created_at / updated_at
```

Minimal unique constraint ditetapkan berdasarkan policy duplicate, misalnya session + normalized email. Bila email tidak wajib, gunakan kombinasi identifier kanal yang dipilih tim.

## Attendance dan follow-up

```text
attendance_record
- id
- registration_id
- status (unknown, attended, no_show)
- source (manual, csv, provider)
- recorded_by
- recorded_at
- import_batch_id (nullable)
- correction_reason (nullable)
```

```text
follow_up_task
- id
- registration_id
- owner_user_id
- status
- due_at (nullable)
- note (nullable)
- outcome (nullable)
- completed_at (nullable)
- created_at / updated_at
```

## Capacity invariant

Kursi terpakai adalah registration aktif pada session. Capacity check dan insert registration harus berada dalam satu transaction dengan row locking atau constraint/counter yang mencegah overbooking saat request concurrent.

Cancelled atau rescheduled registration tidak menghitung kapasitas. Perubahan capacity di bawah jumlah registration aktif harus ditolak atau membutuhkan prosedur operasional eksplisit.

## Data ownership dan external reference

- CRM menjadi sumber kebenaran untuk jadwal, booking, attendance, dan follow-up webinar.
- Webinar provider hanya menyediakan meeting link atau attendance source; provider bukan sumber kebenaran seluruh participant CRM.
- Existing platform tetap sumber kebenaran user dan entitlement, tetapi tidak perlu dipanggil dalam MVP.
- Billing tidak memiliki data pada workflow MVP.
- `platform_user_id` boleh ditambahkan kemudian setelah conversion, tetapi tidak menjadi field wajib saat booking.

## Future-compatible fields

Field `source`, `campaign_reference`, `salesperson_id`, stable `registration_id`, dan attendance status dipertahankan agar voucher atau conversion dapat ditambahkan sebagai consumer kemudian. Tidak ada table atau business rule voucher sebelum scope tersebut diaktifkan.

## Data minimization

- Simpan hanya data kontak yang dibutuhkan untuk komunikasi dan follow-up.
- Jangan menyalin password, session token, nilai akademik, isi pembelajaran, atau data murid massal.
- Meeting URL diperlakukan sebagai data sensitif dan tidak boleh tampil pada public session list tanpa management token yang sah.
- Retention dan deletion policy untuk participant yang tidak menjadi customer harus disepakati sebelum production launch.

