# Playbook OS Engineering Constitution

## Purpose
CODEX.md is the governing engineering constitution for Playbook OS. It defines how contributors verify the repository, plan work, change software, protect product quality, and end each session with a shippable record.

## Ownership
Owned by Playbook OS Engineering. Product, design, data, and AI agent contributors must follow this constitution when working in this repository.

## Last Updated
July 24, 2026

## Related Documents
- Agent execution rules: [AGENTS.md](./AGENTS.md)
- Delivery tracker: [docs/MASTER_CHECKLIST.md](./docs/MASTER_CHECKLIST.md)
- Product roadmap: [docs/ROADMAP.md](./docs/ROADMAP.md)
- Architecture handbook: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- Database handbook: [docs/DATABASE.md](./docs/DATABASE.md)
- Design system: [docs/UI_DESIGN_SYSTEM.md](./docs/UI_DESIGN_SYSTEM.md)
- Architecture decisions: [docs/DECISIONS.md](./docs/DECISIONS.md)
- Release process: [docs/RELEASE_PROCESS.md](./docs/RELEASE_PROCESS.md)
- Auto sprint system: [docs/auto_sprint.md](./docs/auto_sprint.md)
- Intelligence architecture: [docs/INTELLIGENCE/ARCHITECTURE.md](./docs/INTELLIGENCE/ARCHITECTURE.md)

## Canonical Handbook Inventory
The Playbook OS engineering manual consists of 11 canonical documents:

1. [CODEX.md](./CODEX.md) — engineering constitution and operating standard.
2. [AGENTS.md](./AGENTS.md) — AI coding-agent instructions.
3. [docs/MASTER_CHECKLIST.md](./docs/MASTER_CHECKLIST.md) — authoritative engineering operating board.
4. [docs/ROADMAP.md](./docs/ROADMAP.md) — long-term product and technical direction.
5. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — platform architecture handbook.
6. [docs/DATABASE.md](./docs/DATABASE.md) — data architecture and Supabase handbook.
7. [docs/UI_DESIGN_SYSTEM.md](./docs/UI_DESIGN_SYSTEM.md) — design system and product experience handbook.
8. [docs/DECISIONS.md](./docs/DECISIONS.md) — architecture decision records and principles.
9. [docs/RELEASE_PROCESS.md](./docs/RELEASE_PROCESS.md) — release lifecycle and production gates.
10. [docs/auto_sprint.md](./docs/auto_sprint.md) — auto sprint operating system for reliable AI-assisted delivery.
11. [docs/INTELLIGENCE/ARCHITECTURE.md](./docs/INTELLIGENCE/ARCHITECTURE.md) — constitutional specification for intelligence that interprets the Scholar Record and produces explainable, human-controlled guidance.

## Mission
Build the world's premier Operating System for Scholars.

Every engineering decision should strengthen the Scholar Record, increase opportunity, and empower every Scholar to own a verified, lifelong portfolio of achievement.

Every feature should:

- Improve the Scholar Record.
- Increase Opportunity.
- Strengthen the Starting Five.
- Build Community.
- Feel unmistakably like Playbook OS.

If an implementation does not advance one or more of these goals, redesign it before shipping.

## North Star
Every Scholar should leave Playbook more confident than when they arrived.

Our long-term vision is that every Scholar graduates with a verified, portable, opportunity-ready Playbook Portfolio that can unlock college, careers, entrepreneurship, athletics, military service, scholarships, and lifelong opportunity.

Engineering decisions should reinforce trust, ownership, accessibility, and momentum toward that outcome.

## Repository Verification
Before making any changes, contributors must verify they are working in the correct repository.

Repository identity is determined by Git, not by the local folder name.

Run:

- `pwd`
- `git rev-parse --is-inside-work-tree`
- `git rev-parse --show-toplevel`
- `basename "$(git rev-parse --show-toplevel)"`
- `git remote -v`
- `git branch --show-current`
- `git status`
- `git log -1 --oneline`

The canonical GitHub repository is:

https://github.com/sgwalton87/playbook-platform.git

Accepted local repository names include:

- `playbook-platform`
- `playbook-premium-recovery`

Preferred development branch:

`playbook-os-v1`

Never assume the current repository is correct.

Always verify before implementation.

## Workspace & Execution Environment
Playbook OS may be developed and reviewed in several execution environments:

- Local macOS workstations for interactive development and design review.
- Docker containers for isolated dependency and runtime execution.
- GitHub Codespaces for browser-based repository work.
- Codex Cloud for AI-assisted implementation and documentation tasks.
- CI for automated build, lint, test, migration, and release verification.

Regardless of environment, contributors must verify Git identity, read scoped instructions, preserve unrelated work, and keep generated or environment-specific files out of commits unless explicitly tracked.

The repository is organized around a Next.js App Router application with platform code in these primary locations:

- `app/` contains routes, layouts, API route handlers, and global styles.
- `components/` contains reusable UI and feature components.
- `lib/` contains domain engines, Supabase clients, permissions, navigation, and business logic.
- `supabase/migrations/` contains database migrations.
- `docs/` contains engineering, product, historical, release, and architecture records.
- `tests/` contains test documentation and supporting test assets.

If workspace shape changes, update [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) and [docs/DATABASE.md](./docs/DATABASE.md) in the same change.

## AI Operating Principles
Every implementation should optimize for:

