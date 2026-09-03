# ADR-003: Webinar-first MVP dan Penundaan Voucher

## Status

Accepted.

## Context

Rancangan awal mencakup CRM sales yang luas: webinar, voucher, payment handoff, conversion individu, opportunity sekolah/BOS, dan commission. Request terbaru tim internal menetapkan bahwa delivery MVP harus fokus pada webinar terlebih dahulu, sementara voucher management dipending.

## Decision

MVP hanya mencakup:

- webinar event dan session
- public booking
- capacity dan duplicate control
- confirmation, cancellation, reschedule, dan reminder
- attendance manual/CSV
- participant list dan export
- follow-up task/note salesperson
- security, audit, observability, dan operasi yang dibutuhkan flow tersebut

Voucher, payment, subscription activation, school/BOS opportunity, dan commission adalah post-MVP tanpa tanggal delivery pada baseline ini.

## Rationale

- Webinar adalah kebutuhan internal paling mendesak dan dapat memberi nilai mandiri.
- Scope lebih kecil mengurangi dependency pada platform serta billing.
- Tim dapat belajar dari registration, attendance, dan follow-up sebelum menentukan aturan voucher.
- Data inti webinar tetap dapat menjadi input fase berikutnya.

## Consequences

Positif:

- Waktu menuju MVP lebih singkat.
- Acceptance criteria lebih jelas.
- Risiko integrasi dan financial workflow berkurang.
- Salesperson mendapatkan workflow end-to-end yang dapat digunakan tanpa menunggu modul lain.

Trade-off:

- Conversion dan revenue attribution belum otomatis.
- Handoff setelah follow-up masih manual atau melalui export.
- Dokumen lama tentang voucher/payment menjadi referensi masa depan, bukan baseline aktif.

## Future compatibility guardrails

- Registration memakai stable ID.
- Simpan `salesperson_id`, `source`, dan optional `campaign_reference`.
- Attendance transition memiliki audit trail.
- Event `webinar.attendee.attended` boleh ditambahkan saat consumer nyata tersedia.
- Jangan membangun voucher table atau endpoint sebelum scope post-MVP disetujui.

