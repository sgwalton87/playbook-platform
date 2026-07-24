# Playbook OS Auto Sprint System

## Purpose
This document converts the Playbook OS engineering handbook into practical, repeatable auto sprint directions. It is designed for browser-based Codex, human sprint planners, and AI coding agents that need to choose the right work, avoid duplicate implementation, preserve architecture, and produce reviewable pull requests without confusing roadmap direction with live engineering status.

## Ownership
Owned by Playbook OS Engineering. Product, design, data, security, and AI-agent contributors must keep this document synchronized with the engineering constitution, master checklist, architecture handbook, database handbook, UI design system, ADRs, roadmap, and release process.

## Last Updated
July 24, 2026

## Related Documents
- [Engineering constitution](../CODEX.md)
- [Agent instructions](../AGENTS.md)
- [Master engineering checklist](./MASTER_CHECKLIST.md)
- [Product roadmap](./ROADMAP.md)
- [Architecture handbook](./ARCHITECTURE.md)
- [Database handbook](./DATABASE.md)
- [UI design system](./UI_DESIGN_SYSTEM.md)
- [Architecture decision records](./DECISIONS.md)
- [Release process](./RELEASE_PROCESS.md)


## PBOS Engine Integration

PBOS Engine v3 is the deterministic, adapter-driven, resumable orchestration runtime for auto sprints. Use `npm run pbos:next` to load PBOS configuration, load persistent state, discover gates, evaluate reusable rules, select exactly one eligible gate, update release evidence, append PBOS history and ledger records, recommend the next gate, and stop.

The engine must continue to treat this guide as sprint sequencing, `MASTER_CHECKLIST.md` as implementation truth, `RELEASE_PROCESS.md` as release policy, `docs/HISTORY/` and `docs/LEDGER/` as institutional memory, and `ROADMAP.md` as future direction only. PBOS Engine v3 stops before making application code changes. Future engine milestones may add implementation mode only after validation, documentation updates, state management, audit, and release evidence behavior are proven safe.

## Auto Sprint North Star
Auto sprints exist to move Playbook OS toward the world's premier Operating System for Scholars without weakening trust, architecture, data ownership, or the Scholar Record.

Every generated sprint must advance at least one of these outcomes:

- Improve the Scholar Record.
- Verify the Scholar Record.
- Unlock or improve opportunity access.
- Strengthen the Starting Five and trusted support graph.
- Improve role-based operating systems.
- Reduce production risk.
- Improve release readiness.
- Improve platform maintainability.

If a sprint cannot name the outcome it advances, do not generate it.

## The 10 Auto Sprint Requirements
Every auto sprint must include these 10 required elements:

1. **Sprint task ID format** — use stable IDs such as `PBOS-GATE-001`, `PBOS-RLS-001`, `PBOS-UI-001`, or `PBOS-TYPE-001`.
2. **Priority scoring model** — rank candidate work before selecting it.
3. **Required input documents** — read the handbook source hierarchy before planning.
4. **Required output format** — generate sprint plans with the approved sprint output template.
5. **Acceptance criteria template** — define observable completion conditions before implementation.
6. **Definition of Done template** — prove completion using build, lint, tests, validation, documentation, and risk evidence.
7. **How to read `MASTER_CHECKLIST.md`** — treat it as the operating board and implementation source of truth.
8. **How to map `ROADMAP.md` into backlog items** — use roadmap direction only after current checklist status is understood.
9. **How to avoid duplicating existing components or business logic** — search shared UI, domain engines, repositories, routes, migrations, and tests before creating new systems.
10. **How to generate PR summaries from sprint output** — convert objective, scope, tests, risks, and documentation impact into reviewable PR metadata.

A sprint that omits one of these elements is not ready for autonomous implementation.

## Canonical Source Hierarchy
Auto sprint tools must read the handbook in this order:

