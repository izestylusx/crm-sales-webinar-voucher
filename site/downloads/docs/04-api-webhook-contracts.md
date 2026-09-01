# API dan Webhook Contracts

## Konvensi umum

- Base path: `/v1`.
- Format: JSON UTF-8.
- Auth service-to-service: OAuth2 client credentials atau mTLS; API key hanya untuk provider yang belum mendukung OAuth.
- Semua mutating request menerima `Idempotency-Key`.
- Semua response menyertakan `request_id`.
- Pagination untuk list menggunakan cursor.
- Timestamp memakai ISO-8601 UTC.

## CRM API untuk frontend internal

```text
GET    /v1/me/dashboard
GET    /v1/leads?owner_id=&stage=&cursor=
POST   /v1/leads
PATCH  /v1/leads/{lead_id}
POST   /v1/leads/{lead_id}/convert
GET    /v1/webinars?status=&from=&to=
POST   /v1/webinars/{webinar_id}/sessions
POST   /v1/webinar-sessions/{session_id}/registrations
POST   /v1/webinar-registrations/{registration_id}/attendance
POST   /v1/campaigns
POST   /v1/campaigns/{campaign_id}/vouchers/issue
GET    /v1/vouchers?status=&campaign_id=&owner_id=
POST   /v1/vouchers/validate
POST   /v1/vouchers/{voucher_id}/reserve
POST   /v1/vouchers/{voucher_id}/redeem
POST   /v1/opportunities
PATCH  /v1/opportunities/{opportunity_id}
GET    /v1/integrations/deliveries?status=&event_type=
POST   /v1/integrations/deliveries/{delivery_id}/retry
```

## Voucher validation

Request:

```json
{
  "voucher_code": "EDU-XXXX-XXXX",
  "buyer_type": "individual",
  "product_id": "ai-learning-basic",
  "quantity": 1,
  "platform_user_id": "usr_123",
  "platform_organization_id": null
}
```

Response:

```json
{
  "valid": true,
  "voucher_id": "vch_123",
  "campaign_id": "cmp_123",
  "benefit": {
    "type": "percentage_discount",
    "value": 20,
    "currency": "IDR"
  },
  "reservation_required": true,
  "expires_at": "2026-09-01T10:15:00Z",
  "restrictions": []
}
```

Invalid voucher response menggunakan error code stabil, misalnya `VOUCHER_EXPIRED`, `VOUCHER_ALREADY_REDEEMED`, `VOUCHER_PRODUCT_NOT_ELIGIBLE`, atau `VOUCHER_ACCOUNT_MISMATCH`.

## Webhook receiver

CRM menyediakan endpoint private untuk event dari platform/billing:

```text
POST /v1/webhooks/platform
POST /v1/webhooks/billing
```

Header minimum:

```text
X-Event-Id: evt_123
X-Event-Type: payment.paid
X-Event-Version: 1
X-Signature: sha256=...
X-Correlation-Id: cor_123
```

Receiver harus:

1. Memverifikasi signature dan timestamp tolerance.
2. Menyimpan event ID sebelum memproses side effect.
3. Mengembalikan HTTP 2xx setelah event aman di-queue, bukan setelah seluruh workflow selesai.
4. Menjalankan consumer idempotent.
5. Mengirim event bermasalah ke dead-letter queue setelah retry budget habis.

## Event penting dan consumer

| Event | Producer | Consumer | Side effect |
|---|---|---|---|
| `webinar.attendee.attended` | CRM/webinar adapter | Voucher | Evaluasi eligibility dan issue voucher |
| `voucher.issued` | CRM | Notification, reporting | Kirim redeem link dan update funnel |
| `voucher.redeemed` | CRM/platform | CRM, commission | Catat conversion candidate |
| `order.created` | Platform/order | CRM | Link order ke contact/opportunity |
| `payment.paid` | Billing | Platform, CRM | Redeem final, activate, mark conversion |
| `payment.failed` | Billing | CRM | Follow-up task dan status pending |
| `payment.refunded` | Billing | CRM, commission | Reversal/hold commission sesuai policy |
| `subscription.activated` | Platform | CRM | Update customer stage dan onboarding |
| `school.provisioned` | Platform | CRM | Link organization dan mark provisioning complete |

## Event ordering dan consistency

Event dapat datang terlambat atau out of order. Consumer memeriksa `occurred_at`, entity version, dan state transition yang valid. Jangan mengandalkan urutan network delivery sebagai sumber kebenaran.

## Contract testing

- OpenAPI validation pada CI.
- Consumer-driven contract untuk CRM <-> platform dan CRM <-> billing.
- Fixture event untuk duplicate delivery, delayed event, refund, zero-value order, dan partial failure.

