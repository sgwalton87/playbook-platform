# Playbook Platform Onboarding Architecture

**Version:** 1.0.0
**Status:** Canonical Product Architecture
**Owner:** Playbook OS Engineering and Product, with Security, Data, Trust & Safety, and Legal/Compliance review
**Last Updated:** July 27, 2026

## Purpose

Define the governed product architecture through which a new user enters Playbook, establishes identity, selects or receives a role, completes required information, receives permissions, and reaches the correct role-based operating system experience.

## Scope

This specification governs public onboarding, invite-based onboarding, role branching, data collection, consent, relationship establishment, permissions, persistence destinations, and completion routing. It defines target architecture and identifies current gaps; it does not claim that every flow is implemented or production-validated.

Founder and platform-administrator provisioning, organization procurement, ongoing profile editing, and post-onboarding lifecycle operations are out of scope except where they establish an onboarding boundary. Founder and administrative access must not be offered as public signup roles.

## Objective

A new user must be able to establish a Playbook identity, enter through an authorized role pathway, satisfy age- and role-appropriate requirements, and receive the least-privileged operating system experience supported by verified data and relationships.

The onboarding system must support:

- personalization;
- security and least privilege;
- data governance and provenance;
- role-based experiences;
- age-appropriate experiences;
- consent and agreement management; and
- future role, institution, and partner scalability.

## Related Architecture References

- [Engineering Constitution](../../CODEX.md)
- [Master Engineering Checklist](../MASTER_CHECKLIST.md)
- [Platform Architecture](../ARCHITECTURE.md)
- [Database Handbook](../DATABASE.md)
- [Release Process](../RELEASE_PROCESS.md)
- [Canonical Role Registry](../GOVERNANCE/ROLE_REGISTRY.md)
- [Onboarding and Role OS Sprint Map](../ONBOARDING_ROLE_OS_SPRINT_MAP.md)
- [Onboarding Data Flow Audit](../audits/ONBOARDING_DATA_FLOW.md)
- [PPS-300 Scholar Record Domain Overview](../PPS/03_PLATFORM_ARCHITECTURE/PPS-300_SCHOLAR_RECORD_DOMAIN_OVERVIEW.md)
- [PPS-308 Privacy and Sharing](../PPS/03_PLATFORM_ARCHITECTURE/PPS-308_PRIVACY_AND_SHARING.md)
- [PBOS-RLS-001 Gate](../../pbos/gates/PBOS-RLS-001.json)

## Dependencies

- One authoritative executable role registry and alias resolver.
- Authenticated identity and verified-contact workflow.
- Canonical Scholar Record ownership contract.
- Explicit relationship and organization membership models.
- Central role/relationship permission matrix.
- Consent and agreement records with versioned audit evidence.
- RLS policies validated through `PBOS-RLS-001`.
- Stable operating system destination resolver.
- Trust and safety escalation policy.
- Legal review of age thresholds, guardian consent, youth messaging, discoverability, and retention.

## Governance Status Language

- **Verified:** repository evidence supports the stated wiring.
- **Partial:** a foundation exists but is incomplete or not validated end to end.
- **Missing:** the required implementation was not found.
- **Pending clarification:** the product or policy definition is not authoritative enough to implement safely.
- **Target:** required architecture that must pass implementation and release validation before being described as complete.

# 1. Onboarding Philosophy

Playbook onboarding is not account creation. Account creation establishes an authentication principal; onboarding creates a governed relationship among:

- user identity;
- role and role provenance;
- permissions;
- operating system experiences;
- the Scholar Record, where applicable;
- community participation;
- organizations and trusted relationships; and
- opportunities and permitted actions.

Onboarding must never grant access solely because a user selected a label. A selected role is a request until the role's verification, relationship, organization, age, and consent conditions are satisfied. The system may create a pending account or limited experience while those conditions remain unresolved.

The canonical outcome is not a completed form. It is an auditable state transition from an authenticated identity to an authorized, correctly routed, recoverable Playbook experience.

# 2. Supported User Roles

