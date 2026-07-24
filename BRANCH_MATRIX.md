# PBOS-BRANCH-CONVERGENCE-001 Branch Matrix

## Purpose
Provide the canonical branch inventory and convergence disposition for the Playbook OS repository without merging, deleting, or changing runtime code.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Engineering constitution](./CODEX.md)
- [Delivery tracker](./docs/MASTER_CHECKLIST.md)
- [Architecture handbook](./docs/ARCHITECTURE.md)
- [Database handbook](./docs/DATABASE.md)
- [PBOS branch convergence report](./PBOS_BRANCH_CONVERGENCE_REPORT.md)
- [Merge sequence](./MERGE_SEQUENCE.md)
- [Conflict forecast](./CONFLICT_FORECAST.md)
- [Canonical implementation map](./CANONICAL_IMPLEMENTATION_MAP.md)

## Inventory Scope
The working checkout currently exposes one local branch, `work`, and no configured remotes. Therefore, this matrix records the concrete refs available in this checkout and reconstructs previously merged feature, agent, and Codex branch inventory from merge commits already present in history. The reported unmerged branch queue must be re-run in a clone with the missing remote refs before any integration execution.

## Branch Matrix

| Branch | Ahead commits | Subsystems | Duplicate? | Merge Priority | Recommendation |
|---|---:|---|---|---|---|
| `work` | N/A: current integration branch; no `main` ref exists in checkout | Repository aggregate, documentation, current HEAD | No separate branch comparison possible | P0 baseline | Treat as the current baseline until `main`/remote refs are restored; do not merge anything from this checkout without rehydrating remotes. |
| `codex/document-current-state-of-repository` | 1 at merge time | Repository docs, app routes, onboarding, Portfolio, Scholar Record, Compass, notifications, backups | Yes; overlaps broad Codex stabilization branches | Already merged | Superseded by `work`; archive branch after confirming remote PR #17 is closed/merged. |
| `codex/create-audit-documents-for-roles` | 1 at merge time | Governance role architecture docs plus broad app/component snapshot | Yes; nearly identical touched-file surface to `codex/document-current-state-of-repository` | Already merged | Superseded by `work`; preserve audit docs and archive branch. |
| `codex/audit-onboarding-implementation-integrity` | 1 at merge time | Onboarding, Role OS, tutorial, app shell, design audit docs, unit tests | Yes; duplicates onboarding/design branch surfaces | Already merged | Superseded by `work`; keep audit outputs, archive implementation branch. |
| `codex/transform-playbook-web-application-design` | 1 at merge time | Design system, app shell, onboarding, tutorial, role selection, CSS tokens | Yes; overlaps canonical onboarding and design-system branches | Already merged | Superseded by `work`; archive after visual/design audit review. |
| `codex/replace-legacy-onboarding-with-canonical-system` | 1 at merge time | Canonical onboarding engine, role configs, onboarding routes, tutorial tests | Yes; canonicalizes earlier onboarding work | Already merged | Superseded by later onboarding audit/design branches; no further merge. |
| `codex/achieve-production-green-state-for-repository` | 1 at merge time | Broad app routes, UI components, Portfolio, Scholar Record, notifications, Support Network, backups | Yes; very broad duplicate surface | Already merged | Archive; use only as provenance for lint/build state claims. |
| `codex/recover-playbook-os-development-work` | 2 at merge time | Recovery audit, onboarding callback/start, home page, brand visual manifest, onboarding contract test | Partial; recovery branch overlaps onboarding foundation | Already merged | Archive; retain recovery audit as historical evidence. |
| `codex/complete-playbook-design-system-components` | 1 at merge time | Design system components, PBOS engine scaffolding, docs, API lint touchups | Yes; overlaps docs and design transformation branches | Already merged | Superseded by current UI catalog; archive after component inventory validation. |
| `codex/create-complete-engineering-documentation-system` | 1 at merge time | Engineering handbook, PBOS engine docs/state, release evidence, lint config | Partial; overlaps later documentation/current-state branches | Already merged | Archive; use docs as canonical if still referenced by `docs/MASTER_CHECKLIST.md`. |
| `agent/onboarding-role-os-foundation` | 2 at merge time | Role OS routing, onboarding pathway maps, profile/start routes, release ledgers, tests | Yes; foundational work later extended by Codex onboarding branches | Already merged | Superseded as implementation branch; keep tests and role registry decisions. |
| `agent/integrate-sprint-001-004` | 2 at merge time | Scholar Record, dashboard, onboarding, profile, transcript, sprint ledgers | Partial; overlaps later Scholar Record and onboarding branches | Already merged | Archive after verifying Scholar Record remains canonical in `lib/scholar/record.ts`. |

## Required Rehydrated Inventory Pass
When remote refs are restored, enumerate every local and remote branch with:

```bash
git fetch --all --prune
git for-each-ref --format='%(refname:short)|%(objectname)|%(authorname)|%(committerdate:iso8601)|%(subject)' refs/heads refs/remotes
git rev-list --left-right --count main...<branch>
git diff --name-only main...<branch>
```

Any branch with commits ahead of `main` must be added to this matrix before merge execution.
