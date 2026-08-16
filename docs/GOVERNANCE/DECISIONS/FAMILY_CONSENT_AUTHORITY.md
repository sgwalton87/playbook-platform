# Family Consent & Scholar Relationship Authority

Status: IMPLEMENTATION CANDIDATE / FAIL-CLOSED UNTIL MIGRATION AND EXACT-HEAD ACCEPTANCE

## Decision

A Parent / Guardian (`family`) owns their own Playbook identity but does not gain access to a Scholar Record merely by selecting the Family role or entering a scholar name/email during onboarding.

Scholar access is created only by a durable scholar-originated `parent_guardian` invitation that is accepted by the authenticated account whose verified session email matches the invitation email.

## Consent authority

The scholar is the relationship grantor. The family member is the relationship acceptor. Both acts must be durable and attributable.

A valid relationship requires:

1. An authenticated scholar creates the invitation under owner-scoped RLS.
2. The invitation records the intended invitee email, relationship kind, permission snapshot, destination, and cryptographically random token.
3. A signed-in invitee claims that token.
4. The JWT email must match the invitation email before any mutation occurs.
5. Acceptance atomically creates one active support relationship and consumes the invitation.
6. Decline atomically consumes the invitation without creating access.
7. Replays and already-consumed invitations fail closed.

## Least privilege

`parent_guardian` grants only the existing canonical permissions:

- `view_progress`
- `view_deadlines`
- `support_tasks`

It does not grant `view_verified_record`, evidence verification, recommendation authority, cohort access, institutional metrics, opportunity creation, or candidate review.

## Record model

The Family user does not own the scholar's Scholar Record. `support_relationships.scholar_id` continues to identify the scholar owner and `supporter_id` identifies the authenticated family account.

Routing is not duplicated into the relationship row. The durable relationship stores authority and permissions; destination remains invitation/role-routing state.

## Atomic claim

`claim_support_invitation` is the sole new claim primitive introduced by this package. It executes inside PostgreSQL, locks the invitation row, validates authenticated identity/email, creates the relationship when accepted, and updates invitation state in the same transaction.

The function is executable only by `authenticated` users and explicitly checks `auth.uid()` and the JWT email even though it uses `SECURITY DEFINER` to perform the atomic cross-table mutation.

## External gates

This package is not production-certified until:

- `202608150001_atomic_support_invitation_claim.sql` is applied and verified in the governed Supabase environment.
- Negative authorization evidence proves an unrelated authenticated email cannot consume an invitation.
- Exact-head acceptance proves the intended family account can accept and receives only the `parent_guardian` permission set.
- Revocation/removal semantics are separately certified before Family is considered an end-to-end complete role journey.

## Non-decisions

This decision does not infer legal guardianship, custody, educational rights, age-of-majority rights, or authority to make decisions on behalf of a scholar. It governs only Playbook application access created by explicit in-product scholar invitation and invitee acceptance.
