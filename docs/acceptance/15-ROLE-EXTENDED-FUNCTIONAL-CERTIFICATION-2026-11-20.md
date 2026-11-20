# 15-role extended functional acceptance — execution contract

Status: PROPOSED / NOT CERTIFIED
Date: 2026-11-20
Authority: PBOS-RCC-001; PPS-002, PPS-011, PPS-012, PPS-014
Historical baseline: docs/recovery/RCC-15-ROLE-EXECUTION-2026-10-26.md

## Purpose
Extend the previously proven isolated 15-role signup/email/onboarding/profile journeys into role-specific meaningful work, negative authorization, recoverability, accessibility and mobile behavior. This plan is not a passing test report or permission to operate against production.

## Environment boundary
- Run only on explicitly approved disposable localhost Supabase/App fixtures or a separately approved isolated hosted environment. Never provision synthetic identities in production.
- Capture immutable application commit, schema migration version, PBOS Core commit, test fixture manifest, browser viewport, logs and cleanup evidence.
- Never bypass hCaptcha, role verification, relationship consent, reviewer approval, or signed PBOS authority to obtain a PASS.
- Attribute failures to CONFIGURATION, AUTHENTICATION, CAPTCHA, ROLE, RELATIONSHIP, PBOS_TRANSPORT, PBOS_AUTHORITY, RLS, PRODUCT, ACCESSIBILITY or CLEANUP; missing evidence is BLOCKED, not PASS.
- Pending PBOS activation (HTTP 202) is a distinct valid saved-onboarding state, not active-platform certification.

## Shared acceptance steps (for every role)
1. Register via genuine form, confirm email by isolated mail, authenticate and complete canonical role selection.
2. Save required and optional onboarding fields; verify durable readback, refresh, logout, return login and authorization-safe session expiry.
3. Navigate directly to own role destination; deny every other role's protected destination and wrong-role completion endpoint.
4. Perform the *meaningful role action* in the matrix below through the actual UI/API; verify canonical persisted outcome after fresh login.
5. From a second isolated user, prove private resource denial; from authorized relationship or institution context, prove only explicitly scoped access.
6. Exercise pending/incomplete/declined/approved authority states as applicable, without inserting approval IDs or grants from tests.
7. Repeat at desktop, 390x844 mobile and 834x1194 tablet; verify no horizontal overflow, keyboard focus and screen-reader labels.
8. Verify audit/notification side effects where applicable and idempotent retry; clean fixtures and prove absence of leaked records.

## Role-specific extension matrix

| Role | Canonical destination | Meaningful work to certify | Negative/approval edge |
|---|---|---|---|
| Scholar | /dashboard | Scholar Record achievement and evidence upload/readback | Private draft not public; unrelated supporter denied |
| Scholar-Athlete | /scholar-athlete-os | Athletic activity, position and recruiting evidence persistence | Wrong recruiter and NIL-sensitive exposure denied |
| Transition-Aged Youth | /transition-youth-os | Goals, opportunity tracking and private progress | Unrelated parent/mentor denied |
| Parent / Guardian | /family-os | Authorized Scholar invitation and consent-aware view | No access before accepted relationship; expired/revoked invite |
| Mentor | /mentor-os | Relationship-bound mentor interaction and progress feedback | No target Scholar record without active approved relationship |
| Teacher / Educator | /educator-os | Institution-bounded student support workflow | Foreign institution and unapproved verification denied |
| High School Counselor | /counselor-os | Authorized academic guidance workflow | Non-assigned Scholar records denied |
| High School Coach | /coach-os | Approved athlete support/recommendation workflow | Unverified role and unrelated athlete denied |
| College Coach / Recruiter | /recruiting-os | Recruiter discovery and permitted contact intent | Private Scholar/athlete data denied without authority |
| College Admissions | /admissions-os | Approved admissions review workflow | Unauthorized institution and protected records denied |
| Brand Partner | /brand-partner-os | Partner profile/verification request and reviewer outcome | Unverified marketplace/publishing authority denied |
| Employer | /employer-os | Organization verification and permitted opportunity draft | Unapproved posting and private applicant access denied |
| District Administrator | /district-os | Verified district-scoped administration read/action | Athlete Abroad direct URL and foreign district denied |
| Athlete Abroad | /athlete-abroad-os | Enrollment/readiness evidence workflow | No workspace until both readiness and jurisdiction approval |
| Community Partner | /community-partner-os | Notification receipt and reviewer-evidence request flow | Requester-only receipt; no unrelated reviewer evidence |

The matrix names candidate observable contracts, **not** implemented or passing functions. Before automating each row, map the exact route, source handler, schema/RLS policy, fixture and expected result. If missing, open a product defect instead of mocking a green test.

## Certification reporting contract
Per role + viewport + action, emit: `repo_sha`, `schema_revision`, `pbos_sha`, `role`, `viewport`, `journey`, `test_status` (PASS/FAIL/BLOCKED/SKIPPED), `failure_class`, `evidence_uri`, `cleanup_status`. Count test attempts separately from passed journeys. Never aggregate a blocked test as success.

## Release blocking gates
- All role-specific positive and negative actions demonstrably pass at the *same* exact candidate revision.
- Hosted signed PBOS activation is independently accepted; pending activation is not a substitute.
- Email/OAuth, CAPTCHA, sensitive RLS, accessibility, rollback and security vulnerability findings have independent evidence.
- Founder/human release authorization is recorded before production promotion.

Next implementation: add a parametrized acceptance suite using the actual canonical role registry and isolated fixtures; wire role-specific handlers incrementally, not by widening permissions. Reference PR #288 only as historical recovery evidence.
