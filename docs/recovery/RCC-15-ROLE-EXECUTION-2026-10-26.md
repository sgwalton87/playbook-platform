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

## Historical role matrix — c156ee1 (superseded)

At c156ee1, isolated run [40353496954](https://github.com/sgwalton87/playbook-platform/actions/runs/40353496954) executed 33 tests: 32 passed, 1 failed. All 15 actual signup/email/onboarding flows and 210 wrong-role completion API denials passed; District failed when visiting Athlete Abroad OS, before its profile/logout/return checks. Fourteen full browser journeys passed. All 15 private-profile RLS rows passed. This failure was repaired in the follow-up layout ordering change; passing reruns are recorded below. Pending PBOS/relationship/role authority is expected and is not privileged activation certification.

| Role | Canonical route | Browser journey | Profile RLS | Independent activation |
| --- | --- | --- | --- | --- |
| Scholar | /dashboard | PASS at c156ee1 | PASS at c156ee1 | PBOS pending |
| Scholar-Athlete | /scholar-athlete-os | PASS at c156ee1 | PASS at c156ee1 | PBOS pending |
| Transition-Aged Youth | /transition-youth-os | PASS at c156ee1 | PASS at c156ee1 | PBOS pending |
| Parent / Guardian | /family-os | PASS at c156ee1 | PASS at c156ee1 | Relationship gated |
| Mentor | /mentor-os | PASS at c156ee1 | PASS at c156ee1 | Relationship gated |
| Teacher / Educator | /educator-os | PASS at c156ee1 | PASS at c156ee1 | Authority pending |
| High School Counselor | /counselor-os | PASS at c156ee1 | PASS at c156ee1 | Authority pending |
| High School Coach | /coach-os | PASS at c156ee1 | PASS at c156ee1 | Authority pending |
| College Coach / Recruiter | /recruiting-os | PASS at c156ee1 | PASS at c156ee1 | Authority pending |
| College Admissions | /admissions-os | PASS at c156ee1 | PASS at c156ee1 | Authority pending |
| Brand Partner | /brand-partner-os | PASS at c156ee1 | PASS at c156ee1 | Authority pending |
| Employer | /employer-os | PASS at c156ee1 | PASS at c156ee1 | Authority pending |
| District Administrator | /district-os | FAIL — wrong-role Athlete Abroad URL; later checks not reached | PASS at c156ee1 | Authority pending |
| Athlete Abroad | /athlete-abroad-os | PASS at c156ee1 | PASS at c156ee1 | Authority pending |
| Community Partner | /community-partner-os | PASS at c156ee1 | PASS at c156ee1 | Authority pending |

## Verification so far

- Initial targeted route/transport tests: 20 passed (before outage additions).
- New behavioral outage route/transport tests: 19 passed.
- `npm audit --audit-level=high`: 0 vulnerabilities after lockfile update.
- Lint: 0 errors, two existing hook dependency warnings in unchanged files.
- Optimized production build: PASS locally. Exact-revision e95b716 CI validate and dependency audit: PASS; Vercel preview dpl_CzeSZMBZbL4AjruriASaMT3FyT9x READY.
- e95b716 isolated provisioning step: PASS, including own reads for 15 profiles, 210 cross-role private read/update targets, marker integrity and fixture cleanup. Browser phase pending Chromium installation at observation.
- Follow-up route repair: eight specialized verification OS pages previously rendered their verification UI on another role's URL (their APIs deny data). VerifiedRoleActivationBridge now mounts inside CanonicalRoleIdentityBoundary with explicit canonical role, so no verification UI or fetch starts before durable role and onboarding checks succeed. Matching-role authority workflow is unchanged.
- Expanded browser assertions also reject every other role's completion endpoint: 210 directed cross-role API requests expected HTTP 403. This does not certify all feature-specific endpoints.

## Release decision

NOT PRODUCTION READY. Do not merge or promote without founder approval. Require exact-revision CI, isolated browser and RLS evidence, real hosted isolated PBOS signed health/integration, per-feature cross-role authorization, complete field/mobile acceptance, constitutional role alignment, and rollback verification. Local SMTP receipt is not production email deliverability. Unit mocks are not live PBOS certification.

## Athlete Abroad gate-order repair

The layout previously mounted readiness before any role check; an unapproved wrong-role user never reached the page's identity gate. The layout now checks canonical identity and completed onboarding before readiness. Removed duplicate inner readiness and generic pending-authority gates from the page; the existing readiness gate still requires both readiness and jurisdiction approval before mounting the workspace. Tests reproduce District redirect before fetch and preserve all pending/rejected approval locks. No database or approval mutations.

## Exact-head desktop closure and responsive continuation

At 70c090f, [isolated run 40355822043](https://github.com/sgwalton87/playbook-platform/actions/runs/40355822043) passed 33/33 browser tests, all 15 core journeys, 210 foreign-profile read/update targets and 210 wrong-role completion requests. Disposable fixture cleanup passed. [CI 40355822452](https://github.com/sgwalton87/playbook-platform/actions/runs/40355822452) passed 1,046 tests, lint, TypeScript, build and dependency audit. This supersedes all earlier pending desktop statuses above. Trusted hosted tests were skipped, not passed.

The next isolated run adds the same 15 core journeys for the existing mobile (390 × 844) and tablet (834 × 1194) Chromium projects, with signup/profile horizontal-overflow checks. Each viewport gets fresh disposable accounts, local email verification, save/reload/logout/return login and negative role API assertions. Mobile/tablet results are pending until their actual jobs finish. These are responsive browser emulations, not physical-device or complete visual certification. Optional onboarding fields still require separate coverage. Production release remains on hold.

## Runner mail-port failure and full-field continuation

Responsive run [40448929570](https://github.com/sgwalton87/playbook-platform/actions/runs/40448929570) stopped before account provisioning or browser tests: localhost mail port 54324 was already occupied. Responsive steps were skipped, not failed application journeys. The workflow now checks and remaps all seven configured local Supabase ports to 55420–55426, passes the local mail URL to the test and leaves repository/hosted Supabase configuration unchanged. No existing process is terminated.

A separate full-field Chromium pass fills every configured onboarding field through its real widget, including select/multi-select, lists, activities and sport position; it verifies expected answers in the owned database row after completion and after profile editing/logout/return login. Supporter addresses are private planning values and no invitation/authority is requested. Avatar upload, physical devices, every option permutation and feature-specific permissions remain separate scope. Actual responsive/full-field results are pending a successful rerun.

## Responsive evidence and full-field selector repair

At fc70ba6, run40449257035 passed Family smoke (1), complete desktop (33), mobile (15) and tablet (15) tests. It again protected210 cross-role private-profile targets and removed15 provisioning fixtures. Exact-head CI40449256990 passed1,046 tests/lint/type/build/audit; Platform QA40449256915 passed.

Full-field mode failed: seven roles timed out at the new helper's exact `getByLabel` select query for Gender, Coach was interrupted by the15-minute step timeout, and seven later roles were not run. No full-field pass was claimed. Nested option text makes a raw implicit-label text query unsuitable; the helper now uses the select's accessible `combobox` role/name, matching existing component tests. Locators time out after15 seconds, and full-field mode runs first with `--max-failures=1` so a failure flushes a report promptly. This changes testing only; it does not loosen assertions or change application behavior. Retest is required.

The artifact action ran but uploaded no JSON because forced interruption prevented reporter completion. Job logs preserve the actual failure and preceding successful stages. No hosted configuration/schema, member data or production release changes.
