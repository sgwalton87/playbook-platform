# Playbook Canonical Implementation Roadmap

## Purpose
Provide the authoritative, dependency-driven engineering plan from the current repository to the complete Playbook platform without implementing functionality, redesigning architecture, or creating duplicate systems.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 25, 2026

## Related Documents
- [Playbook Constitution](../PLAYBOOK_CONSTITUTION.md)
- [Engineering Constitution](../../CODEX.md)
- [Intelligence Architecture](./ARCHITECTURE.md)
- [Canonical Student Record](./CANONICAL_STUDENT_RECORD.md)
- [Playbook Data Map](./PLAYBOOK_DATA_MAP.md)
- [Traceability Matrix](./PLAYBOOK_TRACEABILITY_MATRIX.md)
- [Schema Gap Analysis](./PLAYBOOK_SCHEMA_GAP_ANALYSIS.md)
- [Engine Dependency Graph](./PLAYBOOK_ENGINE_DEPENDENCY_GRAPH.md)

## Executive Summary

Playbook has a substantial working foundation: a migration-managed Scholar Record graph, evidence and verification, App Router experiences, deterministic Compass and opportunity logic, portfolio/application/recommender workflows, support relationships, events/notifications, role permissions, economy/store, and unit tests. It is not yet a uniformly production-ready intelligence platform. The shared deficiencies are typed permission-filtered Record projections, command/provenance contracts, RLS-to-application parity, production data replacing demonstrations/fallbacks, lifecycle observability, and cross-engine validation.

The safest path is therefore **contract before capability**: harden the canonical Record and trust boundary; make source engines write through it; make platform events and permissions reliable; then extend existing experience and intelligence seams. Scholarship extends Opportunity. Mentor Intelligence extends the support graph. Resume and recommendations reuse portfolio/application evidence. Financial and Career journeys reuse courses, journey nodes, outcomes, and human support. No gate creates a second record, graph, catalog, event bus, API family, or workflow.

This roadmap uses **14 engineering sprints across six milestones** as a planning estimate, not a delivery commitment. Milestones 1, 2, and production validation form the critical path. Carefully bounded UI, content, and test work can proceed in parallel only after its data contract is fixed.

## Authority, Method, and Classification

Authority is applied in this order: Constitution; `CODEX.md`; committed implementation; Intelligence Architecture; Canonical Student Record; Data Map; Traceability Matrix; Schema Gap Analysis; other documentation. Historical or aspirational docs never override code. Inventory was based on committed paths under `app/`, `components/`, `lib/`, `supabase/migrations/`, and `tests/`.

Statuses are evidence claims:

- **Already Complete:** scoped repository contract and workflow are implemented and tested; this does not imply production operations.
- **Production Ready:** implementation, security, data, testing, observability, and operations are evidenced. No engine currently clears this stricter bar end-to-end.
- **Partially Implemented:** direct implementation exists but a required contract, lifecycle, persistence, safety, or validation element is absent.
- **Repository Exists:** route/component or model exists, but it is primarily static, demonstration-oriented, or lacks an end-to-end domain contract.
- **Blocked:** implementation must not begin until a prerequisite gate exits.
- **Missing:** no direct committed implementation was found.
- **Future Vision:** intentionally deferred assisted/adaptive capability, not scheduled as present functionality.

## Phase 1 — Repository Implementation Inventory

