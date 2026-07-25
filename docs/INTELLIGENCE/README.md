# Playbook Intelligence Layer

## Purpose
This index is the repository-grounded executive summary, discovery report, alignment report, maturity matrix, and certification record for `PLAYBOOK-ARCH-RECOVERY-001`. It documents the repository at commit-time; it does not claim that recommended extensions exist.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 25, 2026

## Related Documents
- [Engineering constitution](../../CODEX.md)
- [Architecture handbook](../ARCHITECTURE.md)
- [Database handbook](../DATABASE.md)
- [Intelligence architecture](./ARCHITECTURE.md)
- [Canonical Student Record](./CANONICAL_STUDENT_RECORD.md)
- [Playbook Data Map](./PLAYBOOK_DATA_MAP.md)
- [Playbook Traceability Matrix](./PLAYBOOK_TRACEABILITY_MATRIX.md)
- [Playbook Schema Gap Analysis](./PLAYBOOK_SCHEMA_GAP_ANALYSIS.md)
- [Compass](./COMPASS.md)
- [Resume Intelligence](./RESUME_INTELLIGENCE.md)
- [Scholarship Intelligence](./SCHOLARSHIP_INTELLIGENCE.md)
- [Financial Literacy](./FINANCIAL_LITERACY.md)
- [Mentor Intelligence](./MENTOR_INTELLIGENCE.md)
- [Career Journey](./CAREER_JOURNEY.md)
- [Recommendation Letters](./RECOMMENDATION_LETTERS.md)

## Executive Summary
The repository already contains an intelligence layer, but it is distributed across domain libraries, routes, components, tests, and migrations. Its constitutional center is the Scholar Record: `playbook_records` owns achievements, evidence, verifications, reflections, outcomes, evidence packs, timeline events, matches, and vault items in [`supabase/migrations/20260701_playbook_graph.sql`](../../supabase/migrations/20260701_playbook_graph.sql). [`lib/playbook-record/index.ts`](../../lib/playbook-record/index.ts) deliberately re-exports the Scholar domain rather than defining another record.

Compass is implemented as deterministic orchestration over academic intelligence and opportunity matching. Resume generation, scholarships, mentoring, career readiness, and recommendation letters are partially implemented or represented by adjacent capabilities. Financial literacy is represented narrowly by athlete financial entries, economy ledgers, and course/certificate signals; it is not yet a general journey engine. Human agency is preserved by treating recommendations as explained next actions, never automatic decisions.

## Discovery Method and Scope
The recovery inspected every committed path using Git's file inventory, then classified routes, UI, domain libraries, migrations, tests, configuration, and handbook/history documents. Evidence was prioritized in the mandated authority order. Repository references in this documentation are relative Markdown links and were mechanically checked.

Discovery anchors include:

- Constitution and standards: [`CODEX.md`](../../CODEX.md), [`AGENTS.md`](../../AGENTS.md), [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md), and [`docs/DATABASE.md`](../DATABASE.md).
- Data and security: all files under [`supabase/migrations/`](../../supabase/migrations/).
- Domain implementation: [`lib/`](../../lib/), particularly `scholar`, `playbook-record`, `compass`, `academic-intelligence`, `opportunities`, `opportunity-graph`, `recommenders`, `permissions`, and support/notification domains.
- Surfaces and contracts: [`app/`](../../app/), [`components/`](../../components/), and [`tests/`](../../tests/).
- Existing decisions: [`docs/ADR/ADR-0001-Playbook-Record.md`](../ADR/ADR-0001-Playbook-Record.md), [`docs/DECISIONS/ADR-0002-Scholar-Record.md`](../DECISIONS/ADR-0002-Scholar-Record.md), and [`docs/DECISIONS/ADR-0003-Portfolio-Intelligence.md`](../DECISIONS/ADR-0003-Portfolio-Intelligence.md).

## Architecture Inventory

