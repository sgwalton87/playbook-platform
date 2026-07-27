# PBOS-RLS-004 Security Certification Report

**Version:** 1.0.0
**Status:** Certification Blocked
**Owner:** Playbook OS Engineering and Security
**Last Updated:** July 27, 2026
**Gate:** `PBOS-RLS-004`

## Purpose

Assess the checked-in Playbook authorization and RLS implementation against the approved architecture through static audit, adversarial contract tests, repository validation, and exposure review. This report does not treat structural source checks as deployed database evidence.

## Authority

- [Playbook RLS Authorization Architecture](../SECURITY/PLAYBOOK_RLS_AUTHORIZATION_ARCHITECTURE.md)
- [PBOS Authorization Domain Model](../SECURITY/PBOS_AUTHORIZATION_DOMAIN_MODEL.md)
- [PBOS-RLS-003 Implementation Record](./PBOS_RLS_IMPLEMENTATION_RECORD.md)
- [PBOS-RLS Validation Matrix](./PBOS_RLS_VALIDATION_MATRIX.md)

# Security Posture

## **BLOCKED**

The checked-in foundation demonstrates meaningful deny-by-default controls, but it cannot be certified as production-secure because:

1. the migration has not been applied in an approved Supabase environment;
2. no authenticated database-level owner/non-owner/delegated/expired/revoked/organization/admin/service tests have run;
3. 11 runtime-referenced relations lack checked-in local `CREATE TABLE` authority;
4. 12 RLS-enabled tables intentionally have no policy and several are accessed through service-role routes;
5. all 22 service-role routes are documented but remain unremediated and lack a common privileged audit boundary;
6. age thresholds, guardian/Scholar consent combinations, youth messaging, and visibility rules remain unresolved;
7. public profile, feed visibility, connection, document, and community policy coverage is incomplete; and
8. deployed policy overlap, schema drift, grants, function ownership, views, triggers, and storage policies remain unknown.

A blocked certification is a security result, not a test failure. Security architecture prohibits converting unknowns into permission.

# Evidence

## Repository inventory

| Evidence | Result |
| --- | --- |
| Checked-in migration files | 19 |
| Tables created by checked-in migrations | 55 |
| Created tables missing an RLS-enable statement | 0 |
| Distinct tables with RLS enabled or enabled by alteration | 57 |
| Checked-in `CREATE POLICY` statements | 66 |
| Tables with at least one checked-in policy | 45 |
| RLS-enabled tables with no checked-in policy | 12 |
| Current service-role route occurrences | 22 |
| Service-role occurrences documented in the current-state audit | 22 |
| Authorization foundation tables | 11; all RLS-enabled |
| Existing canonical permissions seeded | 10 |
| Unsupported role permission grants found | 0 |

Static inventory establishes source coverage only. It cannot establish which migrations or out-of-band policies are deployed.

# Task 1 — Security Audit

## Protected tables and RLS

All 55 tables created by checked-in migrations have an RLS-enable statement somewhere in migration history. This structural requirement passes.

The following RLS-enabled tables have no checked-in policy and therefore deny ordinary PostgREST access unless a deployed out-of-band policy exists:

- `authorization_audit_events` and `authorization_verifications` — intentionally closed to authenticated users;
- `brand_partners`;
- `guided_tour_progress`;
- `moderation_actions`;
- `nil_store_campaigns`;
- `notifications`;
- `playbook_events`;
- `shared_actions`;
- `store_products`;
- `store_redemptions`; and
- `support_messages`.

A no-policy RLS table is fail-closed for ordinary roles, but it is not certified when application workflows reach it through service-role bypass.

## Policy purpose documentation

The PBOS-RLS-003 implementation record documents every newly added policy. Legacy policy names and the current-state audit provide partial purpose evidence for older policies. A single canonical table-operation-purpose-test catalog for all 66 policies does not yet exist. Result: **PARTIAL / certification blocker**.

## Ownership

Checked-in policies enforce direct owner predicates for profiles, Scholar Graph records, academic progress, albums, social interactions, trust controls, and the newly protected athletics reads. PBOS-RLS-004 structural tests confirm all created tables enable RLS and profile role/verification updates are server-controlled.

Behavioral owner and cross-owner denial have not been executed against PostgreSQL. Result: **STRUCTURAL PASS; BEHAVIORAL EVIDENCE MISSING**.

## Delegated access

The authorization helper requires a registered permission, active and verified relationship, effective date, non-expiration, non-revocation, and current granted consent when required. Organization decisions require active membership, verified organization, effective date, non-expiration, and non-revocation.

No protected Scholar table currently consumes this helper through a deployed, tested RLS projection. Result: **FOUNDATION PRESENT; END-TO-END BLOCKED**.

## Safe denial

Authorization infrastructure tables without mutation policies fail closed for authenticated clients. Unresolved roles receive no permission template. The foundation does not add public Scholar access or permissive fallbacks.

Actual API error shape, information leakage, timing, unchanged-row behavior, and audit-on-denial require integration tests. Result: **STRUCTURAL PASS; RUNTIME BLOCKED**.

# Task 2 — Role Security Testing