| Engine | Classification | Repository evidence and boundary |
|---|---|---|
| Scholar Record | Partially Implemented | `playbook_records` and graph tables/RLS exist in `supabase/migrations/20260701_playbook_graph.sql`; `lib/scholar/`, `lib/playbook-record/`, `app/record/page.tsx`, and Record components exist. Unified projection/command/provenance and RLS parity remain partial. |
| Compass | Partially Implemented | `lib/compass/CompassEngine.ts` composes goal, reasoning, recommendation, explainability and next-step modules; `app/compass/page.tsx` and `components/compass/CompassCoreCard.tsx` exist. Input is narrow, trust defaults are fixed, and persistence/versioned provenance are absent. |
| Resume Intelligence | Partially Implemented | `lib/scholar-data/scholarApplicationData.ts`, `lib/opportunity-toolkit/resumeBuilder.ts`, toolkit UI/PDF, workspaces and sharing exist. Verification-aware mapping, artifact lifecycle and Scholar approval contract are incomplete. |
| Scholarship Intelligence | Repository Exists | `lib/opportunities/engine.ts` includes scholarship readiness; opportunity graph, page, matches and workspaces exist. A governed live scholarship catalog/rules/freshness lifecycle is missing and must extend Opportunity. |
| Financial Literacy Journey | Repository Exists | Courses, certificates, `lib/store-economy/`, `lib/economy-integrity/`, reward surfaces and athlete financial entries exist. A general competency/journey and safety contract is missing. |
| Career Journey | Partially Implemented | `lib/core-journey/`, `app/journey/page.tsx`, opportunity career readiness and workspaces exist. Career ontology, persistent milestones, sourced labor data and alternative-path contract are incomplete. |
| Mentor Intelligence | Partially Implemented | Support directory/relationship/message/action tables, `app/api/mentor-directory/route.ts`, support libraries and mentor UI exist. Static `lib/support-network/supportNetwork.ts`, safeguarding/capacity and explainable matching block completion. |
| Recommendation Letter Intelligence | Partially Implemented | `lib/recommenders/recommenderWorkflow.ts`, recommender request/RLS migrations, API/UI and unit tests implement requests. Secure artifact ownership, consent, submission snapshot, retention and expiry are incomplete. |
| Opportunity Engine | Partially Implemented | `lib/opportunities/`, `lib/opportunity-graph/`, repository adapters, `app/opportunities/page.tsx`, `opportunity_matches`, and application workspaces exist. Production catalog ingestion, normalized criteria, provenance/freshness and outcome feedback are incomplete. |
| Event Center | Partially Implemented | Community event/RSVP tables and APIs/UI coexist with `lib/events/` and `playbook_events`. Attendance verification, lifecycle consistency, deduplication and complete event-contract coverage remain partial. |
| Notification Engine | Partially Implemented | Notifications table/API/UI, `lib/event-notifications/`, `lib/notification-automation/`, and `lib/notifications-v2/` exist. Multiple namespaces need one contract; preferences, delivery observability and comprehensive engine coverage are incomplete. |
| Support Network | Partially Implemented | `support_relationships`, invitations, messages, shared actions, directory tables/RLS, APIs, live library and UI exist. Demo graph removal, permission parity, lifecycle safety and end-to-end validation remain. |
| Certificates | Repository Exists | `app/certificates/page.tsx`, course completion concepts and Record achievement/evidence structures exist. Issuer/provenance/revocation and persistent credential lifecycle are not evidenced end-to-end. |
| Badges | Repository Exists | `app/badges/page.tsx`, `lib/badges.ts`, gamification/reward engines and achievement structures exist. Governed award rules, persistence mapping, revocation and anti-gaming verification remain incomplete. |
| Courses | Repository Exists | Course index/detail routes and `lib/courses/` content exist with journey/reward adjacency. A general course catalog, enrollment/progress/assessment persistence contract is not evidenced. |
| Transcript | Partially Implemented | `app/transcript/page.tsx`, upload component, `app/api/parse-transcript/route.ts`, academic intelligence and repository exist. Secure artifact persistence, confidence/correction flow and canonical write mapping remain partial. |
| Dashboard | Repository Exists | `app/dashboard/page.tsx`, `components/dashboard/TodaysGuidanceCard.tsx`, role dashboards and shell exist. A permission-filtered canonical read model with freshness/error/empty semantics is incomplete. |
| Connections | Partially Implemented | `lib/network/connections.ts`, connection UI, invitations, relationships, blocks/mutes and connections page exist. Canonical relationship-state consolidation and mutual lifecycle tests remain incomplete. |
| Store | Partially Implemented | Store pages, `lib/store-economy/`, `lib/store-v2/`, products/redemptions/ledger migrations and APIs exist. Namespace consolidation, transactional/idempotent integrity, inventory/operations and full RLS tests remain. |
| Admin | Partially Implemented | Admin/moderation routes, `moderation_actions`, trust reports/blocks/mutes and role permissions exist. Audited policy matrix, operational controls and production observability remain incomplete. |

**Already Complete sub-capabilities:** the committed Playbook graph schema/RLS declaration, deterministic Compass module composition, recommender request construction/status model, application workspace persistence, and core support relationship tables are implemented within their documented scope. They are not independently classified as Production Ready because full operational evidence is absent. **Future Vision:** model-assisted extraction/ranking, adaptive journeys, external labor/catalog feeds and drafting assistance remain deferred until deterministic contracts, consent, provenance, safety, and human review pass.

## Phase 2 — Engine Dependency Analysis

The following profiles are the implementation contract. “DB/API/UI/services/hooks/components” names only evidenced assets; absence is stated rather than inferred. Complexity is relative (`S`, `M`, `L`, `XL`); sprint counts are focused team estimates and may overlap after prerequisites exit.

### 1. Scholar Record
- **Mission/status/priority:** one verified lifelong record; Partially Implemented; P0; XL; 2 sprints.
- **Prerequisites/blockers/downstream:** auth, roles, RLS and graph migration exist; blocked by adapter/projection inventory and policy agreement; blocks every intelligence engine, Dashboard, exports and journeys.
- **Reuse/data/surfaces:** graph tables in `20260701_playbook_graph.sql`; `lib/scholar/`, `lib/playbook-record/`, repositories, Record/portfolio/timeline/trust components and routes. No generic Record API should be added without a bounded command need; hooks are not evidenced as a canonical boundary.
- **Required extension/debt:** versioned permission-filtered projection, explicit validated commands, provenance/revocation/idempotency, adapter consolidation and application/RLS parity. This reduces the highest-risk duplicate-model and `LegacyValue` debt.
- **Risks/tests/validation/success:** over-sharing, stale or duplicate truth, migration drift. Contract/mapping, RLS role matrix, migration, deletion/correction/export, idempotency and privacy tests must prove zero unauthorized reads, traceable writes, fresh projections and no competing record.
- **Impact:** a coherent Scholar experience and trustworthy evidence foundation; enables all platform value.

### 2. Compass
- **Mission/status/priority:** explain readiness and optional next steps; Partially Implemented; P1 after Record; L; 1 sprint.
- **Prerequisites/blockers/downstream:** typed Record projection, repository freshness and proposal contract; feeds Dashboard, Career and Opportunity.
- **Reuse/data/surfaces:** `lib/compass/*`, academic/opportunity/trust repositories, `app/compass`, Compass card. It has no justified dedicated table/API/hook; reuse events/notifications for accepted lifecycle actions.
- **Required extension/debt:** remove fixed trust/default fallbacks, type sources, add engine version/time/evidence factors and accept/edit/defer/dismiss. Consolidates reasoning instead of adding another recommendation service.
- **Risks/tests/validation/success:** opaque or biased guidance and stale reports. Fixture, explanation fidelity, missing-data, permission, fairness/accessibility and proposal-lifecycle tests; success is reason visibility and useful accepted actions, not forced conversion.
- **Impact:** clearer agency-preserving guidance; unlocks differentiated intelligence value.