| Subsystem | Purpose and implementation | Producers / consumers / dependencies | Maturity, reuse, limitations, extension |
|---|---|---|---|
| Identity, profiles, onboarding, roles | Supabase authentication boundaries, profile onboarding, role registry, invitations; routes under `app/auth`, `app/profile`, `app/start`, `app/role-select` | Produces user/role context for every protected domain; consumed by permissions and relationships | Implemented foundation; reuse role registry. Extend only with validated role/consent metadata. |
| Scholar Record and portfolio | Scholar model plus Playbook graph tables and record/portfolio UI | Receives achievements/evidence; consumed by Compass, applications, sharing, opportunities | Implemented authoritative core; persistence and UI have multiple adapters. Consolidate adapters, never add a second record. |
| Academics, transcript, courses | Transcript parser/analyzer, GPA, A–G, graduation/readiness engines; course routes/components | Transcript and courses produce academic signals for Record and Compass | Implemented/partial depending on persistence. Reuse `lib/academic-intelligence`; validate parsed data before record updates. |
| Certificates, badges, evidence, verification | Record graph tables and badge/certificate pages | Courses/users produce claims; trusted supporters verify; portfolio/opportunities consume | Represented and partially persistent. Extend provenance, issuer, expiry, and revocation on existing evidence graph. |
| Compass and explainability | Deterministic report, reasoning, goal, recommendation, next-step, explanation modules | Consumes academics, trust, opportunities; produces explained actions | Implemented library/UI; some defaults/demo data remain. Extend input adapters and persistence. |
| Opportunity and scholarship | Generic opportunity matching, ontology/graph, marketplace/toolkit/workspaces | Consumes record signals; produces ranked matches and application actions | Generic engine implemented; scholarship-specific lifecycle partial. Extend opportunity types and eligibility evidence. |
| Resume and applications | Scholar application-data mapper, resume builder, portfolio sharing and workspaces | Consumes profile/courses/certificates/evidence/goals/athletics | Partial. Extend mapping and provenance; do not create a resume-owned student profile. |
| Mentors, connections, support | Directory, relationships, invitations, messages/shared actions, network and mentor UI | Relationships produce permissions/actions; Compass and notifications consume | Partial but broad. Replace demo network data with relationship repository; retain scholar control. |
| Recommendations | Request status model, email content, API, recommender page, persistence/RLS | Scholar/evidence produce request; recommender produces letter/status | Partial end-to-end workflow. Extend consent, secure artifacts, audit, expiry. |
| Events and notifications | `playbook_events`, notifications, event pipeline, recipient/delivery/digest/escalation logic | All domains produce events; role-aware recipients consume notifications | Implemented foundation. Extend idempotency/observability and real relationship resolution. |
| Economy, store, financial signals | Coin ledger, rewards, store/redemptions, athlete financial entries | Activities produce reward/financial events; dashboards/store consume | Represented, not comprehensive financial literacy. Extend via journey nodes and record evidence. |
| Administration, trust, moderation | Admin/moderation routes, reports, blocks/mutes, role permissions/RLS | Users produce reports; admins consume; all sharing depends on trust | Implemented/partial. Keep sensitive actions server-side and verify policies. |
| Events/community | Community events/RSVPs plus Playbook event bus | Organizers produce events; scholars/network consume; notifications update participants | Implemented event surfaces, partial intelligence. Extend relevance ranking with explanations. |

## Implementation Maturity Matrix

“Represented” means useful repository functionality exists but not a named, complete engine.