## Static role matrix

| Role | Existing allowed foundation | Unauthorized actions expected to deny | Certification result |
| --- | --- | --- | --- |
| Scholar | Own-record permissions and owner predicates | Other-user data; employer/admin permissions; protected role update | Structural PASS; DB test missing |
| Scholar-Athlete | Scholar owner baseline; own athletics read | Cross-athlete reads; unapproved recruiting delegation | Structural PASS; DB test missing |
| Parent/Guardian | `view_progress`, `view_deadlines`, `support_tasks` through qualifying relationship | Documents, full record, unrelated Scholar, expired/revoked/consent-invalid relationship | Structural PASS; delegated DB test missing |
| Educator | `view_progress`, `verify_evidence`, `recommend_actions`, `view_cohort` through qualifying scope | Unrelated Scholar, unrestricted document/edit/admin access | Structural PASS; DB test missing |
| Mentor | `view_progress`, `recommend_actions`, `support_tasks` through qualifying relationship | Full academics/documents, unrelated Scholar, expired/revoked access | Structural PASS; DB test missing |
| Coach | No permission template | All protected Scholar access | Static DENY confirmed; runtime test missing |
| College Partner | No College Coach/Admissions permission template in foundation | All protected Scholar access until approved mapping | Static DENY confirmed; runtime test missing |
| District Partner | `view_cohort`, `view_equity_metrics` in verified active organization membership | Individual private records and cross-organization data | Structural PASS; aggregate/DB test missing |
| Employer Partner | `view_verified_record`, `create_opportunities`, `review_candidates` in verified scope | Non-candidate private records and cross-organization actions | Structural PASS; DB test missing |
| Community Partner | No permission template | All protected data and privileged actions | Static DENY confirmed; runtime test missing |
| Administrator | No public/canonical grant in foundation | All direct protected access absent a future audited server purpose | Static DENY confirmed; admin workflow unresolved |

No role receives production certification because allowed-action success and unauthorized-action denial were not exercised against a migrated database.

# Task 3 — Data Exposure Review

## Unauthorized Scholar Record exposure

- Owner policies exist for the core Playbook Record graph.
- No delegated raw Scholar Record policy was added; this avoids exposing unfiltered metadata and source records.
- Public profile delivery still queries `profiles`, but the new profile policy is owner-only and no safe public projection exists. This is availability-incomplete but security-conservative.
- Deployed overlapping profile policies remain unknown.

**Finding:** No new checked-in private Scholar exposure found; production certification blocked by deployed-policy uncertainty and missing field-level projection tests.

## Cross-user leakage

- Owner predicates and RLS structural coverage are present.
- Legacy authenticated-wide feed comment/reaction reads use `USING (true)` and do not visibly incorporate post visibility, age, block/mute, or moderation state at the policy level.
- Public albums/photos and searchable directory policies require column and parent-visibility validation.

**Finding:** Cross-user owner controls are structurally present, but community and projection leakage risks remain open.

## Organization overreach

The new organization helper verifies membership status, organization status, effective/expiration dates, revocation, and registered permissions. No table-specific opportunity/candidate RLS policy consumes the helper yet.

**Finding:** No foundation-level wildcard organization access; end-to-end organization isolation unproven.

## Consent gaps

Consent is enforced in qualifying authorization relationships when `consent_required = true`. The schema still permits a server-created relationship with `consent_required = false`; policy determining when consent must be required is unresolved.

**Finding:** Mechanism exists; legal/product consent obligation and table policy integration remain blockers.

## Public/private and document exposure

- No new public profile or document policy was created.
- Public, network, connection, and private field projections are not implemented consistently.
- `portfolio_shares`, album photos, feed content, evidence URLs/storage paths, transcript data, and public profile responses require field and token tests.

**Finding:** No certification for public/private separation or protected documents.

# Task 4 — Age and Consent Review

| Requirement | Evidence | Result |
| --- | --- | --- |
| Youth protections | Architecture requires restrictive unknown-age defaults | No age-policy schema/predicate; BLOCKED |
| Consent requirements | Versioned consent and relationship enforcement exist | Mandatory-consent decision rules unresolved; CONDITIONAL |
| Relationship restrictions | Active, verified, effective, unexpired, unrevoked checks exist | Structural PASS; DB behavior missing |
| Messaging boundaries | Support relationship routes and message table exist | Age/consent/contact policy and ordinary-user RLS missing; BLOCKED |
| Visibility restrictions | Architecture vocabulary exists | Feed/profile/document projections incomplete; BLOCKED |

No legal conclusion is made. Numeric thresholds, jurisdiction, guardian authority, Scholar assent, retention, and post-revocation handling remain **UNRESOLVED — DENY BY DEFAULT**.

# Task 5 — Feed and Community Safety Review

