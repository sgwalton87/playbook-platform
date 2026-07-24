# PBOS-BRANCH-CONVERGENCE-001 Canonical Implementation Map

## Purpose
Identify the intended canonical implementation, deprecated implementations, and migration target for major Playbook OS subsystems before branch integration.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Branch matrix](./BRANCH_MATRIX.md)
- [Merge sequence](./MERGE_SEQUENCE.md)
- [Conflict forecast](./CONFLICT_FORECAST.md)
- [PBOS branch convergence report](./PBOS_BRANCH_CONVERGENCE_REPORT.md)
- [Architecture handbook](./docs/ARCHITECTURE.md)
- [Database handbook](./docs/DATABASE.md)

| Subsystem | Canonical implementation | Deprecated implementations | Migration target |
|---|---|---|---|
| Scholar Record | `lib/scholar/record.ts`, `lib/scholar/types.ts`, `components/scholar/`, and `components/playbook-record/` after domain-owner review | Route-local transcript/profile models and duplicate achievement forms | One typed Scholar Record domain API consumed by dashboard, transcript, profile, and public portfolio routes. |
| Role OS | `lib/roles/registry.ts`, `lib/role-os/roleRoutes.ts`, `lib/navigation/roleNavigation.ts`, and `components/role-os/RoleSelect.tsx` | Hard-coded role routing inside pages or onboarding components | One role registry with route mappings and permission-aware navigation. |
| Opportunity Toolkit | `components/opportunities/OpportunityFeed.tsx`, `components/opportunity-graph/OpportunityGraphCard.tsx`, and `components/opportunity-marketplace/OpportunityMarketplace.tsx` once taxonomy is reconciled | Competing opportunity cards or route-local recommendation logic | One opportunity domain vocabulary with feed, graph, and marketplace as views of the same data contract. |
| Portfolio | `components/portfolio/PortfolioEngine.tsx`, `PortfolioCompletion.tsx`, `PortfolioHero.tsx`, portfolio PDF route, and public profile route | Profile-local portfolio calculations and duplicated completion metrics | One Portfolio engine with profile, public share, and PDF presentation adapters. |
| Support Network | `components/support-network-live/SupportNetworkLiveCenter.tsx`, `components/network/ConnectionButton.tsx`, and invitation center components after relationship-state review | Separate connection widgets with independent status rules | One support-network relationship model shared by connections, invitations, dashboards, and notifications. |
| Onboarding | `lib/onboarding/engine.ts`, `lib/onboarding/roleOnboarding.ts`, role config files, `app/onboarding/page.tsx`, `app/start/page.tsx`, and tutorial tests | Legacy `FirstLoginTour` flow and duplicated role-specific onboarding routes | One canonical onboarding state machine with role-configured steps and Supabase mapping. |
| Notification Automation | `components/notifications-v2/NotificationCenter.tsx` and server route handlers after event ownership review | Ad hoc notify-admin calls without typed event contract | One notification event contract with server-side delivery boundaries and user-visible center. |
| Compass | `components/compass/CompassCoreCard.tsx` | Standalone recommendation widgets with no shared opportunity model | Compass as a presentation layer over canonical recommendation/opportunity data. |
| Trust | Trust should be canonicalized through role permissions, verification evidence, moderation, and RLS documentation | Standalone trust badges that bypass verification state | One verification/trust contract tied to evidence, role permissions, and database policy. |
| Timeline | `components/timeline/ScholarTimeline.tsx` backed by Scholar Record events | Static activity timelines embedded in profile pages | Timeline as a chronological projection of Scholar Record evidence and milestones. |
| Living Scholar | `components/living-scholar/*` as experimental/presentation components until domain model is documented | Separate intelligence widgets that create new data contracts | Living Scholar views should consume Scholar Record, Opportunity, Portfolio, and Compass canonical APIs. |
| PBOS engine | `pbos/engine/`, `pbos/commands/`, `pbos/gates/`, and engineering docs | One-off scripts or state files not represented in PBOS docs | One documented PBOS engine workflow with test coverage and release evidence. |
| Backup artifacts | Historical files under `backups/` and `*.backup.tsx` | Any backup file imported by runtime routes | Archive-only provenance outside runtime import paths; no direct merge into app code. |