| Capability | Classification | Repository evidence | Rationale |
|---|---|---|---|
| Compass | Implemented | [`lib/compass/CompassEngine.ts`](../../lib/compass/CompassEngine.ts), [`app/compass/page.tsx`](../../app/compass/page.tsx), [`tests/unit/compass/`](../../tests/unit/compass/) | A report contract, orchestration, explanations, UI, and tests exist. |
| Canonical Student Record | Implemented | [`lib/scholar/`](../../lib/scholar/), [`app/record/page.tsx`](../../app/record/page.tsx), Playbook graph migration | Authoritative model and persistent graph exist; some integrations remain incomplete. |
| Resume Intelligence | Partially Implemented | [`lib/scholar-data/scholarApplicationData.ts`](../../lib/scholar-data/scholarApplicationData.ts), application toolkit UI | A deterministic resume projection exists without a complete verified export lifecycle. |
| Scholarship Intelligence | Represented by existing functionality | [`lib/opportunities/engine.ts`](../../lib/opportunities/engine.ts), [`lib/opportunity-graph/`](../../lib/opportunity-graph/), [`app/opportunities/page.tsx`](../../app/opportunities/page.tsx) | Scholarship is an opportunity type/readiness result, not a distinct complete engine. |
| Financial Literacy Journey | Represented by existing functionality | [`supabase/migrations/20260704_scholar_athlete_os.sql`](../../supabase/migrations/20260704_scholar_athlete_os.sql), [`lib/store-economy/`](../../lib/store-economy/), [`app/reward-economy/page.tsx`](../../app/reward-economy/page.tsx) | Finance and economy records exist, but no general journey state machine does. |
| Mentor Intelligence | Partially Implemented | [`app/api/mentor-directory/route.ts`](../../app/api/mentor-directory/route.ts), [`lib/support-relationships/`](../../lib/support-relationships/), mentor/network surfaces | Discovery, relationships, permissions, messages, and actions exist; matching intelligence is incomplete. |
| Career Journey | Represented by existing functionality | [`lib/opportunities/engine.ts`](../../lib/opportunities/engine.ts), [`lib/core-journey/`](../../lib/core-journey/), application toolkit | Career readiness and journey primitives exist, not a unified career engine. |
| Recommendation Letter Intelligence | Partially Implemented | [`lib/recommenders/recommenderWorkflow.ts`](../../lib/recommenders/recommenderWorkflow.ts), [`app/api/recommenders/request/route.ts`](../../app/api/recommenders/request/route.ts), persistence/RLS migrations | Request lifecycle and evidence-aware messaging exist; letter intelligence and artifact governance remain. |
| Event Center | Implemented | [`app/events/page.tsx`](../../app/events/page.tsx), community-event APIs/tables | Discovery and RSVP surfaces exist; personalization remains an extension. |
| Notification Engine | Implemented | [`lib/event-notifications/`](../../lib/event-notifications/), [`lib/notification-automation/`](../../lib/notification-automation/), notification API/table | Event conversion, role-aware rules, delivery and digest logic exist. |
| Opportunity Engine | Implemented | [`lib/opportunity-graph/`](../../lib/opportunity-graph/), [`lib/opportunities/`](../../lib/opportunities/) | Matching, ontology, readiness, reasons, and next steps exist. |
| Support Network | Partially Implemented | support relationships/messages/actions migrations and [`app/support-network/page.tsx`](../../app/support-network/page.tsx) | Persistent relationships exist, while one helper still returns demo people. |
| Verification | Implemented foundation | `evidence` and `verifications` in the Playbook graph migration | Data model/RLS exist; issuer assurance and revocation are future hardening. |
| Permissions | Implemented foundation | [`lib/permissions/rolePermissions.ts`](../../lib/permissions/rolePermissions.ts), migration RLS | Application permissions and database policies exist; parity audits remain necessary. |
| Explainability | Implemented foundation | [`lib/compass/Explainability.ts`](../../lib/compass/Explainability.ts), opportunity reasons/next steps | Deterministic explanations exist; provenance/version metadata remains an extension. |

## Repository Alignment Report

### Already Implemented
- Scholar Record ownership, evidence and verification graph, timeline, opportunity matches, sharing controls, roles, RLS, Compass reasoning, opportunity matching, event-to-notification flow, and recommender request persistence.

### Partially Implemented
- Durable adapters from every screen into the Record, verified resume output, scholarship lifecycle, mentor fit/routing, career milestones, recommendation artifacts, and personalized event ranking.

