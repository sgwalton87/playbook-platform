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

## Canonical Route and Relationship Authorization

Role OS and Scholar-owned server surfaces use `lib/authorization/routeAuthorization.ts` as the reusable policy decision point and `lib/authorization/server.ts` as the authenticated Supabase resolver. A decision resolves the authenticated identity, normalizes the profile through the canonical role registry, and—when another Scholar is targeted—requires an active `support_relationships` row with the requested permission. Direct URL access is therefore evaluated independently of shell navigation. Unauthenticated page requests redirect to login; authenticated but unauthorized requests render a deliberate restricted state; APIs return HTTP 403.

The authorized evidence workflow uses the same `view_evidence` and `verify_evidence` permission vocabulary in application decisions and RLS. Scholars retain ownership; supporters receive only relationship- and consent-scoped access. Verification decisions are consequential writes and create immutable audit rows.

Onboarding completion is a server-owned lifecycle. The `complete_onboarding` database function idempotently resolves the role profile and Playbook Record, activates accepted invitation relationships, and only then marks the profile complete. The route returns a discriminated success/error response and records failed attempts without converting partial work into a completed profile.

## Explicit Scholar Context and Trusted Workflow Handoffs

Supporters never inherit an arbitrary Scholar context. `active_scholar_contexts` stores an explicit selection backed by an active `support_relationships` row; the shell exposes the selector and server authorization resolves only that persisted context or an explicitly requested, authorized Scholar identifier. Removed relationships fail closed even when a stale context row remains.

Invitation acceptance is a single database operation: it locks the invitation, validates authenticated email ownership and lifecycle state, upserts the permission snapshot into the relationship, updates invitation status, and emits the lifecycle event in one transaction. Evidence verification follows the same approach: Scholars create an atomic queue request that establishes relationship-scoped consent, reviewers act on a pending request with a required reason, and the function updates evidence, request state, audit history, and the event stream together.

Portfolio packets are assembled only on the server from the canonical allowlist (`identity`, `readiness`, and `verified_evidence`). Verified evidence must also be public before it can enter an external packet. Client requests select allowlisted sections and target purpose; they cannot supply packet contents. The same readiness service composes both the Scholar Record and Portfolio surfaces.

`playbook_events` is the notification source of truth for verification, intervention, opportunity, and milestone categories. A database trigger resolves permission-appropriate recipients and inserts deduplicated actionable notifications with governed internal destinations.


## Launch Readiness Workflow Boundaries (August 1, 2026)

Launch-facing dashboard data is assembled at the server boundary from authenticated Scholar context. Trust summaries are deterministic explanations of persisted evidence, verification, and activity signals; they are not predictive rankings. Institutional consent, support messages, role-action handoffs, moderation decisions, and role changes cross purpose-built database functions rather than accepting privileged client writes. Opportunity recommendations must expose provenance, observation time, expiration, evidence requirements, unknowns, and role context before presentation.

## Analytics Consent Boundary (August 1, 2026)

Launch analytics use a registry-first contract: the application validates the event name, retains only declared scalar dimensions, and submits the result to a consent-enforcing database function. Free-form profile, message, evidence, and portfolio content is not accepted as analytics metadata. The Settings surface is the explicit grant/withdrawal interface; product workflows remain available when consent is denied or withdrawn.


## Consequence-Bearing API Boundary Audit (August 1, 2026)

Twenty high-risk handler methods no longer instantiate service-role clients. Reads and writes now execute with the authenticated server session so RLS remains authoritative; client-supplied user identifiers cannot establish ownership. Cross-Scholar routes resolve active context and persisted grants. Administrative reward emission and balance-sensitive redemption use atomic database functions. Service-role clients remain limited to explicitly documented internal boundaries and must never authenticate a browser request.


## Dynamic Ecosystem Wiring — Action, Application, Transcript, and Mail (August 1, 2026)

