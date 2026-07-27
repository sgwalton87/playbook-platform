# PBOS Authorization Domain Model

**Version:** 1.0.0
**Status:** Canonical Authorization Infrastructure Design
**Owner:** Playbook OS Engineering and Security, with Product, Data, Trust & Safety, and Legal/Compliance review
**Last Updated:** July 27, 2026
**Gate:** `PBOS-RLS-002`

## Purpose

Define reusable, deny-by-default authorization primitives for identities, roles, permissions, relationships, organizations, consent, verification, delegation, and audit. This design prepares a future schema and service implementation without creating migrations, RLS policies, production tables, or application behavior.

## Scope

This specification defines domain contracts, reuse decisions, missing canonical records, permission-registry design, relationship authorization, consent, audit events, and readiness for `PBOS-RLS-003`. It does not grant a permission, approve an unresolved role, or replace table-specific RLS validation.

## Constitutional Authority

The command referenced `docs/CONSTITUTION/`; the canonical files are under `docs/PPS/00_CONSTITUTION/`:

1. [PPS-012 Security and Permissions](../PPS/00_CONSTITUTION/PPS-012_SECURITY_AND_PERMISSIONS.md)
2. [PPS-011 Data Governance](../PPS/00_CONSTITUTION/PPS-011_DATA_GOVERNANCE.md)
3. [Playbook RLS Authorization Architecture](./PLAYBOOK_RLS_AUTHORIZATION_ARCHITECTURE.md)
4. [PBOS-RLS-001 Current State Audit](../security/PBOS_RLS_CURRENT_STATE_AUDIT.md)
5. [PBOS-RLS-001 Validation Matrix](../security/PBOS_RLS_VALIDATION_MATRIX.md)

PPS-012 requires explicit View, Create, Update, Delete, Approve, Administer, and Delegate capabilities. This model also reserves Export and Share as high-risk authorization actions required by the sprint. Action support does not create a grant. Unsupported actions remain **UNRESOLVED — DENY BY DEFAULT**.

## Core Decision Formula

```text
decision = authenticated actor
  + approved role assignment
  + registered permission
  + owned resource OR valid scoped delegation
  + verified relationship/organization context when required
  + current consent when required
  + age-policy allowance
  + resource visibility and lifecycle allowance
  + no stronger safety restriction
```

Every factor is evaluated server-side or in RLS using canonical identifiers. Missing, expired, revoked, disputed, unverified, or ambiguous inputs deny access.

# 1. Authorization Domain Design

## 1.1 Users

**Definition:** A user is the platform actor bound to one Supabase Auth identity. Authentication proves control of an identity; it does not prove a requested role, organization membership, professional status, relationship, age category, or permission.

**Existing records that can be reused:**

- Supabase Auth user identity and verified contact claims as the authentication source.
- `profiles` as the current user/profile projection, subject to deployed-schema reconciliation.

**Missing canonical infrastructure:**

- No separate authorization principal record is required if Auth UUID remains canonical, but role approval, account security state, age-policy state, and authorization version must not remain client-controlled profile attributes.
- A canonical account-state contract is missing for pending, active, restricted, suspended, and deactivated states.

## 1.2 Roles

**Definition:** A role describes an approved platform responsibility. Requested, effective, relationship, organization, and administrative roles are distinct.

**Existing records that can be reused:**

- The executable Playbook role registry and alias resolver.
- Transitional `profiles.role` and `profiles.requested_role` fields where deployed.
- Existing relationship kinds in `lib/permissions/rolePermissions.ts`.

**Missing table required in a future migration:** `authorization_role_assignments` (working name; final name requires schema review).

Required contract:

- assignment ID;
- user ID;
- canonical role identifier;
- assignment context: platform, relationship, or organization;
- context resource ID where applicable;
- requested, pending, active, rejected, suspended, revoked, or expired status;
- source and approving actor;
- effective and expiration timestamps;
- revocation actor, time, and reason; and
- created/updated timestamps.

No user may approve or activate their own elevated role assignment.

## 1.3 Permissions

