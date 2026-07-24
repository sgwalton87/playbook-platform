# Repository Canon

## Purpose
Define the canonical repository ownership model, active modules, deprecated modules, and integration decisions after PBOS-INTEGRATE-002.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Documents
- [AGENTS.md](./AGENTS.md)
- [CODEX.md](./CODEX.md)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/DATABASE.md](./docs/DATABASE.md)
- [docs/MASTER_CHECKLIST.md](./docs/MASTER_CHECKLIST.md)
- [INTEGRATION_STATUS.md](./INTEGRATION_STATUS.md)
- [MERGE_DECISION_LOG.md](./MERGE_DECISION_LOG.md)

## Directory Ownership

| Directory | Canonical owner | Responsibility |
| --- | --- | --- |
| `app/` | Application Engineering | Next.js App Router pages, layouts, and route handlers. |
| `components/` | Frontend Engineering and Design Systems | Shared UI, role dashboards, Scholar Record displays, profile surfaces, notifications, and toolkit components. |
| `lib/` | Platform Engineering | Domain modules, role routing, Scholar Record builders, opportunity engines, event systems, repositories, and server-side utilities. |
| `supabase/` | Data Engineering | Database schema, migrations, RLS, indexes, and production data boundaries. |
| `docs/` | Engineering, Product, QA, and Founder Review | Canonical handbook, audits, release evidence, implementation status, and product inventory. |
| `tests/` | Engineering and QA | Unit, integration, and component validation. |
| `scripts/` and `pbos/` | PBOS Engineering | Automation, ledger, release, status, and repository health tooling. |

## Canonical Modules

| Subsystem | Canonical implementation |
| --- | --- |
| Scholar Record pipeline | `buildScholarRecord()` maps domain inputs into `ScholarRecord`; `scholarRecordToProfileForm()` maps record data into profile forms and profile UI. |
| Scholar domain | `lib/scholar/` owns Scholar Record types, modules, and record construction. |
| Profile Builder | Profile UI remains the consumer of Scholar Record-derived profile form data. |
| Athletics Builder | `lib/scholar-athlete/` and `components/scholar-athlete/` remain canonical for scholar-athlete intelligence and dashboard surfaces. |
| Scholar Builder | `lib/scholar/` and scholar-facing components remain canonical; no parallel builder may be introduced. |
| Opportunity Toolkit | `app/opportunity-toolkit/`, `components/opportunity-toolkit/`, and opportunity graph modules remain canonical. |
| Dashboard architecture | Route-level pages compose domain components; business logic remains in `lib/`. |
| Role routing | `lib/roles/registry.ts`, onboarding pathway mapping, and role navigation utilities remain canonical role-routing sources. |
| Notification system | Notification components, notification APIs, and event-notification pipeline remain canonical. |
| Event system | Event route handlers and event libraries remain canonical event surfaces. |

## Deprecated Modules

| Module or artifact | Status | Direction |
| --- | --- | --- |
| `*.backup` and historical backup files | Deprecated artifacts | Preserve until owners confirm safe deletion; do not use for new work. |
| `docs/DEPRECATED/` | Deprecated documentation | Retain historical context; do not treat as canonical unless revalidated. |
| Legacy `/onboarding` flow | Legacy risk | Prefer `/start` and role-aware onboarding unless product explicitly revalidates the legacy route. |

## Future Migration Targets

- Confirm external branch inventory by attaching a remote or providing approved refs and matrix files.
- Reconcile role OS inconsistencies called out in recovery audits, including Athlete Abroad registry coverage, Counselor alias handling, Coach routing, and District navigation.
- Complete browser runtime QA against configured Supabase, authentication, and messaging environments.
- Review backup artifacts for deletion only after proving no runtime or documentation dependency remains.

## Integration Decisions

- No approved branch merges were performed during PBOS-INTEGRATE-002 because no unmerged local or remote branches were available.
- Canonical architecture was preserved without code changes.
- Documentation was added to make the no-op convergence state, validation evidence, and remaining external blockers explicit.
