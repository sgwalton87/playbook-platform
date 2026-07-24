# Repository Canon

## Purpose
Define permanent repository structure, ownership, placement rules, naming conventions, and architectural boundaries.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Architecture Canon](./ARCHITECTURE_CANON.md)
- [Documentation Canon](./DOCUMENTATION_CANON.md)
- [Engineering Dashboard](../ENGINEERING_DASHBOARD.md)

## Folder Ownership and Responsibilities
| Folder | Owner | Responsibility |
| --- | --- | --- |
| `app/` | Product Engineering | Next.js App Router pages, layouts, loading/error boundaries, and route handlers. |
| `components/` | Frontend Engineering | Shared and domain UI components. |
| `components/ui/` | Design System | Reusable primitives, feedback states, data display, form, action, and layout components. |
| `lib/` | Platform Engineering | Domain logic, service boundaries, adapters, repositories, permissions, and integrations. |
| `lib/scholar/` | Scholar Platform | Canonical Scholar Record model, builders, projections, and community record mapping. |
| `lib/playbook/` | Playbook Core | Playbook graph, record, repositories, trust, events, and timeline domain modules. |
| `pbos/` | PBOS Engineering Runtime | Automation commands, gates, prompts, health, rules, and engine state. |
| `supabase/migrations/` | Data Platform | Database schema, indexes, functions, and RLS migrations. |
| `tests/` | Quality Engineering | Unit, integration, domain, and route regression tests. |
| `docs/` | Engineering/Product/Founder Docs | Canonical docs, ADRs, governance, releases, history, and audits. |
| `public/` | Design/Brand/Product Engineering | Runtime static assets. |
| `scripts/` | Platform Engineering | Repeatable operational scripts. |
| `archives/`, `backups/`, `.playbook-backups/` | Archivist / Human Review | Historical or backup material; no app imports should depend on these. |

## Placement Rules
- New route UI starts in `app/<route>/page.tsx` only when route-specific; reusable UI moves to `components/`.
- New domain logic starts in `lib/<domain>/` and exposes explicit types and functions.
- Shared controls, cards, layout, loading, empty, and error states go in `components/ui/`.
- Database changes require Supabase migrations and database documentation updates.
- Generated files, build outputs, archives, and caches stay ignored unless explicitly approved.
- Static media goes in `public/` only when required at runtime; large media should prefer external hosting.

## Naming Conventions
- Use Playbook terminology: Scholar, Portfolio, Scholar Record, role, permission, opportunity, evidence, verification, journey.
- Use kebab-case for route folders and documentation filenames except established all-caps governance/status docs.
- Use PascalCase for React components and explicit named exports for domain utilities.
- Barrels are allowed only when they clarify a public module boundary.

## Architectural Boundaries
- Server-only Supabase and secret-bearing logic must remain in server boundaries or route handlers.
- Client components may consume safe client adapters and UI props, not secrets.
- Routes compose; domain modules decide.
- Scholar Record is the canonical scholar aggregation boundary.
- PBOS runtime is not product runtime.
