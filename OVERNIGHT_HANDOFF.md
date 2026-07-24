# Overnight Handoff

## Purpose
Required handoff template for overnight PBOS and Codex work.

## Ownership
Playbook OS Engineering

## Last Updated
July 24, 2026

## Related Links
- [Engineering Constitution](./CODEX.md)
- [Repository Baseline](./docs/repository/BASELINE_STATUS.md)
- [Stabilization Backlog](./docs/repository/STABILIZATION_BACKLOG.md)

## Branch
`work`

## Commits
Document with `git log --oneline --decorate -10` before handoff.

## Files changed
Document with `git status --short` and `git diff --stat` before handoff.

## Validation
Required commands:
- `git branch --show-current`
- `git log --oneline --decorate -10`
- `git status`
- `npm run build`
- `npx tsc --noEmit`
- `npm run lint`

## Known blockers
Runtime verification must be marked `NOT YET VERIFIED` unless browser/live data evidence is captured.

## Merge requirements
Never open merge-ready PRs automatically. Future overnight PRs must be draft/review artifacts until Product Owner approval.
