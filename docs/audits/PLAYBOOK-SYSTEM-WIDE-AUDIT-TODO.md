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

## Active convergence snapshot — 2026-08-09

This snapshot supersedes optimistic UI percentages while PR #77 is being
converged with Playbook `main`. `IMPLEMENTED` is not treated as `FUNCTIONALLY
COMPLETE`; completion still requires the evidence contract below.

### Delivery lineage

- [x] PR #77 contains the canonical public shell, auth shell, role routing,
  Scholar-Athlete recovery, Athlete Abroad, Brand Partner, Academic Readiness,
  Transcript shell, public Preview, public Newsfeed, footer, and responsive
  safeguards.
- [x] The nine identity/authentication changes merged through PRs #78 and
  #80–#87 have been integrated locally without discarding the canonical UI.
- [x] Merge conflicts across login, email confirmation, password recovery,
  global responsive CSS, and the shared shell have been resolved.
- [x] Focused design/auth validation passes (34 tests) and the production build
  compiles all 129 application/API routes.
- [x] Full repository suite passed on the converged PR #77 revision (126 files,
  394 tests).
- [x] Converged PR #77 head passed exact-head GitHub and Vercel checks.
- [x] PR #77 merged into `main` as `9b0b5a7579fd342e3c98f5c703f33972dd5ecaa9`.
- [ ] The exact `main` merge commit passes independent browser proof. Its tree
  matches the validated PR head, but that does not replace merge-commit browser
  evidence.

### Connection truth

| Connection boundary | Declared / implemented | Functionally complete | Remaining truth |
| --- | ---: | ---: | --- |
| Identity/authentication capabilities | 9 of 9 | 0 of 9 exact-merge browser-certified | Exact-revision browser proof remains. |
| Canonical role registry keys | 15 of 15 | 0 of 15 role journeys certified | Every role still needs durable onboarding, authority, recovery, and acceptance proof. |
| Public role-specific onboarding choices | 14 of 14 | 0 of 14 certified | Entry configuration exists; end-to-end completion does not. |
| Distinct OS destination routes | 17 of 17 implemented | 0 of 17 certified | Six new first-class routes remove shared destination fallbacks; authority, durable data, recovery, and browser proof remain open. |
| Visible route design convergence | 12 of 102 verified | 12 of 102 UI-verified only | 15 are in progress/unverified and 75 remain pending. |
| Canonical delivery phases | 0 of 15 | 0 of 15 | No whole-product phase may be called complete yet. |

### Immediate build checklist

- [x] Reconcile PR #77 with the merged authentication work.
- [x] Run the complete unit/integration suite after reconciliation.
- [x] Push the exact converged revision and clear PR #77 draft/conflicting state.
- [x] Require green exact-head GitHub and Vercel validation.
- [x] Merge PR #77 and preserve its exact validation lineage.
- [ ] Recompile the canonical product graph; replace the historical 89-blocker
  count with current stable blocker IDs.
- [x] Publish the missing six OS destination definitions from canonical
  authority without treating route materialization as journey completion.
- [ ] Accept explicit least-privilege authority contracts for Counselor, Coach,
  Recruiter, Admissions, and Community Partner; these roles currently fail
  closed rather than inheriting unrelated authority.
- [ ] Execute Scholar as the golden end-to-end role contract.
- [ ] Apply that proven contract to the remaining 14 registry roles and all 17
  OS destinations.

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
- [x] Resolve High School Coach route ambiguity with `/coach-os`.
- [x] Resolve Community Partner/Other route ambiguity with `/community-partner-os`.
- [ ] Complete canonical onboarding and authority pathways for High School
  Counselor, Employer, Athletes Abroad, District/School Administrator, and
  Community Partner. Their route destinations now exist, but their journeys do
  not yet satisfy the evidence contract.
- [x] Prove 14 public onboarding choices resolve to unique destinations and all
  17 OS identifiers/routes are unique with unit tests.

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
