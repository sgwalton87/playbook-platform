# Playbook OS Release Process

## Purpose
This document defines the release lifecycle for Playbook OS from development through deployment and rollback.

## Ownership
Owned by Playbook OS Engineering. Product owns launch scope and release notes; Engineering owns technical readiness, deployment, and rollback execution.

## Last Updated
July 23, 2026

## Related Documents
- Constitution: [../CODEX.md](../CODEX.md)
- Agent rules: [../AGENTS.md](../AGENTS.md)
- Master checklist: [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md)
- Roadmap: [ROADMAP.md](./ROADMAP.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Database: [DATABASE.md](./DATABASE.md)
- Decisions: [DECISIONS.md](./DECISIONS.md)
- Release history: [releases/RELEASE_LOG.md](./releases/RELEASE_LOG.md)
- Auto sprint system: [auto_sprint.md](./auto_sprint.md)

## Development
- Start from an intentional branch and verify `git status --short`.
- Read scoped instructions and relevant handbook documents.
- Keep changes focused on the approved sprint or issue.
- Update documentation with behavior, architecture, database, UI, or process changes.
- Do not commit secrets or local-only configuration.

## Testing
Use the smallest reliable test set for the change plus release gates for production-impacting work.

| Change type | Expected checks |
| --- | --- |
| Documentation | Markdown link verification and repository diff review |
| UI | Lint, build, responsive review, accessibility review, screenshot when visible behavior changes |
| Domain logic | Lint, build, targeted unit tests, representative workflow tests |
| API | Lint, build, request validation checks, permission checks, error checks |
| Database | Migration review, RLS review, affected route/API checks |

## Build
Run `npm run build` before merging production-impacting changes. Build failures must be fixed before release unless caused by a documented environment limitation outside the repository.

## Lint
Run `npm run lint` for code changes and release branches. Treat lint failures as product-quality issues, not cosmetic issues. Historical backup snapshots, generated build output, and archived recovery files may be excluded from the active lint gate only when the exclusion is documented in `eslint.config.mjs` with a clear rationale; active application, library, route, migration, and test code must remain inside lint scope.

## CI
The desired CI release gate includes:

1. Install dependencies with the locked package manager workflow.
2. Verify formatting and markdown links.
3. Run lint.
4. Run tests.
5. Run production build.
6. Validate Supabase migrations and RLS policy expectations.
7. Archive build, test, and release artifacts.

## Pull Requests
Every pull request should include:

- Summary of changes.
- User, role, or system impact.
- Testing evidence with exact commands.
- Documentation impact.
- Security, privacy, database, and rollback notes when relevant.
- Links to checklist, roadmap, ADR, or release documentation when relevant.

## Versioning
Until public production launch, versioning follows roadmap milestones and beta release names. Production releases should move to semantic versioning:

- Major: incompatible product, API, database, or deployment changes.
- Minor: new compatible capabilities.
- Patch: fixes, documentation corrections, and low-risk improvements.

## Release Notes
Release notes should include:

- Release name and date.
- Product summary.
- Role impact.
- Technical changes.
- Database or migration notes.
- Known limitations.
- Verification commands.
- Rollback notes.

Historical release notes belong under `docs/releases/` and should be linked from release pull requests.

## Deployment
Production deployment requires:

1. Approved pull request.
2. Passing build, lint, and required tests.
3. Reviewed migrations.
4. Verified environment variables.
5. Confirmed monitoring and alert ownership.
6. Release notes prepared.
7. Rollback path documented.

## Rollback
Rollback planning must account for application code and database state.

- Application rollback: redeploy the prior known-good build.
- Database rollback: use forward fixes when destructive rollback is unsafe; prepare reversible migrations for high-risk changes.
- Feature rollback: disable or hide the workflow when a safe feature control exists.
- Communication rollback: update release notes and affected stakeholders with impact and resolution steps.

## Release Closure
After deployment, record release evidence, update [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md), add or update release notes under `docs/releases/`, and convert any material architectural lessons into [DECISIONS.md](./DECISIONS.md).

## Next lint dependency remediation — October 21, 2026

Purpose: remove the vulnerable braces dependency chain while retaining Next lint enforcement. Owner: Playbook OS Engineering. Related: `scripts/pbos/patch-next-eslint-glob.mjs`, `tests/unit/next-eslint-glob.test.ts`, `package.json` and lockfile.

The pinned Next 16.4.2 lint plugin uses fast-glob only in its get-root-dirs helper, through globSync(pattern, {onlyDirectories:true}). The dependency override replaces that operation's package with pinned tinyglobby 0.2.17, removing fast-glob/micromatch/braces from the installed graph. This is a library replacement, not an audit exception. Tinyglobby expands literal directory arguments by default; a narrowly scoped postinstall compatibility patch sets expandDirectories:false to preserve the existing root-discovery contract. No lint rule or severity changes.

The native Node patch verifies the exact plugin version, original helper SHA-256 and replacement package identity/version. It is idempotent and fails installation if an upgrade changes those assumptions. Review and retire this override/patch together when upstream ships a suitable dependency change; do not bypass a failed patch. Only the named plugin dependency is overridden, not unrelated glob users.

Verification: clean npm ci succeeded; npm ls reported the expected npm:tinyglobby alias without invalid dependencies; npm audit --audit-level=moderate reported zero known vulnerabilities. Behavioral tests cover default, literal, wildcard, brace, array and missing roots, including exclusion of nested directories for literal roots. Real ESLint execution still reports both internal-link and image violations. Full suite passed 828 tests across 227 suites; lint and production build passed. Remote exact-revision security validation is a separate release gate.

Sources: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm (no patched braces release recorded when checked); https://superchupu.dev/tinyglobby/documentation (globSync, onlyDirectories and expandDirectories behavior). Source inspection of the installed pinned Next plugin established the limited call surface.
