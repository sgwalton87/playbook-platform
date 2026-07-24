# Documentation Canon

## Purpose
Define canonical documentation locations and merge/archive policy for Playbook Platform docs.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Repository Canon](./REPOSITORY_CANON.md)
- [Architecture Canon](./ARCHITECTURE_CANON.md)
- [Master Checklist](./MASTER_CHECKLIST.md)

## Canonical Documents by Subject
| Subject | Canonical document | Merge into | Archive / Historical |
| --- | --- | --- | --- |
| Repository structure | `docs/REPOSITORY_CANON.md` | `docs/REPOSITORY_INDEX.md`, architecture repository catalogs | Historical snapshots under `docs/HISTORY/**` or `docs/DEPRECATED/**`. |
| Architecture | `docs/ARCHITECTURE_CANON.md`, `docs/ARCHITECTURE.md` | `docs/ARCHITECTURE/**`, `docs/architecture/**`, `docs/PLAYBOOK_ARCHITECTURE.md`, `docs/ENGINE_ARCHITECTURE.md` | ADRs remain canonical decision history. |
| Database | `docs/DATABASE.md` | `docs/DATABASE_BLUEPRINT.md` when current | Migration files are source of truth for schema history. |
| Design system | `docs/UI_DESIGN_SYSTEM.md` | `docs/DESIGN/**` enduring standards | `docs/DEPRECATED/DESIGN_SYSTEM.md`. |
| Roadmap/sprints | `NEXT_SPRINTS.md`, `docs/MASTER_CHECKLIST.md`, `docs/ROADMAP.md` | `docs/PRODUCT_ROADMAP.md`, sprint logs | `docs/releases/**`, `docs/HISTORY/**`. |
| Product | `docs/PRODUCT/PRODUCT_STRATEGY.md`, `docs/PRODUCT/FEATURE_REGISTRY.md` | Top-level product summaries | Historical release notes. |
| PBOS runtime | `pbos/README.md`, `ENGINEERING_DASHBOARD.md` | Engine status docs and ledgers | PBOS history ledgers. |
| Release process | `docs/RELEASE_PROCESS.md` | Release evidence when generalized | Release logs stay historical. |
| Status/handoff | `PROJECT_STATUS.md`, `OVERNIGHT_PROGRESS.md`, `OVERNIGHT_HANDOFF.md`, `ENGINEERING_CHANGELOG.md` | Daily logs when summary-worthy | Daily logs remain history. |

## Documentation Lifecycle
- Canonical: current operating source of truth.
- Merge Into: useful content that should be folded into a canonical doc.
- Archive: preserve historical content but remove from current navigation.
- Historical: immutable record of decisions/releases/daily work.
- Duplicate: same subject and same era; consolidate before deletion.
- Delete Candidate: generated or redundant only after owner review.
