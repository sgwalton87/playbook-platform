# Next Sprints

## Purpose
Identify the next PBOS engineering work after PBOS-INTEGRATE-002.

## Ownership
Owned by Playbook OS Engineering and Product.

## Last Updated
July 24, 2026

## Related Documents
- [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- [RC_001.md](./RC_001.md)
- [REPOSITORY_CANON.md](./REPOSITORY_CANON.md)
- [docs/MASTER_CHECKLIST.md](./docs/MASTER_CHECKLIST.md)

## PBOS-HARDEN-001 Readiness Sprint

1. Attach or provide the authoritative Git remote and approved branch matrix.
2. Re-run branch inventory and merge only approved unmerged work.
3. Execute browser runtime QA for authentication, onboarding, dashboards, profile editing, Scholar Record generation, notifications, messaging, opportunities, navigation, and permissions.
4. Resolve role OS inconsistencies from recovery evidence.
5. Review deprecated backup artifacts for provable removal candidates.
6. Repeat full validation after any merge or hardening change.

## Release Gate Priorities

- Keep canonical modules single-sourced.
- Avoid new features unless required for approved integration or hardening.
- Treat Supabase-backed flows as incomplete until validated against a real configured environment.
