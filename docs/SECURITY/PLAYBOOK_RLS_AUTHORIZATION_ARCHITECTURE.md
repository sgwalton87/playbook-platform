# Playbook Platform Row Level Security and Authorization Architecture

**Version:** 1.0.0
**Status:** Canonical Security Architecture
**Owner:** Playbook OS Engineering and Security, with Product, Data, Trust & Safety, and Legal/Compliance review
**Last Updated:** July 27, 2026

## Purpose

Define how identity, ownership, canonical role, verified relationship, organization scope, consent, age-policy category, record visibility, and backend trust boundaries determine access to Playbook data. This document establishes the authorization contract that Row Level Security (RLS), server services, application permission checks, and `PBOS-RLS-001` validation must implement.

## Scope

This specification covers the Scholar Record and its principal domains, relationships, social/community data, opportunities, organizations, service-role use, and audit evidence. It defines architecture and validation requirements only. It does not create SQL policies, certify the current schema, or represent unresolved role and age policies as implemented.

## Authority Sources

- [Playbook Onboarding Architecture](../PRODUCT/PLAYBOOK_ONBOARDING_ARCHITECTURE.md)
- [PPS-300 Scholar Record Domain Overview](../PPS/03_PLATFORM_ARCHITECTURE/PPS-300_SCHOLAR_RECORD_DOMAIN_OVERVIEW.md)
- [PBOS-RLS-001 Gate Definition](../../pbos/gates/PBOS-RLS-001.json)
- [Canonical Role Registry](../GOVERNANCE/ROLE_REGISTRY.md)

## Supporting References

