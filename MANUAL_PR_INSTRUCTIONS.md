# Manual PR Instructions

## Purpose
Provide a safe manual publication path for PBOS-RESCUE-001 because this checkout has no configured Git remote and automated PR creation may be unavailable.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [AGENTS.md](./AGENTS.md)
- [PBOS Rescue Audit](./PBOS_RESCUE_AUDIT.md)
- [Binary Blocker Report](./BINARY_BLOCKER_REPORT.md)
- [PBOS Rescue Report](./PBOS_RESCUE_REPORT.md)

## Branch Name
- Local branch: `work`

## Commit Hash
- Rescue commit: `2fa47e60e83b70316ea6c882eb303bf91b72becf`
- Pre-rescue head: `c42cd0d8a9d42d14d1143bb3ea3a5c6b02199f7b`

## Compare URL
No compare URL can be generated from this checkout because `git remote -v` returned no GitHub remote. After adding a remote, use this pattern:

`https://github.com/<owner>/<repo>/compare/main...work`

## Exact Git Commands

```bash
git status --short --branch
git remote add origin git@github.com:<owner>/<repo>.git
git push -u origin work
# Open the compare URL:
# https://github.com/<owner>/<repo>/compare/main...work
```

If `origin` already exists in another environment, use:

```bash
git push -u origin work
```

## Recovery Steps
1. Confirm the working tree is clean with `git status --short --branch`.
2. Confirm `canonical-athletics.patch` exists and is tracked.
3. Confirm `package.json.tmp` is deleted and ignored.
4. Add or restore the GitHub remote.
5. Push `work` to GitHub.
6. Create a pull request from `work` into the repository default branch.
7. If a PR UI reports binary blockers, verify they are not generated artifacts by comparing against [BINARY_BLOCKER_REPORT.md](./BINARY_BLOCKER_REPORT.md). Treat unsupported existing source/demo assets as platform limitations unless GitHub reports a repository-side blocker.