The executable role registry currently defines 13 canonical role keys. The onboarding sprint authority separately identifies High School Counselor as a K–12 pathway, but current code aliases `counselor` to `educator`. To meet the 14-role product view without inventing a new stable key, this specification lists High School Counselor as **pending clarification**. Engineering must not add a fifteenth interpretation or a new key until Product and Governance decide whether counselor remains an educator specialization or becomes a canonical role.

## Role registry

| Role | Purpose | Primary User | Operating System | Required Data | Permissions | Experience Destination |
| --- | --- | --- | --- | --- | --- | --- |
| Scholar | Build a governed academic, growth, portfolio, and opportunity journey | Student or learner | Scholar OS | Identity, age band, school/grade context, goals, agreement; guardian state when required | Own-record access; community capabilities according to age and consent | `/dashboard` |
| Scholar-Athlete | Extend the Scholar journey with athletics and recruiting | Student athlete | Scholar-Athlete OS | Scholar baseline, sport/team context, recruiting intent, visibility, agreement | Own-record access plus explicitly scoped athletics/recruiting sharing | `/scholar-athlete-os` |
| Transition-Aged Youth | Support education, work, and independent-adulthood pathways | Transition-aged learner | TAY OS label; currently Scholar dashboard | Scholar baseline, support context, goals, age/consent state | Scholar-like permissions are partial; dedicated policy pending | `/dashboard` |
| Parent / Guardian | Support an authorized Scholar relationship | Parent, guardian, or caregiver | Family OS | Identity, relationship claim/invite, dependent reference, agreement | `parent_guardian` relationship scope after verification; no automatic full-record access | `/family-os` |
| Mentor | Provide scoped guidance and support | Trusted adult or advisor | Mentor OS | Identity, guidance profile, verification state, relationship invite, agreement | `mentor` relationship scope after approval and connection | `/mentor-os` |
| Teacher / Educator | Support academic progress and evidence workflows | Teacher or educator | Educator OS | Identity, institution, official contact, verification state, agreement | `educator` relationship scope; cohort access only when institutionally authorized | `/educator-os` |
| High School Counselor | Provide counseling, readiness, and pathway support | School counselor | Pending clarification: Educator OS specialization or distinct OS | Institution, official contact, professional role, student/cohort scope, agreement | Currently resolves through `educator`; counselor-specific boundaries pending clarification | Pending clarification; current alias resolves to `/educator-os` |
| High School Coach | Support athlete development, eligibility, and advocacy | School coach | Coach OS label; currently Educator OS | Identity, school/team, official contact, roster/relationship scope, agreement | Coach-specific relationship kind is missing; no access until approved mapping exists | `/educator-os` |
| College Coach / Recruiter | Discover and contact eligible Scholar-Athletes within policy | Verified collegiate coach or recruiter | Recruiting experience within University OS | Institution, official contact, recruiting scope, contact preferences, compliance acknowledgement | University-partner foundation; coach-specific recruiting scope remains partial | `/university-os` |
| College Admissions | Support institutional outreach and admissions pathways | Verified admissions professional | Admissions experience within University OS | Institution, official contact, criteria, engagement intent, agreement | University-partner scope; admissions-specific boundaries remain partial | `/university-os` |
| Brand Partner | Create governed campaigns and funded opportunities | Verified brand or partner representative | Brand Partner OS | Organization, representative identity, opportunity intent, compliance acknowledgement | Brand-specific permission map is missing; remain pending until verified | `/brand-partner-os` |
| Employer / Workforce Partner | Provide internships, work-based learning, and employment pathways | Verified employer representative | Employer OS | Organization, representative identity, opportunity intent, verification, agreement | `employer_partner` relationship scope after approval | `/employer-os`; public onboarding is currently disabled/incomplete |
| District / School Administrator | Use authorized aggregate and cohort views | Verified district or school leader | District OS | Organization, official contact, administrator scope, verification, agreement | `district_admin` scope; no unrestricted individual-record access | `/district-os`; public onboarding is currently disabled |
| Community Partner | Request a role not covered by an approved public pathway | Community or support representative | No dedicated OS | Identity, stated purpose, organization if applicable, agreement | No default relationship permission; manual review required | `/pending` |

