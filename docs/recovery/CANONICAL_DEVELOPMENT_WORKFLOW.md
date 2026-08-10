# Canonical Development Workflow

## Purpose

Define one durable engineering path from feature implementation through PBOS governance, convergence, and production promotion.

## Ownership

Owned by Playbook OS Engineering. Repository administrators enforce branch protection and release approvals.

## Last Updated

August 1, 2026

## Related Documents

- [Repository Canonicalization Report](./REPOSITORY_CANONICALIZATION_REPORT.md)
- [Git Merge Recovery Plan](./GIT_MERGE_RECOVERY_PLAN.md)
- [Engineering constitution](../../CODEX.md)
- [Release process](../RELEASE_PROCESS.md)

## Canonical Flow

Feature branch

↓

Codex implementation

↓

Validation and evidence

↓

PBOS approval

↓

Convergence branch

↓

Main promotion

## Branch Roles

### `main`

- Production and release history only.
- Protected from direct feature commits.
- Accepts reviewed, validated, PBOS-authorized promotion from convergence.
- Promotion uses fast-forward when ancestry permits; otherwise requires an explicit reviewed convergence merge plan.

### `pbos/post-pps300-convergence`

- Current canonical development and integration branch.
- Receives approved feature PRs after conflict, security, migration, and documentation review.
- Must remain buildable and governed.
- May later be replaced by a deliberately named successor, but never by implicit branch drift.

### Feature Branches

- Branch from the current convergence head.
- One bounded objective per branch.
- Use descriptive `feat/`, `fix/`, `docs/`, `test/`, or approved Codex naming.
- Do not target stale `main` while convergence is the development source of truth.

### Historical Branches

- `backup/*`, superseded recovery branches, and prior integration experiments are read-only retention points.
- Archive only after tags, bundles, stash custody, and PR decisions are recorded.
- Never use backup branches as routine merge sources.

## Implementation Contract

Every change must:

1. Verify repository, branch, instructions, and clean scope.
2. Reuse canonical domain modules and authorization boundaries.
3. Add or update tests proportional to risk.
4. Update architecture/database/design/release documentation when behavior changes.
5. Preserve unrelated developer changes.
6. Avoid committing secrets, local runtime authority, caches, or generated noise.

## Validation Contract

Minimum code validation:

- `npx tsc --noEmit`
- `npm run lint`
- targeted tests
- `npm test` for integration candidates
- `npm run build` for application-impacting or release work
- `git diff --check`

Security, database, observability, environment, E2E, and provider validations apply when their boundaries change. Evidence must identify the exact commit, command, result, environment, and limitations.

## PBOS Approval Contract

- Generated repository observations are refreshed before context validation.
- Approval binds repository, branch, commit, scope, reviewer, reason, risk, and expiration.
- Requester and reviewer remain independent.
- Generated artifact refresh cannot silently expand approved source scope.
- Durable evidence follows registered ownership and retention policy.
- Missing, stale, mismatched, expired, or modified authority fails closed.

## Convergence Admission

A feature PR may enter convergence only when:

- it is based on the current convergence line or has been explicitly rebased/merged by the author;
- code ownership and authorization boundaries are preserved;
- migrations and RLS changes have human security review;
- duplicate documentation paths are not introduced;
- generated outputs are separated from authored sources;
- required validation is green or a documented external limitation is approved;
- PR summary includes risks and documentation impact.

## Production Promotion

1. Freeze the convergence candidate.
2. Capture the exact SHA and repository reality.
3. Run the complete release validation matrix.
4. Obtain PBOS and human promotion approval.
5. Confirm `main` ancestry and remote synchronization.
6. Promote without rewriting history.
7. Tag and record release evidence.
8. Monitor production and retain rollback authority.

## Documentation Rules

- Canonical Architecture directory: `docs/ARCHITECTURE/`.
- Canonical Design directory: `docs/DESIGN/`.
- Do not create lowercase case aliases.
- Authored specifications and generated inventories must be clearly labeled.
- Cartographer/Sentinel outputs are replaced only by their generators.
- Historical generated snapshots belong in Git history or an approved archive, not duplicated live paths.

## Runtime Artifact Rules

- Source code under `pbos/runtime/*.ts` is tracked.
- Runtime JSON must have a registered owner and producer.
- Replaceable observations may be regenerated and should not confer authority.
- Durable approval/evidence artifacts require governed retention and must not live only in an ignored local directory.
- Secrets and provider credentials are never runtime evidence.
- Cleanup follows `cleanup` policy from the ownership registry; manual deletion is prohibited without classification.

## PR and Branch Hygiene

- Review open PRs weekly for base freshness, semantic overlap, and ownership.
- Never close a PR merely because its branch is old.
- Record one of: integrate, superseded-with-evidence, archive-for-reference, or blocked-awaiting-decision.
- Keep one active integration target.
- Export and assign owners to stashes; stashes are not durable team collaboration storage.
- Remove prunable worktree metadata only after confirming the underlying work is preserved.

## Recovery Rule

When repository reality is ambiguous, stop mutation, capture refs/status/stashes/worktrees, identify the last common ancestor, preserve untracked data outside the worktree, and produce a reviewed recovery plan before merging.
