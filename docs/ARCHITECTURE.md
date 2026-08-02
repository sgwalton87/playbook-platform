# Playbook OS Architecture

## Purpose
This document explains the Playbook OS platform architecture for engineers, reviewers, and AI coding agents working on production SaaS functionality.

## Ownership
Owned by Playbook OS Engineering. Security-sensitive architecture changes require review from the platform owner and must be recorded in [DECISIONS.md](./DECISIONS.md).

## Last Updated
August 2, 2026

## Related Documents
- Constitution: [../CODEX.md](../CODEX.md)
- Agent rules: [../AGENTS.md](../AGENTS.md)
- Database: [DATABASE.md](./DATABASE.md)
- Design system: [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md)
- Roadmap: [ROADMAP.md](./ROADMAP.md)
- Release process: [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)

## Platform Overview
Playbook OS is a Next.js App Router SaaS platform backed by Supabase and organized around the Scholar Record. The application presents role-aware dashboards and workflows for Scholars, families, educators, mentors, districts, universities, employers, admins, and partners.

## Architecture Philosophy
Playbook OS is not simply a web application; it is an Operating System for Scholars. The architecture must help Scholars build identity, prove achievement, receive support, discover opportunities, and continue growing over a lifetime.

Every architectural decision should support one or more platform pillars:

- Scholar Record
- Opportunity
- Community
- Verification
- Trust
- Lifelong Growth

The Scholar Record is the center of gravity for the platform. Domain engines create meaning from raw data, while pages and dashboards present that meaning to the right role at the right time. Engineering should therefore prioritize durable domain models, reusable engines, trustworthy permissions, and role-aware presentation over isolated page-level implementations.

## Scholar Record First Principle
Every feature must either:

- Improve the Scholar Record.
- Verify the Scholar Record.
- Interpret the Scholar Record.
- Present the Scholar Record.
- Unlock opportunities through the Scholar Record.

If a feature accomplishes none of these objectives, reconsider whether it belongs in Playbook OS. The Scholar Record is the platform's primary source of truth for achievement, evidence, relationships, readiness, and opportunity activation.

## Folder Structure
| Path | Responsibility |
| --- | --- |
| `app/` | App Router pages, layouts, route handlers, global styles, and route-level composition |
| `components/` | Reusable UI and feature components used by pages and workflows |
| `lib/` | Domain engines, clients, permissions, event bus, navigation, AI integrations, and business logic |
| `supabase/migrations/` | SQL migrations for schema, indexes, functions, and RLS policies |
| `docs/` | Engineering handbook, product records, architecture records, release history, and historical context |
| `tests/` | Test guidance and test-supporting documentation |

## PBOS Governed Execution

PBOS constitutional planning is implemented in `pbos/planner/`. It strictly
loads gate metadata, validates the dependency graph, evaluates repository
context, runtime validation, release state, required artifacts, lifecycle
state, and declared blockers, then deterministically selects at most one gate.
`pbos next` and `pbos status` consume this result. Planning failures remain
fail-closed and are recorded in
`pbos/runtime/constitutional-planning.json`.

The constitutional planner is the sole gate-selection authority. Engine rules
validate its decision but cannot select gates. Gate metadata is also the sole
completed-gate history. Required artifacts undergo schema, gate identity,
content identity, digest, and freshness checks where applicable. Repository
context binds both Git state classification and the content identity of tracked
and untracked changes.
PBOS separates planning from authorized execution through a durable artifact handoff:

Gate → Context → Contract → Work Package → Authorization Pending → Authorization Decision → Validation → Execution Eligibility → Adapter Dispatch.

An execution attempt first loads any existing authorization record. When no record exists, PBOS creates the execution contract and Codex work package, binds both artifacts into a `PENDING` authorization record, and stops before dispatch. The binding includes canonical artifact paths, IDs, versions, and SHA-256 content digests.

Governance may transition a pending record once to `AUTHORIZED` or `DENIED`. Terminal decisions are immutable. On resume, PBOS loads the persisted contract and work package, verifies their identities and digests against the authorization, and dispatches only an authorized, matching work package. Missing, pending, denied, stale, or modified artifacts fail closed.

Runtime handoff artifacts live under `pbos/runtime/`. Domain implementation remains constrained by the contract's allowed files, blocked files, operations, validation requirements, rollback reference, and evidence requirements.

