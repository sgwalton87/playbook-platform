# Stabilization Backlog

## Purpose
Prioritize repository stabilization work without adding features or merging branches.

## Ownership
Playbook OS Engineering

## Last Updated
July 24, 2026

## Related Links
- [Repository Baseline Status](./BASELINE_STATUS.md)
- [Lint Error Matrix](./LINT_ERROR_MATRIX.md)
- [Branch Inventory](./BRANCH_INVENTORY.md)
- [Merge Plan](./MERGE_PLAN.md)

## Priority definitions
- P0: blocks build, runtime, or merge.
- P1: architectural/runtime correctness.
- P2: type cleanup.
- P3: lint quality.
- P4: style-only cleanup.

## Backlog
| Priority | Item | Status | Rationale | Recommended action |
|---|---|---|---|---|
| P0 | Restore remote/branch visibility in integration environment | BLOCKED | Current workspace has no configured remote and only local branch `work`; integration planning cannot safely identify remote branch state. | Configure/fetch canonical remote in a controlled integration workspace; do not merge during discovery. |
| P0 | Pull request inventory | BLOCKED | `gh` is unavailable and no remote is configured, so open PRs cannot be verified here. | Run PR inventory from a workstation or CI job with GitHub access. |
| P1 | Browser/live Supabase runtime validation | BLOCKED | Build/type/lint do not verify login, onboarding, tutorial, profile, public profile, or role dashboards. | Run role-by-role runtime traces against a seeded Supabase project. |
| P1 | Branch-specific unique work discovery | BLOCKED | Only local branch `work` is available; no remote branches were available to diff. | Fetch all remote branches and rerun `UNIQUE_WORK_MATRIX.md`. |
| P2 | Historical lint/type debt reconciliation | PLANNED | The prompt cites historical errors, but current checks are clean. | Reproduce on the Product Owner target branch before fixing. |
| P3 | Documentation handoff standard | IN PROGRESS | Overnight sprint reporting needs branch-verifiable handoff artifacts. | Adopt `OVERNIGHT_HANDOFF.md`, `OVERNIGHT_PROGRESS.md`, and changelog updates for future sprints. |
