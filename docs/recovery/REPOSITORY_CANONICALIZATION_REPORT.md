# Repository Canonicalization Report

## Purpose

Establish an evidence-based canonical repository state for Playbook Platform without merging branches, rewriting history, discarding developer work, or treating generated artifacts as source authority.

## Ownership

Owned by Playbook OS Engineering. Branch archival, pull-request disposition, runtime-evidence retention, and production promotion require repository-owner approval.

## Last Updated

August 1, 2026

## Related Documents

- [Git Merge Recovery Plan](./GIT_MERGE_RECOVERY_PLAN.md)
- [Canonical Development Workflow](./CANONICAL_DEVELOPMENT_WORKFLOW.md)
- [Architecture handbook](../ARCHITECTURE.md)
- [Release process](../RELEASE_PROCESS.md)
- [Database handbook](../DATABASE.md)

## Executive Finding

The latest integrated engineering state is `pbos/post-pps300-convergence` at `a3f656e9b9cdf2463ac6f41e9a77eca4b40312af`, not `main` at `836374760a34f73ad91f27b2cae0073f000a0e47`. Git proves that `main` is an ancestor of the convergence branch. The convergence branch is 159 commits ahead and `main` has zero commits outside that lineage. A future promotion can therefore be a fast-forward after worktree, documentation, PR, and runtime-custody gates are satisfied.

Recommended canonical state:

| Responsibility | Canonical ref/location | Rationale |
|---|---|---|
| Production branch | `main` | Stable release and deployment target. It is not yet current. |
| Development/integration branch | `pbos/post-pps300-convergence` | Latest integrated PBOS, platform, Scholar Experience, governance, test, and transition state. |
| Feature branches | Short-lived branches from convergence | Keeps new work based on the integrated state. |
| Historical branches | `backup/*`, superseded `agent/*`, old integration and recovery refs | Preserve until owner approves archival; never merge wholesale. |
| Architecture documentation | `docs/ARCHITECTURE/` | Convergence already contains 199 uppercase paths and no lowercase Architecture paths. |
| Design documentation | `docs/DESIGN/` | Existing design-system authority is uppercase; five authored lowercase reports must be migrated, not deleted. |
| PBOS artifact ownership | `pbos/kernel/artifact-ownership.ts` plus `pbos/kernel/artifacts.ts` | Typed owner, producer, consumer, persistence, and cleanup policy. |
| Runtime authority evidence | Protected external evidence store or explicitly approved durable ledger | Local ignored JSON is not a portable repository authority boundary. |

## Audit Snapshot

Audit commands included `git branch -a`, `git log --all --decorate --oneline --graph -100`, `git status`, `git remote -v`, `git stash list`, worktree inspection, case-fold collision detection, tree comparisons, ancestry checks, branch deltas, GitHub pull-request search, and subsystem inventories.

- Remote: `origin` → `https://github.com/sgwalton87/playbook-platform.git`.
- Current branch: `main`, aligned with `origin/main` at `8363747`.
- Convergence: local and remote aligned at `a3f656e`.
- Ancestry: `git merge-base --is-ancestor main pbos/post-pps300-convergence` succeeds.
- Delta: `main...pbos/post-pps300-convergence` = `0` left, `159` right; 2,192 files changed.
- Worktree: generated uppercase Architecture drift plus five untracked uppercase Design aliases caused by case-insensitive filesystem behavior.
- Stashes: ten entries exist; none were applied or deleted.
- Additional registered worktrees are reported prunable and must be reviewed before `git worktree prune` is authorized.

## Commit Lineage and Integration Evidence

The convergence tip contains this final integration chain:

1. `5825bfa` — merges the PBOS convergence line with `codex/list-next-to-dos-for-pbos-platform-build` while preserving two-parent lineage.
2. `1a5ea2b` — repairs `pbos:transition` ordering by regenerating repository reality before context validation; adds focused regression tests.
3. `a3f656e` — records refreshed repository/context activation evidence.

Earlier convergence commits include Scholar Experience V1 (`321cf5f`), mission-control continuity, execution-fabric governance, Role OS architecture, authorization boundaries, Supabase/RLS work, observability, and constitutional governance. `main` is the merge base, so promotion does not require reconciling independent commits from `main`.

