# User Journeys

> Canonical owner: Playbook Product and Experience
> Reconciled implementation baseline: `4a2d1ca90a12c0be24b9e7bede1c15e82756bd40`
> Reconciled: 2026-08-12

This document records the current role-journey truth after PR #89 materialized 17 unique Operating System destinations and PR #90 implemented the real Scholar completion adapter. Route existence is not acceptance evidence.

## Global journey contract

Every launch role must satisfy this sequence:

public discovery → authentication → role selection → role-specific onboarding → verification/consent → canonical Playbook Record projection → accepted relationship/authority → permission-scoped OS landing → meaningful role action → durable outcome → recovery/sign-out.

A role may save progress before its completion adapter exists. It must fail closed at completion rather than inherit another role's authority or record type.

## Evidence states

- REFERENCE IMPLEMENTATION — real journey implementation exists and is the pattern to replicate; release certification still follows the full exact-revision evidence contract.
- PARTIAL — some required steps exist, but the journey is not complete.
- FAIL-CLOSED — entry or progress may exist, but completion/access is intentionally blocked pending accepted governance/authority.
- MISSING — required journey components are not implemented.

## Current role index

| Role | Entry / onboarding | OS destination | Authority / verification | Current state | Primary next connection |
| --- | --- | --- | --- | --- | --- |
| Scholar | Implemented; real seven-step completion adapter | `/dashboard` | Scholar authority implemented; owner-scoped assertions included in PR #90 | REFERENCE IMPLEMENTATION | Exact merge-revision browser/RLS certification and continued use as template |
| Scholar-Athlete | Role-aware entry/onboarding exists | `/scholar-athlete-os` | Dedicated relationship/compliance lifecycle incomplete | PARTIAL | Apply Scholar adapter with athlete record, eligibility/compliance and denial tests |
| Parent / Guardian | Entry/onboarding surface exists | `/family-os` | Parent relationship model exists; dependent invitation/consent not fully proven | PARTIAL | Durable dependent invitation → consent → Scholar relationship → recovery |
| Mentor | Entry/onboarding surface exists | `/mentor-os` | Mentor relationship exists; eligibility/approval lifecycle incomplete | PARTIAL | Verification/approval + durable scholar assignment + revocation |
| Educator | Entry/onboarding surface exists | `/educator-os` | Educator permissions exist; institutional/roster verification incomplete | PARTIAL | Institution verification + roster/cohort relationship |
| High School Coach | Entry/onboarding surface exists | `/coach-os` | Accepted coach relationship contract missing; access must fail closed | FAIL-CLOSED | Define/accept least-privilege coach authority + verification + athlete roster link |
| College Coach / Recruiter | Entry/onboarding surface exists | `/recruiting-os` | Accepted recruiter authority missing; completion/access must fail closed | FAIL-CLOSED | Institution/recruiter verification + governed Scholar-Athlete access |
| College Admissions | Entry/onboarding surface exists | `/admissions-os` | Accepted admissions authority missing; completion/access must fail closed | FAIL-CLOSED | Institution verification + criteria-scoped scholar access |
| Transition-Aged Youth | Entry/onboarding surface exists | `/transition-youth-os` | Currently scholar-like; explicit canonical record/authority decision remains | PARTIAL | Adopt explicit TAY record/relationship contract then apply Scholar adapter |
| Employer | Public role exists; complete role-specific onboarding is incomplete | `/employer-os` | Employer-partner semantics exist but organization verification is incomplete | PARTIAL / MISSING | Employer onboarding + organization verification + opportunity authority |
| Brand Partner | Entry/onboarding surface exists | `/brand-partner-os` | Brand-specific organization verification/authority incomplete | PARTIAL | Organization verification + partner authority + opportunity lifecycle |
| Community Partner | Entry/onboarding surface exists | `/community-partner-os` | Accepted community-partner authority missing; fail closed | FAIL-CLOSED | Define/accept community partner authority + review workflow |
| High School Counselor | Destination exists; complete public/onboarding contract incomplete | `/counselor-os` | Accepted counselor authority/verification missing | FAIL-CLOSED / MISSING | Canonical signup/onboarding + school verification + least-privilege scholar access |
| Athlete Abroad | Destination exists; canonical enrollment incomplete | `/athlete-abroad-os` | Enrollment/consent/ownership/authority missing | MISSING | Canonical enrollment + record ownership + consent + OS entry |
| District / School Administrator | Destination exists; canonical onboarding incomplete | `/district-os` | Institutional administrator authority/verification missing | MISSING | Institution onboarding + admin authority + roster/data scope |

## Scholar reference contract

PR #90 corrected the former false-positive acceptance path. The implementation now resets a synthetic account, authenticates, traverses all seven onboarding UI steps, records consent, executes the signed PBOS transaction, verifies durable Supabase projections, and lands on the canonical dashboard. It also prevents unsupported roles from being marked complete through the Scholar adapter.

Scholar is therefore the implementation reference for role completion. It is not permission to mark other roles complete, and branch-level tests/build are not a substitute for final exact merge-revision production/browser/RLS evidence.

## Required replication contract

For every non-Scholar role PBOS must implement and prove:

1. Canonical public/auth entry.
2. Role-specific onboarding schema and autosave/recovery.
3. Required consent and verification.
4. Correct canonical Playbook Record type/projection.
5. Correct relationship(s) to people/institutions/opportunities.
6. Least-privilege application authorization and Supabase RLS.
7. Unique canonical OS destination.
8. At least one meaningful role-specific action with durable outcome.
9. Revocation/removal/expiration semantics where relationships grant access.
10. Desktop/mobile/accessibility/restart/recovery browser acceptance at the same governed revision.

## Cross-role relationship fabric

The Starting Five/support layer must become the reusable relationship fabric rather than a visual invitation feature. Invitations must be durable, expirable, revocable and relationship-producing. Accepted relationships must drive downstream access to applications, messaging, notifications and recommendations, while removal immediately removes downstream authority.

## Connected journey priorities

- Scholar Record → readiness → Opportunity → application workspace → authorized support → messaging → outcome.
- Course → progress/completion → evidence → certificate/badge → XP/coins → Record/Timeline/Trust refresh.
- Transcript → A-G/readiness/FAFSA/application → Compass recommendation → human decision → outcome.
- Scholar-Athlete Record → eligibility → coach/recruiter access → target/visit/offer → outcome.
- Event → RSVP → reminder/calendar → attendance/check-in → community/network outcome.

## Route boundary

All 17 OS destinations may exist without all journeys being complete. No route, dashboard zero-state, or role-selection card may be used as evidence of verification, authority, persistence or end-to-end completion.