### 3. Resume Intelligence
- **Mission/status/priority:** create Scholar-controlled, evidence-grounded application artifacts; Partially Implemented; P1; L; 1 sprint.
- **Prerequisites/blockers/downstream:** Record projection/verification, sharing, PDF and workspaces; supports Opportunity, Scholarship and Recommendation Letters.
- **Reuse/data/surfaces:** scholar application mapper, resume builder/PDF/toolkit, portfolio shares and application workspace API/tables/components. No separate resume truth table is justified before exact artifact-retention requirements are approved.
- **Required extension/debt:** preserve identifiers, dates, outcomes, issuer and verification; selection/order/edit/approval; accessible snapshot/export and expiry. Replace permissive legacy mapping and fallback prose.
- **Risks/tests/validation/success:** fabricated metrics, privacy leakage and stale links. No-fabrication fixtures, mapping/snapshot, accessibility/visual and permission/expiry tests; success is verified coverage, Scholar approval and reliable exports.
- **Impact:** removes repeated résumé rebuilding and improves application completion.

### 4. Scholarship Intelligence
- **Mission/status/priority:** explain trustworthy scholarship eligibility and readiness; Repository Exists, blocked on Opportunity hardening; P2; XL; 2 sprints.
- **Prerequisites/blockers/downstream:** Record, Opportunity catalog/ontology, Compass, Resume, recommendations, workspaces and notifications; downstream is scholarship application outcome evidence.
- **Reuse/data/surfaces:** opportunity engine/graph/feed/toolkit, `opportunity_matches`, `application_workspaces`; existing opportunity APIs/UI only. No parallel scholarship API/table/workflow.
- **Required extension/debt:** scholarship criteria, verified sources, refresh/deadline/award/residency rules, evidence gaps, reporting and stages within Opportunity.
- **Risks/tests/validation/success:** scams, stale deadlines, false eligibility and proxy bias. Source audits, rules/time-zone fixtures, explanation/fairness, report-resolution tests; success is valid-listing rate, eligibility precision and equitable completed applications.
- **Impact:** improves access to funding while preventing misleading matches.

### 5. Financial Literacy Journey
- **Mission/status/priority:** safe practical education, not advice; Repository Exists, blocked on Courses and Record; P2; XL; 2 sprints.
- **Prerequisites/blockers/downstream:** governed course progress/certificates, journey milestones, permissions, support relationships and notifications; outputs accepted evidence to Record.
- **Reuse/data/surfaces:** courses, journey, store/economy integrity, athlete finance only within athlete scope, rewards and certificate UI. No general financial API/table/hook exists.
- **Required extension/debt:** versioned competency map, assessment/milestone state, separate sensitive context, explicit education boundary and supporter invitation. Never equate coins with competence.
- **Risks/tests/validation/success:** harmful advice, minor privacy, coercive gamification and jurisdiction variance. Expert/legal/age review, scenario, RLS/consent, accessibility and language tests; success is retained competency, help-seeking and zero privacy incidents.
- **Impact:** durable financial confidence and a responsible education offering.

### 6. Career Journey
- **Mission/status/priority:** enable broad, reversible career exploration; Partially Implemented, blocked on Record/Compass; P2; XL; 2 sprints.
- **Prerequisites/blockers/downstream:** courses/certificates, Opportunity, Resume, mentor/support and notifications; feeds outcomes, applications and Dashboard.
- **Reuse/data/surfaces:** core journey, FirstJourney, opportunity graph, Compass, workspaces, employer/courses/portfolio pages; Record outcomes/timeline/matches. No unified career API/hook is evidenced.
- **Required extension/debt:** versioned pathway concepts, persistent milestones and exploration history, alternatives, sourced/fresh labor data only if approved. Preserve aspiration versus verified competency.
- **Risks/tests/validation/success:** premature tracking, bias and stale market claims. Ontology/source, alternatives, permission, explanation/equity and outcome-calibration tests; success includes exploration breadth and goal revision.
- **Impact:** converts evidence into flexible next steps without narrowing Scholar agency.

### 7. Mentor Intelligence
- **Mission/status/priority:** strengthen safe human support; Partially Implemented, blocked on relationship and safety policy; P2; XL; 2 sprints.
- **Prerequisites/blockers/downstream:** roles, directory, Connections, trust/moderation, permissions, messages/actions and notifications; supports Career/Financial journeys and verification.
- **Reuse/data/surfaces:** support directory/relationship/invitation/message/action tables and APIs; mentor/connect/support UI; support live, relationship, permissions and network libraries. No second graph.
- **Required extension/debt:** replace static graph, define eligible/capacity-aware explainable candidates, mutual/guardian controls, decline/block/report/end and least privilege.
- **Risks/tests/validation/success:** unsafe contact, overload, sensitive disclosure and biased access. Safeguarding/legal, RLS/abuse, capacity, match-reason and lifecycle tests; success is safe mutually accepted relationships and follow-through.
- **Impact:** reinforces—not replaces—the Scholar's chosen support network.

### 8. Recommendation Letter Intelligence
- **Mission/status/priority:** evidence-grounded requests with recommender-owned letters; Partially Implemented, blocked on Record projection/auth review; P1; XL; 1–2 sprints.
- **Prerequisites/blockers/downstream:** consented evidence packs, recommender auth/mail, workspace, RLS, events; feeds application status.
- **Reuse/data/surfaces:** `recommender_requests`, request API, recommender routes/components, workflow and auth libraries, mail gateway, existing tests.
- **Required extension/debt:** secure accept/decline, consent preview, deadline preferences, upload/editor, immutable submission snapshot, audit, withdrawal/expiry and retention. Draft assistance remains Future Vision.
- **Risks/tests/validation/success:** identity bypass, confidentiality leak, coercion and duplicate reminders. Token/RLS penetration, lifecycle/idempotency, consent, retention/export, mail and accessibility tests; success is secure on-time submission and zero incidents.
- **Impact:** reduces request friction while protecting independent human judgment.

