# Repository Topology Report

## Snapshot

- Observation date: 2026-07-24.
- Current ref: `work` at `b33fd695b794954f10b9207ce8d82f9bf3e20914`.
- Local branches: `work` only.
- Remote branches: none; no remotes are configured.
- Upstream: none.
- Available commits: 104.
- Available merge commits: 2.
- Tags: 0.
- Tracked paths at baseline: 1,226.
- Repository is shallow. Boundary OIDs: `432ddf4df147c06dcf46f9d4481c39fb277b35da` and `ac1466a93a1f319d04a8b5c633f3253aab9751da`.

## Observable branch ancestry

All available named refs resolve through the single local branch `work`. There are no distinct named refs against which a non-trivial merge base can be computed. Current-branch self merge-base is the current commit and conveys no cross-branch relationship.

The two available merges are:

| Merge | Parents | Discoverable historical PR |
|---|---|---|
| `3a49993af860a823cd295ef9c96a9da3f6d4bf04` | `1fb73bd1bb38058c6c39640801ba0d7ef76d5858`, `bb8400fdb95a15cb0849d0a69e0abe825a5ed2b0` | PR #5, branch text `sgwalton87/agent/integrate-sprint-001-004` from merge subject only. |
| `ada2871c59aa9ea9cd0f1358de00f68243c8e841` | `3a49993af860a823cd295ef9c96a9da3f6d4bf04`, `84035c24bc5d108f9235a21e394dac2e8e6bdb4e` | PR #6, branch text `sgwalton87/agent/onboarding-role-os-foundation` from merge subject only. |

The merge subjects prove those PR numbers/text occurred in available history; they do **not** prove current owner, organization, remote, default branch, or protection policy.

## Protected, integration, and release history

- Protected history: `UNKNOWN`; requires host rulesets and audit/configuration metadata.
- Integration history: `PARTIAL`; two merges are observable, while shallow history and absent remote refs prevent completeness certification.
- Release history: no tags in available refs. Repository release logs exist as documentation, but hosting-platform releases and complete tag history are `UNKNOWN`.
- Historical pull requests: only #5 and #6 are discoverable from merge subjects. Squash/rebase PRs and host-only PR metadata cannot be enumerated without the remote/host.

## Integrity

`git fsck --full --no-progress` completed successfully and reported one dangling commit, `b23df99c8366adfd1531136b710758557e258fc9`. A dangling object is not itself corruption. There are no unmerged index entries. Full-history integrity cannot be certified from a shallow clone.

## Evidence needed for completion

1. Canonical remote URL and fetch access.
2. An unshallow fetch of all branches and tags.
3. Remote default branch and branch/ruleset settings.
4. Hosting-platform pull requests, releases, labels, projects, and milestones metadata.