### Repository Context Boundary
Before the PBOS runtime enters its execution phase, it validates `pbos/runtime/repository-context.json`. The captured context binds the canonical repository identity, remote, branch, commit, working-tree state, PBOS runtime state, and required runtime artifacts through deterministic SHA-256 identities.

Context validation is fail-closed and precedes execution authorization. Missing, stale, changed, or conflicting context prevents execution engines from running and records a runtime blocker. PBOS never refreshes context implicitly during execution; an intentional repository or runtime transition requires an explicit new capture.

### Governed Transition Authority

Human authority binds the stable repository transition: repository, branch, commit,
approved and excluded files, purpose, acknowledged risk, and expiration. PBOS runtime
files under `pbos/runtime/` and generated release evidence under
`docs/release-evidence/` are system-managed observations. They may be regenerated
after authorization without changing that authority. Source or scope drift remains
fail-closed, as do missing reviewers, self-approval, invalid record digests, and
expired decisions.

`npm run pbos:transition` is the canonical baseline operator flow. It inventories
and reconciles the repository, records one human authorization, refreshes when
needed, activates the trusted context, and validates the resulting lifecycle.

PBOS runtime artifact ownership and test isolation are governed by
[`docs/ENGINEERING/PBOS_RUNTIME_ISOLATION.md`](./ENGINEERING/PBOS_RUNTIME_ISOLATION.md).
Runtime tests use explicit temporary roots and may not consume repository
runtime state.

### Canonical Gate Lifecycle
PBOS gates use exactly four lifecycle states: `proposed`, `in_progress`, `blocked`, and `complete`. The canonical transitions are `proposed → in_progress`, `in_progress → blocked`, `blocked → in_progress`, and `in_progress → complete`.

Only `in_progress` is planning eligible. The planner, runtime validator, lifecycle transition service, and gate schema validation share this definition. Unknown or undocumented states fail closed and cannot become eligible through permissive fallback logic.

## App Router
Routes are implemented under `app/`. Page files compose feature experiences, layout files define shared shells, and route handlers under `app/api/` expose server-side API surfaces. Sensitive logic should remain in server contexts, while client components should focus on interaction and presentation.

## Authentication
Authentication is Supabase-backed. Client access should use public session-aware clients only for user-permitted operations. Server routes and server components are responsible for privileged decisions, identity verification, and writes that require trusted environment variables.

## Supabase
Supabase provides database, auth, and storage-adjacent capabilities. Schema changes live in `supabase/migrations/` and must be documented in [DATABASE.md](./DATABASE.md). Row Level Security protects user-owned, relationship-owned, and role-restricted records.

## Role System
Playbook OS models role-specific experiences rather than one generic account surface. Role logic is represented in `lib/role-os/`, `lib/permissions/`, `lib/navigation/`, and route-level dashboards. Supported role families include Scholar, family/guardian, educator, counselor, mentor, coach, district, university, employer, brand partner, and admin.

## Permissions
Permissions are relationship-aware. A user may access a Scholar's record only through ownership, invitation, institutional relationship, support relationship, or administrative authority. Permission logic should be centralized in domain modules and backed by database RLS whenever data crosses the Supabase boundary.

## Starting Five Architecture
The Starting Five is a core architectural subsystem for trusted Scholar support. It creates the relationship graph that powers:

- Invitations
- Permissions
- Collaboration
- Messaging
- Recommendations
- Support Networks

Relationship validation is enforced through both application logic and Supabase Row Level Security. This ensures that support roles can collaborate with Scholars without weakening privacy, ownership, or trust boundaries.

## Role-Based Operating Systems
Playbook OS provides independent operating systems built on one shared platform. Current operating systems include:

- Scholar OS
- Scholar-Athlete OS
- Parent / Guardian OS
- Teacher / Educator OS
- Counselor OS
- Mentor OS
- Coach OS
- College Recruiter OS
- College Admissions OS
- Employer OS
- Brand Partner OS
- Founder OS
- Athlete Abroad Hub

All operating systems inherit shared platform services while exposing role-specific dashboards, workflows, permissions, navigation, and intelligence. This keeps the platform cohesive while allowing each audience to operate in a purpose-built environment.

## Role Dashboard Architecture
Dashboards are route-level experiences under `app/` that compose shared navigation, domain engines, and reusable components. Role dashboards should expose next actions, evidence status, opportunity status, messages, notifications, and trust/safety states relevant to that role.

