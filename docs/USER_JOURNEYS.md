# User Journeys

> Canonical owner: Playbook Product and Experience
> Reconciled implementation baseline: `2f87a0732532aace3902b363d0290bd7716427f1`
> Reconciled: 2026-08-16

This document records the current role-journey truth after the Aug. 16 authority and feature convergence stack. All 15 canonical roles now have registry identities and OS destinations; authority-sensitive roles have dedicated verification/readiness evidence and governed review. Route existence and authority foundations still do not substitute for exact-revision end-to-end browser acceptance.

## Global journey contract

Every launch role must satisfy:

public discovery → authentication → canonical role selection → role onboarding → verification/consent where required → relationship/data authority → permission-scoped OS → meaningful role action → durable outcome → recovery/sign-out.

Role identity is not data authority. Verification is not Scholar-data permission. Active Scholar selection is not access by itself. Every downstream read/write must remain bounded by the applicable owner, relationship, role, institution, consent and permission contract.

## Evidence states

- REFERENCE IMPLEMENTATION — complete implementation pattern exists; full release certification may still be open.
- IMPLEMENTED / CERTIFICATION OPEN — durable governed path exists; exact-revision browser/device/accessibility/recovery evidence remains incomplete.
- PARTIAL JOURNEY — key foundations exist, but one or more meaningful downstream outcomes remain incomplete or unproven.
- FAIL-CLOSED — intentionally unavailable until a required authority/configuration gate is satisfied.

## Canonical role index

| Role | OS destination | Authority / verification truth | Current state | Primary remaining evidence |
| --- | --- | --- | --- | --- |
| Scholar | `/dashboard` | Owner identity/profile authority and reference onboarding are implemented. | REFERENCE IMPLEMENTATION | Exact-revision browser/device/accessibility/recovery certification. |
| Scholar-Athlete | `/scholar-athlete-os` | Canonical role/onboarding and athlete/recruiting foundations exist. | IMPLEMENTED / PARTIAL JOURNEY | Eligibility → recruiting targets/visits/offers → durable outcome + browser E2E. |
| Transition-Aged Youth | `/transition-youth-os` | Canonical role/onboarding exists under learner authority. | IMPLEMENTED / PARTIAL JOURNEY | Role-specific downstream outcomes + browser E2E. |
| Parent / Guardian | `/family-os` | Governed invitation claim may create the consent-bound family relationship; support access remains permission-scoped. | IMPLEMENTED / CERTIFICATION OPEN | Invitation → active Scholar context → meaningful support action → revocation browser E2E. |
| Mentor | `/mentor-os` | Mentor validation/relationship foundations and Mentor Circles exist. | IMPLEMENTED / CERTIFICATION OPEN | Validation/relationship → Scholar support/circle action → revocation browser E2E. |
| Teacher / Educator | `/educator-os` | Verification request + Founder/Admin review + verified zero-data relationship identity exist. | IMPLEMENTED / CERTIFICATION OPEN | Approved identity → bounded Scholar context → meaningful intervention browser E2E. |
| High School Counselor | `/counselor-os` | Counselor verification/review and zero-data relationship identity exist. | IMPLEMENTED / CERTIFICATION OPEN | Approved identity → academic/application support action + denial/revocation browser E2E. |
| High School Coach | `/coach-os` | Coach verification/review and invitation-bound zero-data relationship activation exist. | IMPLEMENTED / CERTIFICATION OPEN | Verified identity → governed athlete support/recruiting action + browser E2E. |
| College Coach / Recruiter | `/recruiting-os` | Recruiting verification/review and zero-data relationship identity exist. | IMPLEMENTED / PARTIAL JOURNEY | Permissioned athlete interaction → target/visit/offer outcome + browser E2E. |
| College Admissions | `/admissions-os` | Admissions verification/review and zero-data relationship identity exist. `/university-os` is redirect-only compatibility. | IMPLEMENTED / CERTIFICATION OPEN | Permissioned institutional action + browser E2E. |
| Brand Partner | `/brand-partner-os` | Verification/review plus campaign/compliance scope and governed organization/campaign-draft authority exist. | IMPLEMENTED / CERTIFICATION OPEN | Campaign/opportunity lifecycle, compliance/human release evidence, browser E2E. |
| Employer / Workforce Partner | `/employer-os` | Employer verification/review and zero-data relationship identity exist. | IMPLEMENTED / CERTIFICATION OPEN | Opportunity/application workflow + browser E2E. |
| District / School Administrator | `/district-os` | District verification/review and zero-data relationship identity exist. | IMPLEMENTED / CERTIFICATION OPEN | Bounded cohort/institution action + browser E2E. |
| Athlete Abroad | `/athlete-abroad-os` | Readiness review with jurisdiction-scope review exists. | IMPLEMENTED / CERTIFICATION OPEN | Approved readiness → meaningful international-readiness action + browser E2E. |
| Community Partner | `/community-partner-os` | Community Partner verification/review with service scope and zero-data relationship identity exist. | IMPLEMENTED / CERTIFICATION OPEN | Approved service scope → governed support action + browser E2E. |

