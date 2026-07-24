# Architecture Canon

## Purpose
Define the canonical Playbook Platform architecture after repository recovery so future branches integrate into one coherent foundation.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Architecture Handbook](./ARCHITECTURE.md)
- [Repository Canon](./REPOSITORY_CANON.md)
- [Database Handbook](./DATABASE.md)
- [Scholar Record Data Model](./ENGINEERING/SCHOLAR_RECORD_DATA_MODEL.md)

## Canonical Domain Map
| Domain | Canonical implementation | Consumers | Competing/adjacent implementation policy |
| --- | --- | --- | --- |
| Scholar Record | `lib/scholar/record.ts`, `lib/scholar/types.ts`, `lib/scholar/index.ts` | Profile, Record, Portfolio, academic intelligence, recommendations | Legacy direct profile-row mapping must migrate to Scholar Record projections. |
| Support Network | `lib/support-network`, `lib/support-relationships`, `components/support-network` | Support Network routes and APIs | Live/realtime modules may remain adapters, not alternate domain models. |
| Portfolio | `lib/portfolio`, `lib/portfolio-sharing`, `components/portfolio` | Portfolio routes, share routes, evidence surfaces | Portfolio intelligence belongs under engines/services, not route-local forks. |
| Role OS | `lib/role-os`, `lib/roles`, `components/role-os` | Role dashboards and role selection | Role Intelligence is an analysis layer, not the role source of truth. |
| Compass | `lib/compass`, `lib/engines/compass`, `components/compass` | Compass route and recommendation surfaces | Engine logic stays in `lib/engines/compass`; UI composes it. |
| Trust | `lib/trust`, `lib/playbook/trust`, `components/trust`, trust API routes | Moderation, block/mute/report, safe social flows | Trust policy must remain centralized and server-enforced. |
| Events | `lib/events`, `lib/event-notifications`, `lib/playbook/events`, event API routes | Event bus, notifications, rewards | Event handlers must avoid hidden side effects and document emitted events. |
| Playbook | `lib/playbook`, `lib/playbook-record`, `pbos/*` | Platform graph, record, repositories, automation | `pbos/*` is engineering runtime; `lib/playbook/*` is application domain. |
| Studio | `lib/studio`, `components/studio`, `app/studio/*` | Internal tools, audits, release inspection | Studio routes are internal; production app routes must not depend on Studio-only UI. |
| Notification System | `lib/notifications-v2`, `lib/notification-automation`, API notification routes | User notifications, admin/guardian notices | V2 notification model is canonical; older one-off notifiers are adapters. |
| Application Workspace | `lib/application-workspace`, `components/application-workspace`, API workspace route | Opportunity/application workflows | Workspace persistence belongs behind route handlers and domain services. |
| Tutorial | `lib/tutorial`, `components/tutorial`, `app/tutorial` | Onboarding and guided experience | Tutorial is a user-facing learning domain; guided-tour API is progress storage. |
| Living Scholar | `lib/living-scholar`, `components/living-scholar`, `app/living-scholar` | Longitudinal scholar experience | Living Scholar consumes Scholar Record rather than duplicating identity/academic models. |

## Architectural Boundaries
- `app/` contains App Router routes, layouts, route handlers, and composition only.
- `components/` contains presentational and feature UI components.
- `components/ui/` contains reusable primitives, shared states, and design-system implementations.
- `lib/` contains domain logic, server/client adapters, mapping functions, permission logic, and integrations.
- `supabase/migrations/` contains database schema, indexes, and RLS changes.
- `pbos/` contains PBOS runtime automation and gates, not production route code.
- `docs/` contains canonical documentation and historical records.

## Non-Negotiable Canon
Scholar Record is the canonical aggregation layer for scholar identity, academic progress, community evidence, achievements, readiness, and AI readiness projections. Profile UI and portfolio surfaces must consume `ScholarRecord` or explicit projection helpers rather than rebuilding profile mappings locally.
