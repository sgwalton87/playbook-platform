# Unique Work Matrix

## Purpose
Identify unique work by branch for integration planning without merging.

## Ownership
Playbook OS Engineering

## Last Updated
July 24, 2026

## Related Links
- [Branch Inventory](./BRANCH_INVENTORY.md)
- [Pull Request Status](./PULL_REQUEST_STATUS.md)
- [Merge Plan](./MERGE_PLAN.md)

## Discovery status
Unique work discovery is BLOCKED by missing remote branches. Only local branch `work` exists in this workspace.

## Matrix
| Branch | Unique code | Runtime work | Design work | Documentation | PBOS work | Scholar Record | Feed | Store | Role OS | Profile | Onboarding | Tutorial | Dashboard |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `work` | Unknown relative to `main` because no base ref is available | Runtime consolidation is present in recent history | No visual redesign in stabilization changes | Runtime and repository docs present | Stabilization and runtime docs present | No new Scholar Record engine work in stabilization changes | Feed placeholder cleanup present | No store changes in stabilization changes | Role OS profile-read consolidation present | Profile write consolidation present | `/onboarding` redirect and `/start` consolidation present | First-login tutorial pipeline present | Role dashboard empty-state consolidation present |

## Required rerun command once remote is available
Run this for every non-main branch after fetching refs:

```bash
git fetch --all --prune
git branch -r
git log --left-right --cherry-pick --oneline origin/main...origin/<branch>
git diff --name-status origin/main...origin/<branch>
```
