# Playbook OS Master Engineering Checklist

## Current verified snapshot — October 20, 2026 (America/Los_Angeles)

PR 255 merged as `8a4038e322794cb997ad79f52e6fa5ddf1e6d88f`. Its tree exactly matches accepted review `477d03f31db81be7b1a85bb7f745446bb5a59d90`. CI/security/build/tests, Marketplace, public Platform QA and all 48 strict Database Certification steps passed: runs 39546311728, 39546311729, 39546311796 and 39546311769. The forced-error canary proved exit code 3; no ignored-quit warnings remain in that run. Earlier broad green conclusions remain invalidated.

Hosted migrations `20261021045516`, `20261021045527`, `20261021045532` were applied and verified separately: Mentor RLS/tables, governed approval/finalization/revocation, direct-write closure for Mentor/relationship/Event, valid reward unique index, unchanged hardened invitation claim. Vercel `dpl_8rboxo2jDBh7CWkEUfZdXWEo6wxe` is READY; stable production reports exact main SHA, home/login 200 and unauthenticated Mentor approval/support context 401. These observations do not certify authenticated Mentor journeys.

Production PBOS endpoint/configuration remains unverified/missing; latest trusted Scholar onboarding failed at prior deployed 0cb6997, Athlete/Family skipped. No authenticated journey rerun at this revision. The platform remains not launch-certified. All 23 constitutional snapshot hashes are unchanged.

The sections below retain historical evidence. Current snapshot and machine-readable evidence layers supersede earlier current-state and certification claims.

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
- Current production baseline: `main` revision `2f87a0732532aace3902b363d0290bd7716427f1`; the exact Vercel production deployment is READY. Browser/visual certification remains a separate unproven release layer.

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
| 15 Platform QA / Release | PARTIAL | CI, dependency audit, full production build, from-zero DB certification, hosted migration promotion, and exact-revision Vercel production deployment are strong. Exact-revision browser E2E, accessibility/device matrix, remaining Supabase/Auth configuration, legacy performance debt, monitoring/analytics, compliance, soft launch and independent human approval remain open. |

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

## Local candidate: Marketplace sharing recovery — October 20, 2026

Owner: Playbook OS Engineering. Purpose: preserve canonical Application Workspace visibility during an unavailable Marketplace sharing RPC. Related implementation: `components/application-workspace/ApplicationWorkspaceDashboard.tsx`; regression coverage: `tests/unit/application-workspace/sharing-recovery.test.tsx`.

Status: LOCAL CANDIDATE, not merged, deployed or production-certified. The candidate separates sharing availability from an empty consent list, keeps workspace reads usable when sharing fails, withholds sharing mutations until status is verified, explains that existing partner access may remain active, and offers retry. It changes no consent authority, RPC contract, schema or production configuration. Local mocked component tests cover a schema-cache RPC error, network rejection and retry recovery. Hosted permission and production browser evidence remain separate gates.

## Local candidate: versioned Marketplace consent — October 20, 2026

Owner: Playbook OS Engineering. Status: LOCAL CANDIDATE, not merged/deployed/applied. Related: `docs/DATABASE.md` Marketplace consent hardening section. Shares/outcomes remains the canonical representation; no submissions model was added. Candidate adds server-enforced versioned consent and listing/partner checks, private audit events, serialized mutation paths, invoker wrappers and matched checkbox UI. Tests and operational limitations are documented in the database handbook. Production runtime configuration and missing baseline/schema objects remain unresolved. Release requires coordinated caller/migration review and separate explicit authorization.

## Active review follow-up — October 20, 2026

PR 253: Platform QA and dedicated Marketplace Applicant Certification passed at initial published head. Full Database Certification replay passed but invitation privilege preflight failed; a focused grant-closure migration and regression test are prepared. Dependency CI failed at audit (1 critical, 13 high entries). Candidate upgrades Next.js and matching lint config to 16.4.2, Nodemailer to 10.1.7, and compatible lockfile dependencies. Five remaining high audit entries trace to the unpatched braces development-tool dependency chain; do not suppress the audit or claim security certification. Full-suite/rebuild evidence and later-head remote checks must be recorded separately. No release or hosted changes authorized.

Follow-up local evidence: 817 tests across 224 suites passed after dependency updates; lint and production build passed. PBOS Audit Control passed via `node --import tsx scripts/pbos/audit-control.ts`; the usual tsx launcher failed on restricted local IPC, not an audit assertion. Full dependency audit remains blocked by the unpatched braces development chain. Release must not treat local validation as hosted certification.

## Achievement evidence failure handling candidate — October 20, 2026

Owner: Playbook OS Engineering. Related: `lib/playbook-record/services/achievements.ts`. Existing record lookup errors and failed evidence-pack, evidence, reflection and timeline inserts now stop the workflow before AchievementCreated is published. Seven mocked regression cases cover every failure stage and ordered success. This prevents false success/provenance; it does not make the multi-request workflow atomic, idempotent or production-certified. Partial earlier writes remain possible and must be addressed in the canonical command/transaction gate. No automatic cleanup or deletion was introduced.

CI evidence isolation: dependency audit now runs as its own failing security job while validation runs independently. No continue-on-error or audit suppression is introduced. This preserves the release blocker while allowing lint, PBOS control, full tests and build evidence to be collected. Constitutional sources are review snapshots, not amendment approval or proof of complete dependency closure.

## Exact-head review evidence — October 21, 2026

