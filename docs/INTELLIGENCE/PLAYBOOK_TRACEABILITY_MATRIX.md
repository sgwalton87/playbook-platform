# Playbook Intelligence Traceability Matrix

## Purpose

Trace every constitutional Intelligence Engine requirement to committed implementation evidence and explicitly classify it as existing, partial, or missing.

## Ownership

Owned by Playbook OS Engineering.

## Last Updated

July 25, 2026

## Related Documents

- [Intelligence architecture](./ARCHITECTURE.md)
- [Data map](./PLAYBOOK_DATA_MAP.md)
- [Schema gap analysis](./PLAYBOOK_SCHEMA_GAP_ANALYSIS.md)
- [Canonical Student Record](./CANONICAL_STUDENT_RECORD.md)

## Executive Summary

The matrix traces **58 requirements across the cross-cutting architecture and eight constitutional capabilities**. Of those, **18 exist, 24 are partial, and 16 are missing**. “Missing” means no complete committed implementation was found; it does not authorize a new model. The common implementation seam is the existing Scholar Record, Playbook events/notifications, support relationships, and application workspace—not an engine-specific student store.

## Status Rules

- **Existing:** direct domain/schema plus workflow or UI/test evidence supports the requirement.
- **Partial:** adjacent implementation exists, but at least one required contract, persistence, permission, provenance, or lifecycle element is absent.
- **Missing:** no direct committed implementation was found after repository-wide path and symbol discovery.
- Evidence paths are exact and claims do not rely on aspirational or historical documentation alone.

## Cross-Cutting Architecture Requirements

| ID      | Requirement                                                                      | Status   | Existing/partial implementation and evidence                                                                             | Missing boundary / conclusion                                                     |
| ------- | -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| ARCH-01 | Scholar Record remains the sole canonical student record                         | Existing | `lib/scholar/types.ts`; `lib/playbook-record/index.ts`; `supabase/migrations/20260701_playbook_graph.sql`; ADR-0001/0002 | Multiple adapters exist, but no second canonical schema was found.                |
| ARCH-02 | Engines consume minimum-necessary authorized projections                         | Partial  | `lib/scholar-data/scholarApplicationData.ts`, portfolio assembler, Compass composition                                   | No single versioned permission-filtered projection; several `LegacyValue` inputs. |
| ARCH-03 | Proposed intelligence never silently becomes fact                                | Partial  | Separate Compass/opportunity reports and request/workspace statuses                                                      | No general proposal accept/dismiss/defer/edit contract.                           |
| ARCH-04 | Outputs expose explanations/reasons                                              | Existing | `lib/compass/types.ts`, `lib/opportunities/types.ts`, opportunity graph types                                            | Provenance/version/factor contributions remain partial.                           |
| ARCH-05 | Updates use validation, permission and established workflows                     | Partial  | server routes authenticate; migrations enable RLS; Record achievement service exists                                     | Application/RLS parity and command-style writes are not fully tested.             |
| ARCH-06 | Events/notifications are reused                                                  | Existing | `lib/event-notifications/`, `lib/notification-automation/`, event/notification tables and APIs                           | Engine coverage and delivery observability vary.                                  |
| ARCH-07 | Outputs carry source, generation time and engine version                         | Missing  | Some source/time fields exist in individual tables                                                                       | No shared output provenance contract.                                             |
| ARCH-08 | Human agency: accept, dismiss, defer, edit, ask network                          | Missing  | Shared actions, invitations and application statuses are adjacent                                                        | Complete recommendation-choice lifecycle is absent.                               |
| ARCH-09 | Evidence verification captures actor, claim, time, status, provenance/revocation | Partial  | `evidence` and `verifications` tables/model                                                                              | Issuer assurance, uniform provenance and revocation are absent.                   |
| ARCH-10 | RLS/application permissions agree                                                | Partial  | RLS migrations and `lib/permissions/rolePermissions.ts`                                                                  | No complete parity matrix/runtime role test; external-table RLS absent.           |

## Canonical Student Record

| ID     | Requirement                                                                                  | Status   | Evidence                                                                  | Missing boundary / conclusion                                          |
| ------ | -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| CSR-01 | Own identity, learning, achievement, evidence, reflection, outcomes and opportunity progress | Existing | Scholar types; Playbook graph tables; record/dashboard/portfolio surfaces | Identity/academic persistence also depends on missing-DDL tables.      |
| CSR-02 | Separate claims/evidence from verification decisions                                         | Existing | `achievements`, `evidence`, `verifications`; `lib/scholar/models/`        | Boolean `evidence.verified` can drift from verification rows.          |
| CSR-03 | Reusable evidence packs and timeline                                                         | Existing | `evidence_packs`, `timeline_events`, achievement service                  | Not all producers use these adapters.                                  |
| CSR-04 | One typed read projection                                                                    | Partial  | `ScholarRecord` and `buildScholarRecord`                                  | Legacy/untyped sources and no permission/version envelope.             |
| CSR-05 | Explicit proposed-write commands with actor/source/consent/idempotency                       | Missing  | CRUD services/routes exist                                                | No shared command contract.                                            |
| CSR-06 | Correction/deletion/revocation/portability lifecycle                                         | Partial  | soft-delete fields, visibility, portfolio shares                          | End-to-end correction, revocation and export governance not evidenced. |