1. Correctness.
2. Maintainability.
3. Simplicity.
4. Scalability.
5. Performance.

Prefer improving existing systems over creating duplicate systems.

Avoid introducing technical debt when a production-quality implementation is practical.

Never write placeholder production code.

When uncertain, read the documentation before writing code.

## Branch Verification
Before committing, contributors must verify:

1. The active branch is intentional for the requested work.
2. The branch is not protected unless explicitly directed.
3. The diff contains only requested or necessary changes.
4. The commit message follows [AGENTS.md](./AGENTS.md#commit-message-conventions).
5. Push target is the current branch unless release management directs otherwise.

## Pre-flight Checklist
Run this checklist before implementation:

- Read relevant documentation and existing code.
- Identify whether changes affect architecture, database, UI, release, or decisions documentation.
- Confirm no placeholders are introduced.
- Confirm environment variables and secrets are not committed.
- Confirm feature work preserves role-based access and Supabase security boundaries.
- Confirm UI work uses the Playbook design system in [docs/UI_DESIGN_SYSTEM.md](./docs/UI_DESIGN_SYSTEM.md).

## Build Rules
- Production code must compile with `npm run build` before merge.
- Lint must pass with `npm run lint` or have a documented environment limitation.
- TypeScript errors must be fixed at the source rather than bypassed.
- Do not silence rules without documenting the reason in code or the pull request.
- Application changes that affect user-visible screens require a visual check and, where practical, a screenshot.

## Sprint Workflow
Read Documentation

↓

Understand Architecture

↓

Identify Sprint

↓

Identify Highest Priority Task

↓

Plan

↓

Implement

↓

Build

↓

Lint

↓

Test

↓

Update Documentation

↓

Commit

↓

Push

Sprint work should be selected from [docs/MASTER_CHECKLIST.md](./docs/MASTER_CHECKLIST.md), aligned to [docs/ROADMAP.md](./docs/ROADMAP.md), and verified using [docs/RELEASE_PROCESS.md](./docs/RELEASE_PROCESS.md).

## Git Rules
- Keep commits focused and reversible.
- Never commit secrets, local environment files, build artifacts, dependency caches, or generated output unless the repository explicitly tracks them.
- Do not rewrite shared history without explicit release-owner approval.
- Include documentation updates in the same commit as behavior changes when the change alters platform behavior.
- Review `git diff --check` before committing.

## UI Standards
Playbook UI must be accessible, responsive, and consistent with [docs/UI_DESIGN_SYSTEM.md](./docs/UI_DESIGN_SYSTEM.md). Components should use shared tokens, semantic HTML, keyboard-accessible interactions, and clear states for loading, empty, success, error, and permission-restricted views.

## Architecture Principles
- Scholar Record first: features either improve the Scholar Record or responsibly consume it.
- Role-aware by default: every workflow respects user roles and relationship permissions.
- Server trust boundary: sensitive Supabase access and privileged actions stay server-side.
- Domain engines before page logic: durable business rules belong in `lib/`, not scattered in route components.
- Reuse before building new components.
- Document decisions: material tradeoffs belong in [docs/DECISIONS.md](./docs/DECISIONS.md).

## Playbook Intelligence Architecture
Playbook intelligence transforms the Canonical Student Record—implemented in Playbook terminology as the Scholar Record—into timely, explainable guidance. It exists to answer what a Scholar should do next across educational, professional, financial, and personal-development journeys while strengthening, never replacing, the Scholar's Starting Five and wider support network.

All intelligence engines must consume permission-authorized record data, preserve provenance and uncertainty, separate recommendations from decisions, and return explanations that identify the governing goal, supporting evidence, material gaps, deadline, and available human escalation. AI may draft, rank, summarize, and simulate; Scholars and authorized humans retain control of consequential actions. The canonical engine boundaries, shared contracts, diagrams, implementation stages, and open questions are defined in [docs/INTELLIGENCE/ARCHITECTURE.md](./docs/INTELLIGENCE/ARCHITECTURE.md). Changes to those boundaries require an architecture decision record and constitutional review.

## Database Principles
Database changes must be migration-based, reversible in operational practice, and documented in [docs/DATABASE.md](./docs/DATABASE.md). Tables use explicit ownership, timestamps, indexes for high-traffic lookups, and Row Level Security for user data.

## Definition of Done
Work is complete only when:

- Requirements and acceptance criteria are satisfied.
- Tests, lint, and build have run or limitations are documented.
- Security, accessibility, and role permissions are considered.
- Shared components are reused where applicable.
- No duplicate business logic is introduced.
- No new TypeScript warnings are introduced.
- No new ESLint warnings are introduced.
- Architecture remains consistent.
- Implementation is production-ready.
- Relevant documentation is updated and cross-linked.
- The diff is focused and reviewed locally.
- A commit, push, and pull request are completed for the current branch.

## Playbook Standard
Every change should leave the repository in a better state than it was found.

If a meaningful improvement can be made while implementing assigned work without creating unnecessary scope, make the improvement and document it.

Playbook OS values craftsmanship over shortcuts.

## End-of-session Checklist
- `git status --short` reviewed.
- `git diff --check` reviewed.
- Build and lint results recorded.
- Documentation links verified when documentation changes.
- Commit created with a conventional message.
- Branch pushed.
- Pull request opened with summary, testing, and risk notes.