At remote head `a72f4e132b339a2b3093100f004eb1e734f65164`, [Database Certification](https://github.com/sgwalton87/playbook-platform/actions/runs/39533003807), [Marketplace Applicant Certification](https://github.com/sgwalton87/playbook-platform/actions/runs/39533003851) and [Platform QA](https://github.com/sgwalton87/playbook-platform/actions/runs/39533003848) passed. [CI](https://github.com/sgwalton87/playbook-platform/actions/runs/39533003794) passed its validation job (lint, PBOS control, tests, build) and failed its dependency-security job. Security certification remains blocked. These results concern the review revision and isolated certification environments, not production schema/configuration or authenticated production journeys.

A subsequent local achievement-command candidate adds atomic SQL and owner/request-bound retry receipts against the existing graph. It is not yet wired to the form; existing event handlers perform additional writes and need a durable/idempotent delivery contract first. See the database handbook for verified behavior and retention/erasure constraints. Do not mark the existing application workflow atomic or this new migration applied.

Machine-readable reconciliation: `pbos/readiness/PLAYBOOK_CURRENT_STATE.json` now separates merged code, draft review code, exact-revision isolated certification, hosted schema observations and last verified deployment identity. August promotion/frontier assertions remain labeled historical; they cannot certify current hosted coverage or production journeys. Current release blockers and execution order include the October findings.

Release authorization update — October 21, 2026: the owner explicitly lifted the restrictions on merging, deployment and production configuration. Proceed through verified release gates without repeating routine permission requests. Authorization does not convert a failing security check, a staging PBOS service or a local candidate into production certification.

Security remediation candidate: pinned tinyglobby replaces the Next lint plugin's vulnerable glob dependency chain, with a version/hash-guarded compatibility patch preserving directory-discovery semantics. Clean install, full audit (zero known findings), 828 tests, lint and build passed locally. See RELEASE_PROCESS.md. Wait for remote security checks before claiming release clearance. The staging PBOS health endpoint responded HTTP 200; this proves health of that service, not production PBOS readiness.

## Verified repair release — October 21, 2026

PR 253 merged as `0cb6997b4e8f4c4492e222673c7771c343d19488` after exact-review CI/security, Database Certification, Marketplace certification and Platform QA passed. Production deployment `dpl_6UezZoLjTM7QsQfdNsSsP5eUyAFc` is READY; the stable domain reports that SHA, home/login return 200 and unauthenticated Workspace API access returns 401. Canonical Supabase public client variables now include Production scope. Main/review Git auto-deployment remains disabled for coordinated release.

Hosted `hosted_marketplace_convergence` and `support_invitation_privilege_closure` were applied and verified independently: canonical shares/outcomes/audit/versioned RPC exist; the obsolete RPC and direct authenticated share/audit mutations are unavailable; invitation read/create remain while direct update/delete/status mutation are denied. The Dream preference backfill preserved eight source preferences. Original college_priority_flags failed and rolled back on a hosted legacy CHECK. PR 254's guarded college constraint/priority convergence subsequently passed all four checks, was applied, and merged as `bbbcc3892fc2c4f4b45a9eab16d7680945341e41`; hosted counts are eight canonical Dream rows, zero Top rows. The later main revision and last verified deployed revision are intentionally separate.

Trusted production role QA at exact deployed `0cb6997` passed the revision barrier then failed Scholar onboarding on missing PBOS_API_URL: https://github.com/sgwalton87/playbook-platform/actions/runs/39536495519 . Athlete/Family were skipped. The only configured PBOS service verified here is staging and healthy; do not copy staging credentials/authority into Production or claim launch certification. Runtime error-log filtering returned no rows despite that observed failure, so logging coverage is not certified; drain inspection returned 404 and remains unverified.

Mentor convergence is a subsequent candidate, not applied: restore missing request/approval tables, preserve the current private invitation claim, require governed approval/finalization commands, remove direct mutations, and serialize threshold checks. Local behavioral tests cover the authority and retry boundaries; full-chain command certification is required before release. The readiness JSON records the deployed, merged, applied, certified and blocked layers separately.

## Certification correction — October 21, 2026

The raw green Database Certification conclusion was insufficient. Inspection of run 39536009957 confirms nine preflights printed an ignored `quit` exit-argument warning after a failed assertion, then exited successfully. The new Mentor full-chain test separately failed on the existing relationship revocation command, whose invoker could not lock/update through the closed RLS boundary. Earlier statements that the whole database certification passed are superseded by this correction; retain their raw run status as history, not broad certification evidence. Targeted PostgreSQL tests and explicit hosted catalog/grant/data observations retain their stated narrow scope.

Further production mutation/release is held while the candidate repairs all 177 ignored-exit assertion paths, adds a real PostgreSQL failure canary, and runs every gate without converting failures into success. Each failed step keeps the job red; later gates still run to expose the complete failure set. Retired-policy checks are reconciled with current governed contracts, including the explicit four-function anonymous projection/share allowlist. Real gaps are repaired through a private participant-authorized relationship revocation command, the intended reward-ledger unique index, and closure of direct Event mutation grants. No predicate is changed merely to make an assertion green. Full re-certification and current-role runtime evidence remain required.

## Mentor identity and fixture follow-up

Candidate queue reads connected Scholar names through the existing governed support-context projection, never cross-user raw profiles. Projection/network errors withhold approval controls. The fixture-mutating Mentor acceptance suite is restricted to local app plus local Supabase and cleans approvals only for its Scholar/Mentor request IDs. It has not been run against production.