## Source-of-Truth Validation

| Signal | `main` | Convergence | Finding |
|---|---:|---:|---|
| Commits unique to branch | 0 | 159 | Convergence is strictly ahead. |
| Test/spec files | 92 | 231 | Convergence has materially broader coverage. |
| PBOS/governance inventory | 38 paths | 969 paths | Convergence contains the operating governance implementation. |
| Scholar/record-related inventory | 23 paths | 28 paths | Convergence retains and extends Scholar Record/Experience work. |
| Runtime validation artifact | Not authoritative for convergence | `status: PASS` | Repository, planning, selected-gate, and valid-idle checks pass in the committed evidence. |
| Build evidence | Older baseline | Multiple recorded successful Next.js production builds, including Scholar Experience V1 with 123 generated pages | Re-run at promotion time; existing evidence supports candidacy, not automatic release. |
| Transition sequencing | Missing latest repair | `1a5ea2b` | Convergence has the current governed transition implementation. |

The convergence branch is the current engineering source of truth. `main` remains the intended production branch but is a promotion target, not the development baseline.

## Branch Topology and Classification

### Promotion Candidate

- `pbos/post-pps300-convergence` → `main`, fast-forward only after the gates in the recovery plan.

### Active Review Candidates

- PR #41 targets convergence and adds a separate RLS foundation; it is not contained by the convergence tip and requires schema/security review.
- PR #42 targets `integration/repository-convergence` and adds PBOS constitutional/domain work; it requires comparison against the much newer convergence architecture before any integration.
- PR #35 contains authored Intelligence Architecture documentation and requires semantic migration review.
- PRs #18–#22, #3, and #4 contain overlapping ScholarRecord work. Their exact commits are not ancestors of convergence; some concepts were independently integrated. Review file-by-file and never merge these branches wholesale.
- PR #32 is based on `playbook-os-v1`, carries 37 commits not in convergence, and represents an alternative PBOS canonical-state approach. Treat as architecture research until reconciled with the current kernel.

### Historical/Superseded Candidates

