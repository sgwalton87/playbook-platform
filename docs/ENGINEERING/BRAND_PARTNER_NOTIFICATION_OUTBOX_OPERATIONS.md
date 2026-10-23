# RCC-BRAND-021: Brand Partner notification delivery operations

Draft implementation in PR #282. NOT deployed.

## Delivery model
- A PostgreSQL AFTER INSERT trigger records one outbox row in the same transaction as each new verification request. Transaction failure rolls back both.
- A privileged, authenticated worker claims the oldest eligible row, sends one email to brandpartners@playbookseriesinc.org and CCs stephishawalton@gmail.com and sycoywalton@playbookseriesinc.org, then records sent or failed and exponential retry.
- The worker does not authorize reviewers or grant any Brand Partner authority. Email recipients are notification-only.
- This is **at least once** transport: a crash after provider acceptance and before DB acknowledgement may duplicate an email. Request reference ID helps humans deduplicate. Exactly-once email transport cannot be guaranteed with SMTP.

## Prerequisites before merge/deploy
1. Review the SQL migration `202610230003_brand_partner_notification_outbox.sql` including definer privileges, locked claims, delayed retry and restricted RLS.
2. Provision a high-entropy `BRAND_NOTIFICATION_WORKER_SECRET` only on the trusted server and a verified `SUPABASE_SERVICE_ROLE_KEY` server-side only; never expose either under NEXT_PUBLIC.
3. Confirm `NEXT_PUBLIC_SUPABASE_URL`, SMTP_HOST, SMTP_USER, SMTP_PASS and sender configuration are present in the intended environment. Do not reveal secrets in logs.
4. Wire a trusted scheduler to POST `/api/internal/brand-partner-notifications` with `Authorization: Bearer <secret>` at a documented cadence. Do not expose worker secrets in URLs or browser clients. This PR does **not** configure a schedule, so no production delivery claim.
5. Test no request without authorization; expired/missing configuration fails closed; valid pending request delivered to all three recipients; SMTP failure leaves a retryable row; duplicate POST with no eligible item does not duplicate; concurrent claims lock; stale leases eventually retry; owner cannot read notification queue.
6. Operational monitoring: alert on failed/aged outbox records and excess attempts; document owner for manual response. Because no auto-scheduler and alerting exists in this PR, the release must remain blocked.
7. Preserve preexisting review/approval guards, mobile onboarding and profile navigation. Do not enable founder grants until separately certified.

## Backfill caveat
Notifications are enqueued for requests inserted **after** this migration. Existing requests are not backfilled automatically, to avoid unapproved replay. An operator must separately review any pre-migration requests.

## Rollout order
Code reviewed → migration tested on isolated branch → scheduler and worker secrets configured in preview → failure/retry tested → complete E2E and QA → governed production change with rollback plan.
