# Security, Observability, dan Operasi

## Security baseline

### Identity dan authorization

- SSO/OIDC untuk pengguna internal jika identity provider perusahaan tersedia.
- RBAC minimum: `salesperson`, `sales_manager`, `marketing`, `finance_viewer`, `integration_operator`, `crm_admin`.
- Row-level scope: salesperson hanya melihat lead/account miliknya atau yang dibagikan ke tim.
- Approval diperlukan untuk diskon di atas threshold, revoke voucher redeemed, dan perubahan owner opportunity.

### Data protection

- Simpan password hanya di platform identity; CRM tidak pernah menerima password.
- Encrypt data in transit dan at rest.
- Hash voucher code; `code_last4` hanya untuk pencarian operasional.
- Redact PII di log dan dashboard operational.
- Retention policy untuk lead tidak aktif, booking, dan audit log.

### API protection

- Signature verification untuk webhook.
- OAuth scopes atau mTLS untuk service-to-service.
- Rate limit public booking, voucher validation, dan resend notification.
- Input validation dan allowlist untuk `product_id`, voucher type, dan event type.
- Idempotency key wajib untuk issue, reserve, redeem, convert, dan provisioning request.

## Observability

### Log terstruktur

Field minimum:

```text
timestamp
level
service
request_id
correlation_id
event_id
actor_id
entity_type
entity_id
outcome
error_code
```

### Metrics bisnis

- Webinar registration, attendance, no-show rate.
- Voucher issued, delivered, reserved, redeemed, expired, revoked.
- Conversion rate attendee -> voucher -> paid.
- Individual payment success rate.
- School opportunity aging per stage.
- BOS/procurement cycle time.
- Commission pending, eligible, reversed.

### Metrics teknis

- API latency p50/p95/p99.
- Webhook delivery success, retry count, dead-letter count.
- Queue lag dan outbox backlog.
- Duplicate event rate.
- Platform/billing dependency error rate.
- Database connection pool dan slow query count.

## Reliability patterns

- Transactional outbox untuk event yang berasal dari perubahan CRM.
- Retry exponential backoff dengan jitter; jangan retry error 4xx permanen.
- Circuit breaker untuk call platform/billing yang gagal beruntun.
- Timeout per dependency dan bulkhead untuk worker.
- Replay event dari outbox atau dead-letter queue setelah perbaikan.
- Reconciliation job harian untuk membandingkan order/payment/subscription yang terkait voucher.

## Incident dan recovery

Runbook minimum:

1. Webhook billing tertahan.
2. Voucher berhasil dibayar tetapi belum redeemed.
3. Subscription aktif tetapi CRM belum menerima event.
4. Duplicate redemption atau duplicate activation.
5. Booking spam atau voucher enumeration.

Setiap runbook mencantumkan indikator, query/dashboard, tindakan aman, dan cara melakukan replay idempotent.