## Shared Components
Reusable components live in `components/` and should follow [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md). Components should be accessible, responsive, token-driven, and free of hidden database side effects. Feature components may remain domain-specific until reuse justifies extraction.

## Domain Engine Architecture
Business logic belongs inside reusable domain engines rather than page components. Domain engines transform raw data into reusable business models consumed by dashboards, APIs, and user interfaces.

Major engines currently used or planned include:

- Scholar Record Engine
- Portfolio Engine
- Academic Intelligence Engine
- Opportunity Engine
- Event Engine
- Community Engine
- Learning Engine
- Compass AI
- Document Intelligence
- Gamification Engine
- Notification Engine
- Messaging Engine
- Trust Engine

Engines should expose stable interfaces, avoid route-specific assumptions, and keep platform rules testable outside of page rendering. Pages compose these engines; they should not become the permanent home for scoring, eligibility, recommendation, permission, or achievement logic.

## Gamification Architecture
Playbook OS uses gamification to reinforce authentic achievement rather than maximize engagement metrics. Reward systems include:

- XP
- Coins
- Badges
- Certificates
- Milestones
- Streaks
- Progress Tracking

Gamification should be connected to meaningful learning, verified progress, portfolio completion, community contribution, and opportunity readiness. Reward events should be traceable and resistant to abuse.

## Learning Architecture
The education platform supports:

- Courses
- Modules
- Assessments
- Reflections
- Certificates
- XP Rewards
- Coin Rewards

Meaningful course completion should update the Scholar Record automatically whenever appropriate. Learning workflows should connect instruction, reflection, evidence, completion, rewards, and portfolio growth rather than functioning as isolated content consumption.

## Opportunity Platform
Verified Scholar Record data powers recommendations for:

- Colleges
- Scholarships
- Employment
- Internships
- Mentorship
- NIL
- Athletics
- Study Abroad
- Events
- Brand Partnerships

Opportunity recommendations are generated through platform intelligence rather than static listings. The Opportunity Platform should consider readiness, evidence, role context, goals, relationships, and trust signals before surfacing actions.

## Trust Layer
The Trust Layer evaluates the quality and reliability of the Scholar Record using signals such as:

- Activity
- Evidence
- Verification
- Achievement
- Outcomes
- Community

Trust powers recommendations, opportunity readiness, verification workflows, moderation decisions, and future AI capabilities. Trust signals should be explainable enough for Scholars and support roles to understand what improves readiness.

## Playbook Event Bus
Domain engines communicate through an event-driven architecture rather than direct coupling. Example event flow:

Achievement Created

↓

Scholar Record Updated

↓

Trust Engine

↓

Portfolio Engine

↓

Opportunity Engine

↓

Notifications

↓

Compass AI

↓

Role Dashboards

The Event Bus enables scalable platform evolution while minimizing coupling between systems. New events should define actor, subject, payload, permissions, lifecycle, and downstream consumers.

## Data Flow
1. Users authenticate through Supabase.
2. Routes load permitted records through server-aware clients or route handlers.
3. Domain engines in `lib/` transform database rows into product-ready models.
4. UI components render role-specific experiences and actions.
5. User actions call route handlers or server-safe functions.
6. Writes update Supabase, emit events, and refresh downstream views.
7. Intelligence engines may consume Scholar Record data and produce reviewed recommendations.

## API Strategy
API route handlers in `app/api/` own server-side integrations, trusted writes, and workflows that must not expose secrets to browsers. API responses should use predictable status codes and stable JSON shapes. New APIs must document data ownership, permissions, validation, errors, and test coverage.

## State Management
Prefer server-rendered data and local React state for route-level interactions. Use domain engines for computed state and avoid introducing global state unless multiple independent routes require the same client-side source of truth. Persist durable state in Supabase rather than browser-only stores.

## Deployment
Deployments should follow [RELEASE_PROCESS.md](./RELEASE_PROCESS.md). Production deployment requires passing build, lint, migration review, environment variable verification, observability readiness, and rollback planning.

## Architecture Change Control
Material architecture decisions must be recorded in [DECISIONS.md](./DECISIONS.md). Examples include changing auth providers, introducing new global state, adding third-party data processors, changing role boundaries, or adopting a new deployment architecture.