### 9. Opportunity Engine
- **Mission/status/priority:** bring explainable opportunities to Scholars; Partially Implemented; P1 after Record; XL; 2 sprints.
- **Prerequisites/blockers/downstream:** Record projection, ontology/repository contract, source governance; enables Scholarship, Career, applications, Dashboard.
- **Reuse/data/surfaces:** opportunities and opportunity-graph libraries/types/repositories, feed/marketplace/card, opportunities page, `opportunity_matches`, workspace and sharing APIs. Hooks are not evidenced as a core contract.
- **Required extension/debt:** normalized catalog ingestion, criteria/version/source freshness, deterministic eligibility versus ranking, feedback/outcomes and proposal actions. Consolidate overlapping repository adapters.
- **Risks/tests/validation/success:** stale/fraudulent listings, unfair ranking and missed deadlines. Contract/rule/source, freshness, explanation/fairness, RLS and outcome tests; success is valid inventory, reason accuracy, diverse exposure and completed actions.
- **Impact:** realizes “opportunity should find the Scholar” without constraining independent search.

### 10. Event Center
- **Mission/status/priority:** govern community events and normalized domain event flow; Partially Implemented; P1; L; 1 sprint.
- **Prerequisites/blockers/downstream:** auth/RLS, event catalog and idempotency; feeds Record participation, notifications, rewards and Admin.
- **Reuse/data/surfaces:** `community_events`, RSVPs, `playbook_events`, event APIs/page, `lib/events/` and `lib/social-events/`. No duplicate bus.
- **Required extension/debt:** clarify community-versus-domain event boundaries, attendance attestation, lifecycle, schemas/versioning, deduplication and replay/audit behavior.
- **Risks/tests/validation/success:** duplicate rewards/notices, forged attendance and ordering errors. Schema/contract, organizer/RLS, idempotency, retry and time-zone tests; success is traceable events and near-zero duplicate processing.
- **Impact:** dependable activity capture and platform automation.

### 11. Notification Engine
- **Mission/status/priority:** deliver relevant permission-aware notices; Partially Implemented; P1 after Event Center; L; 1 sprint.
- **Prerequisites/blockers/downstream:** committed events, recipient permissions/preferences and delivery provider; serves all engines.
- **Reuse/data/surfaces:** notifications migration/API/page, event-notification pipeline, automation/digest/escalation, v2 center/engine, email service. No new notification table/API.
- **Required extension/debt:** establish one facade/contract across namespaces, preferences, idempotent delivery, engine templates, observability and dead-letter/retry policy.
- **Risks/tests/validation/success:** spam, leakage, alert fatigue and duplicate delivery. Recipient/permission, preference, dedupe/retry, template/accessibility and provider-failure tests; success is explainable delivery with low duplicates and opt-out compliance.
- **Impact:** timely action without eroding trust.

### 12. Support Network
- **Mission/status/priority:** coordinate Scholar-authorized humans and actions; Partially Implemented; P1; XL; 1–2 sprints.
- **Prerequisites/blockers/downstream:** Connections, roles, permissions, trust/moderation and events; enables Mentor, journeys and human verification.
- **Reuse/data/surfaces:** all support tables/routes, live/relationship libraries, support components/pages, workflows and permission graph. Static support graph is demo-only debt.
- **Required extension/debt:** one relationship state model, remove production fallback, field/action scopes, end/revoke lifecycle, audit and notification integration.
- **Risks/tests/validation/success:** unauthorized access, stale relationships and support overload. Role/RLS parity, invitation/end/revoke, message/action and block/report E2E tests; success is zero unauthorized access and clear active scopes.
- **Impact:** makes intelligence human-supported and constitutionally safe.

### 13–16. Learning and Recognition Sources

| Engine | Mission / status / priority / estimate | Dependencies and reuse | Required extensions, risk and validation | Success and impact |
|---|---|---|---|---|
| Courses | Govern learning; Repository Exists; P1; L; 1–2 | Auth, content governance and Record; reuse course routes/content, journey, rewards, certificates | Catalog/enrollment/progress/assessment persistence and versioning; test access, progress idempotency, assessment integrity and accessibility | Reliable completion evidence enables journeys and platform learning value |
| Transcript | Convert uploaded records into reviewable academic evidence; Partial; P1; L; 1 | Secure upload/parser and Record command; reuse transcript page/card/API and academic intelligence | Artifact policy, parser confidence/provenance, correction/approval and course mapping; test hostile files, fixtures, confidence, correction, RLS | Accepted values are traceable; Scholars correct errors before Record updates |
| Certificates | Preserve issuer-backed credentials; Repository Exists; P1; M; 1 | Courses, Record evidence and portfolio; reuse certificate page and achievement/evidence tables | Credential contract, issuer, criteria, expiry/revocation and sharing; test issuance rules, provenance, revocation, permissions | Verifiable portable credentials strengthen portfolios |
| Badges | Recognize governed achievements; Repository Exists; P2; M; 1 | Events/rewards, Record, anti-gaming; reuse badges, gamification and reward events | Award-rule registry, idempotent persistence, revocation and display policy; test rule fixtures, replay/abuse, RLS | Explainable earned recognition without self-verifying loops |

