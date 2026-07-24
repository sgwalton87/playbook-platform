# PBOS-BRANCH-CONVERGENCE-001 Merge Sequence

## Purpose
Define the safe convergence order for Playbook OS branch integration without performing merges in this task.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Branch matrix](./BRANCH_MATRIX.md)
- [Conflict forecast](./CONFLICT_FORECAST.md)
- [Canonical implementation map](./CANONICAL_IMPLEMENTATION_MAP.md)
- [PBOS branch convergence report](./PBOS_BRANCH_CONVERGENCE_REPORT.md)

## Dependency Graph

```text
main / restored production baseline
  ↓
feature branches: Scholar Record, Portfolio, Opportunity Toolkit, Support Network, Compass, Trust, Timeline, Living Scholar
  ↓
agent branches: sprint integration, onboarding-role-os foundation, role-routing work
  ↓
Codex branches: design-system, canonical onboarding, production-green, documentation, current-state audits
  ↓
backup branches: snapshots, backup scripts, pre-redesign pages, recovery-only preservation refs
```

## Exact Merge Order for a Rehydrated Repository

1. **Baseline restoration branch**: restore `main` and all remote refs first. This is mandatory because the current checkout exposes no `main` ref and no remote refs.
2. **Documentation-only audit branches**: merge or cherry-pick reports that do not alter runtime behavior. These establish traceability and make later decisions reviewable.
3. **Schema and data-boundary branches**: review Supabase migrations, RLS, table mappings, and indexes before UI branches so runtime components target one schema contract.
4. **Domain library branches**: merge canonical `lib/` implementations for Scholar Record, Role OS, Opportunity Toolkit, Portfolio, Support Network, Compass, Trust, Timeline, and Living Scholar before routes.
5. **Route composition branches**: merge App Router pages and route handlers only after canonical domain modules are selected.
6. **Shared UI/design-system branches**: merge shared components and tokens after domain contracts are fixed, resolving duplicate component APIs once.
7. **Feature UI branches**: merge subsystem-specific components that consume canonical domain modules and shared UI.
8. **Agent integration branches**: merge branches that combine earlier features only if their commits add net-new integration tests, docs, or glue code not already included.
9. **Codex stabilization branches**: cherry-pick only verified lint/build/test fixes; archive broad generated branches that reimplement existing subsystems.
10. **Backup branches**: do not merge backup branches into runtime. Archive them after extracting any missing historical documentation.

## Why This Order

- Data contracts must precede UI so duplicate UI branches do not lock in incompatible Supabase shapes.
- Domain modules must precede routes so pages remain composition-only and do not fork business logic.
- Shared UI must precede feature UI to prevent duplicate button, card, navigation, shell, and onboarding components.
- Agent and Codex branches are likely integration layers over feature branches, so they should be reviewed after canonical feature decisions.
- Backup branches are provenance only; merging them last or not at all avoids reintroducing stale code and lint surfaces.

## Already-Merged Branches in This Checkout
The visible merge history indicates the known `agent/*` and `codex/*` branches listed in `BRANCH_MATRIX.md` are already merged into `work`. They should not be re-merged; their remote refs should be archived once the full remote inventory confirms they contain no additional unmerged commits.
