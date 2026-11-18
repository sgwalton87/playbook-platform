# Brand Partner Registration Persistence — Controlled Patch Release

**Status:** Candidate — not deployed or accepted in production  
**Prepared:** November 18, 2026  
**Owner:** Playbook OS Engineering  
**Release type:** Application patch, no database migration

## Problem and observed production evidence

An authenticated Brand Partner submitted business-verification evidence and saw a pending confirmation, but jurisdiction, entity type and safeguarding answers were blank when returning. Read-only production inspection of the affected account confirmed one pending `brand_partner_verification_requests` row, no `brand_partner_registration_details` row, and three privately retained business evidence objects. No private safety-answer values or document contents were read. An empty browser file chooser is expected after navigation; stored-document receipts are authoritative.

## Candidate change

- Add authenticated `PATCH /api/brand-verification` to save *fully validated* business registration and safeguarding declarations separately from submitting verification.
- Add **Save registration details**, a clear warning for existing pending requests without a saved registration, and a time-stamped success acknowledgment.
- Read saved declarations from existing owner-scoped registration-details table on subsequent page visits.
- Serialize registration saves and verification submissions using a client mutation lock and disabled fields/buttons during the save. Avoid stale registration writes clobbering a newer review submission.
- Retain existing private evidence objects and pending review authority. No application-side status or approval mutation is introduced.

## Security and privacy boundaries

- RLS enforces applicant ownership for the new UPSERT and read. This route obtains the owner only from authenticated session, never from a client-supplied user ID.
- Only completed Brand Partner onboarding can save, and approved requests cannot self-edit. All five safety questions and explicit safeguarding acknowledgement are required.
- No email invitation, admin approval, SMS, third-party lookup, role elevation, document deletion or migration is triggered by an independent save.
- Content responses are no-store/private. Sensitive safeguarding responses are not added to query parameters, logs, analytics, or public profiles.

## Candidate verification

Required checks before release:
1. `npm ci`, `npm run lint`, full tests including `brand-registration-persistence` and `brand-registration-return-login`, PBOS audit and `npm run build`.
2. Full dependency security audit at existing CI threshold; review any residual moderate findings separately.
3. Responsive Platform QA, safe preview deployment with exact candidate SHA, and review of open PR comments.
4. Vercel environment settings and Supabase RLS/schema compatibility checks; no new schema required.
5. Check approved PR, confirmed previous known-good production deployment identity, and monitored rollback path.

## Production acceptance (not yet performed)

With the original Brand Partner's own session on `app.playbookseriesinc.org`: complete and save declarations without resubmitting. Verify `brand_partner_registration_details` exists for that owner, the request status remains `pending`, and the count of private evidence objects is unchanged. Sign out and return with the same account; confirm formation state and entity type are restored and existing evidence receipts display. The applicant must supply their own safety answers; never fabricate them or create a synthetic production account.

## Rollback

If post-release acceptance fails, restore the preceding known-good Vercel production deployment and stop new registration saves; do not delete `brand_partner_registration_details` or private evidence objects. Since there is no schema migration and the new PATCH is additive, rolling back application code does not require destructive database changes. Preserve failed-request observations and review them with the release owner before another promotion.

## Known limitations

- Previously missing registration answers cannot be reconstructed from an upload success message or stored evidence documents.
- Empty file chooser controls after navigation are browser security behavior, not proof of lost documents.
- A save is distinct from submission and does not grant organization, campaign, or compliance approval.

## Related

- [PR #300](https://github.com/sgwalton87/playbook-platform/pull/300)
- [Security issue #295](https://github.com/sgwalton87/playbook-platform/issues/295)
- [Architecture contract](../ARCHITECTURE.md#brand-partner-registration-save-api--november-18-2026)
- [Release process](../RELEASE_PROCESS.md)