**Definition:** A permission is a stable, reviewable identifier for one bounded action over one data domain. It is not a UI flag and does not encode a user ID, organization ID, or relationship instance.

**Existing infrastructure that can be reused:** the ten current permission identifiers and seven relationship-kind mappings.

**Missing table required in a future migration:** a canonical permission registry only if code-only registry cannot meet versioning, audit, and administrative review requirements. Role/relationship grants require a normalized, governed representation; JSON permission arrays in `support_relationships` and `support_invitations` cannot be the sole authority.

Permission evaluation must distinguish:

- registry definition;
- approved grant template for a role or relationship kind;
- concrete assignment/delegation context; and
- runtime authorization decision.

## 1.4 Relationships

**Definition:** A relationship is a verified, revocable, scoped connection between a Scholar and a support or institutional actor. It supplies context for existing permissions but never creates new permission identifiers.

**Existing tables that can be reused:**

- `support_relationships` for the current Scholar/supporter edge;
- `support_invitations` for invitation initiation and acceptance;
- `shared_actions` and `support_messages` as relationship-dependent workflow records.

**Existing limitations:** `support_relationships` has Scholar, supporter, relationship text, JSON permissions, source invitation, status, and creation time, but lacks canonical verification, expiration, revocation, consent linkage, organization provenance, and authorization-version fields.

**Missing/required change for a future migration:** either evolve `support_relationships` through additive migrations or introduce a canonical relationship record and migrate the current table. The decision depends on deployed data and is unresolved.

## 1.5 Organizations

**Definition:** An organization is a governed institutional principal. Membership in an organization is separate from a platform role and does not grant access to every record associated with that organization.

**Existing tables that may be reused:**

- `brand_partners` for brand-specific data;
- organization-like Playbook Record types;
- organization identifiers embedded in opportunity and role data, subject to catalog audit.

**Missing tables required in future migrations:**

- canonical `organizations`;
- canonical `organization_memberships`; and
- optionally `organization_verification_events` if verification is not represented by the general verification model.

Membership requires user, organization, function/role, status, scope, verifier, effective/expiration/revocation data, and audit linkage.

## 1.6 Consent Records

**Definition:** Consent is versioned evidence that a subject or authorized party agreed to a defined purpose and scope. Consent narrows or activates an already policy-supported path; it never creates an unsupported permission.

**Existing records that can be reused only as migration inputs:** onboarding safety/agreement profile fields and invitation/relationship evidence. They are not a complete canonical consent store.

**Missing table required in a future migration:** `authorization_consents` (working name).

The consent contract is defined in Section 4.

## 1.7 Verification States

**Definition:** Verification records who or what established a claim, role, organization membership, relationship, evidence item, or contact as trustworthy enough for its bounded purpose.

**Existing table that can be reused:** `verifications` for achievement/evidence verification only.

**Missing table required in a future migration:** a general authorization verification record or context-specific verification records for role, relationship, organization, guardian, institutional contact, and service actors. Evidence verification must not be overloaded to represent identity or professional approval.

Canonical states should support pending, verified, rejected, expired, and revoked because those states already exist in architecture; final enum/state transitions require governance review.

## 1.8 Delegation Records

**Definition:** A delegation is a revocable authorization context from an owner or authorized institutional source to a specific actor, relationship, or organization for registered permissions and resource scope.

**Existing records that can be reused:** `support_relationships`, `portfolio_shares`, and application/recommender records provide domain-specific delegation evidence.

**Missing table required in a future migration:** a canonical delegation record if domain-specific records cannot uniformly express delegator, delegate, registered permission IDs, resource scope, purpose, consent, verification, effective/expiry/revocation state, and provenance.

A delegation cannot transfer canonical ownership, delegate `ADMINISTER` by default, or include an unregistered permission.

## 1.9 Audit Events

**Definition:** An audit event is append-oriented evidence of a security-relevant fact. It is not an editable activity feed or analytics event.

**Existing records that may be reused only where guarantees are proven:**

