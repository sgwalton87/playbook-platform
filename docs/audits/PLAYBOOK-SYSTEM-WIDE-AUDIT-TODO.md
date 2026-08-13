# Playbook System-Wide Audit Execution Board

## Purpose

This is the dependency-ordered execution board PBOS must follow before Playbook may be called complete, launch-ready, or certified.

## Reconciled baseline

- Current implementation baseline: `4a2d1ca90a12c0be24b9e7bede1c15e82756bd40` (`main`, merged PR #90).
- Reconciled: 2026-08-12.
- Historical blocker counts and percentages are intentionally retired until the canonical compiler is re-run against a current executable environment.
- PR #77 canonical UI/auth convergence is merged.
- PR #89 materialized all 17 unique OS destinations.
- PR #90 implemented the real Scholar completion adapter and prevents unsupported roles from completing through it.
- PR #79 is closed as superseded by merged PR #80.
- PR #88 remains the active Hostinger Email package and requires external production delivery evidence.

This board records current execution truth. It does not itself certify the product.

## Evidence contract

Every completed mission must record the governed revision and prove, where applicable:

- interface and responsive states;
- durable persistence and restart/recovery;
- least-privilege application authorization and Supabase RLS, including denial tests;
- loading, empty, error, success and restricted states;
- accessibility with no serious/critical violations;
- focused tests, repository checks and production build;
- browser-level acceptance against the exact governed revision;
- reconciled architecture/data/design/status/release documentation;
- independent validation evidence, with human production approval kept separate.

## P0 — Canonical current-state convergence

- [x] Establish `4a2d1ca90a12c0be24b9e7bede1c15e82756bd40` as the post-PR #90 reconciliation baseline.
- [x] Reconcile `docs/MASTER_CHECKLIST.md` to current implementation truth.
- [x] Retire `docs/PLAYBOOK_MASTER_CHECKLIST.md` as a duplicate independent status authority.
- [x] Reconcile `docs/USER_JOURNEYS.md` to the post-PR #90 Scholar contract and post-PR #89 OS destinations.
- [x] Reconcile the functional wiring backlog so resolved Coach routing is not re-opened.
- [x] Close duplicate Password Reset PR #79 as superseded.
- [x] Preserve PR #88 as the active Hostinger Email package rather than falsely marking it complete.
- [x] Publish a machine-readable current-state manifest under `pbos/readiness/PLAYBOOK_CURRENT_STATE.json`.
- [ ] Re-run the canonical product graph/compiler in an executable PBOS environment and publish fresh stable blocker IDs. Do not inherit the old `89 blockers` count.
- [ ] Reconcile any generated graph/readiness artifacts whose values are superseded by the fresh compiler output.

## P0 — Authority and data safety

### Explicit authority contracts

- [ ] Counselor — accepted least-privilege authority and school verification.
- [ ] Coach — accepted least-privilege authority and scholar-athlete roster relationship.
- [ ] Recruiter — accepted institution/recruiter authority and governed athlete-record access.
- [ ] Admissions — accepted institution/admissions authority and criteria-scoped scholar access.
- [ ] Community Partner — accepted partner authority and review/verification workflow.

### Additional role model decisions

- [ ] Employer — canonical onboarding, organization verification, opportunity authority.
- [ ] Transition-Aged Youth — explicit canonical record and relationship/authority model.
- [ ] Athlete Abroad — enrollment, consent, record ownership and OS authority.
- [ ] District / School Administrator — institutional onboarding and scoped administrator authority.

### RLS / authorization

- [ ] Inventory launch tables, policies, privileged APIs and service-role boundaries.
- [ ] Prove Scholar-owned, supporter, institution, partner and administrator policies.
- [ ] Add negative tests for cross-user access, expired invitation, removed relationship, wrong institution and unapproved role.
- [ ] Verify public Newsfeed disclosure returns only explicitly public data and disclosure-safe author fields.
- [ ] Record migration, policy, rollback and production-environment evidence.

## P1 — Replicate the Scholar completion contract

PR #90 is the required implementation pattern. Every role must get its own adapter/authority; no role may complete through Scholar fallback.

- [ ] Scholar — finish exact merge-revision browser/RLS/recovery certification as required by the release gate.
- [ ] Scholar-Athlete — athlete record + compliance/eligibility + dedicated relationship semantics.
- [ ] Transition-Aged Youth — explicit model + adapter.
- [ ] Family — invitation/consent/dependent relationship + recovery.
- [ ] Mentor — eligibility/approval + scholar assignment + revocation.
- [ ] Educator — institution verification + roster/cohort relationship.
- [ ] Counselor — onboarding + verification + authority + scholar access.
- [ ] Coach — verification + authority + roster/athlete relationship.
- [ ] District/Administrator — institution authority + roster/data scope.
- [ ] Recruiter — verification + authority + governed athlete search/access.
- [ ] Admissions — verification + authority + governed scholar search/access.
- [ ] Brand Partner — organization verification + partner authority + opportunity intent.
- [ ] Employer — organization onboarding/verification + opportunity authority.
- [ ] Athlete Abroad — canonical enrollment/consent/ownership/OS entry.
- [ ] Community Partner — verification/review + accepted authority.

## P1 — Starting Five / relationship fabric

- [ ] Invitations are durable, expirable and revocable.
- [ ] Accepted invitations produce canonical relationship records.
- [ ] Relationship grants are consent-aware and least-privilege.
- [ ] Removal/revocation removes downstream access immediately.
- [ ] Authorized support is reusable by applications, messaging, notifications and recommendations.
- [ ] Demo/default invitations are removed from production paths.

## P1 — Connected product pathways

### Opportunity and applications

- [ ] Playbook/Scholar Record → readiness → explainable opportunity match.
- [ ] Opportunity → durable application workspace → private documents → submission state.
- [ ] Application → authorized supporter collaboration → governed messaging.
- [ ] Submission/outcome → canonical Record/Timeline/Trust updates.

### Learning and rewards

- [ ] Course/module completion persists durably.
- [ ] Completion produces evidence, certificate/badge and governed XP/coins.
- [ ] Evidence updates Record/Timeline/Trust and can influence opportunity readiness.
- [ ] Reward/store transactions are durable, auditable and abuse-resistant.
- [ ] Inventory, redemption authorization, failure recovery and balance integrity are proven.

### Messaging and notifications

- [ ] Participant-scoped durable conversations/messages.
- [ ] Attachments, read state, block/report and recovery.
- [ ] Event → outbox → idempotent notification → acknowledgement.
- [ ] Unauthorized/removed participant denial tests.

### Feed and network

- [ ] Private/network/public visibility from DB policy through UI.
- [ ] Author identity, create/edit/delete, media, comments, reactions, shares, moderation, pagination/reporting.
- [ ] `/news` disclosure boundary against production-like data.
- [ ] Connections, mutuals, profile links, notifications and messaging integration.

### Academic / Compass

- [ ] Transcript → A-G/readiness → FAFSA/application state.
- [ ] Compass consumes versioned permission-scoped Record inputs.
- [ ] Recommendation includes evidence, provenance, confidence, human decision and outcome lifecycle.

### Recruiting

- [ ] Scholar-Athlete Record → eligibility → target/recruiter/coach access → visit/offer → outcome.
- [ ] NIL readiness remains advisory/compliance-aware and permission-scoped.

### Events

- [ ] Discover → RSVP → calendar/reminder → attendance/check-in → networking/outcome.

## P2 — Intelligence convergence

- [ ] Re-run current intelligence traceability before quoting missing/partial counts.
- [ ] Replace demo inputs with canonical permission-scoped Record inputs.
- [ ] Close all current missing/partial traceability requirements.
- [ ] Add provenance, explainability, lifecycle/review state and human-agency controls.
- [ ] Prove deterministic recommendation/scoring behavior where required.

## P3 — Canonical interface convergence

- [ ] Reconcile the UI recovery matrix after the fresh current-state compiler/audit.
- [ ] Complete or explicitly remove from launch scope every pending/in-progress governed surface.
- [ ] Prioritize the connected hotspots: Compass, Feed, Messages, Connections, Opportunities, Profile, Notifications, Support Network, Courses, Events and Store.
- [ ] Remove dead/duplicate routes, backup artifacts and competing business logic only after canonical replacements are proven.
- [ ] Complete semantic, keyboard, focus, contrast, reduced-motion and responsive acceptance.
- [ ] Capture screenshot/browser evidence at the same governed revision used for tests/build.

## P4 — Launch operations

- [ ] Role-by-role browser E2E for every launch role.
- [ ] Device/browser/accessibility/performance/recovery matrices.
- [ ] Production monitoring, alert ownership, error reporting and dashboards.
- [ ] Privacy-respecting analytics taxonomy.
- [ ] Security, privacy, compliance and data-retention review.
- [ ] Application/database rollback proof.
- [ ] Production email/notification delivery evidence.
- [ ] Soft launch, feedback intake, incident response and release notes.
- [ ] Independent human validation and explicit launch approval.

## External / human gates

PBOS may skip these during a bounded implementation pass only if the dependent feature remains explicitly blocked and fail-closed:

- Hostinger/SMTP credentials and production delivery verification.
- Production Supabase/Vercel evidence unavailable to the executing environment.
- Third-party account approvals/billing.
- Compliance/legal approval.
- Final production promotion and launch authorization.

Skipping an external gate never converts it to Complete.

## Execution order

1. Run the current canonical graph and publish stable blockers.
2. Close authority/RLS blockers.
3. Replicate the Scholar contract role by role.
4. Build the Starting Five relationship fabric.
5. Close connected product pathways.
6. Converge intelligence on canonical data.
7. Finish UI/browser evidence.
8. Complete operational and human release gates.
9. Reconcile after every merge; never manually decrement blocker counts.

## Final exit gate

Playbook is done only when the current canonical graph reports zero unresolved release blockers, every launch role satisfies the journey evidence contract, connected journeys are durable and permission-safe, repository and production validation pass at the same governed revision, operational gates pass, and independent human certification is recorded.