- `backup/*` branches are retention points, not merge sources.
- Merged sprint/onboarding branches such as `agent/integrate-sprint-001-004` and `agent/onboarding-role-os-foundation` should be tagged/archived only after owner verification.
- Older recovery and integration-plan PRs (#12, #16, #23–#28) are evidence inputs. Their commits are not patch-equivalent to convergence, so they must remain open or be dispositioned by a human after checking whether their findings remain relevant.
- No branch or PR is declared abandoned solely from age or naming.

## Open Pull-Request Inventory

| PR | Base | Head | Classification |
|---:|---|---|---|
| 42 | `integration/repository-convergence` | `codex/verify-repository-before-changes` | PBOS/governance review candidate |
| 41 | convergence | `codex/verify-git-repository-status-commands` | RLS/security review candidate |
| 35 | `main` | Intelligence Architecture | Authored-doc migration review |
| 32 | `playbook-os-v1` | alternate PBOS canonical state | Architecture fork; human decision |
| 28, 27, 26 | `main` | convergence/integration reports | Historical evidence review |
| 25, 24, 23 | `main` | rescue/recovery reports | Historical evidence review |
| 22, 21, 20, 19, 18 | `main` | ScholarRecord/Experience changes | Semantic overlap review |
| 16, 12 | `main` | repository/runtime audits | Historical evidence review |
| 4, 3 | `main` | academic/college ScholarRecord | Semantic overlap review |

No open PR head is an exact ancestor of the convergence tip. This does not prove its functionality is absent; it means PR disposition requires patch and semantic comparison rather than automatic closure.

## Duplicate Documentation Paths

### Architecture

`main` tracks nine uppercase/lowercase pairs. Five pairs have identical blobs. Four generated pairs differ:

- `COMPONENT_CATALOG.md`
- `CURRENT_ARCHITECTURE.md`
- `SENTINEL_REPORT.md`
- `SYSTEM_MAP.md`

The divergent files identify themselves as Cartographer/Sentinel output. Convergence has already removed `docs/architecture/` and retains `docs/ARCHITECTURE/`; this is the correct canonical direction. Generated snapshots may be regenerated only after promotion and must not be used to overwrite authored architecture.

### Design

`docs/DESIGN/` contains the design system and brand constitution. The five `docs/design/` files are authored operational records, not disposable generated noise:

- `CANONICAL_ROUTE_MAP.md`
- `FUNCTIONAL_WIRING_BACKLOG.md`
- `OVERNIGHT_DESIGN_REPORT.md`
- `PAGE_APPROVAL_CHECKLIST.md`
- `VISUAL_DEVIATIONS.md`

Migrate these five files to `docs/DESIGN/` in a case-sensitive worktree and update their relative links. Do not delete their content.

## Documentation Migration Classification

| Location/content | Classification | Action |
|---|---|---|
| `docs/ARCHITECTURE.md` | Keep | Authoritative platform handbook. |
| `docs/ARCHITECTURE/` authored specifications | Keep | Canonical uppercase architecture library. |
| `docs/ARCHITECTURE/` Cartographer/Sentinel snapshots | Keep/regenerate | Keep one canonical copy; regenerate only through owners. |
| `docs/architecture/` | Remove after verification | Duplicate case path; convergence already removes it. |
| `docs/DESIGN/` design system and brand system | Keep | Canonical uppercase design library. |
| Five `docs/design/` operational reports | Migrate | Case-only move to `docs/DESIGN/`, preserve content/history. |
| Superseded generated snapshots | Archive only if required for audit | Prefer Git history over live duplicate files. |

## Runtime Artifact Ownership

The convergence registry distinguishes replaceable observations from durable governance evidence.

- Replaceable: repository analysis, planning, constitutional planning, validation, execution snapshot, repository context, workflow, doctor, and repository inspection outputs. Regenerate through the registered producer; never hand-edit.
- Durable: execution contracts, work packages, authorizations, approvals, assignments, evidence, telemetry, milestone advancement, context refresh/approval, trusted build context, change boundary, launch approval, reconciliation, lifecycle/promotion/certification, and histories. Preserve through governed transition and an approved retention mechanism.
- TypeScript runtime implementation and tests under `pbos/runtime/*.ts` are source code and remain tracked.
- `.gitignore` ignores `pbos/runtime/*.json`, while legacy JSON snapshots remain tracked. This mixed model is intentional only if tracked files are certified fixtures/baselines. A human must decide which durable evidence is committed, externally retained, or both.

The twelve local runtime JSON files previously found on `main` were moved intact to `/private/tmp/pbos-main-premerge-runtime-backup-20260802`. None had a same-path tracked counterpart on convergence. They require custody review before deletion; `/private/tmp` is not durable storage.

## Stash and Developer-Work Preservation

Ten stashes remain. Stashes 0–4 contain the Architecture case-collision variants. Stashes 5–9 contain athletics, UI barrels, logs, release records, test artifacts, and `next-env.d.ts` changes. Do not drop them. Export each stash to a patch/bundle and record an owner/disposition before archival.

## Blockers

1. The current macOS worktree is case-insensitive while Git tracks divergent case-only paths; a clean checkout is not representable until canonicalization occurs in a case-sensitive worktree.
2. Five untracked uppercase Design files alias tracked lowercase files because of filesystem case folding.
3. Open PRs contain unreviewed PBOS, RLS, Intelligence, and ScholarRecord work.
4. Runtime authority artifacts lack a confirmed durable custody location outside the temporary backup.
5. The two prunable registered worktrees require owner review before metadata cleanup.
6. Promotion-time build, lint, type, tests, environment validation, migration review, and PBOS status must be rerun on the exact candidate SHA.

## Recommended Canonical State

Promote a reviewed descendant of `a3f656e` to `main` using `--ff-only`. Before promotion, apply the review-only documentation cleanup on a case-sensitive worktree, preserve the five authored Design reports under uppercase `docs/DESIGN/`, establish durable PBOS evidence custody, review open PR deltas, and execute the validation matrix. After promotion, continue development through `pbos/post-pps300-convergence` (or a deliberately created successor convergence branch) and protect `main` as production-only.