- `playbook_events` for general domain events;
- `moderation_actions` for moderation actions;
- existing lifecycle timestamps on invitations and relationships.

**Missing table required in a future migration:** `authorization_audit_events` or a hardened extension of `playbook_events`. Reuse is allowed only if append-only behavior, restricted access, actor/service attribution, purpose, authorization basis, retention, integrity, and sensitive-value minimization can be guaranteed.

# 2. Canonical Permission Registry Design

## 2.1 Action vocabulary

These are action types, not grants:

| Action | Meaning | Registry support | Default without registered domain permission |
| --- | --- | --- | --- |
| `VIEW` | Read an allowed row/field/projection | Existing permissions cover bounded views | DENY |
| `CREATE` | Create a bounded resource or workflow record | Existing `create_opportunities`; other creation remains owner/policy-specific | DENY |
| `UPDATE` | Change allowed mutable fields or bounded workflow state | No general existing identifier | UNRESOLVED — DENY BY DEFAULT |
| `DELETE` | Delete or request deletion under lifecycle policy | No existing identifier | UNRESOLVED — DENY BY DEFAULT |
| `APPROVE` | Verify, approve, resolve, or review within a bounded workflow | Existing `verify_evidence` and `review_candidates` provide limited semantics | DENY outside those workflows |
| `ADMINISTER` | Perform purpose-bound platform or organization administration | No existing identifier | UNRESOLVED — DENY BY DEFAULT |
| `DELEGATE` | Grant/revoke registered permissions within owned authority | No existing identifier | UNRESOLVED — DENY BY DEFAULT |
| `EXPORT` | Produce a portable copy of allowed data | No existing identifier | UNRESOLVED — DENY BY DEFAULT |
| `SHARE` | Create/revoke a scoped view or share contract | No existing identifier | UNRESOLVED — DENY BY DEFAULT |

The future registry identifier format should be `<domain>.<action>.<scope>` only after governance approves a domain action. Existing identifiers remain canonical until an explicit compatibility/migration decision; aliases must not create parallel grants.

## 2.2 Existing permission registry

| Permission identifier | Primary action | Description | Data domain | Applicable relationship roles | Risk |
| --- | --- | --- | --- | --- | --- |
| `view_progress` | VIEW | Read a bounded Scholar progress projection | Scholar progress | Scholar, Parent/Guardian, Educator, Mentor | High |
| `view_verified_record` | VIEW | Read an explicitly eligible verified-record projection | Scholar Record | Scholar, University Partner, Employer Partner | Critical |
| `view_deadlines` | VIEW | Read bounded Scholar deadline data | Scholar journey/deadlines | Scholar, Parent/Guardian | Moderate |
| `support_tasks` | CREATE/UPDATE bounded workflow | Participate in support-task workflows; exact operations require table mapping | Support actions | Scholar, Parent/Guardian, Mentor | High |
| `verify_evidence` | APPROVE bounded workflow | Verify eligible evidence within scoped educational context | Evidence/achievements | Educator | Critical |
| `recommend_actions` | CREATE bounded workflow | Create a recommendation without editing canonical Scholar facts | Recommendations/support | Educator, Mentor, University Partner | High |
| `view_cohort` | VIEW aggregate/scoped | Read approved cohort projection | Institutional cohort | Educator, District Administrator | Critical |
| `view_equity_metrics` | VIEW aggregate | Read approved aggregate equity metrics | Institutional analytics | District Administrator | Critical |
| `create_opportunities` | CREATE | Create organization-scoped opportunities | Opportunities | Employer Partner | High |
| `review_candidates` | VIEW/APPROVE bounded workflow | Review explicitly shared candidates in organization scope | Applications/candidates | Employer Partner | Critical |

“Applicable” reproduces the current mapping; it does not prove current RLS or expand access. No existing permission authorizes general delete, administration, delegation, export, share, unrestricted update, private documents, private messages, or arbitrary Scholar Record mutation.

## 2.3 Registry record contract

Each future registry entry requires:

