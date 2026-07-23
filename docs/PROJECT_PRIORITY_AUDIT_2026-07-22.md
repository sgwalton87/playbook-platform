# Project Priority Audit — 2026-07-22

## Decision

The next highest-value project task is **OR-008: Production Truth and Governance Gate**.

Do not begin another broad feature category before proving the combined identity → onboarding → permissions → OS → network → messaging system in a non-production review environment.

## Why this outranks another feature build

The platform now has substantial locally validated breadth:

- 14 canonical public roles
- 14 onboarding pathways and tutorials
- four learner OS projections with inherited Scholar capabilities
- ten distinct support/institutional/opportunity OS definitions
- role-aware navigation and relationship-permission mappings
- Starting Five role selection and invitation onboarding gate
- persisted support relationships, messages, events, and notifications
- authenticated product Inbox and Support Network surfaces
- passing local tests, TypeScript, and production compilation

The largest remaining risk is no longer missing interface breadth. It is the gap between local code and production truth:

- pending migrations have not been proven against a review database
- RLS allow/deny behavior has not been audited role by role
- no complete 14-role browser E2E matrix exists
- desktop/mobile critical journeys have not been recorded
- real invitation/email delivery and recovery are not release evidence
- agreement records, observability, accessibility, and failure recovery remain unproven

Building more features before closing this gate increases the amount of code resting on unverified authorization and persistence assumptions.

## OR-008 execution map

### 1. Review-environment database

- Apply every pending migration in order.
- Verify existing records survive schema changes and backfills.
- Validate invitation idempotency, required columns, indexes, and rollback/recovery.
- Record migration version and evidence.

### 2. Authorization and RLS matrix

- Define resources and actions for each canonical role.
- Test allowed access and explicit denial.
- Include cross-scholar isolation, inactive/pending relationships, mismatched invitation email, expired/reused token, institutional scope, and founder/admin boundaries.

### 3. Critical browser journeys

Automate:

- signup → role selection → onboarding → agreement → tutorial → correct OS
- interrupted onboarding → autosave/resume
- learner invitation → invitee account → invited-role onboarding → activation
- automatic welcome message → inviter notification → live Inbox
- unauthorized user → denied network/message/profile access
- logout/session expiry → protected-route recovery

Run the matrix for all 14 roles, with deeper invitation coverage for Family, Coach, Counselor, Educator, and Mentor.

### 4. Device and accessibility gates

- Desktop and mobile viewport runs for every critical journey
- keyboard-only onboarding and messaging
- focus visibility and error announcement
- reduced motion for confetti/tutorial transitions
- contrast, responsive overflow, and touch-target checks

### 5. Delivery and operations

- real verification, password-reset, and invitation email delivery
- token failure/expiry messaging
- agreement version/audit record verification
- error logging, monitoring, backup, and recovery evidence

## Ranked work after OR-008

1. **CORE-001 — Authentication release gate:** security, mobile auth, email verification/reset, session policy.
2. **CORE-002 — Public Playbook Record and privacy:** field-level visibility and canonical profile editing.
3. **CORE-003 — Network, messaging, and safety:** search, direct/group messaging, attachments, receipts, block/report, moderation.
4. **CORE-006 — Academic and recruiting workflows:** transcript parsing, applications, eligibility, recruiting, and NIL depth.
5. **CORE-005 — Learning, rewards, and credentials:** persisted completion, rewards, and certificates.
6. **CORE-004 — Feed, events, and moderation:** community expansion after identity, privacy, and safety are proven.

## Merge boundary

All current work remains on `agent/onboarding-premium-shell`. Nothing should merge to `main` until desktop review and explicit approval. Local-complete means built and locally validated; it does not mean production-complete.