1. [CODEX.md](../CODEX.md) for mission, operating principles, workflow, and Definition of Done.
2. [AGENTS.md](../AGENTS.md) for agent behavior, coding standards, and prohibited actions.
3. [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md) for current implementation state, priorities, blockers, sprint status, phase status, and release readiness.
4. [ROADMAP.md](./ROADMAP.md) for long-term direction only after current-state work is understood.
5. [ARCHITECTURE.md](./ARCHITECTURE.md) for implementation boundaries, domain engines, role operating systems, data flow, and API strategy.
6. [DATABASE.md](./DATABASE.md) for schema, RLS, migration, evidence, trust, and data ownership rules.
7. [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) for dashboard hierarchy, shared components, tokens, accessibility, and Playbook experience language.
8. [DECISIONS.md](./DECISIONS.md) for accepted ADRs, historical decisions, and architecture principles.
9. [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) for release gates, test evidence, CI, deployment, rollback, and closure.

The [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md) is the sprint source of truth. The [ROADMAP.md](./ROADMAP.md) explains direction but must not override current implementation status, blockers, or release readiness.

## How to Read `MASTER_CHECKLIST.md`
Read the master checklist as the live engineering operating board:

1. Start with Overall Completion, Engineering Metrics, Current Sprint, Current Priorities, and Current Blockers.
2. Review Sprint 1.1 through Sprint 1.4 before selecting new work.
3. Review the relevant Phase 1 through Phase 15 section for status, notes, completion percentage, and blocked items.
4. Confirm whether the work belongs to the Final Release Checklist or Progress Tracking sections.
5. Never mark work complete unless the Definition of Done and required evidence are satisfied.
6. Preserve existing status indicators, completion percentages, engineering commentary, and QA evidence.

## How to Map `ROADMAP.md` into Backlog Items
Use the roadmap for direction, not status:

1. Identify the roadmap phase or milestone the work supports.
2. Find the corresponding current-state item in [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md).
3. If no checklist item exists, create a proposed backlog item rather than assuming implementation should begin immediately.
4. Confirm that the proposed work does not bypass current release blockers.
5. Convert roadmap themes into sprint-sized outcomes with acceptance criteria and test evidence.
6. Prefer release readiness, RLS validation, build/lint health, shared UI consolidation, and architecture alignment before feature expansion.

## Sprint Selection Algorithm
Use this sequence before proposing work:

1. Verify repository identity, branch, status, and latest commit.
2. Read the current sprint, current priorities, current blockers, and release readiness from [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md).
3. Select the highest-priority work that unblocks production readiness or reduces release risk.
4. Check [ARCHITECTURE.md](./ARCHITECTURE.md), [DATABASE.md](./DATABASE.md), [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md), and [DECISIONS.md](./DECISIONS.md) for implementation constraints.
5. Search the repository for existing components, utilities, domain engines, repositories, migrations, and tests before proposing new ones.
6. Produce a sprint plan with objective, scope, files likely affected, acceptance criteria, test plan, documentation impact, risks, and rollback path.
7. Implement only the approved sprint scope.
8. Update documentation when behavior, architecture, database, UI standards, release process, or operating status changes.
9. Run required checks and record exact evidence.

## Priority Scoring Model
Score candidate sprint work from 1 to 5 in each category:

| Category | Question |
| --- | --- |
| Scholar Impact | Does this improve Scholar confidence, ownership, verified records, or opportunity access? |
| Release Risk | Does this remove a blocker to merge, build, lint, test, security, RLS, or deployment readiness? |
| Architecture Alignment | Does this move implementation closer to the documented domain-engine, App Router, shared UI, and data-boundary architecture? |
| Reuse Leverage | Does this reduce duplicate components, duplicate business logic, or one-off route logic? |
| Evidence Strength | Can the sprint produce clear build, lint, test, QA, or documentation evidence? |
| Dependency Unblocking | Does this unlock multiple future sprints or remove ambiguity for future agents? |

Prioritize the highest total score. If scores tie, choose release-risk reduction before feature expansion.

## Sprint Task ID Format
Use this format:

```text
PBOS-<AREA>-<NUMBER>
```

Recommended area codes:

| Area Code | Meaning |
| --- | --- |
| `GATE` | Build, lint, test, CI, deployment, or release-gate work. |
| `RLS` | Supabase Row Level Security, policies, data ownership, or permission validation. |
| `SEC` | Authentication, authorization, service-role use, audit logging, or environment safety. |
| `UI` | Shared components, AppShell, tokens, accessibility, responsive design, or visual QA. |
| `ARCH` | Domain engines, repositories, event bus, routing, state boundaries, or architecture consolidation. |
| `DB` | Schema, migrations, indexes, storage buckets, generated types, or data model mapping. |
| `TYPE` | TypeScript hardening, public signatures, DTO validation, or `any` removal. |
| `DOC` | Documentation synchronization, ADRs, release notes, or handbook maintenance. |
| `QA` | Role-by-role workflow validation, browser E2E, regression testing, or launch QA. |
| `OPP` | Opportunity, marketplace, recruiting, recommendations, or opportunity graph work. |

