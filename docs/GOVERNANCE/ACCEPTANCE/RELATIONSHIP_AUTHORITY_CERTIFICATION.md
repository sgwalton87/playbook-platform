# Relationship Authority Certification

## Purpose

Define the non-production certification sequence for the stacked onboarding, verification, support-relationship, revocation, and observability migrations.

## Live production baseline observed before certification

Connected project: Playbook OS (`oexgxnybeixwadgtdtzp`).

Observed baseline:

- Project status is healthy.
- No Supabase development branches exist.
- No migration history entries at or after `202608140001` exist.
- None of the new relationship/verification tables in this stack exist in production.
- Existing `support_relationships` is therefore the only live object from this domain baseline.

This document does not authorize direct production migration application.

## Certification environment requirement

The migration stack must first be applied to a Supabase development branch or equivalent governed non-production database.

Production is not an acceptable first execution environment.

## Post-migration preflight

Run:

`supabase/tests/relationship_authority_preflight.sql`

The preflight is read-only and ends with `ROLLBACK`.

It must pass before browser acceptance begins.

## Required object checks

The preflight validates:

- support invitation foundation;
- Mentor validation requests and approvals;
- Coach, Educator, Counselor, District, Recruiting, Admissions, Employer, Brand Partner, Community Partner, and Athlete Abroad verification/readiness tables;
- relationship revocation audit columns;
- invitation claim, Mentor validation, and revocation functions;
- participant RLS on canonical relationship and audit history;
- relationship-security trigger existence;
- private placement of the internal `SECURITY DEFINER` trigger helper;
- no direct authenticated write privileges to the append-only audit ledger.

## Browser acceptance matrix

### Onboarding finalization

For every visible role:

1. Complete final onboarding form.
2. Force a governed completion failure.
3. Verify `onboarding_completed=false` and resumable state.
4. Complete successfully.
5. Verify server-finalized completion and correct OS destination.

### Family

- Scholar-originated invitation only.
- Wrong email cannot claim.
- Correct Parent/Guardian claim activates only governed Family permissions.
- Revocation zeroes permissions and retains history.

### Mentor

- Scholar invitation required.
- Acceptance creates pending validation only.
- One active Parent/Guardian OR one verified active Coach OR two distinct active support members meets threshold.
- Mentor cannot self-approve.
- Activation creates only Mentor least-privilege permissions.
- Revocation removes access and preserves audit history.

### Coach

- Scholar invitation required.
- Unverified Coach claim fails without consuming invitation.
- Verified Coach claim creates active `coach` relationship with `permissions=[]`.
- That active relationship may count as the single Coach validator for Mentor validation.
- No Scholar data becomes visible from Coach relationship identity alone.

### Educator / Counselor / District / Recruiting / Admissions / Employer / Community Partner

For each exact role:

- Wrong durable role fails.
- Unverified role claim fails without consuming invitation.
- Approved verification claim creates exact relationship identity only.
- Created relationship has `permissions=[]`.
- Correct OS destination is preserved.
- Any future data capability requires a separate explicit permission contract.

Community Partner additionally requires approved service scope.

### Brand Partner

- Pending verification cannot enter the protected custom workspace.
- Organization, campaign, and compliance scopes must all be approved.
- Approved access preserves the existing Brand Partner OS design.

### Athlete Abroad

- Athlete retains self-owned record access while readiness is pending.
- Jurisdiction-sensitive workflows remain gated until readiness and jurisdiction scope are approved.

## Revocation acceptance

For at least one Family/Mentor relationship and one zero-data verified relationship:

- Scholar can revoke.
- Supporter can self-revoke.
- Unrelated user cannot revoke.
- Status changes to `removed`.
- Permissions become `[]` immediately.
- `ended_at`, `ended_by`, and optional reason persist.
- Repeated revocation is rejected.
- Historical relationship remains queryable to authorized participants.

## Observability acceptance

Verify exactly one expected event for each canonical transition:

- activation → `relationship.activated`;
- revocation → `relationship.revoked`;
- blocking → `relationship.blocked`;
- other status transition → `relationship.status_changed`;
- permission-only mutation → `relationship.permissions_changed`.

Verify:

- Scholar can view participant history.
- Connected supporter can view participant history.
- Unrelated authenticated user receives no rows.
- Authenticated clients cannot directly insert/update/delete audit events.
- Internal trigger helper is not present in `public`.

## Supabase advisor gate

After migrations and acceptance data are applied to the non-production branch:

1. Run Supabase security advisors.
2. Run Supabase performance advisors.
3. Classify findings as introduced by this stack vs. pre-existing baseline.
4. No new security warning introduced by this stack may remain unresolved at certification.

The current production baseline already contains unrelated pre-existing advisor findings. They must not be falsely attributed to this migration stack.

## Promotion gate

This stack is eligible for production promotion only when all of the following are true:

- exact-head repository CI is green for every stacked PR;
- non-production migration application succeeds in deterministic order;
- SQL preflight passes;
- browser acceptance matrix passes;
- security advisor diff introduces no unresolved security warning;
- required human/institutional verifier contracts are explicitly governed;
- migration evidence and acceptance evidence are preserved in the PR/release record.

Until then, the stack remains draft and production migration is blocked.