## Compass

| ID     | Requirement                                                              | Status   | Evidence                                                     | Missing boundary / conclusion                              |
| ------ | ------------------------------------------------------------------------ | -------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| CMP-01 | Consume courses and trust, derive academic/opportunity intelligence      | Existing | `lib/compass/CompassEngine.ts`; academic/opportunity engines | Page uses demo courses and trust default.                  |
| CMP-02 | Produce typed score/headline/summary/prioritized recommendations/actions | Existing | `lib/compass/types.ts`; Compass UI; `tests/unit/compass/`    | —                                                          |
| CMP-03 | Explain reasons and next steps                                           | Existing | Compass types/modules/components                             | Factor contributions/evidence citations absent.            |
| CMP-04 | Consume authorized full Record projection                                | Partial  | Academic/application adapters exist                          | Compass accepts narrow page-owned input.                   |
| CMP-05 | Include evidence links, missing-data disclosure, time/version/confidence | Missing  | Academic reports include some missing signals                | No complete Compass contract.                              |
| CMP-06 | Scholar controls lifecycle and network escalation                        | Missing  | Shared actions/event/notification primitives exist           | No Compass accept/dismiss/defer/edit/ask-network workflow. |

## Resume Intelligence

| ID     | Requirement                                                   | Status   | Evidence                                                                  | Missing boundary / conclusion                                    |
| ------ | ------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| RES-01 | Project profile/courses/certificates/evidence/goals/athletics | Existing | `lib/scholar-data/scholarApplicationData.ts`                              | Input is permissive legacy data.                                 |
| RES-02 | Reuse portfolio/workspace/share/PDF surfaces                  | Existing | portfolio components; application workspace/share APIs; PDF route/tooling | Exact snapshot semantics incomplete.                             |
| RES-03 | Preserve IDs, verification, dates, issuer, outcomes           | Partial  | Source record models contain several fields                               | Resume mapper drops most provenance/trust detail.                |
| RES-04 | Scholar selection/order/edit and explained tailoring          | Missing  | Toolkit/workspace editing is adjacent                                     | No verified resume lifecycle or tailoring-reason contract.       |
| RES-05 | Accessible structured/PDF snapshot and expiry enforcement     | Partial  | PDF tooling and `portfolio_shares.expires_at`                             | Accessibility and immutable snapshot validation not evidenced.   |
| RES-06 | Generated language is draft; no fabricated metrics            | Partial  | Deterministic mapper and existing evidence inputs                         | No formal generation/approval/no-fabrication policy enforcement. |

## Scholarship Intelligence

| ID     | Requirement                                                                | Status   | Evidence                                                                   | Missing boundary / conclusion                             |
| ------ | -------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------- | --------------------------------------------------------- |
| SCH-01 | Extend generic Opportunity Engine, not separate truth store                | Existing | opportunity libraries/types; `opportunity_matches`; application workspaces | —                                                         |
| SCH-02 | Read academic/leadership/service/certificate/badge signals                 | Partial  | `lib/opportunities/engine.ts`; Scholar Record projections                  | Several source tables lack committed DDL/adapters.        |
| SCH-03 | Explain readiness/reasons/next steps                                       | Existing | opportunity types/engine/UI                                                | Current scholarship is a coarse built-in readiness entry. |
| SCH-04 | Typed eligibility, sponsor/source/freshness/deadline/award/renewal         | Missing  | generic requirements/deadline fields exist                                 | No scholarship catalog/rule provenance contract.          |
| SCH-05 | Distinguish hard eligibility, inferred fit, missing data, optional actions | Missing  | reasons/next steps are generic                                             | No typed distinction.                                     |
| SCH-06 | Scam/safety review and outcome tracking                                    | Missing  | trust reporting/application status are adjacent                            | Scholarship-specific review/outcomes absent.              |

## Financial Literacy Journey

