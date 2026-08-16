# Relationship Default-Deny Authority

## Decision

A support relationship is evidence of identity, consent, and connection. It is not automatically a grant of role authority.

Shared relationship defaults must never bypass independent Operating System verification and scope contracts.

## Governed exceptions

The following relationship permissions remain active because their activation contracts are already explicitly governed:

- `parent_guardian`: `view_progress`, `view_deadlines`, `support_tasks`
- `mentor`: `view_progress`, `recommend_actions`, `support_tasks`

## Default-deny external relationships

The following relationship identities carry zero data permissions until an independent authority contract explicitly activates capabilities:

- Educator
- Coach
- District Administrator
- University Partner
- Employer Partner

This means relationship existence alone cannot grant Scholar Record access, cohort access, evidence verification, recruiting access, candidate review, opportunity creation, or recommendation authority.

## Rationale

The role-specific verification work establishes separate identity, scope, and relationship requirements. Legacy relationship defaults that pre-grant permissions would allow shared invitation code to bypass those gates.

The platform therefore treats relationship identity as one proof in the authority chain, not the final permission source.

## PBOS release rule

Any future relationship permission must identify:

1. the role verification contract that authorizes it;
2. the relationship/scope evidence required;
3. the exact permission set;
4. the revocation path; and
5. acceptance evidence proving no broader access is possible.
