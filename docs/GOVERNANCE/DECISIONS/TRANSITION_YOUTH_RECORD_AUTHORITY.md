# Transition-Aged Youth Record & Authority Decision

Status: PROPOSED IMPLEMENTATION / FAIL-CLOSED UNTIL PBOS APPROVALS AND ACCEPTANCE EVIDENCE

## Decision

Transition-Aged Youth (`transition-youth`) is a self-owned specialization of the canonical Scholar Record. It does not introduce a second learner record, organization-owned learner record, or cross-user access model.

PBOS role: `TRANSITION_YOUTH`.

Canonical durable record: the existing owner-scoped Scholar Record tables (`scholar_profiles`, `scholar_goals`, `scholar_milestones`, `scholar_dashboard_projections`).

Dashboard projection sections: `identity`, `goals`, `support`.

Operating System destination: `/transition-youth-os`.

## Authority

The authenticated user must be the owner of the record. Existing Scholar Record owner-scoped RLS remains authoritative. Transition-Aged Youth completion does not grant family, mentor, educator, employer, institution, or community-partner access.

The PBOS identity role must equal `TRANSITION_YOUTH` before durable persistence. Role mismatch fails closed before the Scholar Record is mutated.

Role-specific protected approvals are required:

- `PBOS_TRANSITION_YOUTH_IDENTITY_APPROVAL_ID`
- `PBOS_TRANSITION_YOUTH_EXCHANGE_APPROVAL_ID`

These values are server-only and must never be exposed through `NEXT_PUBLIC_*` configuration.

## Verification model

Transition-Aged Youth is not treated as an institutional authority role. The role is self-owned and therefore does not require employer, school, recruiter, coach, admissions, or partner verification merely to own its own Scholar Record.

Any later relationship that exposes the record to another person or organization must be governed by its own explicit consent, relationship, and least-privilege contract. This decision does not create those permissions.

## Data model

No TAY-specific learner table is introduced. TAY-specific life-context and support data remains part of the authenticated user's governed profile/onboarding data and can be projected into the Scholar Record only through accepted adapters.

This preserves the platform rule that learner identity, goals, milestones, evidence, and outcomes converge on one canonical Scholar Record.

## Completion contract

The completion path must prove:

1. Authenticated owner identity.
2. Durable `profiles.role` / `profile_mode` resolving to `transition-youth`.
3. PBOS identity registered as `TRANSITION_YOUTH`.
4. Role-specific identity and exchange approvals.
5. Owner-scoped Scholar Record persistence.
6. Idempotent onboarding milestone and goal persistence.
7. `identity + goals + support` dashboard projection.
8. Redirect to `/transition-youth-os`.
9. Anonymous and role-mismatch denial paths.
10. Exact-head browser acceptance before certification.

## Non-decisions

This decision does not authorize access for caregivers, mentors, educators, employers, agencies, schools, community partners, or case managers. It also does not create eligibility determinations, placement decisions, benefits decisions, or other high-impact decisions.

## Release gate

Implementation may be reviewed while approvals are unprovisioned, but the role remains fail-closed and must not be described as production-certified until the protected PBOS approval IDs exist and exact-head acceptance passes against the governed environment.