Role selection availability and destination are separate controls. A route existing in the repository does not authorize public signup, and successful signup does not prove permission to access Scholar data.

# 3. Role-Based Onboarding Flow

## Step 1 — Account creation

Create the authentication principal through the approved identity provider. Capture only authentication essentials and anti-abuse signals. Do not create elevated roles, Scholar relationships, or organization membership from unverified client input.

## Step 2 — Identity verification

Verify the required contact channel and bind onboarding state to the authenticated user ID. Institutional and partner roles additionally require organization-controlled contact or another approved verification mechanism. Failed or pending verification routes to a recoverable pending state.

## Step 3 — Role selection

Resolve the requested role through the canonical registry and alias map. Store the requested role separately from the approved/effective role. Invite context may constrain the available role. Unknown values must not fall back to Scholar in a way that grants Scholar permissions or creates a Scholar Record.

## Step 4 — Age verification

Collect the minimum age signal approved by Legal and Security. Derive an age band server-side where possible; do not expose exact birth date more broadly than required. Until age is resolved, apply the most restrictive youth-safe defaults.

## Step 5 — Consent requirements

Present versioned terms, privacy, community safety, and role-specific agreements. Determine whether guardian consent, institutional authorization, or specialized acknowledgement is required. Record the document version, actor, subject, timestamp, method, and state; a boolean embedded only in profile JSON is insufficient canonical evidence.

## Step 6 — Role-specific profile creation

Create or update the role profile and its canonical domain records. Learner roles create or link exactly one Scholar Record. Support and partner roles create actor/organization records but do not own a Scholar Record for the students they support.

## Step 7 — Permissions setup

Derive effective permissions from approved role, verified relationship, organization membership, age/consent policy, record visibility, and account state. Persist grants or relationship state through server-controlled operations. RLS is the final database enforcement boundary.

## Step 8 — Dashboard routing

Resolve the destination from the approved role registry only after required writes succeed. Incomplete, pending, rejected, or recoverable states route to explicit status/recovery experiences, never to an incorrectly privileged dashboard.

# 4. Branching Logic

```text
START
  -> create authentication identity
  -> verify required contact
  -> normalize requested role against canonical registry
  -> determine age band and consent state
  -> IF verification, age, or required consent is unresolved
       -> save resumable state
       -> apply restrictive permissions
       -> route to verification/consent/pending experience
     ELSE
       -> execute approved role branch
       -> create required profile/domain records
       -> establish only verified relationships or memberships
       -> derive effective permissions
       -> route through canonical destination resolver
```

## Role branches

- **Scholar:** Scholar onboarding → one Scholar Record → academic baseline → goals and activities → privacy/community defaults → Scholar dashboard.
- **Scholar-Athlete:** Scholar baseline → Scholar Record → athletics profile → recruiting intent and visibility → recruiting permissions → Scholar-Athlete OS.
- **Transition-Aged Youth:** Scholar baseline → Scholar Record → education/work/support context → goals → TAY policy projection → current Scholar dashboard until a distinct destination is approved.
- **Parent / Guardian:** identity → dependent invite or relationship claim → guardian/consent verification → scoped relationship → Family OS. No verified relationship means pending/recovery, not Scholar access.
- **Mentor:** identity → mentor profile → eligibility/background state → Scholar invite/assignment → connection permissions → Mentor OS. Background-verification policy is pending clarification.
- **Teacher / Educator:** identity → institution and official contact → institutional verification → cohort/Scholar relationship scope → Educator OS.
- **High School Counselor:** identity → institution and official contact → counselor specialization → authorized student/cohort scope → destination pending canonical role decision; current alias uses Educator OS.
- **High School Coach:** identity → school/team and official contact → coach verification → roster/athlete relationship → approved coach permissions → current Educator OS destination.
- **College Coach / Recruiter:** identity → institution verification → recruiting scope → compliance/contact preferences → approved Scholar-Athlete visibility → University OS recruiting experience.
- **College Admissions:** identity → institution verification → admissions criteria and engagement scope → approved record visibility → University OS admissions experience.
- **Brand Partner:** identity → organization verification → opportunity/campaign intent → compliance state → approved partner permissions → Brand Partner OS.
- **Employer / Workforce Partner:** invite or approved entry → organization verification → opportunity/hiring intent → candidate access boundaries → Employer OS. Public onboarding remains disabled until the pathway is complete.
- **District / School Administrator:** provisioned or approved entry → district/school verification → membership and cohort scope → aggregate/authorized permissions → District OS. Public onboarding remains disabled.
- **Community Partner:** identity → purpose and organization context → manual classification/review → assigned approved role or pending state. No default Scholar or partner permissions.

