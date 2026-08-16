# Mentor Invitation and Validation Authority

## Status

Accepted implementation decision for the Mentor role pathway.

## Decision

Mentor access is not self-asserted and is not activated merely because a user selects `mentor` during signup.

A Mentor pathway has three distinct authority states:

1. **Invited** — a Scholar originates a Mentor invitation to a specific email address.
2. **Accepted / pending validation** — the authenticated invitee whose account email matches the invitation accepts. A pending Mentor relationship is created with no permissions.
3. **Validated / active** — the approval threshold is met and the relationship receives the canonical Mentor permission set.

## Validation threshold

A pending Mentor becomes validated when either condition is satisfied:

- One active Parent/Guardian or Coach in the Scholar's support system approves; or
- Two distinct active members of the Scholar's support system approve.

The two-supporter path may include any active support-system relationship except the pending Mentor being evaluated. Duplicate approvals by the same account count once. Inactive, removed, blocked, pending, or self approvals do not count.

A Coach approval is recognized only when an already active Coach relationship exists for the same Scholar. This decision does not independently create Coach authority or bypass the separate Coach verification contract.

## Permission boundary

Pending Mentor relationships receive an empty permission set.

After validation, the canonical Mentor permissions are:

- `view_progress`
- `recommend_actions`
- `support_tasks`

Mentors do not receive verified-record disclosure, evidence-verification authority, cohort access, institutional analytics, candidate-review authority, or ownership of the Scholar Record through this workflow.

## Data and transaction model

- `support_invitations` remains the Scholar-originated invitation record.
- `support_relationships` stores the pending or active Mentor relationship.
- `mentor_validation_requests` stores the durable validation state.
- `mentor_validation_approvals` stores one approval per distinct approver account.
- Invitation acceptance is atomic: the invitation is consumed only when the pending relationship and validation request are created successfully.
- Mentor activation is atomic: approval evidence is recorded, the current threshold is recomputed from active support relationships, and permissions are issued only when the threshold passes.

Invitation-supplied permissions are never trusted as authorization. The database assigns the canonical permission set.

## Independent onboarding pathway

Mentor signup, onboarding, validation, and operating-system access are a distinct role pathway:

`Mentor role selection → Mentor onboarding answers → Scholar invitation → invitee acceptance → support-system validation → Mentor record completion → /mentor-os`

Role selection may begin onboarding and preserve progress, but completion and Mentor OS access remain fail-closed until the invitation and validation authority requirements are satisfied.

## Correct destination behavior

- Accepted but unvalidated Mentor: `/pending?role=mentor&validation=required`
- Validated Mentor: `/mentor-os`

No other role destination may be used as a fallback.

## Security invariants

- Authentication is required for invitation claim and validation approval.
- Invitation email must match the authenticated account email before mutation.
- The Scholar owns the invitation origin.
- Only an active support relationship for the same Scholar may approve.
- The pending Mentor cannot approve their own validation.
- Approval identity is deduplicated by authenticated user ID.
- Removed or blocked supporters cease to count toward the threshold.
- Replay cannot create duplicate relationships or duplicate approvals.
- All unsupported role invitations remain fail-closed until their independent validation contracts exist.

## Non-goals

This workflow does not establish professional licensure, legal guardianship, background-check completion, employment status, or suitability for any high-impact decision. Those claims require separate verified evidence and governance.
