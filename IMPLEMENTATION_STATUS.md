# Implementation Status

Generated: 2026-07-21

## Status classification rules

- `Observed` means repository paths exist and were found by inspection.
- `Verified` means a command succeeded and supports the claim.
- `NOT VERIFIED` means evidence was incomplete, unavailable, or a command failed.

## Baseline verification

| Area | Status | Evidence |
| --- | --- | --- |
| TypeScript | Verified | `npx tsc --noEmit` exited `0`. |
| Unit tests | Verified | `timeout 180 npm test -- --reporter=dot` exited `0`; 88 files and 291 tests passed. |
| Build | NOT VERIFIED | `npm run build` exited `1`; failed collecting page data for `/api/notify-admin` due to missing Resend API key. |
| Lint | NOT VERIFIED | `npm run lint` exited `1`; 426 problems reported in captured output summary. |
| Governance chain | NOT VERIFIED | `docs/GOVERNANCE/GOVERNANCE_MANIFEST.md` was missing. |

## Subsystem status

| Subsystem | Status | Repository evidence | Verification evidence |
| --- | --- | --- | --- |
| Playbook/Scholar Record | Observed, NOT VERIFIED as canonical | `lib/playbook-record/index.ts`, `lib/playbook/record/index.ts`, `lib/portfolio/scholar-record.ts`, `lib/scholar/record.ts` | Tests include `tests/unit/scholar-record.test.ts`; full build failed. |
| Event Bus | Observed | `lib/events/bus.ts`, `lib/events/emit.ts`, `lib/events/types.ts`, `lib/events/register.ts`, `lib/events/handlers/*` | Tests include `tests/unit/events.test.ts` and `tests/unit/event-handlers.test.ts`; full test suite passed. |
| Engine/Repository pattern | Observed | `lib/engines/*`, `lib/repositories/*` | TypeScript passed; build failed after TypeScript. |
| Academic Intelligence | Observed | `lib/academic-intelligence/*`, `lib/engines/academic/academicEngine.ts` | Tests include academic intelligence and academic engine suites; full test suite passed. |
| Transcript Intelligence | Observed | `lib/academic-intelligence/transcript/*`, `app/api/parse-transcript/route.ts`, `app/transcript/page.tsx` | Tests include `tests/unit/academic/transcript-knowledge-graph.test.ts`; full test suite passed. |
| Trust Layer | Observed, NOT VERIFIED as canonical | `lib/trust/*`, `lib/engines/trust/trustEngine.ts`, `lib/playbook/trust/index.ts` | Tests include `tests/unit/trust-engine.test.ts`; full test suite passed. |
| Opportunity Engine / Graph | Observed, NOT VERIFIED as canonical | `lib/opportunities/*`, `lib/opportunity-graph/*`, `lib/engines/opportunities/opportunityEngine.ts`, `lib/playbook/opportunities/index.ts` | Tests include opportunity graph and marketplace suites; full test suite passed. |
| Compass | Observed, NOT VERIFIED as canonical | `lib/compass/*`, `lib/engines/compass/compassEngine.ts`, `lib/playbook/compass/index.ts` | Tests include `tests/unit/compass/compass-core.test.ts`; full test suite passed. |
| Resume support | Observed, NOT VERIFIED as dedicated Phase III engine | `lib/opportunity-toolkit/resumeBuilder.ts`, `lib/portfolio/services/resume.ts` | Tests include `tests/unit/opportunity-toolkit/opportunity-toolkit.test.tsx`; full test suite passed. |
| FAFSA Intelligence | NOT VERIFIED | No dedicated `lib/fafsa` or FAFSA engine path was found in inspected file map. | No FAFSA-specific test file was observed in `tests/`. |
| Athlete Intelligence | Observed | `lib/scholar-athlete/athleteIntelligence.ts`, `lib/scholar-athlete/eligibilityEngine.ts`, `lib/scholar-athlete/financialEngine.ts`, `lib/scholar-athlete/nilEngine.ts`, `lib/scholar-athlete/recruitingEngine.ts` | Tests include `tests/unit/scholar-athlete/scholar-athlete-os.test.tsx`; full test suite passed. |
| Notifications and mail | Observed, build NOT VERIFIED | `lib/notifications-v2/*`, `lib/notification-automation/*`, `lib/email/*`, `lib/mail-gateway/*`, `app/api/notify-admin/route.ts` | Build failed at `/api/notify-admin`; tests for notifications/mail passed within full suite. |
| Studio/tooling | Observed | `lib/studio/*`, `app/studio/*`, `lib/cartographer/*`, `lib/sentinel/*`, `lib/doc-governor/*`, `scripts/*` | Studio/tool tests passed within full suite; build still failed globally. |

## Completion statement

Repository implementation status is **partially verified**. TypeScript and tests are verified. Build, lint, governance-chain application, and Integration Matrix row status are **NOT VERIFIED**.