Examples:

- `PBOS-GATE-001` — make lint scope production-safe.
- `PBOS-RLS-001` — create production RLS validation matrix.
- `PBOS-UI-001` — inventory active dashboards against AppShell and design system standards.

## Sprint Task Schema
Every generated sprint task must use this structure:

| Field | Requirement |
| --- | --- |
| Sprint ID | Stable identifier using the sprint task ID format. |
| Title | Concise outcome-focused name. |
| Source | Checklist phase, roadmap phase, ADR, or handbook section that justifies the work. |
| Outcome | Scholar Record, Opportunity, Starting Five, Community, Trust, Release Readiness, or Maintainability. |
| Scope | Files, folders, workflows, roles, or data areas expected to change. |
| Non-goals | Explicit boundaries that prevent scope creep. |
| Dependencies | Required docs, code paths, migrations, environment variables, or unresolved blockers. |
| Acceptance Criteria | Observable conditions required for completion. |
| Test Plan | Exact checks to run, including lint, build, targeted tests, RLS validation, E2E, accessibility, or documentation link checks. |
| Documentation Impact | Docs to update or confirmation that no docs need changes. |
| Risk Notes | Security, RLS, data migration, UX, performance, deployment, or rollback concerns. |
| Rollback Plan | How to safely undo the work if needed. |

Do not generate tasks without acceptance criteria and test evidence requirements.

## Required Output Format
Every auto sprint plan should use this template:

```markdown
# Sprint: <Sprint ID> — <Title>

## Objective
<One outcome-focused paragraph.>

## Source of Truth
- Checklist: <section/link>
- Related handbook: <section/link>
- ADR: <section/link if applicable>

## Priority Score
| Category | Score | Reason |
| --- | ---: | --- |
| Scholar Impact | <1-5> | <Reason> |
| Release Risk | <1-5> | <Reason> |
| Architecture Alignment | <1-5> | <Reason> |
| Reuse Leverage | <1-5> | <Reason> |
| Evidence Strength | <1-5> | <Reason> |
| Dependency Unblocking | <1-5> | <Reason> |

## Scope
- <In scope>

## Non-goals
- <Out of scope>

## Implementation Plan
1. <Step>
2. <Step>
3. <Step>

## Acceptance Criteria
- <Measurable condition>

## Test Plan
- <Exact command or validation>

## Documentation Impact
- <Docs to update or no-docs-change rationale>

## Risks and Rollback
- <Risk>
- <Rollback path>
```

## Acceptance Criteria Template
Acceptance criteria must be observable, reviewable, and tied to sprint scope:

- The target workflow, file, route, component, engine, migration, or policy behaves as described.
- The implementation follows the relevant handbook sections and accepted ADRs.
- Existing components, utilities, engines, repositories, and migrations were reused where practical.
- Required tests and checks pass or environment limitations are documented.
- Documentation and checklist status are updated when needed.
- No unrelated behavior is changed.

## Definition of Done Template
A sprint is done when:

- Acceptance criteria are met.
- Implementation follows [CODEX.md](../CODEX.md), [AGENTS.md](../AGENTS.md), and all scoped instructions.
- Shared components, domain engines, repositories, and existing utilities are reused where applicable.
- No duplicate business logic is introduced.
- No new TypeScript or ESLint warnings are introduced.
- Build, lint, targeted tests, and required validations pass or environment limitations are clearly documented.
- RLS or permission validation is complete when data access changes.
- Documentation and checklist status are updated.
- The final response or PR body includes summary, tests, risks, and documentation impact.

## Avoiding Duplicate Components and Business Logic
Before creating anything new, auto sprint agents must search:

- `components/` for shared UI and route-specific UI that can be generalized.
- `components/ui/`, `components/system/`, and `components/shell/` for foundation components.
- `lib/` for domain logic, utilities, engines, repositories, and data mappers.
- `lib/design-system/` for tokens and design primitives.
- `app/` for active route implementations and route handlers.
- `supabase/migrations/` for existing tables, policies, indexes, and storage assumptions.
- `tests/` for existing coverage that should be extended instead of duplicated.
- `docs/DECISIONS.md` for decisions that constrain architecture.