# 5. Required vs Optional Fields

A field is **Required** when onboarding cannot safely complete without it, **Optional** when omission does not alter authorization, **Conditional** when role/age/relationship state activates it, and **Restricted** when collection or access requires additional purpose, consent, or privilege.

## Field governance matrix

| Field | Role | Required? | Visibility | Database Destination | Privacy Level |
| --- | --- | --- | --- | --- | --- |
| Authenticated user ID | All | Required | System only | Authentication identity; `profiles.id` reference | Restricted |
| Verified email/contact state | All; stronger evidence for institutional roles | Required | User and authorized operations | Authentication identity plus verification/audit record | Restricted |
| Requested role | All | Required | User and operations | `profiles.requested_role` until canonical role-request model exists | Private |
| Approved/effective role | All | Required for completion | User and authorization services | `profiles.role`; future normalized role assignment | Restricted |
| Full name/display name | All | Required | Private by default; public only by explicit profile setting | `profiles.full_name` | Private |
| Username | Public-profile-capable roles | Conditional | Public when activated | `profiles.username` | Public |
| Date of birth or approved age evidence | Learner roles; others if policy requires | Restricted/Conditional | Authorized policy service only | Dedicated age/consent record; **must not remain only in onboarding JSON** | Restricted |
| Derived age band | All community participants | Required before community grants | Authorization services | Dedicated age/consent or policy-state record | Restricted |
| Guardian identity/relationship | Youth or teen user when policy requires | Conditional | User, guardian, authorized operations | Consent subject/actor plus support relationship | Restricted |
| Agreement acceptance and version | All | Required | User and audit operations | Dedicated consent/agreement record; current profile safety fields are transitional | Restricted |
| School, grade, graduation year | Scholar, Scholar-Athlete, TAY | Conditional by pathway | Private/network by default | Academic Profile/Scholar Record; transitional profile mapping must be explicit | Private |
| Goals and intended pathways | Learner roles | Optional or Conditional | Private by default; controlled sharing | Goals and Milestones / Career and College Profile | Private |
| Activities and achievements | Learner roles | Optional | User-selected public/network/private | Scholar Record activity/achievement tables | Private by default |
| Sport, team, position, graduation/recruiting context | Scholar-Athlete | Conditional | Private by default; recruiting share only by consent | Athletics Profile and recruiting records | Restricted |
| Athletics measurements, statistics, film, honors | Scholar-Athlete | Optional/Restricted | Explicit recruiting visibility | Athletics evidence/profile records | Restricted |
| Institution/organization name | Educator, counselor, coaches, admissions, district, employer, brand | Required | Organization members; selected public identity | Organizations plus membership/request | Private |
| Official organization contact | Institutional and partner roles | Required | Verification operations | Verification request/audit record | Restricted |
| Professional title/function | Support, institutional, partner roles | Required | Network or organization context | Role profile / organization membership | Private |
| Scholar/dependent/roster/cohort reference | Support and institutional roles | Conditional | Relationship parties and authorized operations | Connections/support relationship/organization scope | Restricted |
| Opportunity or engagement intent | Admissions, brand, employer, partner roles | Conditional | Organization and opportunity operations | Role profile initially; normalized opportunity/provider record before activation | Private |
| Messaging/contact preference | All community roles | Required before messaging | Authorization and relationship parties | Preferences plus permission policy state | Private |
| Discoverability setting | All public/network-capable roles | Required | Enforced by search/profile services | Preferences/privacy setting | Private |
| Posting/commenting/sharing defaults | All community-capable roles | Required | Authorization services | Preferences/privacy setting | Private |
| Invite supporter email | Learner/support roles | Optional/Restricted | Inviter and invitation operations | Invitations; do not persist indefinitely as generic profile JSON | Restricted |
| Demographic or support-context data | Learner roles | Optional/Restricted | User and specifically authorized support/analytics purposes | Dedicated protected Scholar/support domain where approved | Restricted |