## Shared authority fabric

### Profile and public identity

`public.profiles` remains owner-only for direct SELECT. Public Scholar profiles, shared public identities, Network identities and support-side presentation identity use bounded projection RPCs. No public/shared surface may reopen broad direct cross-user profile reads.

### Verification and review

Authority-sensitive role evidence is independently reviewed. Founder/Admin reviewer authority covers Coach, Educator, Counselor, District, Recruiting, Admissions, Employer, Brand Partner, Community Partner and Athlete Abroad readiness. Review events are auditable and reviewers may not approve their own request.

Verification establishes approved role/scope evidence; it does not itself grant Scholar-data access.

### Support relationships and Active Scholar Context

Support invitations and relationships are governed and revocable. Parent/Guardian and Mentor may carry explicitly defined permissions. Verified external/support role relationships activate with zero Scholar-data permissions unless a separate authority contract grants more.

Active Scholar Context accepts a relationship ID rather than an arbitrary Scholar ID and remains valid only while that relationship is active. Downstream features must still enforce the relationship permission keys.

## Connected learner journeys

### Opportunity → Application

Scholar Record/readiness → explainable Opportunity match → Start application → learner-owned Application Workspace → documents/tasks/evidence/support → submission/outcome.

The direct Marketplace → Application Workspace handoff is implemented. Full document/support/submission/outcome browser E2E remains open.

### Learning → Credential → Rewards → Store

Course catalog → module content → acknowledgement/reflection → durable module progress → idempotent XP/coin ledger reward → course completion → credential + evidence-backed badge → Store balance/redemption.

The durable core is implemented. Fulfillment/operations, recovery and browser E2E remain open.

### Events / Mentorship

Event discovery → capacity-safe RSVP → verified attendance → idempotent reward.

Mentor Circle discovery → active membership or waitlist → leave/rejoin lifecycle.

The durable cores are implemented. Calendar/reminders/networking/session outcomes and browser E2E remain open.

### Notifications / Attention

Trusted producer → notification outbox → owner Attention Center → acknowledgement/preferences → delivery retry/finalization.

Clients cannot manufacture trusted notification events. Verification decisions and earned learning credentials are trusted producers today; additional producers must be added only after their upstream event authority is trustworthy.

## Journeys still materially partial

### Messaging

Complete participant-scoped attachments, read state, safety/block/report, relationship-removal semantics, notification acknowledgement, recovery and exact-revision browser E2E.

### Academic

Complete and prove Transcript → A-G/readiness/FAFSA/application → Compass recommendation → human decision → durable outcome as one connected journey.

### Recruiting

Complete and prove Scholar-Athlete Record → eligibility → verified coach/recruiter interaction → targets/visits/offers → durable outcome.

### Intelligence

Canonical Scholar AI and Experience-derived projections exist, but the platform still needs consistent explainability, provenance, confidence, human-decision and outcome measurement across all permission-scoped intelligence domains.

## Required role certification contract

For every role, final release evidence must prove:

1. Canonical public/auth entry and role selection.
2. Role-specific onboarding autosave/recovery and completion.
3. Required consent, verification and human review.
4. Correct relationship/institution/scope lineage.
5. Least-privilege Supabase authorization, including negative cross-user/wrong-role/revoked cases.
6. Correct canonical OS destination.
7. At least one meaningful role-specific action with durable outcome.
8. Revocation/removal/expiration behavior wherever relationship or scope grants authority.
9. Desktop/mobile keyboard/screen-reader/contrast/reduced-motion acceptance.
10. Restart/recovery/sign-out behavior at the same governed production revision.

## Current release boundary

Repository CI, dependency security audit, production builds, from-zero Database Certification, hosted Supabase promotion/reconciliation and Vercel deployment evidence are now materially stronger than the Aug. 12 baseline. Browser/visual E2E is still not proven for all roles in the current execution environment and must remain a release blocker rather than being inferred from source tests or Vercel READY state.