If an existing component or engine almost fits, prefer extending it with clear props or typed inputs instead of forking it.

## Anti-Confusion Rules
Auto sprint tools must not:

- Treat the roadmap as current implementation status.
- Mark a phase complete without evidence in [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md).
- Create new UI before checking shared components and tokens.
- Create new business logic before checking domain engines and repositories.
- Add database tables without migrations, RLS policy planning, indexes, and documentation updates.
- Use service-role keys without server-only boundaries, authorization checks, and audit notes.
- Ignore lint, build, TypeScript, RLS, or permission failures.
- Convert historical documentation into current truth without explicitly marking status.
- Delete historical documentation to reduce complexity.
- Generate placeholder code, placeholder docs, or unverifiable claims.

## Required Pre-Implementation Checklist
Before code changes begin, the sprint agent must answer:

- What current checklist item or blocker does this sprint address?
- Which Playbook pillar does it strengthen?
- What existing component, engine, repository, migration, route, or test already handles part of this work?
- Which roles are affected?
- Which data is created, read, updated, deleted, shared, or exposed?
- Which RLS policies, permissions, or service boundaries apply?
- What is the smallest production-quality change that advances the sprint?
- What evidence will prove the sprint is complete?

## Documentation Synchronization Rules
Update documentation in the same sprint when:

- Behavior changes.
- Architecture boundaries change.
- A database table, relationship, index, migration, RLS policy, or storage bucket changes.
- A shared UI standard, component, token, or dashboard hierarchy changes.
- Release gates, environment variables, CI, deployment, rollback, or QA expectations change.
- A durable architecture decision is made.
- A checklist item changes status.

Use [DECISIONS.md](./DECISIONS.md) for durable architecture decisions and [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md) for implementation status.

## Evidence Requirements
A sprint is not complete until the final response or PR body records:

- Exact commands run.
- Whether each command passed, failed, or was limited by the environment.
- Relevant screenshots for visible web-application changes.
- RLS or permission validation when data access changes.
- Documentation updates or explicit no-docs-impact rationale.
- Remaining risks or follow-up items.

## PR Summary Generation
Auto sprint PR summaries must be generated from the sprint plan and final evidence.

Use this structure:

```markdown
### Motivation
- <Why this sprint mattered.>

### Description
- <What changed.>
- <How it follows the handbook.>
- <What was intentionally left out of scope.>

### Testing
- <Exact command and result.>
- <Environment limitations, if any.>

### Risk Notes
- <Security, RLS, data, deployment, rollback, or UX risk.>

### Documentation Impact
- <Docs updated or no-docs-impact rationale.>
```

The PR body should never claim tests passed unless they actually passed in the current environment.


## PBOS-BASELINE-10 Final Release Gate
`PBOS-BASELINE-10` is the final Staff Engineer release-candidate command for elevating Playbook OS to the production baseline. It is not a feature sprint. It is the verification sequence that proves the handbook, engineering gates, architecture, security posture, QA evidence, and launch operations are ready before the branch merges to `main`.

### Objective
Establish Playbook OS as the production baseline by validating documentation, engineering quality, architecture, security, QA, and release readiness against the canonical handbook.

### Phase 1 — Documentation
Required evidence:

- All 10 handbook documents exist.
- `docs/auto_sprint.md` is restored, linked, and verified as the auto sprint operating system.
- Internal documentation links resolve.
- No placeholder sections remain.
- [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md) is designated as the implementation source of truth.
- [ROADMAP.md](./ROADMAP.md) is clearly labeled as future direction only.

Pass condition: documentation is internally consistent and complete.

### Phase 2 — Engineering Gates
Required commands:

```bash
npm install
npm run lint
npm run build
npm test
```

Required evidence:

- Lint passes or intentional exclusions are documented with rationale and follow-up ownership.
- Production build succeeds, or an environment-only failure is isolated and documented.
- Targeted unit tests pass for touched behavior.
- Browser E2E smoke suite exists for launch-critical journeys.
- Release evidence is archived in the PR, release notes, checklist, or release-candidate audit.

