# PBOS-RLS-001 Validation Matrix

**Version:** 1.0.0
**Status:** Implementation-Ready Test Plan
**Owner:** Playbook OS Engineering and Security
**Last Updated:** July 27, 2026

## Purpose

Define positive and negative authorization scenarios required to validate Playbook RLS, application authorization, and audited backend boundaries. This matrix defines expected security outcomes; it does not claim the current database passes them.

## Authority

- [Playbook RLS Authorization Architecture](../SECURITY/PLAYBOOK_RLS_AUTHORIZATION_ARCHITECTURE.md)
- [PBOS-RLS-001 Current State Audit](./PBOS_RLS_CURRENT_STATE_AUDIT.md)
- [PPS-012 Security and Permissions](../PPS/00_CONSTITUTION/PPS-012_SECURITY_AND_PERMISSIONS.md)
- [PPS-011 Data Governance](../PPS/00_CONSTITUTION/PPS-011_DATA_GOVERNANCE.md)
- [PBOS-RLS-001 Gate](../../pbos/gates/PBOS-RLS-001.json)

## Result Vocabulary

- **PASS:** the authorized operation must succeed and return only allowed rows/fields.
- **DENY:** the operation must return no protected data and make no unauthorized change; the interface may use an authorization-safe error.
- **UNRESOLVED:** governance or schema does not yet define a safe grant. Implementation must deny by default until resolved.

“Expected result” is normative. “Current evidence” reports repository evidence available during planning.

## Core Validation Matrix

