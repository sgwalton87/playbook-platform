# Gap Analysis

Generated: 2026-07-21

## Scope

This gap analysis reports only inspection findings. It does not recommend implementation.

## Verification baseline

| Check | Status | Objective evidence |
| --- | --- | --- |
| Governance manifest read | NOT VERIFIED | `cat docs/GOVERNANCE/GOVERNANCE_MANIFEST.md` failed with `No such file or directory`. |
| TypeScript compilation | Verified | `npx tsc --noEmit` exited `0`. |
| Build | NOT VERIFIED | `npm run build` exited `1`; failure occurred after compile/TypeScript during page data collection for `/api/notify-admin`. |
| Tests | Verified | `timeout 180 npm test -- --reporter=dot` exited `0`; 88 files and 291 tests passed. |
| Lint | NOT VERIFIED | `npm run lint` exited `1`; output reported 324 errors and 102 warnings. |

## Governance gaps

| Gap | Evidence | Impact |
| --- | --- | --- |
| Governance manifest absent | `docs/GOVERNANCE/GOVERNANCE_MANIFEST.md` does not exist. | Referenced governance chain cannot be read or applied. |
| Integration Matrix absent | `docs/INTEGRATION_MATRIX.md` does not exist. | Matrix row status cannot be objectively compared to implementation. |
| Sprint backlog absent | `docs/SPRINT_BACKLOG.md` does not exist. | Sprint ordering and acceptance criteria cannot be verified. |
| Verification standard absent | `docs/VERIFICATION_STANDARD.md` does not exist. | Repository-specific verification requirements cannot be confirmed beyond commands requested by the user. |
| Codex engineering contract absent | `docs/CODEX_ENGINEERING_CONTRACT.md` does not exist. | Contract-specific compliance cannot be audited. |

## Build and quality gaps

| Gap | Evidence | Impact |
| --- | --- | --- |
| Build requires missing Resend key or lazy initialization | `npm run build` failed with `Missing API key. Pass it to the constructor new Resend("re_123")` while collecting page data for `/api/notify-admin`. | Production build is NOT VERIFIED in this environment. |
| Lint fails on backup and application files | `npm run lint` reported `.playbook-backups/20260701_181912_types.ts` parse error, hook/set-state-in-effect errors, no-explicit-any errors, no-html-link-for-pages errors, and image warnings. | Lint baseline is NOT VERIFIED. |
| Backup artifacts are inside lint scope | Lint parsed `.playbook-backups/20260701_181912_types.ts` and failed. | Tooling scope includes historical backup material. |

## Product/subsystem gaps observed

| Subsystem | Evidence present | Gap status |
| --- | --- | --- |
| Scholar/Playbook Record | `lib/playbook-record/index.ts`, `lib/playbook/record/index.ts`, `lib/portfolio/scholar-record.ts`, `lib/scholar/record.ts`. | Canonical ownership NOT VERIFIED due to multiple record-related paths and absent governance manifest. |
| Event Bus | `lib/events/bus.ts`, `lib/events/emit.ts`, `lib/events/register.ts`, `lib/events/handlers/*`. | Present; integration coverage NOT VERIFIED without matrix. |
| Trust Layer | `lib/trust/*`, `lib/engines/trust/trustEngine.ts`, `lib/playbook/trust/index.ts`. | Present; duplicate/canonical boundary NOT VERIFIED. |
| Opportunity | `lib/opportunities/*`, `lib/opportunity-graph/*`, `lib/engines/opportunities/opportunityEngine.ts`, `lib/playbook/opportunities/index.ts`. | Present; duplicate/canonical boundary NOT VERIFIED. |
| Compass | `lib/compass/*`, `lib/engines/compass/compassEngine.ts`, `lib/playbook/compass/index.ts`. | Present; duplicate/canonical boundary NOT VERIFIED. |
| Transcript Intelligence | `lib/academic-intelligence/transcript/*`, `app/api/parse-transcript/route.ts`, `app/transcript/page.tsx`. | Present; end-to-end build NOT VERIFIED. |
| FAFSA Intelligence | Search output shows FAFSA in docs/UI text; no dedicated `lib/fafsa` or FAFSA engine path was found in inspected file map. | Implementation NOT VERIFIED. |
| Resume Intelligence | `lib/opportunity-toolkit/resumeBuilder.ts`, `lib/portfolio/services/resume.ts`. | Dedicated engine NOT VERIFIED. |
| Athlete Intelligence | `lib/scholar-athlete/*`, `components/scholar-athlete/ScholarAthleteDashboard.tsx`, `app/scholar-athlete-os/page.tsx`. | Present; end-to-end build NOT VERIFIED. |

