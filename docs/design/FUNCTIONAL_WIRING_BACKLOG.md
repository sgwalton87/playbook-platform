# Functional Wiring Backlog

## Purpose

Captures product surfaces whose visible route/UI exists but whose durable workflow is not yet fully connected. Reconciled 2026-08-12 against `main` revision `4a2d1ca90a12c0be24b9e7bede1c15e82756bd40`.

## Status rule

A route or visual shell is not functionally complete until persistence, permissions/RLS, integrations, recovery, accessibility and exact-revision browser evidence are proven.

## Reconciled backlog

| Area | Status | Current truth / required connection |
| --- | --- | --- |
| Coach Dashboard routing | RESOLVED ROUTE / FUNCTIONAL JOURNEY OPEN | PR #89 materialized `/coach-os`; do not reopen the old `/mentor-os` fallback issue. Coach authority, verification, roster relationship and browser evidence remain open. |
| Settings | FUNCTIONAL WIRING REQUIRED | `/permissions` is the current account/privacy surface; create a separate `/settings` only if canonical product authority requires distinct behavior. Do not duplicate account/privacy logic. |
| College Search | FUNCTIONAL WIRING REQUIRED | College-search components and `/opportunities` exist. Complete the canonical Record → search/match → saved/target school → application pathway before inventing duplicate routing. |
| Messaging | FUNCTIONAL WIRING REQUIRED | Complete durable participant-scoped messages, read state, attachments, block/report, relationship removal semantics, notification acknowledgement and recovery. Realtime is an implementation choice, not the Definition of Done. |
| Starting Five / support invitations | FUNCTIONAL WIRING REQUIRED | Invitations must be durable, expirable, revocable and relationship-producing, then drive least-privilege access to applications, messaging, notifications and recommendations. |
| Role completion adapters | P0 FUNCTIONAL WIRING REQUIRED | Scholar is the reference adapter. Every other role needs its own canonical record, verification/consent, authority, OS landing, meaningful durable action and denial/recovery evidence. Unsupported roles must continue to fail closed. |
| Role authority | P0 FUNCTIONAL WIRING REQUIRED | Counselor, Coach, Recruiter, Admissions and Community Partner require accepted least-privilege contracts. Employer, TAY, Athlete Abroad and District/Admin need explicit model decisions. |
| Production RLS | P0 FUNCTIONAL WIRING REQUIRED | Prove scholar, supporter, institution, partner and administrator access plus negative tests for cross-user, expired/revoked relationship, wrong institution and unapproved role. |
| Opportunity → Application | FUNCTIONAL WIRING REQUIRED | Record/readiness → explainable match → application workspace → private docs → supporter collaboration → submission/outcome. |
| Courses → Record / Rewards | FUNCTIONAL WIRING REQUIRED | Completion → durable progress/evidence → certificate/badge → XP/coins → Record/Timeline/Trust/Opportunity refresh. |
| Feed / Network | FUNCTIONAL WIRING REQUIRED | Prove visibility semantics, author identity, media, comments/reactions/shares, moderation/reporting, pagination, connections, mutuals and messaging/notification integration. |
| Events | FUNCTIONAL WIRING REQUIRED | Discovery → RSVP → calendar/reminder → attendance/check-in → networking/outcome. |
| Recruiting | FUNCTIONAL WIRING REQUIRED | Scholar-Athlete Record → eligibility → governed coach/recruiter access → targets/visits/offers → durable outcome. |
| Compass / Intelligence | FUNCTIONAL WIRING REQUIRED | Consume versioned permission-scoped canonical Record inputs and emit explainable, provenance-backed recommendations with confidence, human decision and outcome tracking. |
| Store / Reward Ledger | FUNCTIONAL WIRING REQUIRED | Durable auditable balances, transactions, inventory, redemption authorization, abuse controls and failure recovery. |
| Observability / Analytics | RELEASE BLOCKER | Implement monitoring, error ownership, privacy-respecting analytics taxonomy, health signals and AI outcome observability before launch. |
| Hostinger Email | EXTERNAL GATE / ACTIVE PR #88 | Code package exists; production SMTP/template/delivery and staging evidence remain required. |

## Resolved historical items

- Legacy deployed landing UI: resolved by PR #76.
- Canonical public/authenticated shell convergence: merged by PR #77.
- Duplicate Password Reset PR #79: closed as superseded by merged PR #80.
- Six missing OS destination fallbacks: resolved at the route identity level by PR #89.
- False multi-role completion through Scholar adapter: corrected by PR #90; unsupported roles now fail closed.