| ID | Scenario | Preconditions | Operation | Expected result | Current evidence |
| --- | --- | --- | --- | --- | --- |
| OWN-001 | Scholar reads own Scholar Record | Authenticated Scholar; matching owner FK | Select own canonical record | PASS | Owner policy exists for `playbook_records`; runtime test missing |
| OWN-002 | Scholar creates own achievement | Authenticated Scholar; own record | Insert achievement with own owner ID | PASS | `FOR ALL` owner policy exists; invariant test missing |
| OWN-003 | Scholar updates verified evidence fields directly | Evidence already verified/final | Change verifier-controlled fields | DENY | Operation-specific restriction not proven |
| OWN-004 | User reads own profile private fields | Authenticated matching profile ID | Select private profile | PASS | Local profile policy authority missing |
| OWN-005 | User changes approved role to elevated role | Authenticated ordinary user | Update effective role/approval fields | DENY | Local profile policy authority missing; critical gap |
| NON-001 | Scholar reads another Scholar's private record | Different authenticated user | Select target record | DENY | Owner policy suggests denial; runtime test missing |
| NON-002 | User updates another user's album | Different authenticated user | Update album/photo | DENY | Owner policies exist; API service bypass requires test |
| NON-003 | User supplies another Scholar ID to elevated API | Authenticated/non-authenticated caller as applicable | Query or mutate via service-role route | DENY | Multiple routes accept identifiers; authorization inconsistent |
| DEL-001 | Verified Parent reads connected Scholar progress summary | Active parent relationship; required consent | Select allowed progress/deadline projection | PASS | Relationship permissions documented; table/projection policy missing |
| DEL-002 | Parent reads Scholar documents | Active parent relationship only | Select private document/evidence source | UNRESOLVED | No existing document permission; deny by default |
| DEL-003 | Verified Mentor recommends an action | Active mentor relationship | Create bounded recommendation/action | PASS | Permission exists; RLS/action test missing |
| DEL-004 | Mentor updates Scholar academic record | Active mentor relationship | Update academic row | DENY | No update permission exists |
| DEL-005 | Educator verifies evidence in assigned scope | Verified educator and scoped Scholar/cohort | Execute verification workflow | PASS | `verify_evidence` exists; predicate/workflow test missing |
| DEL-006 | Educator views unrelated Scholar | No roster/cohort relationship | Select progress/record | DENY | Scoped relationship architecture; policy evidence missing |
| EXP-001 | Expired relationship reads progress | Relationship expiry before request | Select delegated projection | DENY | Expiry model/predicate unresolved |
| EXP-002 | Revoked relationship sends message | Revoked edge | Insert message | DENY | Message policies absent; elevated route review required |
| CON-001 | Valid scoped consent allows otherwise supported action | Valid role/relationship and current consent | Execute permission-supported action | PASS | Canonical consent schema missing |
| CON-002 | Revoked consent permits future delegated read | Consent revoked before request | Select protected data | DENY | Canonical consent schema missing |
| CON-003 | Consent attempts to create unsupported coach permission | Consent exists but role permission absent | Select athletics/Scholar data | DENY | Deny-by-default architecture established |
| PUB-001 | Anonymous user reads allowlisted public profile projection | Owner affirmatively published eligible fields | Select public projection | PASS | Public profile runtime exists; field/policy evidence incomplete |
| PUB-002 | Anonymous user reads private Scholar Record through public profile | Public username exists | Select source/private fields | DENY | Field-level projection/RLS test missing |
| PUB-003 | Authenticated user reads public event | Event active and public | Select public event allowlist | PASS | Public event policy exists; field test missing |
| PUB-004 | Anonymous user reads album photos from private album | Album private | Select photos by album ID | DENY | Photo read policy may require parent-album correlation review |
| VIS-001 | Network-only post read by eligible network member | Defined network, age/consent eligible | Select post | PASS | Network model/policy unresolved |
| VIS-002 | Nonmember reads network-only post | No eligible network relationship | Select post | DENY | Feed-post local policy authority missing |
| VIS-003 | Connection reads connection-visible achievement | Active, non-blocked eligible edge | Select shared achievement projection | PASS | Connection and projection policy unresolved |
| VIS-004 | Blocked connection reads or messages blocker | Active block | Select connection content / insert message | DENY | Block tables exist; cross-policy enforcement unproven |
| ORG-001 | Verified employer creates opportunity for own organization | Active verified membership; `create_opportunities` | Insert organization opportunity | PASS | Permission exists; organization schema/policy incomplete |
| ORG-002 | Employer reviews opted-in candidate | Verified membership; candidate/application scope; `review_candidates` | Select shared candidate projection | PASS | Permission exists; candidate projection test missing |
| ORG-003 | Employer reads non-applicant private record | No candidate sharing | Select Scholar Record | DENY | Must be tested |
| ORG-004 | District admin reads approved aggregate cohort metrics | Verified district scope; `view_cohort`/`view_equity_metrics` | Select aggregate projection | PASS | Permissions exist; aggregate view/policy unresolved |
| ORG-005 | District admin enumerates individual restricted rows without approved purpose | Only aggregate scope | Select individual records | DENY | Aggregate suppression policy unresolved |
| ORG-006 | User from organization A reads organization B private data | Membership only in A | Select B records | DENY | Organization membership schema/policies unresolved |
| ORG-007 | Brand Partner writes campaign | Brand role selected, no approved permission schema | Insert campaign | UNRESOLVED | Service route exists; permission mapping missing; deny by default |
| YTH-001 | Unknown-age user enables public discoverability | Age policy unresolved | Update discoverability to public | DENY | Age-policy schema missing |
| YTH-002 | Youth user starts unapproved direct message | Youth state; no approved relationship channel | Insert message | DENY | Age/message policy missing |
| YTH-003 | Eligible teen messages approved connection | Approved age/consent state and relationship | Insert participant message | PASS | Exact thresholds/consent policy unresolved; cannot implement yet |
| YTH-004 | Client changes birth data to widen permissions | Authenticated youth user | Update age evidence/category | DENY | Server-controlled policy required; schema missing |
| REC-001 | Verified college recruiter reads explicitly shared verified recruiting record | Verified university membership, recruiting scope, age/consent, share active | Select allowlisted recruiting projection | PASS | Dedicated recruiting relationship/policy unresolved |
| REC-002 | Recruiter reads private transcript/document | Recruiting share does not include source | Select protected source | DENY | Must be tested |
| REC-003 | Recruiter contacts youth outside approved channel | No contact authorization | Insert message/retrieve private contact | DENY | Contact governance unresolved |
| ADM-001 | Provisioned administrator performs approved moderation read | Strong auth, approved admin role, purpose | Read moderation projection | PASS | Admin route exists; role verification/audit evidence incomplete |
| ADM-002 | Ordinary user calls moderation mutation | No admin role | Update moderation action/report | DENY | Requires route/RLS negative test |
| ADM-003 | Administrator reads unrelated private data without operational purpose | Admin identity only | Select raw protected record | DENY | Purpose-bound enforcement unresolved |
| SRV-001 | Browser receives or uses service-role credential | Any client context | Inspect bundle/network or call with key | DENY | Key references are server routes; bundle/secret scan still required |
| SRV-002 | Authenticated route uses service role after explicit caller authorization | Named bounded workflow | Minimal read/write and audit | PASS | 22 routes need individual evidence |
| SRV-003 | Unauthenticated caller supplies target user ID to service route | No approved public/webhook auth | Elevated read/write | DENY | Inconsistent route auth; critical test |
| SRV-004 | Signed webhook ingests authorized support message | Valid signature, mapped relationship, replay-safe event | Bounded insert | PASS | Hostinger route exists; audit/replay evidence incomplete |
| SRV-005 | Invalid/replayed webhook writes message | Invalid or reused signature/event | Insert | DENY | Replay evidence incomplete |
| SRV-006 | Reward event is processed twice | Same idempotency key/event | Insert ledger entries twice | DENY | Idempotency/atomicity requires validation |
| SRV-007 | Store redemption exceeds balance under concurrency | Two concurrent requests | Debit/redeem | DENY | Transactional invariant not proven |
| AI-001 | Intelligence engine reads data available to caller | Caller authorized; minimal inputs | Generate derived recommendation | PASS | Caller-permission inheritance test missing |
| AI-002 | Intelligence engine includes restricted other-user data | Caller lacks source permission | Generate response | DENY | Required constitutional negative test |
| AUD-001 | Delegated protected read creates required audit event | Policy marks read auditable | Read then inspect audit metadata | PASS | Canonical audit storage missing |
| AUD-002 | Service-role mutation lacks actor/purpose/correlation ID | Privileged workflow | Commit mutation | DENY | Common audit layer missing |
| REV-001 | Access after share/consent/relationship revocation | Previously allowed, now revoked | Repeat read using prior identifier/token | DENY | Revocation propagation tests missing |
| LIFE-001 | Archived/deleted record remains writable by owner | Record archived/deleted | Update content | DENY | Lifecycle-specific policies unresolved |

