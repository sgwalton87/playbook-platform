# Playbook System-Wide Audit Execution Board

## Purpose

Convert the exact-revision system audit into the dependency-ordered work PBOS must execute before The Playbook may be called complete, launch-ready, or certified.

## Ownership

Owned by Playbook Product and Engineering. PBOS may plan, implement, validate, and preserve evidence. Human owners retain authority over production promotion, external accounts, compliance approval, and final certification.

## Baseline

- Audited product revision: `cc5ff3e2139fe547c0f0ee0aaadf4ab33600b12d`.
- Recovery continuation revisions: `2a7700c4b8c7787554c6ca35453341c50786716c` and `43693bd`.
- Canonical compiler result at the audited revision: `CERTIFICATION_READY=false`, 89 blockers.
- Canonical phase completion: 0 of 15 phases complete.
- Intelligence traceability: 18 implemented, 24 partial, 16 missing.
- Route convergence: 93 of 95 audited visible routes mapped and design-bound.
- Role onboarding certification: 0 of 15 pathways complete.
- UI recovery matrix: 18 verified, 4 in progress/unverified, 74 pending.

This board is not completion evidence. Every checked item requires exact-revision implementation and the evidence contract below.

## Evidence contract for every item

- [ ] Exact commit SHA and governed source digests recorded.
- [ ] Interface and responsive states verified on desktop and mobile.
- [ ] Durable persistence and recovery behavior verified where state changes.
- [ ] Least-privilege application permissions and Supabase RLS verified, including denial tests.
- [ ] Loading, empty, error, success, and restricted states verified.
- [ ] Accessibility validation has no serious or critical violations.
- [ ] Focused tests, repository lint, and production build pass.
- [ ] Browser-level acceptance passes against the exact revision.
- [ ] Architecture, database, design, checklist, and release documentation are reconciled.
- [ ] Independent validation evidence is attached; human approval remains separate.

## P0 — Restore canonical authority and a provable reference journey

### P0.1 Exact-revision product graph refresh

- [ ] Compile the PBOS canonical graph against the current pushed recovery revision.
- [ ] Add `/about`, `/preview`, and `/news` to the governed route map with approved design-canon bindings or remove them from launch scope through an accepted decision.
- [ ] Reconcile `docs/MASTER_CHECKLIST.md`, role journey authority, UI recovery matrix, intelligence traceability, and release status with observed implementation.
- [ ] Publish the new blocker inventory by stable blocker ID; do not inherit the older 89 count without recompilation.

### P0.2 One role registry and destination resolver

- [ ] Make signup, auth callback, invitations, onboarding, navigation, and completion use one canonical role resolver.
- [ ] Resolve High School Coach ambiguity between `/mentor-os` and `/educator-os`.
- [ ] Resolve Community Partner/Other ambiguity between `/pending` and `/dashboard`.
- [ ] Add complete canonical pathways for High School Counselor, Employer, Athletes Abroad, and District/School Administrator.
- [ ] Prove all 15 onboarding pathway keys and all 17 OS destinations with unit tests.

### P0.3 Scholar golden journey

- [ ] Complete Scholar signup → verification → `/start` onboarding → Playbook Record projection → permission-scoped dashboard.
- [ ] Persist onboarding progress, agreements, recovery, and completion state.
- [ ] Prove owner access and non-owner denial at both application and RLS boundaries.
- [ ] Pass desktop, mobile, accessibility, restart/recovery, and browser acceptance.
- [ ] Use this journey as the required contract for every other role; do not mark Scholar complete from UI-only evidence.

### P0.4 Production authorization and data safety

- [ ] Inventory every launch table, policy, privileged API route, and service-role boundary.
- [ ] Complete Scholar-owned, supporter, institution, partner, and admin RLS validation.
- [ ] Add negative permission tests for cross-user, expired invitation, removed relationship, wrong institution, and unapproved role access.
- [ ] Verify public Newsfeed returns only explicitly public posts and only disclosure-safe author fields.
- [ ] Record migration, policy, rollback, and production-environment evidence.

## P1 — Close the highest-impact connected product gaps

### P1.1 Onboarding package