No complete shared hooks were found for these four boundaries. Any hook added later must call the established service/API contract rather than own business logic.

### 17–20. Experience and Operations

| Engine | Mission / status / priority / estimate | Dependencies and reuse | Required extensions, risk and validation | Success and impact |
|---|---|---|---|---|
| Dashboard | Present role-aware truth and proposals; Repository Exists; P1; L; 1 | Record projection, Compass/Opportunity/Support read models; reuse dashboard, guidance card, role dashboards and shell | Canonical read model, freshness and explicit loading/empty/error/restricted states; test roles, stale/partial data, accessibility/responsive behavior | A coherent daily experience without creating truth |
| Connections | Govern mutual relationship state; Partial; P1; L; 1 | Auth/roles/trust; reuse network library/button, invitations, relationships, blocks/mutes and pages | Consolidated lifecycle, mutual consent, revocation and audit; test state machine, concurrency, RLS and abuse controls | Safe reliable graph enables support and mentoring |
| Store | Redeem governed virtual value; Partial; P2; L; 1 | Reward events/ledger, auth/RLS and operations; reuse store/economy/v2 libraries/UI/API/tables | One facade, transactional redemption/idempotency, inventory/refund policy and operations; test concurrency, ledger invariants, replay, RLS | Trustworthy rewards without confusing coins and money |
| Admin | Apply least-privilege operations and moderation; Partial; P1/P3; XL; 1–2 | Role registry, RLS, trust/events/observability; reuse admin routes, moderation API/table and trust controls | Policy matrix, audited actions, queues/appeals, operational dashboards; test privilege escalation, audit immutability, moderation lifecycle | Safe operations with accountable interventions |

## Phase 3 — Dependency-Driven Milestones

### Milestone 1 — Canonical Trust Foundation (Sprints 1–3)
- **Objectives/deliverables:** Record projection/command/provenance contracts; adapter inventory; role/RLS matrix; Connections relationship lifecycle; event contract and duplicate-system decisions.
- **Dependencies/repository state:** existing graph migrations, auth/roles, evidence, repositories and events must remain intact.
- **Completion/validation:** contract/mapping, migration, RLS, privacy, idempotency and duplicate-boundary tests pass; every write is attributable and no second Record exists.
- **Blocking risks:** policy ambiguity, migration drift, unknown legacy adapters and over-broad sharing.

### Milestone 2 — Trusted Inputs and Platform Delivery (Sprints 4–6)
- **Objectives/deliverables:** Transcript review/write flow; course progress contract; certificate/badge rules; Event Center lifecycle; unified notification facade/preferences/observability.
- **Dependencies/repository state:** Milestone 1 projections/commands and authorization exited; existing routes/services are extended.
- **Completion/validation:** source-to-Record lineage, parser correction, completion/award idempotency, event dedupe and recipient permission tests pass.
- **Blocking risks:** unsafe uploads, content/issuer governance and provider failure.

### Milestone 3 — Scholar Experience and Core Intelligence (Sprints 7–9)
- **Objectives/deliverables:** hardened Compass and Opportunity contracts; canonical Dashboard read model; Resume artifact workflow; recommender artifact lifecycle.
- **Dependencies/repository state:** reliable Record inputs, event/notification delivery and sharing permissions.
- **Completion/validation:** explanations cite authorized evidence; proposals require human action; exports and letters preserve consent/expiry; UI models all states.
- **Blocking risks:** fabricated content, catalog freshness, confidential artifact leakage and ranking bias.

### Milestone 4 — Community and Human Support (Sprints 10–11)
- **Objectives/deliverables:** production Support Network state and scopes; safeguarded explainable Mentor candidates; Admin safety workflow.
- **Dependencies/repository state:** Connections, permissions, notifications, trust and audit contracts are validated.
- **Completion/validation:** invitation-to-end lifecycle, least privilege, block/report, capacity and safeguarding reviews pass; intelligence strengthens existing humans.
- **Blocking risks:** minor safety, identity assurance, capacity inequity and moderation operations.

### Milestone 5 — Guided Journeys and Specialized Opportunity (Sprints 12–13)
- **Objectives/deliverables:** Career Journey internal milestones/alternatives; Financial Literacy governed curriculum; Scholarship specialization within Opportunity; Store integrity consolidation.
- **Dependencies/repository state:** Courses/credentials, Compass/Opportunity, support and notifications are production candidates.
- **Completion/validation:** subject-matter/safety reviews, source freshness, alternative-path/fairness, sensitive-data RLS and ledger invariants pass.
- **Blocking risks:** external data licensing/quality, advice boundary, inequitable rules and transactional race conditions.

### Milestone 6 — Production Readiness and Certification (Sprint 14)
- **Objectives/deliverables:** cross-engine E2E suite, security/privacy/accessibility/performance evidence, observability/runbooks, recovery rehearsal, readiness rescore and release certification.
- **Dependencies/repository state:** all intended engines meet their prior gate exit criteria; no open critical safety/security defects.
- **Completion/validation:** production-like build, migration rehearsal, RLS/role matrix, event recovery, accessibility, load and incident exercises pass with owned evidence.
- **Blocking risks:** environment parity, missing telemetry, unresolved high risks and operational ownership gaps.

## Phase 4 — Engineering Timeline and Readiness Plan

### Timeline, Critical Path, and Parallel Work

