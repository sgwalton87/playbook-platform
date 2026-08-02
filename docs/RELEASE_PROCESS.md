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
- Public beta dependency audit: [GOVERNANCE/AUDITS/PUBLIC_BETA_DEPENDENCY_AUDIT.md](./GOVERNANCE/AUDITS/PUBLIC_BETA_DEPENDENCY_AUDIT.md)

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
The repository CI foundation in `.github/workflows/quality.yml` and `.github/workflows/supply-chain.yml` includes:

1. Install dependencies with the locked package manager workflow.
2. Verify formatting and markdown links.
3. Run lint.
4. Run tests.
5. Run production build.
6. Validate Supabase migrations and RLS policy expectations.
7. Validate the canonical platform registry and its evidence/dependency contracts.
8. Archive build, test, and release artifacts.

The quality workflow also resets a local Supabase stack from migrations, runs public browser smoke checks, and retains evidence artifacts for 30 days. The supply-chain workflow rejects high-severity production dependency findings and invalid registry signatures. CI definitions remain launch evidence only after hosted runs pass and protected branches require the checks.

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

## Machine-Evaluated Launch Gates

The launch evaluator fails closed across build, lint, unit tests, browser E2E, authenticated RLS integration, accessibility, monitoring, analytics, privacy review, and rollback evidence. Missing evidence is `unknown`, not passing. `/api/health/ready` reports only non-secret configuration names and returns HTTP 503 when required public Supabase configuration is absent; deployment infrastructure should use it as a readiness signal, not a comprehensive dependency probe.

Run `npm run platform:validate` before release. The command inventories registered application surfaces and reports deterministic platform, feature, infrastructure, and production readiness plus unresolved blockers. Its score is diagnostic and never replaces the required release evidence or human certification. Recovery follows [the recovery runbook](./OPERATIONS/RECOVERY_RUNBOOK.md), and production readiness remains blocked until a production-equivalent rehearsal is retained.

Run `npm run observability:validate` and `npm run test:synthetic` before beta promotion. A passing local contract validates instrumentation, redaction, alert definitions, and journey structure only. Promotion also requires collected deployed telemetry, dashboard and alert bindings, a test-alert receipt, an authenticated synthetic trace, retention/access approval, and acknowledged operational coverage as defined by [the observability architecture](./OPERATIONS/PBOS_OBSERVABILITY_ARCHITECTURE_001.md).
