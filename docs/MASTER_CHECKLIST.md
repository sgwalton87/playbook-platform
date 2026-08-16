# Playbook OS Master Engineering Checklist

## Authority

This is the authoritative human-readable engineering status board for Playbook OS.

Reconciled on 2026-08-16 against `main` revision `2f87a0732532aace3902b363d0290bd7716427f1` after PRs #123–#137 and hosted Supabase production reconciliation through the canonical Aug. 16 migration frontier.

Repository implementation, exact-head CI/Database Certification, hosted Supabase inspection, and exact-revision Vercel deployment evidence outrank older Drive exports, archived checklists, and prior audit snapshots. Historical percentages and blocker counts are not carried forward unless regenerated from current evidence.

`pbos/readiness/PLAYBOOK_CURRENT_STATE.json` is the machine-readable companion.

## Definition of Done

A capability is Complete only when its interface, durable persistence, permissions/RLS, integrations, tests, production build, recovery behavior, accessibility, and exact-revision browser workflow are proven. Route existence, visual implementation, or a passing unit test alone is not completion.

Status vocabulary:

- COMPLETE — satisfies the full evidence contract.
- IMPLEMENTED — durable governed code exists, but one or more release-certification gates remain.
- PARTIAL — some required links remain incomplete.
- FAIL-CLOSED — intentionally unavailable until a required authority/configuration gate is satisfied.
- EXTERNAL GATE — requires provider configuration, compliance/legal approval, credentials, or human launch authority.

## Current verified lineage

- PR #123 added privacy-safe Public Scholar Record/member projections without reopening owner-only `public.profiles` reads.
- PR #124 converged canonical Experiences and the Scholar AI foundation as derived, permission-scoped projections.
- PR #125 added Founder/Admin verification review authority and auditable review events for Coach, Educator, Counselor, District, Recruiting, Admissions, Employer, Brand Partner, Community Partner, and Athlete Abroad readiness.
- PR #126 made high-severity dependency audit a permanent CI gate.
- PR #127 converged Network and Newsfeed through bounded identity projections; direct cross-user `profiles` reads remain prohibited.
- PR #128 replaced hard-coded Learning/credential/badge prototypes with durable Learning authority and the existing canonical Store/coin ledger.
- PR #129 connected explainable Opportunity matches directly to the durable Application Workspace.
- PR #130 replaced static Events/Mentorship prototypes with governed Events, RSVP, attendance rewards, Mentor Circles, memberships, and waitlisting.
- PR #133 converged trusted Notification Authority and the Attention Center; clients cannot manufacture trusted system notifications.
- PR #132/#135 added live authenticated shell context and relationship-bound Active Scholar Context. Selecting a Scholar never grants access independently of the active relationship and permission keys.
- PR #134 removed recurring frontend navigation/avatar quality warnings without changing authority.
- PR #136 recorded hosted-production privilege reconciliation and performance hardening after the full Aug. 16 migration stack was promoted.
- PR #137 rebuilt `/preview` as a 15-role Product Review Center derived from the canonical role registry and removed `University OS` as a separately presented role.
- Current production baseline before this documentation-only reconciliation: `main` revision `2f87a0732532aace3902b363d0290bd7716427f1`; exact production deployment was initiated automatically after merge and must be READY before that revision is called production-certified.

## Production authority truth

Hosted Supabase now contains the canonical Aug. 16 authority/convergence stack through Active Scholar Context. Historical missing July foundations were reconciled from repository-defined migrations rather than recreated ad hoc.

Key invariants now proven in hosted schema:

- `public.profiles` direct SELECT remains owner-only; shared identity uses bounded projection RPCs.
- role identity/onboarding state is governed rather than freely writable through broad profile mutation.
- verification decisions are Founder/Admin reviewed and auditable.
- external/support relationship identity does not automatically grant Scholar-data permissions.
- Learning progress, credentials, badges, reward issuance, Store redemption, Events attendance rewards, Notifications, and Active Scholar Context use governed mutation paths.
- closed foundation tables with no client authority remain fail-closed rather than receiving permissive policies.

Remaining Supabase release items include the manual Auth setting for leaked-password protection and legacy performance-advisor debt outside the newly converged canonical layer.

## Phase status