| Sprint | Critical-path work | Safe parallel work after contract freeze |
|---|---|---|
| 1–2 | Gate 1: Scholar Record projection, commands, provenance and adapter map | RLS fixtures; UI state inventory |
| 3 | Connections/permission parity and event contracts | Source/parser threat models; content governance |
| 4–6 | Trusted sources, Event Center and Notification Engine | Dashboard read-model design; accessibility fixtures |
| 7–9 | Compass → Opportunity → Resume/recommender workflows | Dashboard UI; catalog source operations; PDF testing |
| 10–11 | Support Network → Mentor safety → Admin workflows | Human-review tooling and usability studies |
| 12–13 | Career/Financial/Scholarship specializations and Store integrity | Curated course content and source onboarding |
| 14 | Production validation, recovery, observability and certification | Documentation closure only |

**Critical path:** Record contract → authorization/RLS → trusted source writes → event/notification reliability → Compass/Opportunity contracts → support safety → specialized journeys → production certification.

**Quick wins:** remove/document demo fallbacks; inventory adapters and duplicate namespaces; add missing-data states; create contract/RLS fixtures; surface recommendation reasons already produced; connect notification preferences to the existing delivery facade. Quick wins may not bypass gates.

**Long-term work:** scholarship catalog operations, career taxonomy/labor sources, comprehensive credential issuer governance, financial curriculum review and mentor safeguarding operations. **Future work:** assisted extraction/ranking/drafting, adaptive curricula and external portability, only after deterministic governance is certified.

### Risk Register

| ID | Risk | Likelihood / impact | Mitigation and owner | Exit evidence |
|---|---|---|---|---|
| R1 | Competing or stale Scholar truth | High / Critical | Record owner: one projection/command boundary; adapter consolidation | Mapping and duplicate-store audit |
| R2 | App permissions diverge from RLS | High / Critical | Security owner: executable role/relationship matrix | Deny/allow integration suite |
| R3 | Unverified or fabricated intelligence | Medium / Critical | Engine owners: provenance, reasons, human acceptance, no-fabrication fixtures | Explanation and proposal tests |
| R4 | Sensitive Scholar/minor data exposure | Medium / Critical | Security/privacy: least privilege, consent, retention/deletion | Threat model, RLS and privacy review |
| R5 | Unsafe mentor/recommender contact | Medium / Critical | Trust owner: identity, safeguarding, block/report/end | Abuse and lifecycle E2E |
| R6 | Stale/fraudulent opportunity data | High / High | Opportunity owner: source registry, freshness SLA, report flow | Source audit and stale suppression |
| R7 | Duplicate events, rewards or notices | High / High | Platform owner: idempotency keys and transactional consumers | Replay/retry tests and metrics |
| R8 | Financial content interpreted as advice | Medium / High | Curriculum/legal: explicit education scope and expert review | Content and scenario certification |
| R9 | Biased ranking or premature tracking | Medium / High | Product/data: alternatives, factor review and equity testing | Cohort exposure and explanation audit |
| R10 | Demo/fallback data reaches production | High / High | Feature owners: runtime inventory and fail-explicit states | Mock/fallback scan and E2E |
| R11 | Multiple library generations drift | High / Medium | Architecture owner: facade and deprecation plan, no rewrite | Import/dependency checks |
| R12 | Operational recovery is unproven | Medium / High | SRE owner: telemetry, runbooks, migration/restore rehearsal | Drill evidence and alerts |

### Technical Debt Reduction Plan

1. **First:** inventory and route all Scholar data through typed projections/commands; eliminate permissive legacy boundaries as touched.
2. **Second:** establish facades over existing notification, store and support namespaces; deprecate imports gradually rather than rewrite.
3. **Third:** replace static/demo/fallback production paths with explicit loading/empty/error states.
4. **Fourth:** turn policy prose into RLS, contract, state-machine and idempotency tests.
5. **Fifth:** add provenance/freshness/version fields only through justified migrations with backfill, rollback and docs.
6. **Ongoing:** measure stale outputs, duplicate events, correction rates, unauthorized attempts and accessibility failures.

### Readiness Reports and Scores

Scores are repository-grounded planning judgments on a 100-point scale, not production certifications.

| Dimension | Score | Written justification |
|---|---:|---|
| Repository Readiness | 76 | Broad routes, components, domain modules, migrations and tests exist, but demo fallbacks and overlapping namespaces/adapters remain. |
| Architecture Readiness | 82 | Constitution, Record, ADRs, repositories, event bus and intelligence boundaries provide a strong direction; projection/command/provenance contracts are incomplete. |
| Implementation Readiness | 68 | Clear extension seams exist for most engines, but foundational contract and safety gates block specialization. |
| Documentation Readiness | 88 | Certified intelligence docs, Data Map, traceability and gap analysis are unusually comprehensive; operational contracts and this roadmap still require maintenance as code changes. |
| Operational Readiness | 48 | Production delivery telemetry, catalog/content operations, incident runbooks and restore/replay evidence are not comprehensively evidenced. |
| Testing Readiness | 62 | Unit coverage exists across recovered domains, but cross-engine E2E, RLS parity, security, accessibility, replay and production-like tests are incomplete. |
| Dependency Readiness | 72 | Dependencies are identifiable and mostly reusable; Record, authorization, source governance and event contracts must exit first. |
| Engineering Readiness | 71 | Team can begin the canonical foundation gate now, but should not begin downstream functionality. |
| **Overall PBOS Readiness** | **70** | Weighted judgment: strong repository and architecture, moderate implementation/test readiness, and materially lower operational readiness. PBOS is roadmap-ready, not fully production-ready. |

## Phase 5 — Canonical PBOS Engineering Gate Sequence

Every gate begins with repository discovery and ends with committed validation evidence. Estimated complexity and risk use `M/L/XL` and `Medium/High/Critical`.

