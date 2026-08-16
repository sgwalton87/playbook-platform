# Mentor Invitation & Support-System Validation Authority

Status: IMPLEMENTATION CANDIDATE / FAIL-CLOSED UNTIL MIGRATION AND EXACT-HEAD ACCEPTANCE

## Decision

A Mentor relationship must begin with a Scholar invitation. A mentor may accept that invitation, but acceptance alone does not activate access to the Scholar Record or support network.

After the invited mentor accepts, the relationship enters `pending_validation` and must satisfy one of these validation paths before active Mentor access is created:

1. **One validating approval from an active Parent / Guardian**, or
2. **One validating approval from an active Coach**, or
3. **Two validating approvals from two distinct active members of the Scholar's support system.**

The two-member path may include Parent / Guardian or Coach, but either of those roles already satisfies the single-validator path on its own.

## Scholar control

Only a Scholar-originated invitation may create a mentor-validation request. A mentor cannot self-enroll, discover a scholar and request access through this contract, or activate themselves without the required support-system validation.

## Mentor acceptance

The invited mentor must be authenticated and the JWT email must match the invitation email before the invitation can be accepted. Acceptance:

- consumes the mentor invitation;
- creates a durable `mentor_validation_requests` record;
- records the authenticated mentor account as the candidate;
- does **not** create an active `support_relationship`;
- returns a `pending_validation` activation state.

## Validator eligibility

A validator must already be an **active support relationship** for the same Scholar. The validator is identified by their authenticated user ID and the specific support-relationship row through which they hold authority.

A mentor candidate cannot approve their own request. One support-relationship row may contribute at most one approval to a given mentor-validation request.

The validator's relationship type is snapshotted at approval time for audit evidence, while threshold evaluation also requires the source relationship to remain active.

## Approval threshold

A mentor-validation request is approved when either condition is true:

- at least one valid approval comes from an active `parent_guardian` or `coach` relationship; or
- at least two valid approvals come from two distinct active support relationships for that Scholar.

No unverified public account, role selection, invitation metadata, profile self-description, or client-supplied role can satisfy the threshold.

## Activation

Once the threshold is satisfied, the invited mentor may finalize the validated relationship. Finalization creates exactly one active `mentor` support relationship tied to the original invitation and grants only the canonical Mentor permissions:

- `view_progress`
- `recommend_actions`
- `support_tasks`

The mentor does not receive evidence-verification authority, cohort access, institutional metrics, verified-record access, opportunity creation, or candidate-review authority through this contract.

## Audit model

The durable audit chain is:

Scholar invitation → authenticated mentor acceptance → mentor validation request → validator approvals → threshold satisfied → active mentor relationship.

Each approval preserves the approving support-relationship ID, approver user ID, relationship snapshot, timestamp, and request ID.

## Coach note

`coach` is recognized as a privileged validator relationship for this Mentor rule, but this decision does not itself create or certify the Coach relationship lifecycle. A Coach can validate a Mentor only when a separate governed process has already produced an active `coach` support relationship for that Scholar.

## External gates

This package is not production-certified until:

- the Family consent migration beneath it is verified;
- the Mentor validation migration is applied to the governed Supabase environment;
- negative tests prove mentor acceptance alone creates no Scholar access;
- negative tests prove an unrelated/non-support account cannot approve;
- one Parent/Guardian approval activates the threshold;
- one active Coach approval activates the threshold when such a governed Coach relationship exists;
- one ordinary support approval is insufficient;
- two distinct ordinary support approvals satisfy the threshold;
- exact-head browser acceptance proves the full Scholar → Mentor → Validator(s) → Mentor OS journey.
