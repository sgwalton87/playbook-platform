# PR #282 — Release gate and rollback plan (October 23, 2026)

## Decision
**NOT APPROVED FOR PRODUCTION.** Draft implementation, no production deployment or privileged reviewer grant.

## Gate 1 — Exact-head automated checks
Require CI, Platform QA, Database Certification, Marketplace Applicant Certification, and Isolated Profile Recovery QA all pass against the same HEAD SHA. Passing an earlier commit does not satisfy the gate. Capture links to workflow runs and logs. Investigate any failures before promotion.

## Gate 2 — Isolated integration QA
Test on isolated Supabase branch or separate test instance, not production. Branch creation may incur charges and requires explicit approval. Apply all PR #282 migrations there in migration order. Assert:
- New verification inserts one pending outbox row atomically; failed transaction inserts neither.
- Repeat concurrent submissions do not overwrite approval and do not enqueue a second event.
- Privileged worker without configured secret, with incorrect secret, and from a normal user all fail closed.
- SMTP outage moves claimed row to failed with delayed next attempt; subsequent successful retry becomes sent.
- Two concurrent workers claim distinct jobs. Stale worker ack with old attempt_count cannot update later worker's lease.
- After SMTP provider success and DB acknowledgement failure, duplicates may occur; request ID is the dedupe reference.
- Eight failed attempts become exhausted and require human intervention.
- Email contains organization and request reference, no onboarding personal data or privileged approval token.
- Pending, approved, rejected and scope-specific states show correctly on mobile.

## Gate 3 — Environment and scheduling
Vercel environment inspection found SMTP_HOST/USER/PASS only in production, not preview; NEXT_PUBLIC_SUPABASE_URL and ANON_KEY in both. No BRAND_NOTIFICATION_WORKER_SECRET or SUPABASE_SERVICE_ROLE_KEY found in the Vercel project. **Do not copy production secrets into preview or paste them into chats.** Provision an isolated test database, separate test SMTP transport and its own test credentials; configure worker secret only in the server runtime. Set a trusted schedule to call POST /api/internal/brand-partner-notifications with Authorization: Bearer <server-only secret> every few minutes. Deploy alerts for oldest unsent age, failed/exhausted attempts, and unexpected worker 401/503. Ensure an on-call owner can triage.

## Gate 4 — Role security and mobile journey
Before approval grant: RLS must block applicant access to reviewer grants, audits, notification outbox and other users' requests. An unauthenticated user and unapproved applicant cannot view/admin approve. For a controlled test identity, bootstrap each reviewer scope by a separately approved privileged migration, and test scope denial, no self-approval, organization-first sequencing, audit immutability, revoked-grant failure. Test iOS/mobile signup → email verification → onboarding resume → submission → founder notification → organization review → campaign and compliance review → correctly scoped workspace → logout/login. Restore initial deny-all reviewer-grant posture after testing.

## Gate 5 — Controlled release and rollback
Automatic deployment of main is disabled by vercel.json; merging is NOT deployment. Founder approves production SHA, database migration list, env/security review, deploy destination, change window, smoke tests, and rollback owner in advance. Back up schema/data and capture migration history. Publish through an intentional Vercel production deployment, then verify production alias to the exact SHA and user journey. If failure: disable worker schedule and revoke reviewer grants immediately, roll back app deployment to the last verified revision, preserve notification outbox records (do not drop migration tables containing pending applications), replay only after resolution. Database rollback must be an additive, separately reviewed migration; do not blindly drop tables or historical audit events.

### Known blockers from live evidence
- Latest exact-head checks still pending when this note was drafted.
- No Supabase test branch exists; branch may have additional cost.
- Worker service-role key and worker secret missing from Vercel environment.
- SMTP variables only present in production.
- Worker scheduler and delivery monitoring unconfigured.
- New reviewer-grant/review-audit/meeting-preference tables absent from production.
- No live end-to-end founder approval run has been certified.

This document authorizes neither a production migration nor creation of privileged user grants.

## Isolated QA branch creation result — October 23, 2026
The founder explicitly approved the quoted $0.01344/hour branch charge, and Supabase confirmed that rate. However, `create_branch` returned `PaymentRequiredException: Branching is supported only on the Pro plan or above`. No branch was created. Do not treat the approved price as an upgraded-plan authorization. Alternative: provision a separately approved, isolated QA project or use disposable local PostgreSQL/Supabase test infrastructure; do not run experimental migrations against production. Gates 2 and 4 remain blocked for live database acceptance until an isolated environment exists.