## Table-Level Execution Template

Every sensitive relation must instantiate this template for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` as applicable:

| Dimension | Positive case | Negative case | Required evidence |
| --- | --- | --- | --- |
| Owner | Matching authenticated owner | Different authenticated owner | SQL/API result plus unchanged-row assertion |
| Relationship | Active, scoped, permission-bearing edge | Missing, unrelated, expired, or revoked edge | Result plus relationship predicate evidence |
| Organization | Verified in-scope membership | Other/unverified/revoked membership | Result plus organization predicate evidence |
| Public | Explicit eligible published row/field | Private, draft, moderated, or restricted row/field | Anonymous and authenticated result comparison |
| Age/consent | Eligible current policy state | Unknown/pending/expired/revoked state | Result plus policy-state fixture |
| Administrator/service | Named purpose with authorized actor and audit | Ordinary caller, excessive scope, or missing audit | Response, row diff, and audit event |
| Lifecycle | Active eligible record | Archived, revoked, expired, moderated, or deleted record | Result and lifecycle transition evidence |

## Exit Criteria

The validation gate cannot pass until:

1. every sensitive deployed table, view, function, RPC, and storage bucket is included;
2. every allowed path has a least-privileged positive test;
3. every path has cross-owner and privilege-escalation negative tests;
4. relationship expiry and consent/share revocation tests pass;
5. organization isolation and youth-safe defaults pass;
6. every service-role occurrence has caller authorization, bounded access, and required audit evidence; and
7. test output is archived with the reviewed migrations and release evidence.