### Future Extension
- Add capabilities as projections, services, journey nodes, events, and verified evidence attached to the existing record. Extensions must expose reasons, source/version, confidence where relevant, and scholar-controlled accept/dismiss/edit actions. They must not make admissions, employment, scholarship, mentor, or financial decisions for a scholar.

## Certification Report

**Certification: GRANTED for architecture reconstruction.** The documents describe the repository state and separately label recommended extensions and future vision. The Scholar Record remains the sole authoritative lifelong record. Engines consume or project it rather than competing with it. Recommendations require explanation and preserve scholar choice; mentor and supporter workflows strengthen existing human relationships rather than replacing them.

Verification performed for certification:

1. Required documents and all relative repository links were checked for existence.
2. Classification claims were traced to implementation, migration, UI/API, and test evidence.
3. The data model was checked for canonical-model duplication; no new database or application model was introduced by this documentation sprint.
4. Future recommendations name the existing implementation to extend.
5. No application code, schema, policies, or runtime behavior changed.

Certification is architectural, not a claim of production readiness for every engine. Runtime, security, accessibility, data-quality, and human review gates remain required before extensions ship.

## Prepared Next Gate — Do Not Execute

### Mission
Validate and harden the existing Scholar Record integration boundary so every intelligence capability reads a traceable record projection and writes only scholar-approved evidence, actions, or events.

### Objectives
1. Inventory current Record adapters and identify demo/in-memory fallbacks.
2. Define one typed read projection and explicit write commands over existing Scholar/Playbook Record models.
3. Prove RLS/application permission parity for those commands.
4. Add provenance and explanation metadata without creating a second canonical model.

### Repository Discovery
Inspect `lib/scholar`, `lib/playbook-record`, `lib/playbook/record`, `lib/repositories`, `lib/scholar-data`, `lib/compass`, record/portfolio routes and components, Playbook graph migrations, relevant APIs, and record/permission tests.

### Implementation Plan
Map adapters; write an ADR-compatible contract; consolidate only evidenced duplicate adapters; add targeted contract/security tests; update architecture/database docs; preserve current UI behavior. Do not add an AI provider or autonomous decision path.

### Validation Plan
Run lint, full tests, build, targeted Scholar Record/permissions/portfolio/Compass tests, migration policy review, relative-link validation, and a no-duplicate-model audit.

### Success Criteria
- One documented authoritative Record boundary.
- Every intelligence input has source/provenance.
- Every proposed write is permission-checked and scholar-visible.
- Existing behavior and RLS remain intact.
- No parallel student profile or record is introduced.

### Expected Deliverables
Record adapter inventory, boundary contract/ADR, focused implementation and tests if approved, security validation evidence, updated handbook links, and a certification note.

### Copy-and-Paste-Ready Codex Prompt
```text
PLAYBOOK-INTEL-GATE-002 — Scholar Record Intelligence Boundary Hardening

Mission: Validate and harden the existing Scholar Record integration boundary. Discover before editing. Treat the existing Scholar Record/Playbook Record as the only authoritative lifelong record; do not create a parallel model.

Inspect lib/scholar, lib/playbook-record, lib/playbook/record, lib/repositories, lib/scholar-data, lib/compass, record and portfolio routes/components, relevant API handlers, supabase/migrations/20260701_playbook_graph.sql, permissions/RLS, and targeted tests. Inventory all read adapters, write paths, demo/in-memory fallbacks, provenance gaps, and permission boundaries with file evidence.

Then propose the smallest repository-grounded implementation that defines one typed intelligence read projection and explicit scholar-controlled write commands over existing models. Consolidate only proven duplication. Preserve human agency, explanations, the support network, server trust boundaries, and current UI behavior. Do not add an AI provider, autonomous decisions, or a second canonical record.

Validate with npm run lint, npm test, npm run build, targeted Scholar Record/permissions/portfolio/Compass tests, an RLS parity review, link checks, and a no-duplicate-model audit. Update relevant architecture/database/decision documentation. Commit the approved changes and prepare a PR with summary, test evidence, risks, and documentation impact. Stop after this gate and await approval for engine implementation.
```