No production field may be added to onboarding without: a stable key, type, collection purpose, validation rule, owning domain, database destination, visibility classification, retention rule, reader inventory, update owner, and deletion/correction behavior. The current `profiles.onboarding_data` JSON may support resumable drafts, but it is not the canonical final destination for normalized domain data.

# 6. Database Mapping

## Write ownership map

| Data class | Canonical destination | Write boundary | Current-state note |
| --- | --- | --- | --- |
| Authentication | Supabase Auth identity/session tables | Identity provider/server auth flow | Implemented foundation; verification must be validated end to end |
| Base profile | `profiles` | Authenticated server/client boundary permitted by validated RLS | Current `/start` upserts profile fields and `onboarding_data` |
| Scholar Record | Canonical Scholar Record and domain tables | Server domain service | Onboarding-created record is not yet verified |
| Academic Profile | Scholar academic domain tables | Server domain service | Some values currently remain in `profiles.onboarding_data` or mismatched profile fields |
| Athletics Profile | `athlete_profiles` and governed athletics/recruiting tables | Server domain service | Onboarding projection is incomplete |
| Role assignments | Normalized role assignment target; transitional `profiles.role/requested_role` | Server authorization service | Requested and effective roles must remain distinct |
| Role profiles | Role-specific profile/domain table | Server role service | Several roles currently store unnormalized JSON only |
| Permissions | Derived from role, relationship, organization, age, consent, and policy; explicit grants only where required | Server authorization service plus RLS | Central matrix and full validation remain incomplete |
| Consent | Versioned consent/agreement records | Server consent service | Profile boolean/timestamp fields are transitional and insufficient for all consent cases |
| Organizations | Organizations and memberships | Server organization service | Organization-capable model exists; onboarding creation/approval is incomplete |
| Connections | Invitations, support relationships, roster/cohort scopes | Server relationship service | Invite and support foundations exist; completion wiring is incomplete |
| Preferences | Privacy, communication, discoverability, and community preference records | Authenticated preference service with RLS | Target normalization required |
| Audit evidence | Append-oriented role, consent, permission, and privileged-action logs | Server-only audit service | Required; comprehensive onboarding audit log is not yet claimed |

## Transaction and recovery requirements

1. Draft saves must be idempotent and bound to the authenticated identity.
2. Completion must validate required fields and policy state server-side.
3. Domain writes must use stable idempotency keys or an equivalent retry-safe contract.
4. A partial failure must retain an explicit resumable state; it must not route the user as complete.
5. Role, relationship, organization, and permission writes must be auditable.
6. Destination routing occurs only after required canonical writes commit.
7. Re-running completion must not create duplicate Scholar Records, memberships, or relationships.

# 7. Age-Based Onboarding Rules

Exact legal age thresholds and jurisdiction rules are **pending clarification**. Product code must not hard-code assumed thresholds from this document. The policy service must resolve the applicable jurisdiction and approved thresholds. Until resolved, use the most restrictive relevant state.

| Age category | Guardian consent | Privacy default | Messaging | Discoverability | Posting |
| --- | --- | --- | --- | --- | --- |
| Youth user | Required where policy determines; completion may remain pending | Private | Disabled except approved, safety-reviewed relationship channels | Off | Disabled or tightly restricted pending policy |
| Teen user | Conditional by jurisdiction, feature, institution, and relationship | Private | Connections/approved relationships only by default | Off unless eligible and affirmatively enabled | Restricted; safety controls and consent state apply |
| Adult user | Not generally guardian-dependent, subject to applicable exceptions | Private for learner records; explicit choice for public profile | Controlled by role, relationship, and user preference | Opt-in | Allowed only under community policy and account standing |