| Control | Current evidence | Future readiness |
| --- | --- | --- |
| Safe publishing | Feed posts/comments/reactions exist | Post-level age, visibility, moderation, and ownership predicates incomplete |
| Visibility enforcement | Legacy authenticated-wide comment/reaction reads | Not ready; parent post visibility and block/mute enforcement require policies/tests |
| Moderation | Reports and moderation actions tables/routes exist | Admin authorization and audit workflow unproven; moderation table has no ordinary policy |
| Reporting | Owner report insert/read policies exist | Abuse resistance, target validation, rate limits, evidence retention, and escalation tests missing |
| Profanity detection | No certified control found | Planned only; requires false-positive, context, human-review, and audit design |
| Harassment monitoring | No certified automated control found | Planned only; must not convert inference into fact |
| Abuse prevention | Blocks/mutes and some API checks exist | Cross-policy enforcement, rate limiting, evasion, and youth scenarios missing |
| Auditability | Authorization audit table exists but no write workflow | Not ready until bounded append service and retention/monitoring exist |

**Community safety posture:** **BLOCKED for certification**. Existing foundations support future work but do not prove safe publishing or youth community readiness.

# Task 6 — Service-Role Certification

Static reconciliation found exactly 22 service-role route files and all 22 are documented in `PBOS_RLS_CURRENT_STATE_AUDIT.md`. No undocumented checked-in occurrence was found.

Certification still fails because:

- the routes remain unchanged from the audit;
- caller authentication and authorization are inconsistent;
- service-role possession can bypass RLS;
- no common bounded privileged-operation service is implemented;
- required audit events are not emitted through the new audit store; and
- route-specific necessity, selected columns, idempotency, replay protection, denial behavior, and data minimization have not been behaviorally tested.

**Service-role posture:** inventory **PASS**; operational certification **BLOCKED**.

# Tests

## Added adversarial structural tests

`tests/unit/security/pbos-rls-004-certification.test.ts` verifies:

- every table created by checked-in migrations has RLS enabled;
- unresolved roles receive no permission grants;
- relationship, consent, and organization decisions check verification, expiration, and revocation;
- authorization audit and verification tables remain closed to authenticated users;
- all 22 service-role route occurrences are documented; and
- effective profile role/verification columns remain server-controlled.

## Validation command results

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run lint` | PASS | ESLint completed with no reported violations |
| `npm run build` | PASS | Next.js production build and TypeScript validation completed; 122 static pages generated |
| `npm test` | PASS | 94 test files and 325 tests passed |
| Targeted PBOS-RLS-004 tests | PASS | 1 file and 6 tests passed |
| `git diff --check` | PASS | No whitespace errors reported |
| `git status --short` | PASS | Only the certification report and certification test changed before commit |
| Deployed database tests | NOT RUN | No Supabase CLI, `psql`, or approved database target available |

# Policies

- 66 checked-in policy statements were statically inventoried.
- New PBOS-RLS-003 policies have purpose/action/role/ownership/test documentation in the implementation record.
- Legacy policies have partial intent evidence from names and the current-state audit.
- Broad authenticated/public reads require explicit exposure review.
- RLS-enabled no-policy tables are fail-closed for ordinary clients but not certified while privileged routes access them.

**Policy certification:** **BLOCKED** pending a complete deployed policy catalog and database behavior suite.

# Tables

- All 55 locally created tables have checked-in RLS enablement.
- 11 runtime-referenced relations still lack local create authority according to the PBOS-RLS-001 audit.
- 12 RLS-enabled tables have no checked-in policy.
- Views, materialized views, RPCs, functions, grants, triggers, storage buckets/objects, and deployed-only relations are not fully inventoried from a live catalog.

**Table certification:** structural RLS coverage **PASS**; deployed authorization **BLOCKED**.

# Known Risks

1. Deployment drift or overlapping permissive policies.
2. No database execution evidence for the new migration.
3. No table policy integration for delegated authorization helpers.
4. Service-role bypass remains in 22 routes.
5. No safe public profile/document projection.
6. Legacy broad feed/comment/reaction and public media reads.
7. Missing age-policy enforcement and messaging restrictions.
8. Missing audit writer, retention, monitoring, and administrator model.
9. Unresolved Coach, College Partner, Community, and other specialized grants.
10. No authenticated negative tests for row, field, organization, token, storage, or API leakage.

# Remaining Decisions

- Age bands, jurisdictions, guardian authority, Scholar assent, and mandatory consent rules.
- Public/network/connection/private field allowlists.
- Coach, college partner, counselor, brand, and community permissions.
- Administrator provisioning, purpose approval, break-glass, and review.
- Audit and consent retention, export, deletion, legal hold, and subject access.
- Service-role necessity and replacement strategy per route.
- Safe public profile, verified-record, document, candidate, and aggregate projections.
- Deployed catalog reconciliation and migration rollout/rollback plan.

# Recommended Next Gate

**Remain on `PBOS-RLS-004` for remediation and database-backed certification.** Do not mark RLS complete or advance to a feature/UI gate.

Required next actions:

1. provision a disposable Supabase validation environment;
2. apply all migrations and reconcile the live catalog;
3. run the full owner/non-owner/delegated/expired/revoked/consent/organization/admin/service matrix;
4. remediate broad legacy policies and create safe projections;
5. implement and audit bounded privileged workflows;
6. resolve age/consent and community safety governance; and
7. rerun certification with archived database evidence.
