# Git Merge Recovery Plan

## Purpose

Define the exact, non-destructive sequence for preparing and later promoting the current PBOS convergence state to `main`. This document does not authorize or perform a merge.

## Ownership

Owned by Playbook OS Engineering. The repository owner approves PR dispositions, runtime-evidence custody, the promotion SHA, and the final merge action.

## Last Updated

August 1, 2026

## Related Documents

- [Repository Canonicalization Report](./REPOSITORY_CANONICALIZATION_REPORT.md)
- [Canonical Development Workflow](./CANONICAL_DEVELOPMENT_WORKFLOW.md)
- [Release process](../RELEASE_PROCESS.md)

## Proposed Refs

- Production target: `main` at `8363747` before promotion.
- Canonical development source: `pbos/post-pps300-convergence` at audited tip `a3f656e`.
- Merge base: `8363747`.
- Expected strategy: fast-forward only. `main` has no unique commits relative to convergence.

## Mandatory Preconditions

1. Use a case-sensitive filesystem/worktree. Do not use `skip-worktree`, `assume-unchanged`, or case-insensitive index tricks.
2. Preserve the current ten stashes by exporting patches and recording owners.
3. Move the temporary runtime backup from `/private/tmp/pbos-main-premerge-runtime-backup-20260802` to approved durable custody and record digests.
4. Review PRs #41 and #42 for PBOS/RLS deltas and PRs #3, #4, #18–#22 for ScholarRecord overlap.
5. Apply and review `CANONICALIZATION_CLEANUP.patch` on a branch created from convergence. This migrates five authored Design documents to the uppercase canonical tree.
6. Confirm `git status --short` is empty in the case-sensitive worktree.

## Exact Preparation Sequence

```bash
git fetch origin --prune
git worktree add /path/on/case-sensitive-volume/playbook-canonicalization pbos/post-pps300-convergence
cd /path/on/case-sensitive-volume/playbook-canonicalization
git status --short
git switch -c chore/repository-canonicalization
git apply --check docs/recovery/CANONICALIZATION_CLEANUP.patch
git apply docs/recovery/CANONICALIZATION_CLEANUP.patch
git diff --check
```

Review the five case-only Design migrations, update any broken links, then commit the cleanup only after human approval. Do not remove the lowercase Architecture tree manually on convergence; it is already absent there.

## Validation Sequence

Run on the exact cleanup candidate:

```bash
npm install
npx tsc --noEmit
npm run lint
npm test
npm run build
npm run env:check
npm run db:validate:rls
npm run platform:validate
npm run observability:validate
npm run pbos:status
git diff --check
git status
```

Environment-backed integration, E2E, Supabase migration, email/provider, and synthetic checks require configured non-production infrastructure. Record every limitation rather than bypassing it.

## Future Promotion Sequence

Only after the candidate is reviewed, pushed, and approved:

```bash
git switch main
git pull --ff-only origin main
git merge-base --is-ancestor main origin/pbos/post-pps300-convergence
git merge --ff-only origin/pbos/post-pps300-convergence
```

If the cleanup commit exists after the named convergence tip, promote the reviewed cleanup ref instead. Stop if fast-forward is impossible. Do not create an accidental merge commit, rebase shared history, or force-update `main`.

## Expected Conflict and Collision Surfaces

Git history predicts no content conflicts because `main` is an ancestor. Worktree preparation can still fail on:

- `docs/ARCHITECTURE/` versus `docs/architecture/` on case-insensitive filesystems.
- `docs/DESIGN/` versus `docs/design/` on case-insensitive filesystems.
- Untracked uppercase Design aliases that would be overwritten by checkout.
- Local generated Cartographer/Sentinel drift.
- Local ignored PBOS JSON artifacts.

Resolve these through a case-sensitive worktree and explicit custody, not by forcing checkout.

## Files Safe to Regenerate

Only regenerate through registered producers:

- Cartographer catalogs/maps and Sentinel report.
- Replaceable PBOS observations: repository, planning, constitutional planning, validation, execution snapshot, repository context, workflow, doctor, and repository inspection.
- Next.js generated `.next/` types and `next-env.d.ts` when produced by the framework.

Generated output must be reviewed for meaningful source changes before commit.

## Files Requiring Human Review

- All durable PBOS authority/evidence artifacts.
- Five `docs/design/` authored operational reports during migration.
- Four divergent Cartographer/Sentinel pairs when validating historical provenance.
- Supabase migrations and RLS policy changes, especially PR #41.
- PR #42 constitutional/PBOS domain additions.
- ScholarRecord overlap in PRs #3, #4, and #18–#22.
- Stash entries 0–9.
- Prunable worktree metadata.

## Branch Disposition Sequence

After—not before—successful production promotion:

1. Tag the promoted convergence SHA.
2. Mark merged/superseded PRs only after semantic comparison and owner approval.
3. Rename or archive historical branch refs by policy; do not delete immediately.
4. Retain `backup/*` until recovery artifacts and stashes have durable custody.
5. Start new feature branches from the canonical convergence head.

## Stop Conditions

Stop before promotion if the worktree is dirty, case collisions remain, runtime evidence lacks custody, validation fails, `main` is no longer an ancestor, required PR deltas are unresolved, or PBOS reports invalid authorization for the proposed transition.