| Gate | Mission and purpose | Expected inputs → outputs | Dependencies | Implementation and validation tasks | Tests / success / exit / deliverables | Complexity / risk |
|---|---|---|---|---|---|---|
| G1 Canonical Record Contract | Make existing Record the safe integration boundary | Graph schema, adapters, roles → projection, commands, provenance plan | Existing auth/RLS/evidence | Discover every read/write; extend types/adapters; justify any migration; validate mapping/privacy | Contract, RLS, idempotency, correction tests; zero shadow records; contract + evidence | XL / Critical |
| G2 Authorization & Relationships | Align app permissions, RLS and mutual relationship state | Role registry, policies, invitations → executable permission matrix | G1 | Discover policies/routes; consolidate lifecycle; audit/revoke | Role/RLS, concurrency, block/end tests; no unauthorized access | XL / Critical |
| G3 Trusted Source Ingestion | Make transcript/course/certificate/badge updates reviewable and attributable | Source UIs/parsers/rules → accepted Record commands | G1–G2 | Discover flows; add confidence/rules/review/provenance | File, fixture, issuance, replay and accessibility tests; full lineage | XL / High |
| G4 Event & Notification Reliability | Normalize events and delivery without coupling truth | Event catalog/tables/pipelines → versioned events, preferences, telemetry | G1–G3 | Discover emitters/consumers; add idempotency/facade/retry | Contract, replay, recipient and provider-failure tests; no duplicate effects | XL / High |
| G5 Core Intelligence | Harden Compass and Opportunity as explainable proposals | Authorized projection/catalog → versioned reasons/actions | G1–G4 | Discover engines/repos; source governance; proposal lifecycle | Fixture, freshness, explanation, fairness and permission tests | XL / High |
| G6 Scholar Artifacts | Complete Resume and recommendation artifact governance | Evidence, matches, shares/requests → approved snapshots | G1–G5 | Discover workspace/export/auth; consent, expiry, retention | No-fabrication, PDF, token/RLS, lifecycle tests | XL / Critical |
| G7 Daily Scholar Experience | Present canonical state and actions | Record/engine read models → role-aware Dashboard | G1–G6 | Discover dashboards; compose read model and explicit states | Role, stale/error, accessibility/responsive tests | L / Medium |
| G8 Human Support Safety | Productionize Support and Mentor Intelligence | Relationships/directory/actions → safe mutual support | G2, G4–G5 | Discover support graphs; remove fallback; safeguarding/capacity/reasons | Abuse, RLS, capacity, invite/end E2E; safety approval | XL / Critical |
| G9 Guided Journeys | Extend existing journey/courses for Career and Financial Literacy | Record, curriculum, opportunities/support → accepted milestones | G3, G5, G8 | Discover journey primitives; version competencies/pathways; expert review | Alternatives, content, sensitive-data and accessibility tests | XL / High |
| G10 Scholarship Specialization | Add governed scholarship rules inside Opportunity | Catalog/Record/artifacts → eligibility and application actions | G5–G6, G4 | Discover overlap; normalize sources/rules/deadlines/reporting | Rules, time-zone, freshness, fairness and E2E tests | XL / High |
| G11 Economy & Administration | Harden redemption and accountable operations | Ledger/events/policies → transactional store and audited admin | G2, G4, G8 | Discover namespaces; facade, transactions, appeals/audit | Concurrency, ledger invariant, escalation and privilege tests | XL / High |
| G12 Production Certification | Prove the integrated platform is operable | All gate evidence → release decision and runbooks | G1–G11 | Discover residual gaps; rehearse migration/recovery; instrument SLIs | Full build/E2E/security/a11y/performance/recovery; no critical open risk | XL / Critical |

For each gate, **repository discovery required** means checking current branch/status, scoped `AGENTS.md`, relevant Next.js docs when applicable, routes, components, services, hooks, schemas/RLS, APIs, tests, mocks, docs and recent history. Deliverables include the discovery record, decision/migration justification where needed, implementation, tests, docs, validation report and updated risk/readiness score.

## Phase 7 — Mandatory Implementation Rules

1. Functionality never precedes its canonical data contract.
2. Reuse repository components, APIs, tables and workflows; never duplicate them.
3. The Scholar Record is the Canonical Student Record; no competing profile or engine-owned truth store is permitted.
4. Extend existing implementations. Refactor only when a documented dependency cannot otherwise be unblocked.
5. Begin every gate with repository discovery and end it with validation evidence.
6. Justify every schema change with ownership, mapping, RLS, index, migration/backfill/rollback and documentation impact.
7. Every recommendation is versioned, sourced, explainable, correctable and presented as a proposal.
8. Humans decide: accept, edit, dismiss, defer and pursue alternatives must remain available.
9. Intelligence strengthens—not replaces—the Scholar's family, educators, counselors, coaches, mentors and other authorized supporters.
10. Delivery systems never determine canonical truth; committed domain state emits events, and notifications consume them.

## Certification Report

**Roadmap certification: GRANTED — PLAYBOOK-ROADMAP-001, July 25, 2026.**

Certification scope is the planning sequence in this document, not production readiness of the platform or any engine. The roadmap is certified because it is grounded in exact repository implementation; orders milestones behind explicit prerequisites; schedules extensions rather than duplicate records, tables, APIs or workflows; preserves the Scholar Record as canonical; and applies the Constitution, `CODEX.md`, Intelligence Architecture, Data Map, Traceability Matrix and Schema Gap Analysis in their required authority order.

Certification is invalidated if a gate bypasses its predecessor, introduces a competing canonical boundary, silently promotes an intelligence output, omits discovery/validation, or implements an unjustified schema. In that case engineering must stop, record the conflict, and recertify the affected sequence.

## Prepared First Implementation Gate — Do Not Execute