- immutable permission identifier;
- action;
- one canonical data domain;
- description and explicit exclusions;
- allowed resource and field scope;
- applicable role/relationship templates;
- risk: Low, Moderate, High, or Critical;
- whether consent, age, verification, organization, or audit is mandatory;
- version, owner, approval decision, effective/deprecation dates; and
- compatibility aliases, if any.

Duplicate identifiers or semantically overlapping grants are rejected during review.

# 3. Relationship Authorization Model

## 3.1 Canonical relationship contract

Every relationship must contain:

- relationship ID;
- Scholar subject ID;
- actor user ID and optional organization membership ID;
- registered relationship type;
- pending, active, declined, expired, revoked, removed, or blocked state;
- verification state and verifier reference;
- source invitation or provisioning reference;
- created and effective dates;
- optional expiration;
- revocation actor, date, and reason;
- required consent record references;
- registered permission template/version, never arbitrary client JSON;
- resource/field scope where narrower than the template; and
- audit correlation.

## 3.2 Relationship matrix

| Relationship | Existing reusable model | Existing permission basis | Consent | Verification | Expiration/revocation | Authorization status |
| --- | --- | --- | --- | --- | --- | --- |
| Scholar ↔ Parent/Guardian | `support_invitations`, `support_relationships` | `view_progress`, `view_deadlines`, `support_tasks` | Guardian authority and age-policy combination unresolved | Invite/dependent verification partial | Missing complete model | Foundation reusable; incomplete |
| Scholar ↔ Mentor | `support_invitations`, `support_relationships` | `view_progress`, `recommend_actions`, `support_tasks` | Youth contact/support consent unresolved | Mentor eligibility/background verification missing | Missing complete model | Foundation reusable; incomplete |
| Scholar ↔ Educator | Support relationship plus future institution scope | `view_progress`, `verify_evidence`, `recommend_actions`, `view_cohort` | Educational purpose/age rules unresolved | Institution/contact verification partial | Missing complete model | Incomplete |
| Scholar ↔ Coach | Coach role exists; no canonical relationship kind | None | Youth/athletics/recruiting consent unresolved | School/team verification partial | Missing | UNRESOLVED — DENY BY DEFAULT |
| Scholar ↔ Institution | Organization/membership model missing | District: `view_cohort`, `view_equity_metrics`; University: `view_verified_record`, `recommend_actions` | Sharing/purpose consent unresolved | Institution and membership verification partial/missing | Missing | UNRESOLVED beyond existing bounded verbs |
| Scholar ↔ Employer | Application/candidate plus organization model incomplete | `view_verified_record`, `create_opportunities`, `review_candidates` | Candidate sharing and age/work policy unresolved | Employer/membership verification missing | Missing | UNRESOLVED beyond existing bounded verbs |

A relationship grants nothing until active, verified where required, supported by current permission mapping, consent/age eligible, unexpired, unrevoked, and within resource scope.

# 4. Consent Model

## 4.1 Consent record

A canonical consent must contain:

- consent ID;
- subject user/Scholar;
- requesting party user, relationship, organization, or service;
- actor who grants/records consent and their authority basis;
- registered scope: data domains, resource IDs/field projection, and capabilities;
- purpose identifier and human-readable notice;
- policy/agreement version;
- pending, granted, declined, expired, revoked, or disputed status;
- created and effective dates;
- expiration date or explicit non-expiring policy basis;
- revocation actor, date, reason, and successor record if replaced;
- jurisdiction/institution context where required;
- source channel and evidence reference; and
- audit correlation ID.

## 4.2 Consent invariants

1. Consent cannot register or grant a permission.
2. Consent cannot widen the actor's role, relationship, organization, or resource scope.
3. Consent cannot bypass age, safety, verification, lifecycle, block/mute, or public-data rules.
4. Consent purpose and scope are immutable after grant; changes create a new version.
5. Revocation denies future consent-dependent access and triggers delegation re-evaluation.
6. Expired, declined, disputed, or missing consent denies dependent access.
7. Guardian consent, Scholar assent, institutional authorization, and adult self-consent remain distinct evidence.
8. Client-supplied booleans are not sufficient canonical consent evidence.