Action Routing reads persisted `role_action_handoffs` and exposes only assignee-authorized lifecycle transitions. Application Workspaces resolve the active Scholar on the server, permit Scholar-owned creation, and deliberately expose loading, empty, restricted, error, and success states. Transcript parsing binds A–G writes to the authenticated Scholar, constrains media and payload size, and treats model output as untrusted bounded input. Inbound mail rejects missing webhook configuration and delegates replay-safe relationship-bound persistence to one atomic service-role-only function.
### Public Beta Exposure Boundary

Beta exposure is an opt-in server boundary, not a navigation convention. `proxy.ts` consults the canonical route allowlist in `lib/beta/exposure.ts`; routes outside the beta contract return a non-disclosing API 404 or the accessible unavailable experience. Governed routes can require a live, unexpired `beta_access_grants` row. This boundary limits surface exposure but never replaces route authorization or RLS.

`PLAYBOOK_BETA_EXPOSURE_MODE=allowlist` and `PLAYBOOK_BETA_REQUIRE_ACCESS_GRANT=true` are mandatory in a validated beta environment. Public authentication, invitation, onboarding, controlled portfolio-share, and readiness entry points remain reachable while their own server boundaries continue to enforce identity and data access.

### Environment Contract

`.env.example` is the non-secret deployment inventory. `lib/config/environment.ts` owns typed validation and `npm run env:check` fails closed when Supabase or beta-boundary variables are missing, malformed, insecure, or placeholders. Server secrets must remain unprefixed; `NEXT_PUBLIC_*` values are treated as build-time public configuration.

## Athlete Network and NIL Application Boundary (August 1, 2026)

Scholar-Athlete OS is a first-class, server-rendered operating surface rather than a Scholar dashboard fixture. `lib/scholar-athlete/server.ts` maps owner-authorized profile, recruiting, NIL identity, NIL opportunity, and activity records into an explicit projection. Client commands cross bounded APIs that independently require the canonical Scholar-Athlete role; durable ownership remains enforced by RLS.

Athletic self-report never changes verification state. Recruiting target creation atomically records relationship-direction activity and an event without implying coach interest, admission, an offer, or commitment. NIL lead creation and lifecycle commands are idempotent and audited. Direct changes to stage, agreement, disclosure, compliance, payment, and review state are trigger-blocked; signed and active stages require a signed agreement reference, submitted disclosure, and an authorized human compliance approval.

Brand discovery does not expose athlete tables. Registered active brand partners call an allowlisted security-definer projection containing only athlete-approved identity and brand fields. Marketplace visibility requires explicit athlete consent; youth, middle-school, high-school, and international athlete discovery additionally remains excluded until verified guardian consent exists. Audience demographics and private commercial records are never returned by discovery.

## Shared High-Risk API Boundary (August 1, 2026)

Authenticated mutations that invoke external providers use `lib/api-security/server.ts` for same-origin enforcement, byte-accurate JSON limits, authenticated identity, persistent quotas, idempotency, and sanitized errors. AI guidance additionally requires the current explicit processing consent, fixes the model configuration server-side, applies a provider timeout, returns no raw provider payload, and preserves human review. Privacy-minimized provenance stores prompt and output hashes rather than their content. Consent can be withdrawn without disabling core workflows. Administrative and guardian email identities and recipients come from server configuration or active authorized relationships; delivery begins and finishes through an idempotent database audit rather than reporting synthetic success.

## Operational Telemetry Boundary (August 1, 2026)

`lib/observability` is the canonical application telemetry boundary. The edge proxy issues privacy-neutral request and correlation identifiers, Next.js instrumentation captures server and client runtime failures, and shared API/provider boundaries emit redacted structured JSON with release, environment, operation, outcome, dependency, and duration fields. Liveness, readiness, and protected per-instance metric snapshots support deployment probes; the governed alert and synthetic contracts bind signals to owners and runbooks.

Repository telemetry remains a foundation rather than deployed certification. Production requires a durable collector and metric/trace backend, approved retention and access controls, hosted dashboards, bound alert queries, test-alert receipts, authenticated synthetic traces, and acknowledged on-call ownership. See [the canonical observability architecture](./OPERATIONS/PBOS_OBSERVABILITY_ARCHITECTURE_001.md).