- [ ] Apply the Scholar contract to Scholar-Athlete and Transition-Aged Youth.
- [ ] Complete family and mentor invite/consent/recovery pathways.
- [ ] Complete educator, counselor, coach, and district verification and roster relationships.
- [ ] Complete college recruiter/admissions verification, criteria, compliance, and distinct experiences.
- [ ] Complete Brand Partner and Employer organization verification, permissions, and opportunity intent.
- [ ] Complete Athletes Abroad enrollment, consent, record ownership, and OS entry.

### P1.2 Starting Five support package

- [ ] Make invitations durable, expirable, revocable, and relationship-producing.
- [ ] Enforce consent-aware support access and removal across every downstream surface.
- [ ] Connect authorized support to applications, messaging, notifications, and recommendations.
- [ ] Remove remaining demonstration invitation defaults from production paths.

### P1.3 Messaging and notification package

- [ ] Complete durable participant-scoped conversations and messages.
- [ ] Verify read state, attachments, safety actions, blocking/reporting, and recovery.
- [ ] Prove event → outbox → idempotent notification → acknowledgement.
- [ ] Pass unauthorized participant and removed-relationship denial tests.

### P1.4 Compass and intelligence package

- [ ] Replace demonstration inputs with versioned, permission-scoped Scholar Record inputs.
- [ ] Close the 16 missing and 24 partial traceability requirements.
- [ ] Add provenance, explainability, lifecycle, review state, and human-agency controls.
- [ ] Prove deterministic recommendation and scoring behavior with tests.

### P1.5 Newsfeed and network package

- [ ] Verify private, network, and public visibility semantics from database policy through UI.
- [ ] Complete author identity, create/edit/delete, media, comments, reactions, sharing, moderation, pagination, and reporting.
- [ ] Validate the public `/news` disclosure boundary and failure behavior against production-like data.
- [ ] Complete connections, mutuals, notification, profile-link, and messaging integration.

### P1.6 Opportunity, application, and Store package

- [ ] Prove readiness → explainable opportunity matches using verified record data.
- [ ] Prove opportunity → durable application workspace → private documents → submission state.
- [ ] Prove application → authorized supporter → governed messaging.
- [ ] Replace demonstration reward/store ledgers with durable, abuse-resistant transactions.
- [ ] Verify balances, redemption authorization, inventory, failure recovery, and audit history.

## P2 — Complete canonical interface convergence

- [ ] Finish every `PENDING` and `IN_PROGRESS_UNVERIFIED` row in `docs/audits/PLAYBOOK-UI-RECOVERY-MATRIX.md` or remove the surface from governed launch scope through an accepted decision.
- [ ] Prioritize Compass, Feed, Messages, Connections, Opportunities, Profile, Notifications, Support Network, Courses, Events, and Store.
- [ ] Remove duplicate routes, backup artifacts, dead components, and competing business logic after canonical replacements are proven.
- [ ] Validate semantic structure, keyboard navigation, focus, contrast, reduced motion, mobile, tablet, desktop, and empty/error/restricted states.
- [ ] Capture screenshot and browser evidence at the same exact revision used for tests and build.

## P3 — Platform QA and launch operations

- [ ] Complete role-by-role browser E2E for all supported launch roles.
- [ ] Complete device, browser, accessibility, performance, and recovery matrices.
- [ ] Establish production monitoring, alert ownership, error reporting, and operational dashboards.
- [ ] Finalize analytics taxonomy without weakening privacy or consent.
- [ ] Complete security, privacy, compliance, and data-retention review.
- [ ] Prove application and database rollback procedures.
- [ ] Execute soft launch, feedback intake, incident response, and release-note workflows.
- [ ] Obtain independent human validation and explicit launch approval.

## PBOS execution order

1. Recompile the canonical product graph at the current governed revision.
2. Materialize blocker-derived missions in priority order: authority → Scholar journey → RLS → connected hotspots → UI convergence → operations.
3. Execute one bounded mission package at a time in an isolated branch/worktree.
4. Require implementation, validation, evidence, and exact-revision lineage before mission completion.
5. Reconcile the graph after every merged package; never manually decrement blockers.
6. Keep `048-product-journeys` queued until `certificationReady` is true.
7. Advance web staging, mobile, store, and CIP-050 certification only through their declared dependency and human gates.

## Final exit gate

The Playbook is done only when the canonical graph reports zero blockers, all 15 phases satisfy their acceptance contracts, every launch role and connected journey has exact-revision functional evidence, repository CI and production build pass, operational gates pass, and independent human certification is recorded.
