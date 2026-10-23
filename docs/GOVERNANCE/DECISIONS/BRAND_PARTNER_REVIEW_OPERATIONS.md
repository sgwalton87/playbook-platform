# Brand Partner review operations — interim founder / future administration

Status: IMPLEMENTATION CONTRACT — no elevated permissions granted by this document.
Tracking: RCC-BRAND-021, RCC-EXEC-022, PR #282.

## Notification routing
On first creation of an independently reviewable Brand Partner request:
- To: brandpartners@playbookseriesinc.org
- CC: stephishawalton@gmail.com, sycoywalton@playbookseriesinc.org
- Include only organization name, opaque request ID and pending status. Never include raw onboarding answers, personal records, secret links, or authority tokens.
- Email receipt does not confer reviewer authority. Notification failures must be observable and retryable without resubmitting or resetting approved applications.

## Executive review identity
Designate the already registered and verified owner of stephishawalton@gmail.com as the *intended* initial Founder Executive Reviewer, subject to explicit authenticated grant recorded in a server-side grants registry. An email match alone is insufficient. The second CC mailbox is a notification recipient, not a second executive identity automatically.

## Implement before approving requests
1. Server-side reviewer grants: unique authenticated user identity, grantor, authorized scope, status, timestamps, rationale; require verified login and stronger authentication suitable for sensitive review.
2. Independent organization, campaign and compliance approval actions and reasons. Preserve the existing three-condition approval gate; no self-approval, no applicant write access to approval fields.
3. Bound reviewer read endpoints: display only the evidence required to decide; enforce deny-by-default checks server-side. No general access to scholar records.
4. Durable review audit trail with decision, actor, time, before/after, scope, and request reference. Revocations and future team delegation must also be auditable.
5. Administrative inbox: pending/under-review/approved/rejected status, evidence review, requests for corrections, and approved scopes. Applicants should be able to edit their self-owned profile while their restricted operations remain gated.
6. Notification delivery through a durable outbox/idempotency mechanism. A single failed SMTP call should never lose a request, and repeated submission must not reset granted authority.
7. Automated tests: unauthenticated denial, non-reviewer denial, cross-organization denial, self-review denial, field-ownership/RLS, reviewer revocation, scope separation, audit events and notification idempotency.
8. Release requires exact-commit CI, hosted schema/RLS verification, preview mobile acceptance, founder authorization of initial grant and human-approved production release.

## Transition to future administration team
Allow scoped, revocable grants to named verified staff identities. Founder retains executive oversight and visibility. Do not hard-code an approval email as the long-term authorization mechanism. Any constitutional or privacy-policy change must follow the platform amendment and security review rules.

## Current limitations
PR #282 improves pending verification UX and adds a best-effort notification on first submission. It does not include an authenticated approval UI or grant executive authority. SMTP delivery, end-to-end application state and future-team delegation remain unverified.