### Gate 1: Canonical Record Contract

**Mission:** make the existing Scholar Record a typed, permission-filtered, versioned and attributable integration boundary for every future engine without creating new functionality or a second record.

**Objectives**
1. Inventory every committed Scholar data reader, writer, adapter, API, table, policy and test.
2. Specify the minimum authorized `ScholarRecordProjection` variants and explicit proposed/accepted command shapes.
3. Reuse `lib/scholar`, `lib/playbook-record`, existing repositories, graph tables, evidence/verifications, events and permissions.
4. Close the smallest proven gaps in mapping, provenance, validation, idempotency and RLS parity.

**Repository discovery tasks:** read all applicable instructions and authority docs; inspect status/history; trace imports and call sites across `app`, `components`, `lib`, migrations and tests; enumerate Supabase ownership/RLS/indexes; identify demo/fallback/legacy shapes; map every field to the Data Map; search for competing record/API/workflow concepts; inspect relevant bundled Next.js guides before any framework edit.

**Implementation tasks (only after approval):** write a discovery report and contract decision; add strict projection/command types at the existing domain seam; map current adapters deliberately; add validation, actor/source/time/version/evidence/idempotency fields where already supported; propose any unavoidable migration with backfill/rollback/RLS/index documentation before applying it; emit existing events only after successful commands; update handbook documentation.

**Validation tasks and testing requirements:** run lint/build and targeted unit/integration suites; add mapping/round-trip fixtures, missing/malformed input tests, role/relationship allow-deny RLS tests, duplicate-command tests, correction/deletion/export tests and event-after-commit tests; audit that no new canonical table, generic duplicate API, silent mutation or over-broad projection exists.

**Success criteria:** every inventoried consumer uses or has a documented migration path to an authorized projection; every inventoried write uses or has a documented path to a validated command; provenance and verification state survive mapping; unauthorized access is denied; retries are idempotent; existing behavior remains stable; documentation and validation evidence are reviewable.

**Expected deliverables:** discovery inventory, contract/decision record, focused code and tests, any separately justified migration, updated database/architecture docs, validation report, risk-register delta and readiness rescore.

### Copy-and-paste-ready Codex prompt

```text
PBOS-GATE-001 — Canonical Record Contract

Mission: Implement only the first certified gate in docs/INTELLIGENCE/PLAYBOOK_IMPLEMENTATION_ROADMAP.md. Make the existing Scholar Record a typed, permission-filtered, versioned and attributable integration boundary. Do not implement downstream engine functionality and do not create a second record, duplicate API, table, event bus, permission system or workflow.

Authority order:
1. docs/PLAYBOOK_CONSTITUTION.md
2. CODEX.md
3. committed repository implementation
4. docs/INTELLIGENCE/ARCHITECTURE.md
5. docs/INTELLIGENCE/CANONICAL_STUDENT_RECORD.md
6. docs/INTELLIGENCE/PLAYBOOK_DATA_MAP.md
7. docs/INTELLIGENCE/PLAYBOOK_TRACEABILITY_MATRIX.md
8. docs/INTELLIGENCE/PLAYBOOK_SCHEMA_GAP_ANALYSIS.md
9. other documentation

Before editing:
- Read /workspace/playbook-platform/AGENTS.md and every more-specific AGENTS.md in scope.
- Inspect git status and preserve unrelated work.
- Read the Gate 1 section and dependency graph.
- Inventory every Scholar data reader/writer, adapter, route/API, service, hook, component, migration/table/RLS/index, test, mock/fallback and relevant import/call site.
- Map fields and ownership against the certified Data Map and locate competing or legacy boundaries.
- Read the relevant guide under node_modules/next/dist/docs before changing Next.js-specific code.
- Produce a concise discovery report and proposed file-level plan. Stop for clarification if implementation would contradict a higher authority.

Implementation scope:
- Extend the existing lib/scholar and lib/playbook-record seams with strict, versioned, minimum-necessary ScholarRecordProjection types and explicit validated command/result types.
- Reuse existing repositories, evidence/verifications, permissions, Supabase tables/RLS and Playbook events.
- Preserve IDs, actor, source, timestamp, verification/evidence references, consent and idempotency wherever applicable.
- Map Supabase rows to application models intentionally; do not use any or permissive spreading.
- Treat intelligence updates as proposals until an authorized human accepts them.
- Emit an existing typed event only after a successful canonical write.
- Do not add a migration unless repository evidence proves it unavoidable. If unavoidable, first document field ownership, justification, index/RLS impact, backfill, rollback and database handbook changes.
- Keep route/page files compositional and business logic in domain modules.

Validation:
- Add targeted contract/mapping and malformed/missing-input tests.
- Add role and relationship allow/deny tests proving application permissions and RLS agree.
- Add idempotent retry, correction/deletion/export and event-after-commit tests.
- Prove provenance and verification state survive every projection.
- Audit for duplicate records, generic duplicate APIs, silent mutations and over-broad fields.
- Run npm run lint, npm test, and npm run build; resolve root causes and document genuine environment limitations.

Required deliverables:
- Repository discovery inventory.
- Contract/decision record.
- Focused implementation and tests.
- Any separately justified migration and documentation.
- Validation report, risk-register delta and readiness rescore.

Exit only when every inventoried consumer uses the authorized projection or has an explicit reviewed migration path; every writer uses a validated command or has an explicit reviewed migration path; unauthorized access is denied; retries are idempotent; no competing truth store exists; and all required evidence is reviewable. Commit the focused change and prepare the required pull request. Stop after Gate 1; do not begin Gate 2.
```

No implementation work is authorized by this preparation. Await explicit approval before executing Gate 1.
