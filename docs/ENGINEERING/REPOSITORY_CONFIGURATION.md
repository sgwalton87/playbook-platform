# Canonical Repository Configuration

**State vocabulary:** `VERIFIED` means directly observed; `CONFIGURED` means explicitly declared in a repository authority; `MISSING` means an expected artifact is absent; `UNKNOWN` means authoritative evidence is unavailable. `ASSUMED` is prohibited.

## Repository metadata

| Field | State | Value / evidence required |
|---|---|---|
| Repository root | VERIFIED | `/workspace/playbook-platform` from `git rev-parse --show-toplevel` (environment-specific, not a portable identity). |
| Repository name | VERIFIED | `playbook-platform` in `package.json`; also an accepted Git-root name in `CODEX.md`. |
| Owner | UNKNOWN | Requires canonical remote metadata or hosting-platform repository settings. |
| Organization | UNKNOWN | Requires canonical remote metadata or hosting-platform repository settings. |
| Host / hosting platform | UNKNOWN | No remote is configured. |
| Visibility | UNKNOWN | Requires hosting-platform repository settings. |
| Canonical remote | MISSING | `git remote -v` is empty. |
| Configured remotes | VERIFIED | None. |
| Current branch | VERIFIED | `work`. |
| Default branch | UNKNOWN | No remote HEAD or host metadata. |
| Git snapshot | VERIFIED | `b33fd695b794954f10b9207ce8d82f9bf3e20914`. |
| History completeness | VERIFIED | Shallow clone; boundary commits are recorded in the topology report. |
| Git LFS | VERIFIED | No `.gitattributes` and no `git lfs ls-files` entries; only system-wide LFS filters exist. |
| Submodules | VERIFIED | No `.gitmodules` and no gitlink entries. |

## Branch strategy

| Field | State | Value / evidence required |
|---|---|---|
| Development branch | CONFIGURED / NOT PRESENT | `CODEX.md` declares `playbook-os-v1`; it is absent from local refs. |
| Integration branch | UNKNOWN | Requires Git Integration Policy or host settings. |
| Release branch | UNKNOWN | Requires Git Integration Policy or release policy. |
| Protected branches | UNKNOWN | Requires hosting-platform branch/ruleset settings. |
| Branch topology | PARTIAL | Only local `work` is available; no remote refs; clone is shallow. |

## Remote and protection strategy

There is no configured remote, upstream tracking branch, remote HEAD, or locally available ruleset. Remote fetch, ahead/behind status, default-branch discovery, visibility, branch protections, labels, projects, milestones, and complete pull-request discovery are therefore `UNKNOWN`. Required evidence is a canonical remote URL plus read access to repository metadata and branch/ruleset settings.

## Release and deployment strategy

| Item | State | Finding |
|---|---|---|
| Releases / tags | VERIFIED | No Git tags are present in available history. |
| Release workflow | PARTIAL | Documentation and `npm run log:release`/`npm run ship` exist; no hosted automation workflow is present. |
| Deployment workflow | UNKNOWN | No canonical deployment policy or workflow was found. `vercel.svg` is a starter asset, not deployment evidence. |
| Environment strategy | MISSING / UNKNOWN | No `.env*` example or canonical environment document exists. Runtime environments, secrets, promotion, and required variables are unknown. |

## Engineering ownership and approval authority

| Item | State | Finding |
|---|---|---|
| CODEOWNERS | MISSING | No CODEOWNERS file. |
| Approval authority | UNKNOWN | Requires Git Integration Policy and/or CODEOWNERS/rulesets. |
| PR template | MISSING | No pull-request template. |
| Issue templates | MISSING | No issue templates. |
| Labels, projects, milestones | UNKNOWN | Requires hosting-platform metadata. |

## Automation and validation rules

| Item | State | Finding |
|---|---|---|
| GitHub Actions | MISSING | No `.github/workflows` files. |
| Lint | CONFIGURED | `npm run lint` (`eslint`). Baseline fails. |
| TypeScript | CONFIGURED | `npx tsc --noEmit`. Baseline fails. |
| Build | CONFIGURED | `npm run build`. Baseline fails at type checking. |
| Unit tests | CONFIGURED | `npm test` (`vitest run`). 431 pass; suite fails during E2E test import. |
| E2E | CONFIGURED / BLOCKED | Playwright scripts/config exist; installed tree lacks declared Playwright packages. |
| Jest | MISSING | No Jest script/config/dependency. |
| Database validation | MISSING | Migrations exist, but no Supabase config or validation command. |
| Security validation | PARTIAL / BLOCKED | `npm audit` is available but registry audit endpoint returned HTTP 403. |

## PBOS execution rules

1. Operate on Git identity, never a presumed absolute path.
2. Preserve the authority order in the Documentation Authority Report.
3. Never replace `UNKNOWN` with inference.
4. Do not execute engineering gates until their dependencies and human decisions are satisfied.
5. Do not merge, rewrite history, force-push, or modify application logic during discovery gates.
6. Record command, timestamp, commit, exit status, and environment limitations for every baseline.
7. Reconcile existing canonical state before overwriting it.

## Repository status

`PARTIAL`: the local repository and validation surface are well inventoried, but remote identity/governance, full topology, environment/deployment strategy, and several validation facilities are unavailable.
