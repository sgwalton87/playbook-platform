# Cartography Report

Generated: 2026-07-21

## Scope

This report is a documentation-only repository cartography pass. No application code was modified.

## Governance source status

| Required source | Status | Objective evidence |
| --- | --- | --- |
| `docs/GOVERNANCE/GOVERNANCE_MANIFEST.md` | NOT VERIFIED | `cat docs/GOVERNANCE/GOVERNANCE_MANIFEST.md` returned `No such file or directory`. Repository search found only `docs/FOUNDER/FOUNDER_MANIFESTO.md` and `docs/PLAYBOOK_MANIFESTO.md` for manifest-like paths. |
| Referenced governance documents | NOT VERIFIED | Because the governance manifest is absent, referenced documents could not be enumerated or read. |

## Repository shape

Objective evidence from `find . -maxdepth 1 -mindepth 1 -not -path './.git' -printf '%f\n' | sort` shows these top-level areas:

- `app` — Next.js App Router pages and API routes.
- `components` — React UI components grouped by product area.
- `lib` — domain engines, repositories, event systems, services, and utilities.
- `docs` — architecture, ADR, engineering, product, release, and archival documentation.
- `scripts` — ledger, ship, cartographer, sentinel, doc governor, founder tooling, and shell logging scripts.
- `tests` — Vitest unit test suites plus empty e2e/integration/helper/mock fixture folders.
- `supabase` — Supabase-related project area.
- `public` — static assets and demo media.
- `archives`, `backups`, `.playbook-backups` — historical/archive material and backup code artifacts.

## Route map

Objective evidence from `find app -path '*/page.tsx' -o -path '*/route.ts' -o -path '*/route.tsx' | sort` identified:

- Application pages for scholar, portfolio, transcript, compass, opportunities, role OS, studio, support network, messaging, gamification, onboarding, courses, demo, and public marketing surfaces.
- API routes for albums, applications, brand partners, community events, events, guided tour progress, invitations, mail gateway, mentor directory, notifications, transcript parsing, portfolio PDF/shares, recommenders, rewards, social interactions, store redemptions, support network, and trust moderation.

## Library map

Objective evidence from `find lib -maxdepth 1 -mindepth 1 -type d -printf '%f\n' | sort` identified major library domains including:

- Architecture/tooling: `archivist`, `cartographer`, `doc-governor`, `ledger`, `sentinel`, `studio`.
- Core platform: `events`, `repositories`, `playbook`, `playbook-record`, `portfolio`, `trust`, `timeline`.
- Intelligence: `academic-intelligence`, `compass`, `intelligence`, `intelligence-automation`, `intelligence-network`, `intelligence-platform`, `oracle`.
- Opportunity/application systems: `opportunities`, `opportunity-graph`, `opportunity-toolkit`, `portfolio-sharing`, `recommenders`.
- Role/community systems: `scholar`, `scholar-athlete`, `role-os`, `role-intelligence`, `support-network`, `support-network-live`, `support-relationships`, `network`, `network-intelligence`.
- Product verticals: `gamification`, `store-economy`, `store-v2`, `reward-events`, `notifications-v2`, `notification-automation`, `messages`, `invitations`, `mail-gateway`.

## Architecture evidence observed

| Architectural concern | Repository evidence | Status |
| --- | --- | --- |
| Playbook/Scholar Record | `lib/playbook-record/index.ts`, `lib/playbook/record/index.ts`, `lib/portfolio/scholar-record.ts`, `lib/scholar/record.ts` | Present, but canonical ownership is NOT VERIFIED without governance manifest and Integration Matrix. |
| Event Bus | `lib/events/bus.ts`, `lib/events/emit.ts`, `lib/events/types.ts`, `lib/events/register.ts`, `lib/events/handlers/*` | Present. |
| Engine/Repository pattern | `lib/engines/*`, `lib/repositories/*` | Present. Some parallel domain-specific engines also exist outside `lib/engines`. |
| Trust Layer | `lib/trust/*`, `lib/engines/trust/trustEngine.ts`, `lib/playbook/trust/index.ts` | Present. Potential overlap requires deeper adjudication. |
| Opportunity Graph / Opportunity Engine | `lib/opportunity-graph/*`, `lib/opportunities/*`, `lib/engines/opportunities/opportunityEngine.ts`, `lib/playbook/opportunities/index.ts` | Present. Potential overlap requires deeper adjudication. |
| Compass | `lib/compass/*`, `lib/engines/compass/compassEngine.ts`, `lib/playbook/compass/index.ts` | Present. Potential overlap requires deeper adjudication. |
| Transcript Intelligence | `lib/academic-intelligence/transcript/*`, `app/api/parse-transcript/route.ts`, `app/transcript/page.tsx` | Present. |
| FAFSA Intelligence | Search found FAFSA references in docs and UI copy, but no dedicated `lib/fafsa` or FAFSA engine path in inspected file map. | NOT VERIFIED as implemented. |
| Resume Intelligence | `lib/opportunity-toolkit/resumeBuilder.ts`, `lib/portfolio/services/resume.ts` | Present as resume generation/readiness support; dedicated Resume Intelligence engine NOT VERIFIED. |
| Athlete Intelligence | `lib/scholar-athlete/*`, `app/scholar-athlete-os/page.tsx`, `components/scholar-athlete/ScholarAthleteDashboard.tsx` | Present. |

## Baseline command evidence

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run lint` | 1 | Failed. Output includes `.playbook-backups/20260701_181912_types.ts` parse error and multiple lint errors. |
| `npx tsc --noEmit` | 0 | TypeScript compilation passed. |
| `npm run build` | 1 | Failed. Next.js compiled and finished TypeScript, then failed collecting page data for `/api/notify-admin` due to missing Resend API key. |
| `timeout 180 npm test -- --reporter=dot` | 0 | Passed: 88 test files, 291 tests. |

