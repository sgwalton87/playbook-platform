# Institutional Role Verification Authority

Status: IMPLEMENTATION CANDIDATE / FAIL-CLOSED UNTIL GOVERNED DATABASE MIGRATION AND REVIEW WORKFLOW

## Scope

This decision governs three independent Playbook role pathways that may reuse verification infrastructure but must never share role authority:

- `educator` → Educator OS (`/educator-os`)
- `high-school-counselor` → Counselor OS (`/counselor-os`)
- `coach` → High School Coach OS (`/coach-os`)

Shared tables and review tooling are infrastructure only. An approval is always bound to exactly one requested role.

## Core rule

Completing an institutional onboarding form does not activate institutional authority. It creates a verification request and routes the user to a role-aware pending state.

A user may not self-approve through `profiles.verification_status`, client metadata, onboarding answers, or role selection.

## Evidence by role

### Educator
Required request evidence:
- school or organization;
- district when supplied;
- official educator/school email;
- subjects/support scope from Educator onboarding.

Approval authorizes only the Educator role and its own future relationship contracts. It does not create automatic access to any Scholar Record or roster.

### High School Counselor
Required request evidence:
- school;
- district when supplied;
- official institutional email;
- counselor support scope from Counselor onboarding.

Approval authorizes only the Counselor role. Scholar access still requires a separate governed roster/relationship contract.

### High School Coach
Required request evidence:
- high school;
- school city/state when supplied;
- official school email;
- sport/coaching role/team context from Coach onboarding.

Approval authorizes only the High School Coach role. It does not automatically connect athletes or create roster authority. Coach eligibility to validate Mentor candidates requires a separately active Coach-to-Scholar support relationship.

## Profile authority hardening

The current profile model is user-owned for general profile editing. Verification status is different: it is an authority field.

Authenticated self-service writes may perform only the email-confirmation transition required by signup:

`email_pending → email_confirmed`

A user may not self-write `approved` or `rejected` and may not alter `verification_expires_at` to manufacture verification evidence.

Privileged service/admin review remains responsible for approved/rejected transitions.

## Verification request model

`role_verification_requests` stores:
- authenticated user ID;
- exact canonical requested role;
- official email supplied during onboarding;
- organization/school label;
- role-specific evidence snapshot;
- status (`pending`, `approved`, `rejected`, `expired`);
- review timestamps, reviewer identity, and review notes.

A user may create and read their own request. They may not approve, reject, or rewrite review evidence after submission.

## Independent completion contract

Each role remains independently addressable through its canonical endpoint:

- `/api/pbos/onboarding/educator`
- `/api/pbos/onboarding/high-school-counselor`
- `/api/pbos/onboarding/coach`

Submission must verify the endpoint role equals the authenticated durable profile role.

Successful submission returns `pending_verification` and `/pending`. The user reaches the role's own OS only after a privileged approval changes verification truth; `/pending` resolves the durable role through the canonical registry and redirects to that exact OS.

## Non-decisions

This package does not yet define:
- scholar roster assignment;
- counselor caseload assignment;
- educator classroom/cohort assignment;
- coach athlete roster assignment;
- evidence verification rights;
- recommendation authority over a specific scholar;
- district or institution administrator delegation.

Those are separate relationship/authority contracts and remain fail-closed.
