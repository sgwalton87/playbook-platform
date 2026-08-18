# Messaging Report User Release Checklist

## Purpose

Record immutable-head certification and production closure evidence for Phase 7 Messaging Report User.

## Ownership

Playbook Platform Engineering, Trust & Safety, and PBOS.

## Last Updated

August 18, 2026.

## Related Documents

- `docs/ENGINEERING/MESSAGING_REPORT_USER_SPEC.md`
- `supabase/migrations/202608180101_messaging_report_user_authority.sql`
- `supabase/tests/messaging_report_user_preflight.sql`
- `.github/workflows/database-certification.yml`
- `docs/ENGINEERING/MESSAGING_BLOCK_USER_RELEASE.md`

## Release Scope

- Canonical profile-report cases in `moderation_reports`.
- Conversation and source-message evidence lineage without duplicated message content.
- Support and Network canonical-peer reporting.
- Group sender reporting through a source message.
- Direct profile-report insertion denial.
- Inline accessible Messaging report workflow.
- Moderator-only reported-user and source-message projection.
- Existing human Review, Resolve, and Dismiss decisions.

## Immutable Head Gates

Before merge, record and verify:

- [ ] Exact pull-request head SHA recorded.
- [ ] Dependency security audit passed.
- [ ] Lint passed.
- [ ] PBOS Audit Control passed.
- [ ] Full unit test suite passed.
- [ ] Production build passed.
- [ ] Full migration replay from zero passed.
- [ ] Messaging Report User behavioral preflight passed.
- [ ] All earlier database authority preflights passed.
- [ ] Exact-head Vercel preview is READY.

## Database Acceptance

The behavioral certification must prove:

- [ ] Anonymous report-table access is absent.
- [ ] Normal users have no generic UPDATE or DELETE authority.
- [ ] Existing non-profile report creation remains available.
- [ ] Profile reports require the governed Messaging RPC.
- [ ] Reporters cannot report themselves or unrelated users.
- [ ] Support and Network reports target the canonical peer.
- [ ] Group reports require another member's source message.
- [ ] Cross-conversation and wrong-sender evidence is denied.
- [ ] A canonical user block does not prevent an authorized safety report.
- [ ] Message content is not copied into report records.
- [ ] Conversation and message history remain unchanged.
- [ ] Reporter review-state mutation is denied.
- [ ] Non-moderators cannot read private evidence context.
- [ ] Founder/Admin moderators receive the bounded evidence projection.

## Production Closure

After guarded merge:

- [ ] Apply migration `messaging_report_user_authority` to Playbook production.
- [ ] Verify migration 101 appears in production migration history.
- [ ] Verify all pre-existing moderation report rows are preserved.
- [ ] Verify all pre-existing conversations and messages are preserved.
- [ ] Verify source lineage columns and foreign keys exist.
- [ ] Verify authenticated and anonymous grant surfaces match the certified model.
- [ ] Verify profile-report direct insertion remains denied by RLS.
- [ ] Verify public wrappers are SECURITY INVOKER and authenticated-only.
- [ ] Verify private authorities are SECURITY DEFINER with fixed search paths.
- [ ] Verify production contains no fabricated report case.
- [ ] Verify exact merge-commit Vercel deployment is READY in production.

## Release Decision

Report User may be marked production-green only when every immutable-head gate and production-closure item above is evidenced. Reporting shall remain separate from blocking and from human moderation outcomes.