| ID     | Requirement                                                             | Status   | Evidence                                                                | Missing boundary / conclusion                                    |
| ------ | ----------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| FIN-01 | Reuse courses, certificates, achievements, finance/economy capabilities | Existing | course/certificate surfaces; athlete finance/economy migrations/modules | —                                                                |
| FIN-02 | General versioned competency/curriculum/milestone graph                 | Missing  | generic journey/course primitives                                       | No cross-population literacy model.                              |
| FIN-03 | Keep real financial data distinct from coins/rewards                    | Partial  | separate athlete finance, coin ledger and store tables                  | UI/domain-wide safety boundary is not formalized.                |
| FIN-04 | Record completion as existing achievement/evidence                      | Partial  | achievements/evidence and certificate/course workflows exist            | Durable completion-to-Record adapter not consistently evidenced. |
| FIN-05 | Sensitive values private; support sharing is explicit                   | Partial  | RLS, support permissions and invitations exist                          | Field-level sensitivity and consent flow not defined.            |
| FIN-06 | Education-not-advice scenarios with expert/safety review                | Missing  | scenario engines are generic                                            | No literacy advice-safety/content governance contract.           |

## Mentor Intelligence

| ID     | Requirement                                                                 | Status   | Evidence                                          | Missing boundary / conclusion                                                   |
| ------ | --------------------------------------------------------------------------- | -------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| MEN-01 | Reuse directory, invitations, relationships, messages and shared actions    | Existing | five support tables/APIs and support domain/UI    | Some active UI still uses demo network/messages.                                |
| MEN-02 | Role-aware least-privilege permissions                                      | Partial  | role permissions and relationship permission JSON | Complete RLS parity/sensitive Record projection absent.                         |
| MEN-03 | Explain fit from goals, expertise, availability, modality, capacity, safety | Missing  | directory expertise/role and basic UI exist       | No matching/filter/explanation/capacity contract.                               |
| MEN-04 | Scholar invitation/accept/decline/end controls                              | Partial  | invitation send/accept and relationship status    | Decline/end/guardian-policy lifecycle incomplete.                               |
| MEN-05 | Easy block/report and safeguarding                                          | Partial  | block/report/moderation APIs/tables               | `trust_reports` schema collision and no mentor-specific safeguarding lifecycle. |
| MEN-06 | Prefer/strengthen existing trusted relationships                            | Partial  | support graph and network intelligence primitives | Static demo graph and no prioritization evidence.                               |

## Career Journey

| ID     | Requirement                                                               | Status   | Evidence                                                        | Missing boundary / conclusion                        |
| ------ | ------------------------------------------------------------------------- | -------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| CAR-01 | Reuse journey, outcomes/timeline/evidence, opportunities, applications    | Existing | core journey, Playbook graph, opportunity and workspace domains | Integrations are adjacent rather than one lifecycle. |
| CAR-02 | Consume career goal, activities, certificates and produce reasons/actions | Existing | `lib/opportunities/engine.ts`; Scholar application mapper       | Coarse signals only.                                 |
| CAR-03 | Versioned career/pathway concepts with evidence requirements              | Missing  | generic opportunity ontology exists                             | No career ontology/source contract.                  |
| CAR-04 | Multiple alternatives and reversible goal revision/history                | Partial  | scenario/journey primitives and timeline exist                  | No persisted exploration/revision contract.          |
| CAR-05 | Separate aspiration from verified competency                              | Partial  | profile career goals separate from evidence/verifications       | Projection/UI labeling not uniformly enforced.       |
| CAR-06 | External labor data is sourced and dated                                  | Missing  | no live labor-market feed found                                 | Future only.                                         |

## Recommendation Letters

| ID     | Requirement                                                          | Status   | Evidence                                                        | Missing boundary / conclusion                        |
| ------ | -------------------------------------------------------------------- | -------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| REC-01 | Request model/status/evidence/email/API/UI                           | Existing | recommender workflow, table/RLS, route, pages/components, tests | —                                                    |
| REC-02 | Consented evidence preview/reference; no copied truth                | Partial  | evidence JSON and evidence-pack concepts                        | Consent/preview/reference integrity incomplete.      |
| REC-03 | Recommender identity and independent letter control                  | Partial  | email-based RLS and `letter_text`                               | Identity/token flow and ownership need hardening.    |
| REC-04 | Accept/decline/reminder preference/draft/upload/submit lifecycle     | Partial  | request statuses and email workflow                             | Complete secure lifecycle/preferences/upload absent. |
| REC-05 | Immutable snapshot, withdrawal/expiry, audit/retention               | Missing  | created/approved dates exist                                    | Governance fields/events absent.                     |
| REC-06 | Assisted drafting cites evidence, discloses help, never auto-submits | Missing  | no approved drafting engine found                               | Future policy/implementation only.                   |

## Coverage Result

- Requirements: **58 total**.
- Existing: **18 / 58 (31.0%)**.
- Partial: **24 / 58 (41.4%)**.
- Missing: **16 / 58 (27.6%)**.
- Traceability coverage: **58 / 58 (100%)** have an evidence path or an explicit “no implementation found” result.

This is requirement coverage, not production-readiness coverage. Runtime Supabase state, RLS behavior, external data sources, accessibility, fairness, and human safety gates remain outside source-only certification.