Required architecture:

- store birth/age evidence separately from public profile data;
- derive an age-policy state without exposing exact birth date to unrelated services;
- re-evaluate permissions when the user crosses a policy threshold;
- preserve consent version, actor, subject, scope, and revocation state;
- provide guardian invite, verification, decline, expiry, and correction flows;
- prevent client-side age changes from directly increasing permissions; and
- define data retention and deletion rules with Legal and Security.

# 8. Scholar Athlete Requirements

Scholar-Athlete onboarding extends rather than duplicates Scholar onboarding and the Scholar Record.

## Required architecture

- Create or link one canonical Scholar Record.
- Create a governed Athletics Profile for sport, team, position/event, development context, and evidence.
- Capture recruiting intent, target level, contact preferences, and visibility separately from public profile defaults.
- Treat statistics, measurements, film, eligibility context, academic records, and contact information as independently governed data classes.
- Record provenance and verification state for claims and uploaded evidence.
- Require explicit visibility controls for coaches, recruiters, institutions, network members, and the public.
- Grant coach/scout access only through a verified institutional role, permitted recruiting purpose, user visibility/consent state, and RLS-backed query.
- Support revocation and audit of recruiting access.

## NCAA-related considerations

Playbook may collect recruiting and compliance context, but onboarding must not represent Playbook as an eligibility certifier or legal/compliance authority. NCAA-related fields, contact rules, acknowledgements, and workflows require policy owner review and current governing-rule validation before release. Automated guidance must be labeled as guidance and must not become an unverified eligibility fact.

# 9. Community and Feed Permissions

Onboarding establishes conservative defaults; users may receive only the capabilities allowed by age, consent, verified role, relationship, account standing, and safety policy.

## Visibility vocabulary

| Level | Meaning |
| --- | --- |
| Public | Accessible without an approved Playbook relationship; never the default for protected Scholar data |
| Network | Accessible to an authorized, policy-defined Playbook network audience |
| Connections | Accessible only to accepted, non-blocked, permission-eligible relationships |
| Private | Accessible only to the owner and explicitly authorized operational roles |

## Capability matrix

| Capability | Default | Required controls |
| --- | --- | --- |
| Posting | Private draft or disabled for unresolved youth state | Age/consent eligibility, community agreement, moderation policy, account standing |
| Following | Disabled until age and community policy resolve | Discoverability, block/mute state, relationship policy |
| Messaging | Connections or approved relationship channels only | Age policy, consent, recipient policy, block/mute state, rate/abuse controls, audit metadata |
| Commenting | Disabled until community eligibility is established | Audience visibility, age policy, moderation controls, account standing |
| Achievement sharing | Private | Item-level public/network/connections/private choice; provenance and sensitive-data review |

Changing a preference must not bypass a stricter role, age, relationship, consent, record, or safety policy. The effective permission is the intersection of all applicable controls.

# 10. Security Requirements

`PBOS-RLS-001` is the active validation dependency for production data access. Onboarding is not release-ready until its tables and access paths are included in the RLS matrix and validated with representative roles.

- **Least privilege:** New and pending users receive no capability beyond what is required to complete or recover onboarding.
- **Role-based permissions:** Effective permissions derive from an approved role, not raw client input or route selection.
- **RLS enforcement:** `profiles`, Scholar Records, role profiles, organizations, memberships, relationships, invitations, preferences, consents, and onboarding drafts require explicit policies where sensitive.
- **Audit logging:** Record role requests/approvals, consent events, relationship changes, organization verification, permission-affecting changes, completion, and privileged overrides.
- **Protected records:** Scholar, demographic, age, guardian, academic, athletics, recruiting, contact, and verification data require purpose-limited access.
- **Consent boundaries:** A consent event applies only to its recorded subject, actor, scope, version, and lifecycle state.
- **Server trust boundary:** Elevated role approval, organization verification, consent adjudication, canonical record creation, and explicit permission grants are server-controlled.
- **Input and upload safety:** Validate type, size, content, storage ownership, and malware/safety policy for evidence and avatar uploads.
- **Anti-abuse:** Rate-limit account creation, invitations, verification attempts, username selection, and relationship requests.
- **Failure safety:** Errors must not widen permissions, disclose whether protected users exist, or leave an account incorrectly marked complete.