| Phase | Current state | Reconciled truth |
| --- | --- | --- |
| 1 Identity & Authentication | IMPLEMENTED / EXTERNAL GATES | Core auth, role identity, onboarding authority, profile hardening, and dependency audit are merged. Leaked-password protection remains a Supabase Auth settings gate. Production outbound email/template delivery remains an external certification item; legacy PR #88 is closed unmerged. |
| 2 Onboarding & Verification | IMPLEMENTED / CERTIFICATION OPEN | Canonical 15-role registry, governed role persistence/completion, role-specific verification evidence for authority-sensitive roles, and Founder/Admin review authority are implemented. Role-by-role browser/recovery acceptance remains open. |
| 3 Public Profile | IMPLEMENTED / CERTIFICATION OPEN | Public Scholar/member reads use bounded projections; raw `profiles` remains owner-only. Browser/accessibility/privacy acceptance remains to be proven at the exact production revision. |
| 4 Operating Systems | IMPLEMENTED / CERTIFICATION OPEN | All 15 canonical role destinations exist. `/university-os` is redirect-only compatibility to `/admissions-os`, not a separate role. Route existence does not certify every meaningful role action. |
| 5 Network & Feed | IMPLEMENTED / CERTIFICATION OPEN | Bounded directory/member identity, connection lifecycle, persisted Feed categories/media/reactions/comments, and public news identity projection are wired. Full browser pagination/moderation/relationship journey acceptance remains open. |
| 6 Messaging | PARTIAL | Governed messaging foundations exist, but complete attachment/read-state/safety/removal/recovery and browser E2E remain open. |
| 7 Learning / Credentials / Rewards / Store | IMPLEMENTED / CERTIFICATION OPEN | Durable course/modules/progress, governed completion, credentials, badges, XP/coin ledger, and atomic Store redemption are wired. Browser/recovery/fulfillment operations remain release gates. |
| 8 Academic | PARTIAL | Transcript and academic/readiness foundations exist, but the complete transcript → A-G/readiness/FAFSA/application → Compass → durable outcome journey remains unproven end-to-end. |
| 9 Opportunity / Applications | IMPLEMENTED / CERTIFICATION OPEN | Explainable Opportunity matches now hand directly into learner-owned Application Workspaces. Full document/support/submission/outcome browser journey remains open. |
| 10 Recruiting | PARTIAL | Scholar-Athlete/recruiting surfaces and verified recruiting authority exist, but eligibility → targets/visits/offers → durable outcome remains incomplete or unproven end-to-end. |
| 11 Events / Mentorship | IMPLEMENTED / CERTIFICATION OPEN | Governed Events, capacity-safe RSVP, verified attendance rewards, Mentor Circles, membership/waitlist lifecycle, and bounded projections are durable. Calendar/reminder/networking and browser acceptance remain open. |
| 12 Partner / Institution Authority | IMPLEMENTED / CERTIFICATION OPEN | Verification/review foundations exist for Educator, Counselor, Coach, District, Recruiter, Admissions, Employer, Brand Partner, Community Partner and Athlete Abroad readiness. Relationship/data scope remains independently permission-bound. Full meaningful-action browser journeys remain open. |
| 13 Notifications / Attention | IMPLEMENTED / CERTIFICATION OPEN | Trusted notification producers, owner acknowledgement/preferences/retry, and Attention Center are wired. Browser delivery/recovery evidence remains open. |
| 14 Founder / Admin | IMPLEMENTED / PARTIAL | Verification Review Center and bounded operator authority exist. Monitoring, analytics, release operations, and broader production administration remain incomplete. |
| 15 Platform QA / Release | PARTIAL | CI, dependency audit, full production build, from-zero DB certification, hosted migration promotion, and Vercel deployments are strong. Exact-revision browser E2E, accessibility/device matrix, remaining Supabase/Auth configuration, legacy performance debt, monitoring/analytics, compliance, soft launch and independent human approval remain open. |

## Role journey status

The governed journey is:

public discovery → authentication → role selection → role onboarding → verification/consent where required → relationship/authority → permission-scoped OS → meaningful role action → durable outcome → recovery/sign-out.

All 15 roles have canonical registry identities and destinations. Authority-sensitive roles also have dedicated verification/readiness evidence and governed review where applicable. The remaining distinction is not “does a route exist?” but “has the complete role-specific meaningful-action journey been proven at the exact production revision?”

