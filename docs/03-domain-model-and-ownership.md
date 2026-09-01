# Domain Model dan Data Ownership

## Entity inti CRM

| Entity | Owner | Catatan |
|---|---|---|
| `crm_user` | CRM | Pengguna internal: salesperson, manager, marketing, finance, operator |
| `lead` | CRM | Calon client sebelum menjadi account; source dan owner wajib ada |
| `contact` | CRM | Individu yang berinteraksi; simpan role bisnis seperti parent, teacher, principal |
| `commercial_account` | CRM | Account penjualan; dapat bertipe `individual` atau `school` |
| `sales_activity` | CRM | Call, note, email, WhatsApp, meeting, webinar interaction |
| `task` | CRM | Follow-up dan due date salesperson |
| `campaign` | CRM | Aturan marketing, webinar, voucher, dan attribution |
| `webinar_event` | CRM | Template/topik webinar |
| `webinar_session` | CRM | Jadwal konkret dan kapasitas |
| `webinar_registration` | CRM | Peserta dan attendance status |
| `voucher` | CRM/Voucher | Code hash, benefit, lifecycle, assignment, external references |
| `opportunity` | CRM | Pipeline sekolah atau conversion individu bernilai tinggi |
| `quotation_reference` | CRM + Billing | Metadata proposal; nominal final dimiliki order/billing |
| `commission_record` | CRM | Perhitungan attribution; payment/refund menjadi input eksternal |
| `integration_delivery` | CRM/Integration | Queue, attempt, status, next retry, last error |

## External references

CRM menyimpan ID eksternal berikut jika sudah tersedia:

```text
platform_user_id
platform_organization_id
platform_order_id
platform_subscription_id
billing_customer_id
billing_invoice_id
payment_transaction_id
```

Email, nomor telepon, dan nama bukan kunci integrasi utama. Perubahan data contact harus memiliki aturan merge dan conflict resolution.

## Voucher data model minimal

```text
voucher
- id
- code_hash
- code_last4
- campaign_id
- voucher_type (discount, trial, free_seat, extension, credit)
- benefit_config_json
- audience_type (individual, school, both)
- max_redemptions
- redemption_count
- valid_from
- valid_until
- status
- assigned_salesperson_id
- assigned_contact_id (nullable)
- assigned_account_id (nullable)
- reservation_id (nullable)
- redeemed_order_id (nullable)
- created_at / updated_at
```

```text
voucher_redemption
- id
- voucher_id
- order_id
- buyer_reference
- beneficiary_reference
- redeemed_at
- reversal_reason (nullable)
- idempotency_key
```

## Account model

### Individual

- `commercial_account.type = individual`
- `contact` menjadi buyer atau beneficiary.
- `platform_user_id` boleh kosong sebelum checkout berhasil.

### School

- `commercial_account.type = school`
- Simpan legal name, NPSN jika relevan, district/province, PIC, procurement stage, dan `platform_organization_id` setelah provisioning.
- Murid/guru tetap berada di platform; CRM cukup menyimpan aggregate atau count bila dibutuhkan untuk sales.

## Data minimization

CRM hanya menyimpan PII yang dibutuhkan untuk sales dan komunikasi. Jangan menyalin password, token sesi, nilai akademik, isi chat pembelajaran, atau data murid massal ke CRM.