Pass condition: CI gates are trustworthy.

### Phase 3 — Architecture Review
Required evidence:

- Domain logic resides under `lib/`.
- Routes compose services rather than own business logic.
- Shared UI components are reused where practical.
- AppShell architecture is consistent across active role dashboards.
- Role and permission modeling is centralized rather than duplicated.

Pass condition: architecture follows Playbook OS standards.

### Phase 4 — Database & Security
Required evidence:

- Row-Level Security validation matrix is documented.
- Service-role API routes are reviewed for authorization, auditability, and server-only boundaries.
- Environment variables are documented without exposing secrets.
- Supabase migrations are reviewed for schema, relationship, index, naming, and policy correctness.
- Admin-only routes are verified against role and permission expectations.

Pass condition: security posture is validated.

### Phase 5 — Launch Readiness
Required evidence:

- Monitoring owner is assigned.
- Analytics taxonomy is defined.
- Soft-launch checklist is completed.
- Rollback procedure is documented.
- Release notes are prepared.

Pass condition: operational readiness is confirmed.

### Final Staff Engineer Release Plan
1. Push the current handbook branch to GitHub.
2. Open a pull request and do not merge it until all final gates are reviewed.
3. Confirm `docs/auto_sprint.md` exists and is linked as the 10th handbook document.
4. Execute `PBOS-GATE-001` to validate lint, build, and test gates.
5. Execute `PBOS-RLS-001` to validate database access and RLS security.
6. Execute `PBOS-UI-001` to audit AppShell usage, shared components, design system consistency, and UI reuse.
7. Execute `PBOS-QA-001` to validate critical browser journeys through automated smoke testing.
8. Review all release evidence. If every gate passes, merge to `main`, tag `v1.0.0-baseline`, and declare: `Playbook OS Production Baseline Established`.

### Success Criteria

| Area | Required Result |
| --- | --- |
| Documentation | Complete and internally consistent. |
| Engineering Gates | Build, lint, and tests are trustworthy. |
| Architecture | Domain, route, AppShell, UI reuse, and permission architecture match the handbook. |
| Security | RLS, service-role usage, environment variables, migrations, and admin paths are validated. |
| QA | Launch-critical workflows have automated or documented smoke evidence. |
| Launch Readiness | Monitoring, analytics, soft launch, rollback, and release notes are ready. |

When `PBOS-BASELINE-10` passes, Playbook OS becomes the official production baseline and all future work proceeds from the verified release.

## Recommended First Auto Sprints
The next auto sprint sequence should be:

1. `PBOS-GATE-001` — Make lint scope production-safe by removing active backup/archive files from lint or converting them into documentation snapshots.
2. `PBOS-GATE-002` — Make build pass without requiring unrelated provider keys during static analysis or page-data collection.
3. `PBOS-SEC-001` — Audit service-role API routes for authentication, authorization, data scope, and audit logging.
4. `PBOS-RLS-001` — Create and execute a production RLS validation matrix for Scholar, support, institutional, public, and admin access paths.
5. `PBOS-UI-001` — Inventory active dashboards against AppShell, shared UI components, tokens, accessibility, and responsive layout standards.
6. `PBOS-TYPE-001` — Begin high-risk `any` removal at external data boundaries and active domain engines.

Do not start feature-expansion sprints until release gates and security/RLS evidence are in a known-good state.

## Definition of Auto Sprint Ready
A sprint is ready to start when:

- The objective maps to [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md), [ROADMAP.md](./ROADMAP.md), or an accepted ADR.
- Scope and non-goals are explicit.
- Existing code and docs have been searched.
- Acceptance criteria are measurable.
- Required tests are known.
- Documentation impact is known.
- Risks and rollback are documented.

## Definition of Auto Sprint Done
A sprint is done when:

- Acceptance criteria are met.
- Implementation follows [CODEX.md](../CODEX.md), [AGENTS.md](../AGENTS.md), and all scoped instructions.
- Shared components, domain engines, repositories, and existing utilities are reused where applicable.
- No duplicate business logic is introduced.
- No new TypeScript or ESLint warnings are introduced.
- Build, lint, targeted tests, and required validations pass or environment limitations are clearly documented.
- Documentation and checklist status are updated.
- The final response or PR body includes summary, tests, risks, and documentation impact.