| Role | Current state | Remaining release evidence |
| --- | --- | --- |
| Scholar | REFERENCE IMPLEMENTATION | Exact-revision browser/device/accessibility/recovery certification. |
| Scholar-Athlete | IMPLEMENTED / PARTIAL JOURNEY | Eligibility/recruiting outcome and exact-revision browser certification. |
| Transition-Aged Youth | IMPLEMENTED / PARTIAL JOURNEY | Role-specific downstream outcomes and browser certification. |
| Family | IMPLEMENTED / CERTIFICATION OPEN | Invitation/relationship → active Scholar context → meaningful support action → revocation browser E2E. |
| Mentor | IMPLEMENTED / CERTIFICATION OPEN | Validation/relationship → circle/support action → revocation browser E2E. |
| Educator | IMPLEMENTED / CERTIFICATION OPEN | Approved verification → bounded Scholar relationship/context → meaningful intervention browser E2E. |
| High School Counselor | IMPLEMENTED / CERTIFICATION OPEN | Approved verification → relationship/context → academic/application support browser E2E. |
| High School Coach | IMPLEMENTED / CERTIFICATION OPEN | Approved verification → zero-data relationship identity → governed athlete support/recruiting browser E2E. |
| College Coach / Recruiter | IMPLEMENTED / CERTIFICATION OPEN | Approved recruiting verification → permissioned athlete interaction/outcome browser E2E. |
| College Admissions | IMPLEMENTED / CERTIFICATION OPEN | Approved admissions verification → permissioned institutional action browser E2E. |
| Brand Partner | IMPLEMENTED / CERTIFICATION OPEN | Approved brand/compliance scope → organization/campaign workflow → human/compliance release evidence. |
| Employer | IMPLEMENTED / CERTIFICATION OPEN | Approved employer verification → opportunity/application workflow browser E2E. |
| District / School Administrator | IMPLEMENTED / CERTIFICATION OPEN | Approved institution verification → bounded cohort/action browser E2E. |
| Athlete Abroad | IMPLEMENTED / CERTIFICATION OPEN | Readiness review/jurisdiction approval → international readiness action browser E2E. |
| Community Partner | IMPLEMENTED / CERTIFICATION OPEN | Approved service scope → zero-data relationship identity → governed community support action browser E2E. |

## Connected pathways: current truth

### Implemented and governed

- Public profile/member identity projections without broad profile reads.
- Network discovery + connection identity projection.
- Newsfeed categories/media/reactions/comments with durable post semantics.
- Opportunity → Application Workspace handoff.
- Learning → module progress → reward ledger → credential/badge.
- Reward ledger → atomic Store redemption.
- Events → RSVP → verified attendance → idempotent rewards.
- Mentor Circles → join/waitlist/leave.
- Verification evidence → human review event → trusted notification.
- Support relationship → Active Scholar Context without authority broadening.
- Trusted Notification outbox → acknowledgement/preferences/retry/finalization.

### Still partial or release-unproven

- Messaging full lifecycle and browser recovery/safety matrix.
- Academic transcript/A-G/FAFSA/application/Compass as one complete outcome journey.
- Recruiting eligibility/targets/visits/offers as one complete outcome journey.
- Event calendar/reminders/check-in/networking beyond the durable RSVP/attendance core.
- Store fulfillment/operational recovery beyond atomic redemption.
- Intelligence engines as a fully measured provenance/confidence/human-decision/outcome layer across every role.

## Remaining release blockers

- [ ] Exact-revision browser E2E for all 15 roles and the canonical connected pathways.
- [ ] Mobile/device, keyboard, screen-reader, contrast, reduced-motion and recovery acceptance.
- [ ] Enable and verify Supabase Auth leaked-password protection if available for the current plan/configuration.
- [ ] Triage remaining legacy Supabase performance-advisor warnings without weakening RLS.
- [ ] Complete production outbound email/template/delivery certification; legacy PR #88 is closed and must not be treated as an active merge path.
- [ ] Complete Messaging lifecycle gaps.
- [ ] Complete/prove the end-to-end Academic and Recruiting outcome journeys.
- [ ] Complete monitoring, error ownership, privacy-respecting analytics and operational health evidence.
- [ ] Complete privacy/data-retention, compliance/legal and incident-response review.
- [ ] Execute soft launch, feedback loop, rollback proof, release notes and independent human launch approval.

## Exit gate

Playbook is complete only when the current canonical graph reports no unresolved launch blockers; all 15 launch roles satisfy the journey evidence contract; required connected pathways are durable and permission-safe; repository, hosted database and production deployment evidence align at governed revisions; browser/device/accessibility and operational gates pass; and independent human launch approval is recorded.