- [Database Handbook](../DATABASE.md#rls-policies)
- [PPS-308 Privacy and Sharing](../PPS/03_PLATFORM_ARCHITECTURE/PPS-308_PRIVACY_AND_SHARING.md)
- [Release Process](../RELEASE_PROCESS.md)
- [Engineering Constitution](../../CODEX.md)

## Governance Language

- **Existing permission:** a permission present in the current permission architecture: `view_progress`, `view_verified_record`, `view_deadlines`, `support_tasks`, `verify_evidence`, `recommend_actions`, `view_cohort`, `view_equity_metrics`, `create_opportunities`, or `review_candidates`.
- **Delegated access:** access derived from a verified, active relationship or organization scope and limited by an existing permission, visibility, consent, and age policy.
- **Target rule:** a required policy direction that still needs schema mapping, implementation, and test evidence.
- **Unresolved:** no sufficiently authoritative rule exists; deny by default until governance resolves it.

# 1. Security Philosophy

Playbook authorization is deny-by-default and record-centered. A route, dashboard, role label, signup selection, profile field, or client-side condition is never sufficient authority to read or change protected data.

The Scholar owns the Scholar Record. Playbook acts as steward. Supporters, institutions, coaches, recruiters, employers, partners, and administrators receive only the minimum access established by a verified purpose and an enforceable policy. Authorization decisions must evaluate all applicable dimensions:

```text
allow = authenticated identity
    AND approved account state
    AND permitted operation
    AND ownership OR valid delegation OR explicit public policy
    AND effective role/relationship/organization scope
    AND age-policy allowance
    AND consent allowance
    AND record visibility allowance
    AND record lifecycle allowance
    AND no stronger safety restriction
```

Failure or uncertainty in any required dimension denies access. Application permission checks explain and constrain workflows; RLS remains the database-level enforcement boundary. Privileged backend access may not erase ownership, purpose limitation, or audit requirements.

# 2. Role-Based Access Model

## Authorization inputs

1. **Authenticated identity:** the server-validated user ID, never a client-supplied substitute.
2. **Effective role:** an approved canonical role; requested roles do not grant access.
3. **Relationship kind:** an active and verified `scholar`, `parent_guardian`, `educator`, `mentor`, `district_admin`, `university_partner`, or `employer_partner` relationship where currently supported.
4. **Organization membership:** a verified membership with an explicit organization and scope.
5. **Existing permission:** one of the currently defined permission verbs.
6. **Ownership:** the record's user, Scholar, relationship, organization, or creator owner.
7. **Visibility:** public, network, connections, or private, subject to stricter controls.
8. **Age and consent:** applicable policy state and versioned consent evidence.
9. **Record state:** active, pending, revoked, archived, moderated, or other governed lifecycle state.
10. **Safety state:** blocks, mutes, moderation constraints, account standing, and contact restrictions.

## Existing relationship permission baseline

| Relationship | Existing permissions | Security interpretation |
| --- | --- | --- |
| Scholar | `view_progress`, `view_verified_record`, `view_deadlines`, `support_tasks` | Own-record baseline; ownership rules govern changes |
| Parent/Guardian | `view_progress`, `view_deadlines`, `support_tasks` | Scoped Scholar support summaries after verified relationship and consent policy |
| Educator | `view_progress`, `verify_evidence`, `recommend_actions`, `view_cohort` | Scoped student/cohort access through verified educational relationship |
| Mentor | `view_progress`, `recommend_actions`, `support_tasks` | Scoped progress and support actions for connected Scholars |
| District Administrator | `view_cohort`, `view_equity_metrics` | Aggregate or authorized cohort access; not blanket individual-record access |
| University Partner | `view_verified_record`, `recommend_actions` | Explicitly shared verified-record view and recommendation workflows |
| Employer Partner | `view_verified_record`, `create_opportunities`, `review_candidates` | Explicitly shared candidate record, organization opportunities, and scoped review |

Coach-specific, college-coach-specific, admissions-specific, brand-partner-specific, Transition-Aged Youth-specific, community-partner-specific, and counselor-specific relationship permissions are incomplete or absent. They must not be inferred from a similar role except through a formally approved alias and tested policy.

# 3. Role × Data Domain Matrix

## Legend

- **O:** owner access. Mutation still depends on record type, verification state, and lifecycle policy.
- **D:** delegated view or action only when an active relationship/organization scope and the named existing permission support it.
- **S:** summary/aggregate access only; no unrestricted underlying record access.
- **C:** creator/organization-owned access, limited to the actor's own records.
- **P:** public visibility only when the record owner affirmatively published an eligible field or item.
- **—:** no supported access; deny by default.
- **U:** unresolved governance; deny until clarified.

This matrix is an architecture baseline, not SQL. A cell never bypasses age, consent, visibility, block/mute, verification, lifecycle, or audit controls.

| Role / relationship | Scholar Record | Academic Profile | Athletics Profile | Career Profile | Documents | Achievements | Goals | Connections | Feed Posts | Messages | Opportunities | Organizations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Scholar | O | O | O if applicable | O | O | O | O | O for own edges/actions | O for own posts; P/network/connection reads by policy | Participant-only | Read eligible; own applications/actions | Read public/member-authorized |
| Scholar-Athlete | O | O | O | O | O | O | O | O for own edges/actions | O for own posts; P/network/connection reads by policy | Participant-only | Read eligible; own recruiting/opportunity actions | Read public/member-authorized |
| Transition-Aged Youth | O | O | O if applicable | O | O | O | O | O for own edges/actions | Youth/teen policy; dedicated rules U | Participant-only under age policy | Read eligible; own actions | Read public/member-authorized |
| Parent/Guardian relationship | D: progress/deadlines only | D: progress summary | U | — | — unless separately and explicitly shared | D only when surfaced in progress/deadline support | D: support context only | Own relationship edge | P/eligible connection content only | Participant-only with age/consent allowance | Read eligible; support actions only | — |
| Mentor relationship | D: progress only | D: progress summary | — | D only through `recommend_actions` workflow context | — | D only if included in shared progress | D: recommend/support context | Own relationship edge | P/eligible connection content only | Participant-only with age/consent allowance | Read eligible; recommend/support only | — |
| Educator relationship | D: progress/verification context | D: progress; S cohort | — unless authorized evidence context | D only through recommendation context | D only for explicit verification workflow | D: `verify_evidence` scope | D only through recommendation context | Scoped roster/cohort relationship | P/eligible network content only | Participant-only under institution and age policy | Read eligible; recommend only | Member-authorized institution read |
| High School Counselor | Same as Educator only while canonical alias remains approved; counselor-specific expansion U | D/S under educator scope | — | D only through recommendation context | — unless explicit workflow | D only under educator verification scope | D only through recommendation context | Scoped student/cohort relationship | P/eligible network content only | Participant-only under institution and age policy | Read eligible; recommend only | Member-authorized institution read |
| High School Coach | U; no coach relationship kind | U | U | — | — | — | — | U roster/athlete relationship | P only | U | Read public opportunities only | Member-authorized school/team read if separately verified |
| College Coach/Recruiter | D only for explicitly shared `view_verified_record` if university-partner scope is approved | D only within shared verified record | U: recruiting-specific rule required | — | — unless item explicitly shared in verified record | D only within shared verified record | — | U recruiting relationship | P only | U pending recruiting contact policy | Read eligible; no unsupported create/review permission | C/member-authorized university scope |
| College Admissions | D only for explicitly shared `view_verified_record` | D only within shared verified record | — | D only within shared verified record | — unless explicitly shared | D only within shared verified record | — | U admissions relationship | P only | U pending admissions contact policy | Read eligible; recommend only | C/member-authorized university scope |
| Employer relationship | D only for explicitly shared `view_verified_record` | — unless included in shared verified record | — | D only within shared candidate record | — unless explicitly shared | D only within shared verified record | — | Candidate/application scope only | P only | Participant-only in authorized candidate workflow | C for organization opportunities; D `review_candidates` | C/member-authorized employer scope |
| District Administrator | S cohort/equity only | S cohort/equity only | — | S only if separately approved aggregate | — | S only if approved aggregate | — | Organization/cohort scope | — except moderation/public policy | — unless explicit operational workflow | S aggregate only if approved | C/member-authorized district scope |
| Brand Partner | — | — | — | — | — | — | — | U; no brand relationship permission | P only | U | C only after partner permission model is approved; current permission U | C/member access after verification; detailed permission U |
| Community Partner | — | — | — | — | — | — | — | — | P only | — | Public opportunities only | Public organization data only |
| Platform Administrator | Audited operational access only | Audited operational access only | Audited operational access only | Audited operational access only | Audited operational access only | Audited operational access only | Audited operational access only | Audited operational access only | Moderation/operations only | Safety/operations only | Operations only | Operations only |
| Unauthenticated public | P | P eligible presentation only | P eligible presentation only | P eligible presentation only | P only through explicit share contract | P eligible achievements only | — | — | P | — | Public listings | Public organization profile |

## Matrix enforcement rule

Every non-`—` cell must map during `PBOS-RLS-001` to:

- concrete tables and storage objects;
- select/insert/update/delete operations;
- ownership and relationship predicates;
- age, consent, visibility, and lifecycle dependencies;
- application/server call paths;
- positive and negative tests; and
- audit expectations where access is privileged or delegated.

# 4. Ownership Rules

## Owner

The owner is the authenticated actor or canonical subject to whom a record belongs. A Scholar owns their Scholar Record and associated Scholar-owned domain records. An organization owns its organization profile and organization-created opportunities; a message participant does not own the other participant's account or records.

Ownership does not imply unrestricted mutation. Verified evidence, moderation state, immutable audit events, consent records, and finalized outcomes may require append-only, correction, review, or revocation workflows.

## Viewer

A viewer may select only the fields and rows allowed by public visibility or a valid delegation. View access does not imply download, resharing, messaging, search discoverability, or access to the underlying source document.

## Editor

An editor may change only fields allowed by ownership or an explicit existing workflow permission. Current support-role permissions do not establish broad edit rights to Scholar Records. `verify_evidence`, `recommend_actions`, `support_tasks`, `create_opportunities`, and `review_candidates` authorize bounded actions, not arbitrary row updates.

## Administrator

An administrator is an operational role, not a universal data owner. Administrative access must be server-mediated, purpose-bound, auditable, limited to approved support/moderation operations, and unavailable through self-assigned profile fields. RLS bypass must not be the routine implementation of an administrator dashboard.

## Delegated Access

Delegated access exists only when all of the following are true:

1. the delegating subject or authorized institution is valid;
2. the relationship or membership is verified, active, scoped, and not expired/revoked;
3. an existing permission supports the requested action;
4. the specific record and fields are within scope;
5. visibility, age, consent, and safety policy allow access;
6. the operation is enforced in RLS or an audited server boundary; and
7. the access can be revoked without changing record ownership.

# 5. Age-Based Security Rules

Exact numeric thresholds and jurisdiction logic remain unresolved in the onboarding authority. RLS policies must consume an approved age-policy state rather than embed guessed age bands.

| Category | Required security posture |
| --- | --- |
| Youth | Private by default; community discovery and posting denied or tightly restricted; messaging limited to approved safety-reviewed relationship channels; guardian/consent state enforced where policy requires |
| Teen | Private by default; discoverability opt-in only when eligible; messaging and community actions limited by consent, relationship, safety, and jurisdiction policy |
| Adult | Role, relationship, visibility, and preference controls apply; learner records remain private unless explicitly shared |
| Unknown/unverified | Apply the most restrictive youth-safe policy and deny permission-increasing actions |

Age-policy changes must be server-controlled, auditable, and re-evaluate active grants. Client edits to birth or age evidence may never directly widen permissions. Exact birth information must not be exposed to services that need only a derived policy state.

# 6. Consent Boundaries

Consent is scoped authorization evidence, not a global boolean. Each record must identify:

- actor granting or recording consent;
- subject whose data or action is governed;
- consent type and purpose;
- covered data domains or capabilities;
- policy/document version;
- jurisdiction or institutional context where applicable;
- granted, declined, pending, expired, or revoked state;
- effective and expiry timestamps; and
- revocation and dispute evidence.

Consent cannot grant a permission absent from the role/relationship architecture, bypass age or safety rules, convert a pending relationship into an approved one, or override a more restrictive record visibility state. Revocation must stop future access promptly while preserving required audit history. Whether historic exports, notifications, or derived records require deletion or restriction is unresolved and requires retention policy.

# 7. Scholar-Athlete Recruiting Visibility Model

Recruiting visibility is item- and purpose-specific; it is not equivalent to making the full Scholar Record public.

## Visibility layers

| Layer | Intended audience | Allowed content direction |
| --- | --- | --- |
| Private athlete record | Scholar-Athlete and audited operations | Full governed athletics/recruiting data subject to domain rules |
| Connections | Accepted, eligible support relationships | Items explicitly shared for support; no automatic recruiter access |
| Verified recruiting audience | Verified university-partner member with approved recruiting scope | Explicitly shared verified record and recruiting items only |
| Public recruiting profile | Unauthenticated or general audience | Scholar-selected eligible presentation fields only; never protected academic documents, exact age evidence, private contact, or consent records |

A college coach/recruiter currently relies on partial university-partner architecture; there is no dedicated coach relationship permission. Therefore recruiting queries beyond explicitly shared `view_verified_record` scope remain denied until governance defines the recruiting relationship, contact policy, field allowlist, age/consent rule, and audit requirements.

Playbook must record who viewed or acted on restricted recruiting data when required by policy, support revocation, and prevent public visibility from becoming an unverified NCAA eligibility or compliance claim.

# 8. Mentor, Coach, and Organization Access Model

## Mentor

Mentor access requires a verified active `mentor` relationship to a specific Scholar. Existing permissions support `view_progress`, `recommend_actions`, and `support_tasks`. They do not support full documents, unrestricted messages, full academic history, athletics records, or arbitrary edits.

## Educator and counselor

Educator access requires verified educational context and a scoped Scholar or cohort relationship. Existing permissions support progress, evidence verification, recommendations, and cohort views. Counselor currently aliases to Educator; any counselor-specific expansion is unresolved.

## High School Coach

The canonical role exists, but no coach-specific relationship kind or permission map is verified. Coach access to Scholar or athletics data is therefore unresolved and denied by default. It must not silently inherit Mentor or Educator access merely because current routing shares an operating system.

## College Coach and admissions

These roles may use the university-partner baseline only after verified institution membership and purpose scope. `view_verified_record` and `recommend_actions` do not authorize unrestricted discovery, private contact, documents, or full Scholar Records. Recruiting- and admissions-specific contact rules remain unresolved.

## District, employer, brand, and other organizations

- District administrators receive `view_cohort` and `view_equity_metrics`, favoring aggregate data and preventing automatic individual-record access.
- Employer partners receive `view_verified_record`, `create_opportunities`, and `review_candidates` only within verified organization and candidate/application scope.
- Brand Partner has no verified permission mapping; deny protected data and partner actions until approved.
- Community Partner has no default relationship permissions and remains public/pending only.

Organization membership must include organization, user, role/function, status, scope, verifier, timestamps, and revocation. Membership alone does not authorize every record associated with the organization.

# 9. Public vs Network vs Connection vs Private Visibility

| Visibility | Eligibility | Authorization rule | Prohibited assumptions |
| --- | --- | --- | --- |
| Public | Explicitly publishable item and affirmative owner choice | Public policy selects allowlisted fields/items in eligible lifecycle state | Public profile does not make underlying Scholar Record, documents, contact data, age evidence, or relationships public |
| Network | Approved policy-defined network audience | Authenticated user plus network membership, age/consent eligibility, and item visibility | Same platform or organization is not automatically the same network |
| Connections | Accepted, active, non-blocked relationship with compatible permission | Relationship edge, permission, age/consent, item visibility, and safety state all pass | Connection does not grant full-record or message access |
| Private | Owner and explicitly authorized audited operations/delegations | Ownership or narrow policy-specific delegation | Private data is not available merely because an actor is staff, partner, guardian, or administrator |

The effective visibility is always the most restrictive result across item visibility, domain policy, age, consent, relationship, organization, moderation, and lifecycle state. Blocks and safety restrictions may further reduce access.

# 10. Service-Role and Backend Boundary Rules

The Supabase service role and equivalent privileged credentials bypass RLS and therefore belong only in audited server-controlled boundaries.

1. Never expose service-role credentials to browsers, mobile clients, public bundles, logs, URLs, or user-controlled configuration.
2. Use ordinary user-context/RLS queries whenever the operation can be performed safely without bypass.
3. Permit privileged access only for a named server use case with authenticated caller, authorization decision, purpose, input validation, bounded query, and audit event.
4. Do not accept arbitrary table names, predicates, user IDs, role values, organization IDs, or permission grants from clients.
5. Separate user authentication from privileged operational authorization.
6. Keep role approval, organization verification, consent adjudication, canonical record creation, moderation, and explicit grant changes in server boundaries.
7. Return the minimum response fields required by the workflow.
8. Require idempotency and replay protection for privileged writes where duplicate execution creates risk.
9. Treat scheduled jobs, webhooks, background processors, and AI/analytics services as service actors with explicit purpose and data scope.
10. Review and inventory every service-role call path during `PBOS-RLS-001`; undocumented bypass is release-blocking.

A backend route is not inherently trusted merely because it runs on the server. It must authenticate, authorize, validate, constrain, audit, and handle failure safely.

# 11. Audit Requirements

## Minimum audit event

Privileged, delegated, permission-changing, consent-sensitive, or moderation-related activity must record, as applicable:

- event ID and timestamp;
- authenticated actor and service actor;
- subject user/Scholar;
- organization and relationship context;
- action and target domain/record;
- authorization basis: ownership, permission, visibility, consent, age-policy state, or administrator purpose;
- policy/version or code-path identifier;
- outcome and denial reason category;
- correlation/request ID;
- changed fields or before/after state for privileged mutations, with sensitive values minimized;
- expiration, revocation, or review reference; and
- environment/source.

Audit records must be append-oriented, access-controlled, tamper-resistant in operational practice, and retained according to an approved policy. Logs must not duplicate secrets, exact youth data, documents, message contents, or other sensitive values when identifiers and classified metadata are sufficient.

## Events requiring explicit evidence

- role request, approval, rejection, and revocation;
- organization membership verification and removal;
- relationship invitation, acceptance, scope change, expiry, and revocation;
- consent grant, decline, expiry, version change, and revocation;
- permission-increasing age-policy transition;
- restricted Scholar Record or recruiting access where required;
- evidence verification and recommendation action;
- candidate review and organization opportunity mutation;
- administrator or service-role access to protected data;
- moderation, safety, export, correction, and deletion operations; and
- policy denial testing during release validation.

# 12. Definition of Done

This architecture document is complete when:

- ✅ the security philosophy and deny-by-default authorization inputs are defined;
- ✅ the existing role/relationship permission baseline is recorded without inventing new permission verbs;
- ✅ the role × data-domain matrix covers all required domains and identifies unsupported access;
- ✅ owner, viewer, editor, administrator, and delegated-access rules are defined;
- ✅ age, consent, recruiting, mentor/coach/organization, and visibility boundaries are documented;
- ✅ service-role/backend and audit requirements are explicit; and
- ✅ unresolved governance questions are named rather than converted into permissions.

`PBOS-RLS-001` is complete only after this architecture is mapped to actual tables, storage objects, routes, and operations; SQL policies are implemented in reviewed migrations; service-role paths are inventoried; and positive and negative tests provide evidence for critical owner, relationship, institution, public, administrator, age, consent, and revocation scenarios.

## Required PBOS-RLS-001 Validation Matrix

For every sensitive table, view, function, and storage bucket, validation evidence must include:

| Test dimension | Required evidence |
| --- | --- |
| Owner | Allowed owner operations and denied cross-owner operations |
| Delegated relationship | Allowed scoped operation, denied unrelated Scholar, and denial after revocation/expiry |
| Organization | Allowed member scope, denied other organization, denied unverified membership |
| Public | Allowlisted published read and denial for private/nonpublishable fields |
| Age/consent | Allowed eligible state and denial for unknown, pending, expired, or revoked state |
| Mutation | Allowed bounded action and denial of self-assigned role, ownership, verification, or elevated permission |
| Administrator/service | Named backend purpose, caller authorization, bounded access, and audit event |
| Lifecycle | Correct behavior for pending, active, archived, moderated, expired, and deleted/revoked records |

## Unresolved Governance Questions

1. Is High School Counselor a separate role, an Educator specialization, or a relationship subtype?
2. What relationship kind and exact permissions govern High School Coaches?
3. What recruiting-specific relationship, permissions, contact rules, and field allowlist govern College Coaches/Recruiters?
4. What admissions-specific discovery and contact boundaries apply to College Admissions?
5. What protected actions and data, if any, are available to Brand Partners?
6. What dedicated authorization behavior applies to Transition-Aged Youth beyond the Scholar baseline?
7. What numeric age thresholds and jurisdiction rules generate youth, teen, adult, and unknown policy states?
8. Which actions require guardian consent, Scholar assent, institutional authorization, or combinations of them?
9. Which documents and verified-record fields may be delegated to each support and institution role?
10. When may district cohort access expose individual rows versus aggregates with suppression controls?
11. What audit retention, user-access, correction, export, legal-hold, and deletion requirements apply?
12. Which current service-role call paths exist, and which can be replaced with user-context RLS queries?
13. What schema is authoritative for consent, role approval, organization membership, visibility, and age-policy state?
14. How should access to data already exported or incorporated into derived outputs respond to revocation?

Until resolved through Product, Security, Data, Trust & Safety, Legal/Compliance, and architecture governance, every unresolved path is denied by default.
