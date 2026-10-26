# RCC 15-role recovery execution — 2026-10-26

Purpose: record reproducible evidence for RCC-OS-014, RCC-ONB-015 and BUG-001.
Owner: Playbook OS Engineering. Last updated: 2026-10-26.
Single source of truth: [PBOS-RCC-001](https://docs.google.com/spreadsheets/d/12ALDMBbQOPIT9lGSzT-RfqY5S_TMdtPO4Wwi00Xo0kI/edit).
Related: [PR #288](https://github.com/sgwalton87/playbook-platform/pull/288), [PPS-012](../PPS/PPS-012_SECURITY_AND_PERMISSIONS.md).

## Reconciled baseline

- PR #288 initial SHA f0dbaf168dc42c8867752d4f765d0a1097bf7789: validate and public browser QA passed; dependency audit failed (Zod <4.6.6); trusted hosted E2E skipped. The isolated recovery workflow did not trigger for the original source-test path.
- Vercel preview dpl_AfVzjpAPhXDoPVqe84G1xXncdYiB was READY at that SHA. Production remains d46fe845bc43fbb8785e562e9e21f856582d1b55, deployment dpl_8zPMMYVugzTSEufBqsBLggLpMPwV. READY does not certify a user journey.
- Supabase Playbook OS is ACTIVE_HEALTHY. Branch discovery returned only main; no hosted isolated database was established. Existing synthetic profiles are ephemeral CI fixtures, created and removed on each disposable localhost Supabase runner.
- PBOS-CORE main b1cece27e1d1947195764ee104447ac4105112ba; production connector authority remains blocked per QA-082–085. This change does not issue authority, reuse staging credentials, or provision production services.

## Repairs and test scope

- Distinguish network/timeout/HTTP 502, 503, 504 PBOS outages from authorization, role, protocol and persistence failures. Only a typed transport outage permits governed self-owned onboarding completion with HTTP 202 and `pending-pbos-activation`. No PBOS authority or privileged projection is fabricated. Retry keeps the same user/role idempotency key.
- Preserve fail-closed behavior for denial, wrong-role identity, correlation mismatch, and database errors. Behavioral route tests reproduce outage/retry and check the governed RPC boundary.
- Upgrade only locked transitive Zod from 4.4.3 to 4.6.7. No production configuration or schema changes.
- Trigger isolated CI for role registry, onboarding API, PBOS connector, and onboarding unit changes.
- Each canonical role now has an independent browser test: actual registration form and test CAPTCHA → local confirmation email → verification callback → optional onboarding steps → safety agreement → 202 pending authority → canonical route → reload → wrong-role route denial → profile edit/save/readback/reload → logout → protected route rejection → return login → persisted profile.
- Optional onboarding questions are skipped after first/last name. This does not certify every field widget or mobile fidelity.
- Disposable profile provisioning additionally signs in all 15 ordinary users, checks own private answers, denies reads/updates targeting all 14 other profiles, and independently verifies all original private markers remain intact. This covers profile RLS only, not every feature's data model.

## Role matrix

Browser and data results below must be updated from actual execution. PENDING means not certified.

| Role | Canonical route | Browser journey | Profile RLS | Independent activation |
| --- | --- | --- | --- | --- |
| Scholar | /dashboard | PENDING | PENDING | PBOS pending |
| Scholar-Athlete | /scholar-athlete-os | PENDING | PENDING | PBOS pending |
| Transition-Aged Youth | /transition-youth-os | PENDING | PENDING | PBOS pending |
| Parent / Guardian | /family-os | PENDING | PENDING | Relationship gated |
| Mentor | /mentor-os | PENDING | PENDING | Relationship gated |
| Teacher / Educator | /educator-os | PENDING | PENDING | Authority pending |
| High School Counselor | /counselor-os | PENDING | PENDING | Authority pending |
| High School Coach | /coach-os | PENDING | PENDING | Authority pending |
| College Coach / Recruiter | /recruiting-os | PENDING | PENDING | Authority pending |
| College Admissions | /admissions-os | PENDING | PENDING | Authority pending |
| Brand Partner | /brand-partner-os | PENDING | PENDING | Authority pending |
| Employer | /employer-os | PENDING | PENDING | Authority pending |
| District Administrator | /district-os | PENDING | PENDING | Authority pending |
| Athlete Abroad | /athlete-abroad-os | PENDING | PENDING | Authority pending |
| Community Partner | /community-partner-os | PENDING | PENDING | Authority pending |

## Verification so far

- Initial targeted route/transport tests: 20 passed (before outage additions).
- New behavioral outage route/transport tests: 19 passed.
- `npm audit --audit-level=high`: 0 vulnerabilities after lockfile update.
- Lint: 0 errors, two existing hook dependency warnings in unchanged files.
- Full test/build and 15-role isolated browser execution: pending at commit preparation.

## Release decision

NOT PRODUCTION READY. Do not merge or promote without founder approval. Require exact-revision CI, isolated browser and RLS evidence, real hosted isolated PBOS signed health/integration, per-feature cross-role authorization, complete field/mobile acceptance, constitutional role alignment, and rollback verification. Local SMTP receipt is not production email deliverability. Unit mocks are not live PBOS certification.
