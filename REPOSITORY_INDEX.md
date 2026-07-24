# Repository Index

Generated: 2026-07-21

## Verification note

This index is based on repository inspection commands only. It does not assert feature completeness.

## Project metadata

- Package name: `playbook-platform`.
- Framework dependency: `next` `16.2.9`.
- React dependency: `react` `19.2.4`.
- Test runner: `vitest` via `npm test`.
- Build command: `npm run build`.
- Lint command: `npm run lint`.
- TypeScript command used for baseline: `npx tsc --noEmit`.

## Top-level areas

| Path | Observed role |
| --- | --- |
| `app/` | Next.js routes, layouts, API routes, and pages. |
| `components/` | Product and platform UI components. |
| `lib/` | Business/domain logic, event bus, repositories, engines, integrations, utilities. |
| `docs/` | Architecture, ADRs, engineering notes, product docs, release docs, ledgers, archives. |
| `scripts/` | Operational scripts for ledger, ship, cartographer, sentinel, docs governor, founder docs, and logs. |
| `tests/` | Vitest unit suites and placeholder folders for e2e/integration/helpers/mocks/fixtures. |
| `supabase/` | Supabase project area. |
| `public/` | Static and demo assets. |
| `.playbook-backups/`, `backups/`, `archives/` | Backup/archive material. |

## Application route inventory

The inspected `app/` route tree includes pages for:

- Academic readiness: `app/academic-readiness/page.tsx`.
- Action routing: `app/action-routing/page.tsx`.
- Admin/moderation: `app/admin/page.tsx`, `app/admin/moderation/page.tsx`.
- Application workspaces: `app/application-workspaces/page.tsx`.
- Compass: `app/compass/page.tsx`.
- Dashboard/home/start/onboarding/profile/record: `app/dashboard/page.tsx`, `app/home/page.tsx`, `app/start/page.tsx`, `app/onboarding/page.tsx`, `app/profile/page.tsx`, `app/record/page.tsx`.
- Opportunities/application toolkit: `app/opportunities/page.tsx`, `app/opportunity-toolkit/page.tsx`.
- Portfolio sharing: `app/portfolio/[shareId]/page.tsx`.
- Recommenders: `app/recommenders/page.tsx`, `app/recommenders/[requestId]/page.tsx`.
- Scholar-athlete and role OS surfaces: `app/scholar-athlete-os/page.tsx`, `app/role-select/page.tsx`, `app/role-intelligence/page.tsx`, plus district, educator, employer, family, mentor, university, athlete-abroad, and brand-partner OS routes.
- Studio/admin tooling: `app/studio/*` pages for architecture, docs, events, inspector, release, SDK, simulator, system map, themes, visual QA, and beta dashboards.
- Transcript: `app/transcript/page.tsx`.

## API route inventory

The inspected `app/api/` route tree includes API endpoints for:

- Albums and photos.
- Application workspaces.
- Brand partner campaigns.
- Community events and RSVPs.
- Event emission.
- Guided tour progress.
- Invitations.
- Mail gateway.
- Mentor directory.
- Notifications and guardian/admin notifications.
- Transcript parsing.
- Portfolio PDF and shares.
- Recommender requests.
- Rewards and store redemptions.
- Social comments/reactions.
- Support network actions/messages/summary.
- Trust block/mute/report.

## Test inventory

Objective evidence from `find tests -type f | sort` shows 88 passing Vitest test files in the baseline run. Major tested areas include:

- Academic Intelligence and transcript graph.
- Event handlers and events.
- Compass core.
- Opportunity graph and marketplace.
- Opportunity toolkit.
- Scholar record.
- Trust engine.
- Scholar-athlete OS.
- Support network and support relationships.
- Notifications, messages, invitations, mail gateway.
- Role OS and role intelligence.
- Store, reward economy, reward events.
- Studio, visual QA, responsive, design system, onboarding/core journey.

## Documentation inventory

Key architecture and engineering documents observed:

- `docs/ADR/ADR-0001-Playbook-Record.md` through `docs/ADR/ADR-0005-Playbook-Graph.md`.
- `docs/ADR/ADR_LOG.md`.
- `docs/ENGINEERING/BUILD_PROCESS.md`.
- `docs/ENGINEERING/CODING_STANDARDS.md`.
- `docs/ENGINEERING/COMPONENT_STANDARDS.md`.
- `docs/ENGINEERING/ENGINE_PRINCIPLES.md`.
- `docs/ENGINEERING/ENGINE_ROADMAP.md`.
- `docs/ENGINEERING/PLAYBOOK_GRAPH.md`.
- `docs/ENGINEERING/PLAYBOOK_RECORD.md`.
- `docs/ENGINEERING/SCHOLAR_RECORD_DATA_MODEL.md`.
- `docs/architecture/*` catalogs and snapshots.

## Missing required governance/index documents

The following paths requested by mission or prior phase inspection were not present during inspection:

- `docs/GOVERNANCE/GOVERNANCE_MANIFEST.md`.
- `docs/CODEX_ENGINEERING_CONTRACT.md`.
- `docs/VERIFICATION_STANDARD.md`.
- `docs/INTEGRATION_MATRIX.md`.
- `docs/SPRINT_BACKLOG.md`.
- `docs/ENGINEERING_PRINCIPLES.md`.

