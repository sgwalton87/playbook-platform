# File Classification

## Purpose
Classify repository files and recommend cleanup actions without deleting files automatically.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Repository Canon](../REPOSITORY_CANON.md)
- [Documentation Canon](../DOCUMENTATION_CANON.md)
- [Component Consolidation](../runtime/COMPONENT_CONSOLIDATION.md)

## Classification Legend
- KEEP: required and active.
- KEEP (Foundation): canonical domain, architecture, runtime, or governance foundation.
- KEEP (Framework): framework/config/package files.
- KEEP (Production): user-facing routes, APIs, components, or assets.
- KEEP (Barrel): export/index files that define module boundaries.
- KEEP (Planned Scaffold): intentional future-facing scaffolds.
- IMPLEMENT: scaffold needs product/code completion.
- ARCHIVE: historical material that should stay but move under history/archive conventions.
- DELETE CANDIDATE: duplicate or generated material that needs human review before deletion.

## Repository-Level Classification
| Path family | Classification | Recommendation |
| --- | --- | --- |
| `app/**` | KEEP (Production) / IMPLEMENT / Internal by route | Use route audit before changes; keep production routes and classify Studio/demo/internal separately. |
| `components/ui/**` | KEEP (Foundation) | Canonical shared UI primitives and state components. |
| `components/<domain>/**` | KEEP (Production) | Keep when route-backed; consolidate repeated primitives into `components/ui/**`. |
| `lib/scholar/**` | KEEP (Foundation) | Canonical Scholar Record architecture. |
| `lib/playbook/**` | KEEP (Foundation) | Canonical Playbook domain and repository pattern. |
| `lib/engines/**` | KEEP (Foundation) | Canonical engines for academic, compass, opportunities, portfolio, timeline, and trust. |
| `lib/<domain>/**` | KEEP (Production) | Keep active domain modules; document overlapping modules before consolidation. |
| `pbos/**` | KEEP (Foundation) | PBOS engineering runtime, commands, gates, prompts, and state. |
| `supabase/migrations/**` | KEEP (Foundation) | Database schema/RLS history must not be deleted. |
| `tests/**` | KEEP (Foundation) | Regression suite for domains, UI, APIs, and PBOS. |
| `docs/ADR/**` | KEEP (Foundation) | Architecture decisions. |
| `docs/DECISIONS/**` | MERGE INTO / ARCHIVE | Overlaps with ADR; preserve history and cross-link. |
| `docs/ARCHITECTURE/**` and `docs/architecture/**` | MERGE INTO / DELETE CANDIDATE after review | Case-duplicated architecture catalogs; merge into canon before deletion. |
| `docs/DESIGN/**` | KEEP / MERGE INTO | Merge enduring standards into `docs/UI_DESIGN_SYSTEM.md`. |
| `docs/DEPRECATED/**` | ARCHIVE | Keep for historical reference until explicit deletion approval. |
| `docs/HISTORY/**`, `archives/**`, `.playbook-backups/**`, `backups/**` | ARCHIVE / HUMAN REVIEW REQUIRED | Preserve historical docs; review backup directories for duplication. |
| `public/assets/**`, `public/brand/**` | KEEP (Production) | Runtime brand/app assets; optimize before any migration. |
| `public/demo/founder-archive/**` | HUMAN REVIEW REQUIRED | Legitimate demo/archive media but large and variant-heavy. |
| `package.json`, lockfile, configs | KEEP (Framework) | Framework and tooling boundary. |

## Delete Candidate Policy
Nothing was deleted automatically. Delete candidates require a follow-up PR with owner approval, redirect/citation updates, and validation that no route/import references remain.