# 11. UX Requirements

## Desktop

- Maintain a readable content width, persistent progress context, clear previous/next actions, and non-destructive save/resume behavior.
- Keep complex institutional and role-specific fields grouped by purpose rather than presenting one long form.

## Mobile

- Use single-column, touch-safe controls and avoid interactions that depend on hover.
- Preserve drafts across navigation, refresh, and authentication handoff.
- Keep the primary action visible without obscuring content or validation errors.

## Accessibility

- Meet semantic HTML, keyboard, focus-order, label, instruction, error-association, contrast, and reduced-motion requirements.
- Announce step changes, save state, validation summaries, and asynchronous errors appropriately.
- Do not use color alone to communicate completion, restriction, or failure.

## State model

- **Loading:** Show what is being resolved; prevent duplicate completion actions.
- **Empty:** Explain why data is requested and whether it is optional, conditional, or unavailable.
- **Error:** Preserve entered data, identify the affected field or operation, provide safe retry/recovery, and expose a support path when blocked.
- **Success:** Confirm the completed state and destination without implying unapproved verification or access.
- **Pending:** Explain verification, consent, or review requirements without exposing protected review details.
- **Permission-restricted:** State that access is unavailable and provide the authorized remediation path; never silently fall back to a different privileged role.

Progress indicators must represent validated required work, not merely visited screens. Optional steps must be identifiable, and users must be able to understand what remains before completion.

# 12. Definition of Done

The onboarding architecture may be treated as implementation-ready when:

- ✅ all 14 product role rows are documented, with non-canonical counselor status explicitly unresolved;
- ✅ branching logic exists for every role row;
- ✅ required, optional, conditional, and restricted field governance is defined;
- ✅ every approved onboarding field has a canonical database destination and reader/retention contract;
- ✅ role, relationship, organization, age, consent, and community permission derivation is defined;
- ✅ age-policy categories and safe defaults are documented, with legal thresholds resolved before implementation;
- ✅ security boundaries and `PBOS-RLS-001` validation requirements are documented; and
- ✅ UX, persistence, recovery, audit, testing, and routing requirements are implementable without hidden assumptions.

The product implementation is complete only after the architecture is reflected in code and migrations, all role flows pass targeted and end-to-end tests, RLS and service boundaries are validated, accessibility and responsive behavior are verified, and the Master Engineering Checklist records the evidence.

## Unresolved Governance Questions

1. Is High School Counselor a canonical role key, an Educator specialization, or a relationship subtype?
2. What jurisdiction-aware numeric thresholds define youth, teen, and adult policy states?
3. Which features require verifiable guardian consent, and what are the consent expiry, revocation, and dispute rules?
4. What background, eligibility, or institutional verification is required for mentors, coaches, educators, recruiters, admissions staff, employers, brand partners, and district administrators?
5. Which role types may self-register, require an invite, or require organization-admin provisioning at launch?
6. What is the canonical consent/agreement schema and system of record?
7. Which normalized domain tables replace each current `profiles.onboarding_data` field, and what backfill is required?
8. What are the approved default and maximum community permissions by age category?
9. What recruiting information may be public, connection-only, institution-only, or private, and who owns policy updates?
10. What retention, deletion, export, correction, and audit-access rules apply to youth and institutional onboarding evidence?

Until these questions are resolved through Product, Security, Data, Trust & Safety, Legal/Compliance, and architecture governance, implementations must choose the least-privileged behavior and must not infer authority from missing policy.