Exact age/guardian combinations, retention, historic export handling, and post-revocation derived data require human governance decisions.

# 5. Audit Event Model

## 5.1 Required event types

| Event | Trigger | Minimum risk | Required outcome evidence |
| --- | --- | --- | --- |
| Authentication | Sign-in, sign-out, session rejection, identity verification | High | Actor/identity, method category, outcome, reason category, request context |
| Authorization failure | Denied protected operation | High/Critical | Actor, action, resource classification, denial reason, policy version |
| Permission change | Registry, template, role assignment, or delegation change | Critical | Before/after identifiers, approver, purpose, effective time |
| Consent created | New consent request/grant/decline | Critical | Subject, actor authority, requester, scope, purpose, version, state |
| Consent revoked | Revocation/expiry/dispute | Critical | Prior consent, actor, reason, affected delegation references |
| Sensitive data access | Policy-designated restricted read/export | Critical | Actor/service, subject, projection/domain, authorization basis, purpose |
| Administrative action | Moderation/support/configuration/security operation | Critical | Provisioned admin, purpose, target, bounded result, approval if required |
| Export | Portable copy generation/download | Critical | Subject/requester, included domains, purpose, format, expiry/delivery reference |
| Deletion | Delete request, soft delete, purge, denial | Critical | Requester authority, target classification, lifecycle action, retention exception |
| Correction | Protected/canonical record correction | High/Critical | Actor, target, changed-field names, provenance, review/verification impact |

## 5.2 Canonical event structure

- immutable event ID;
- occurred-at and recorded-at timestamps;
- event type and schema version;
- authenticated actor ID, effective role assignment, and actor type;
- service actor/workload identity where applicable;
- subject user/Scholar and organization/relationship context;
- action and target domain/type/ID;
- authorization decision and basis: ownership, registered permission, delegation, consent, visibility, age-policy category, administrator purpose;
- policy/registry versions;
- outcome and safe reason category;
- purpose and correlation/request/idempotency IDs;
- source environment, route/function/job, and network/device metadata where approved;
- changed-field names or minimized before/after references for mutations;
- parent event, approval, revocation, or incident references; and
- integrity metadata defined by the future storage design.

Audit payloads must not copy secrets, access tokens, full documents, message bodies, exact youth attributes, or sensitive values when classified identifiers and field names suffice.

## 5.3 Actor identity

Events distinguish:

- authenticated human actor;
- subject on whose data/action the event operates;
- administrator actor and approved purpose;
- service/workload actor;
- delegating or consenting actor; and
- impersonation/support-session context, if governance ever approves such a capability.

“System” without a named workload identity, code path, and initiating context is insufficient for privileged events.

## 5.4 Retention requirements

PPS-011 requires lifecycle and retention to be defined before production use. Numeric periods are unresolved and require Legal/Compliance, Security, and Data approval. The future policy must define per-event retention, archival, legal hold, access, export, correction annotation, deletion exceptions, integrity checks, monitoring, and purge verification.

Until approved, audit data must not be silently deleted, made broadly queryable, or used as a secondary analytics store. Audit-event access itself is a Critical audited permission.

# 6. Existing Reuse, Missing Infrastructure, and Decisions

## 6.1 Reuse summary

| Domain | Reuse candidate | Decision constraint |
| --- | --- | --- |
| Users | Supabase Auth + `profiles` projection | Authorization state must not be user-controlled profile data |
| Roles | Executable role registry; transitional role fields | Needs approved assignment lifecycle and context |
| Permissions | Ten existing identifiers and relationship mapping | Must be normalized/versioned without duplicate grants |
| Relationships | `support_invitations`, `support_relationships` | Requires verification, expiry, revocation, consent, scope, provenance |
| Organizations | `brand_partners`, organization-like records | No canonical organization/membership authority yet |
| Consent | Onboarding agreement fields as migration evidence | Not sufficient canonical store |
| Verification | Evidence `verifications` | Cannot represent identity/role/org/relationship verification |
| Delegation | Relationships, portfolio shares, applications | Cross-domain canonical delegation decision unresolved |
| Audit | `playbook_events`, `moderation_actions` | Reuse only if append-only security guarantees and restricted access are proven |

