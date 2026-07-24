# Next Sprints

## Purpose
Define the next disciplined integration sprint sequence after repository recovery.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Project Status](./PROJECT_STATUS.md)
- [Engineering Dashboard](./ENGINEERING_DASHBOARD.md)
- [Repository Recovery Audit](./docs/repository/REPOSITORY_RECOVERY_AUDIT.md)

## PBOS-INTEGRATE-001
1. Restore or configure repository remote visibility.
2. Reconcile hosted open PR branches, merged branches, stale branches, and documentation branches.
3. Re-run conflict and binary audits against remote integration candidates.
4. Integrate branches one at a time into recovery branch, preserving Scholar Record canon.
5. Require build, TypeScript, lint, and tests before each integration batch.

## PBOS-CLEANUP-001
1. Merge duplicate architecture/documentation trees into canonical docs.
2. Review delete candidates with owners.
3. Consolidate duplicate component primitives.
4. Classify route duplicates with analytics/import checks.
