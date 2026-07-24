# PBOS-INTEGRATE-001 Merge Plan

## Purpose
Define the dependency order and execution approach for integrating approved work into `pbos-integrate-001`.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Integration matrix](./INTEGRATION_MATRIX.md)
- [Conflict resolution log](./MERGE_CONFLICT_RESOLUTION.md)
- [Integration report](./PBOS_INTEGRATE_001_REPORT.md)
- [Architecture handbook](./docs/ARCHITECTURE.md)

## Integration Strategy

1. Create a dedicated branch from the locally available approved base: `pbos-integrate-001`.
2. Inventory local branches with `git for-each-ref`.
3. Inventory PRs from locally available merge commits because no Git remote is configured and GitHub CLI is unavailable.
4. Preserve the canonical Scholar Record path: `buildScholarRecord()` → `ScholarRecord` → `scholarRecordToProfileForm()` → Profile UI.
5. Add integration documentation only; do not alter runtime application code unless a validation failure requires it.
6. Validate the final state with the required checks.

## Dependency Order

All visible approved work is already reachable from the starting `work` branch, so no additional feature branch merges are required. The effective dependency chain visible in local history is:

| Order | Work | Rationale |
| --- | --- | --- |
| 1 | #1 Consolidate implementation backlog | Establishes planning backlog baseline. |
| 2 | #2 Canonicalize scholar community activities | Builds canonical Scholar community semantics before later record surfaces. |
| 3 | #5 Integrate sprint 001-004 | Integrates earlier sprint work after backlog and community activity normalization. |
| 4 | #6 Onboarding role OS foundation | Establishes role routing foundation used by later onboarding work. |
| 5 | #7 Complete engineering documentation system | Adds documentation structure used by later audits. |
| 6 | #8 Complete design system components | Provides shared design assets before design transformation. |
| 7 | #9 Recover Playbook OS development work | Reconciles recovered work and includes a `main` merge. |
| 8 | #10 Achieve production green state | Stabilizes production build configuration. |
| 9 | #11 Replace legacy onboarding with canonical system | Consolidates onboarding implementation on the canonical engine. |
| 10 | #13 Transform Playbook web application design | Applies product design updates after component scaffolding. |
| 11 | #14 Audit onboarding implementation integrity | Audits the canonical onboarding implementation after replacement. |
| 12 | #15 Create audit documents for roles | Documents governance and role architecture after onboarding audit. |
| 13 | #17 Document current state of repository | Records latest visible repository state. |
| 14 | PBOS-INTEGRATE-001 documentation | Captures integration inventory, plan, conflict handling, and report. |

## Per-Integration Validation Gate

Because the approved branches are already present in the base history, the per-branch gate is recorded as already satisfied by reachability. The final integration gate is:

- `git status --short`
- `git diff --check`
- `npm run build`
- `npx tsc --noEmit`
- `npm run lint`

## Review Readiness Criteria

- Dedicated integration branch exists.
- Integration matrix, merge plan, conflict resolution log, and report exist.
- No merge markers remain.
- Canonical Scholar Record architecture remains intact.
- Required validation commands have been executed and documented.
