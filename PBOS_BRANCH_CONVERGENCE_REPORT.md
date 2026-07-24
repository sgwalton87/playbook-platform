# PBOS-BRANCH-CONVERGENCE-001 Report

## Purpose
Produce the canonical engineering convergence plan for Playbook OS branch integration without merging branches, deleting code, hardening the repository, or adding runtime features.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Branch matrix](./BRANCH_MATRIX.md)
- [Merge sequence](./MERGE_SEQUENCE.md)
- [Conflict forecast](./CONFLICT_FORECAST.md)
- [Canonical implementation map](./CANONICAL_IMPLEMENTATION_MAP.md)
- [Engineering constitution](./CODEX.md)
- [Architecture handbook](./docs/ARCHITECTURE.md)
- [Database handbook](./docs/DATABASE.md)

## Repository Health

- The checkout is clean before this documentation change.
- The checkout exposes only one local branch, `work`, and no configured remote refs. This prevents direct verification of the reported dozens of unmerged branches in this environment.
- Visible history contains merged `agent/*` and `codex/*` branches with broad overlap across onboarding, Role OS, design system, Scholar Record, Portfolio, notifications, PBOS engine docs, and backup files.
- `npm run lint` currently exits successfully in this checkout, with an npm warning about an unknown `http-proxy` env config. This conflicts with the previously reported 317 lint errors and 127 warnings, so lint evidence must be regenerated in the full branch inventory clone before integration.

## Branch Inventory Summary

- **Concrete refs currently available**: `work` only.
- **Remote refs currently available**: none.
- **Reconstructed merged branches from history**: `agent/integrate-sprint-001-004`, `agent/onboarding-role-os-foundation`, and the Codex branches listed in `BRANCH_MATRIX.md`.
- **Unverified reported ahead branches**: feature, agent, backup, and Codex branches with 1-58 unique commits are not present as refs in this checkout. They remain a blocker for final merge execution, not for producing this planning framework.

## Recommended Merge Queue

1. Restore complete refs and designate the true `main` baseline.
2. Mark branches already merged into `main` or `work` as `superseded` or `archive`.
3. Merge documentation-only branches first when they are not superseded.
4. Review schema/data branches next and reject duplicate table/RLS implementations.
5. Select canonical domain implementations for Scholar Record, Role OS, Opportunity Toolkit, Portfolio, Support Network, Onboarding, Notification Automation, Compass, Trust, Timeline, and Living Scholar.
6. Merge route composition and UI branches only after canonical domain decisions.
7. Cherry-pick stabilization fixes from broad Codex branches instead of merging entire generated branches.
8. Archive backup branches after extracting any missing documentation or recovery notes.

## Estimated Merge Effort

| Workstream | Estimated effort | Rationale |
|---|---:|---|
| Ref restoration and branch inventory | 0.5-1 day | Requires remote access and branch metadata generation. |
| Duplicate detection and canonical selection | 1-2 days | Many subsystems have overlapping component and route surfaces. |
| Onboarding and Role OS convergence | 1-2 days | Highest known overlap across domain, route, tutorial, and auth callback files. |
| Scholar Record, Portfolio, Opportunity, Support Network review | 2-4 days | Requires domain, data, and UI review across multiple feature areas. |
| Lint/build stabilization per accepted branch | 1-3 days | Reported lint failures must be reproduced and triaged by source branch. |
| Backup/archive disposition | 0.5 day | Requires policy decision; should not be mixed with runtime integration. |

## Remaining Blockers

1. Missing `main` ref and missing remote refs in the current checkout.
2. Need authoritative list of all local and remote branches ahead of `main`.
3. Need per-branch author metadata from refs that are not present here.
4. Need reproducible lint output for the reported 317 errors and 127 warnings in the same clone that contains the unmerged branches.
5. Need product owner decisions for duplicate subsystems before merge execution.
6. Need database/RLS review for any branch that changes Supabase schema, route handlers, permissions, or user-owned data access.

## Execution Rule
Do not merge any branch until the matrix has a row for every local and remote branch, every duplicate implementation has a canonical owner, and every accepted branch has lint/build/test evidence recorded against the exact commit being merged.