## 6.2 Missing future tables or canonical records

The following require creation or an approved equivalent in future reviewed migrations:

- role assignments;
- organizations and memberships;
- authorization consent records;
- role/relationship/organization verification records;
- normalized permission templates/grants if code-only governance is insufficient;
- canonical delegations if domain-specific records cannot meet the contract;
- authorization audit events or a hardened event store; and
- age-policy/account-security state if not safely represented elsewhere.

No table name in this list is approved for migration merely by appearing in this document.

## 6.3 Unresolved governance decisions

1. Stable canonical names and ownership for missing records.
2. Counselor role versus Educator specialization.
3. Coach relationship kind and supported permission identifiers.
4. Recruiting and admissions contact, view, and organization scope.
5. Brand Partner protected-data and opportunity authority.
6. Transition-Aged Youth authorization specialization.
7. Age thresholds, jurisdictions, guardian consent, and Scholar assent combinations.
8. Role and organization verification authorities and evidence.
9. Permission-registry storage: code, database, or governed hybrid.
10. Whether delegation is one cross-domain record or domain-specific contracts.
11. Whether `playbook_events` can satisfy security audit guarantees.
12. Audit and consent retention, deletion, export, legal hold, and subject-access rules.
13. Administrative provisioning, purpose approval, break-glass policy, and review.
14. Compatibility and backfill for JSON permission arrays and transitional role fields.

Every unresolved grant remains deny-by-default.

# 7. PBOS-RLS-003 Implementation Readiness Review

## Ready

- Constitutional action vocabulary and deny-by-default invariants.
- Inventory of existing permissions, relationship kinds, tables, and service-role gaps.
- Domain contracts for role assignment, relationship, organization membership, consent, verification, delegation, and audit.
- Existing permission registry mapping without new grants.
- Required relationship/consent/audit fields and lifecycle states.
- Validation scenarios from `PBOS-RLS-001`.

## Blocked

- Deployed Supabase catalog, Auth, grant, function, view, trigger, and storage-policy reconciliation.
- Human decisions listed above.
- Approval of table names, ownership keys, enums/states, and retention.
- Backfill/migration design for existing JSON permissions, invitations, relationships, roles, and event data.

## Missing

- Reviewed entity-relationship diagram and exact foreign-key/cardinality decisions.
- Threat model for role approval, invitation acceptance, delegation, consent, admin, export, and audit access.
- Policy decision records for permission registry and administrator/break-glass access.
- Safe development fixtures for youth, consent, organization, relationship expiry/revocation, and admin/service scenarios.
- Migration rollback/backfill and compatibility plan.

## Requires human decision

Product, Security, Data, Trust & Safety, Legal/Compliance, and architecture owners must resolve role/relationship grants, age and consent rules, organization verification, admin purpose, export/share authority, audit retention, and the canonical table/reuse choices.

## Readiness decision

**PBOS-RLS-003 is conditionally ready for schema proposal and threat modeling only. It is not ready to create or deploy authorization tables, grants, migrations, or RLS policies.** The next sprint must begin with human governance decisions and deployed-catalog reconciliation, then produce a reviewable schema/ADR and migration test plan before implementation.

# 8. Definition of Done

This design sprint is complete when:

- authorization primitives and reuse/missing decisions are documented;
- the action vocabulary supports VIEW, CREATE, UPDATE, DELETE, APPROVE, ADMINISTER, DELEGATE, EXPORT, and SHARE without treating unsupported actions as grants;
- all ten existing permission identifiers have domain, applicable roles, and risk classifications;
- required Scholar relationship types are mapped without inventing Coach/Institution/Employer grants;
- consent and audit structures and invariants are defined;
- unresolved governance decisions remain explicit and deny-by-default; and
- `PBOS-RLS-003` readiness is reported honestly.
