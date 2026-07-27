# PBOS-RLS-003 Implementation Record

**Version:** 1.0.0
**Status:** Foundational Authorization Infrastructure Implemented; Deployment Validation Required
**Owner:** Playbook OS Engineering and Security
**Last Updated:** July 27, 2026

## Purpose

Record the controlled database implementation of the Playbook authorization foundation. This sprint establishes reusable authorization records, fail-closed database helpers, baseline owner policies, and structural security tests. It does not claim comprehensive table coverage or production deployment validation.

## Authority

- [Playbook RLS Authorization Architecture](../SECURITY/PLAYBOOK_RLS_AUTHORIZATION_ARCHITECTURE.md)
- [PBOS Authorization Domain Model](../SECURITY/PBOS_AUTHORIZATION_DOMAIN_MODEL.md)
- [PBOS-RLS-001 Current State Audit](./PBOS_RLS_CURRENT_STATE_AUDIT.md)
- [PBOS-RLS-001 Validation Matrix](./PBOS_RLS_VALIDATION_MATRIX.md)
- [PPS-011 Data Governance](../PPS/00_CONSTITUTION/PPS-011_DATA_GOVERNANCE.md)
- [PPS-012 Security and Permissions](../PPS/00_CONSTITUTION/PPS-012_SECURITY_AND_PERMISSIONS.md)

The command-supplied `docs/CONSTITUTION/` paths do not exist; canonical constitutional sources were applied from `docs/PPS/00_CONSTITUTION/`.

# Implemented

- Canonical role registry table seeded with the 13 executable Playbook role keys.
- Canonical permission registry seeded with exactly the ten existing permission identifiers.
- Role-permission templates copied only from approved existing mappings. No permissions are granted to unresolved Coach, College Coach, College Admissions, Brand Partner, or Community Partner roles.
- Role assignment lifecycle with requested/pending/active/rejected/suspended/revoked/expired states and self-approval protection.
- Organization and organization-membership verification, expiry, and revocation foundation.
- Versioned, purpose-bound consent records with status, effective/expiration dates, and revocation evidence.
- General authorization verification records separate from Scholar evidence verification.
- Scholar relationship records for Guardian, Mentor, Educator, Coach, Institution, and Employer. Relationship type/role combinations are constrained, but a relationship grants only registered permissions already assigned to that role.
- Delegation records limited to one user or organization delegate, one registered permission, resource scope, purpose, consent reference, and lifecycle state.
- Append-oriented authorization audit-event storage with no authenticated read/write policy.
- Database helper functions for active roles, registered permission decisions, and bounded Scholar visibility.
- Owner-only profile policies, protected server-governed profile role/verification columns, and read-only owner policies for athletics, eligibility, recruiting targets, NIL deals, and athlete financial entries.

# Tables Changed

## New tables

| Table | Canonical owner/steward | Security purpose |
| --- | --- | --- |
| `authorization_roles` | Platform Security | Canonical executable role definitions |
| `authorization_permissions` | Platform Security | Existing permission registry and action/risk metadata |
| `authorization_role_permissions` | Platform Security | Approved role-permission templates |
| `authorization_role_assignments` | Platform Security; assignment subject | Approved role lifecycle and context |
| `authorization_organizations` | Verified organization; platform steward | Organization identity and verification state |
| `authorization_organization_memberships` | Organization/platform steward; member subject | Scoped membership, role, verification, expiry, revocation |
| `authorization_consents` | Consent subject; platform steward | Versioned purpose/scope and lifecycle evidence |
| `authorization_verifications` | Platform Security/verifying authority | Role, relationship, organization, guardian, contact, and service verification |
| `authorization_relationships` | Scholar subject; platform steward | Verified, scoped, expiring/revocable relationship context |
| `authorization_delegations` | Delegator; platform steward | Registered permission delegation over bounded resources |
| `authorization_audit_events` | Platform Security | Append-oriented security event evidence |

## Existing tables receiving policies

- `profiles`: authenticated owner select, insert, and update only. Column-level update privileges are revoked for effective `role` and `verification_status`. No public profile policy was introduced because field-level public projection requires separate design.
- `athlete_profiles`, `athlete_eligibility_checks`, `recruiting_targets`, `nil_deals`, and `athlete_financial_entries`: authenticated Scholar owner read policies using `scholar_id = auth.uid()`. Create/update/delete remain denied until operation-specific lifecycle rules are approved.

No existing column or production row is altered by the migration definition.

# Functions Added

| Function | Inputs | Output | Security/failure behavior |
| --- | --- | --- | --- |
| `authorization_has_active_role` | role ID; optional context UUID | Boolean | `true` only for caller-owned active, effective, unexpired, unrevoked assignment; missing/ambiguous state returns `false` |
| `authorization_has_permission` | existing permission ID; optional Scholar ID; optional organization ID | Boolean | Requires authenticated caller, registered permission, and owner, verified active relationship with required current consent, or verified active organization membership; any missing, expired, revoked, or unverified factor returns `false` |
| `authorization_can_view_scholar` | Scholar user ID | Boolean | Owner or existing `view_progress`/`view_verified_record` decision only; no public or frontend fallback |

All functions are `SECURITY DEFINER` with an empty fixed `search_path`, fully qualified objects, revoked `PUBLIC` execution, and execution granted only to `authenticated` and `service_role`. These helpers return decisions; they do not mutate permissions or protected resources.

# Policies Added

| Table | Policy purpose | Action | Allowed role/audience | Ownership/authorization rule | Validation test |
| --- | --- | --- | --- | --- | --- |
| `authorization_roles` | Read canonical registry | SELECT | Authenticated | Explicit registry read only | Structural registry policy check; deployed read test pending |
| `authorization_permissions` | Read permission definitions | SELECT | Authenticated | Definitions only, no grants | Exact ten-permission seed test |
| `authorization_role_permissions` | Read grant templates | SELECT | Authenticated | Templates only, no assignment mutation | Unresolved-role no-grant test |
| `authorization_role_assignments` | Read own assignments | SELECT | Authenticated subject | `user_id = auth.uid()` | Owner/non-owner deployed test pending |
| `authorization_organization_memberships` | Read own memberships | SELECT | Authenticated member | `user_id = auth.uid()` | Owner/non-owner deployed test pending |
| `authorization_organizations` | Read organization through active membership | SELECT | Active member | Membership user, status, expiry, revocation predicate | Organization isolation deployed test pending |
| `authorization_consents` | Consent parties read evidence | SELECT | Subject/requester/granting actor | Caller matches one consent party | Consent party/non-party deployed test pending |
| `authorization_relationships` | Relationship parties read edge | SELECT | Scholar or actor | Caller is `scholar_id` or `actor_user_id` | Party/non-party deployed test pending |
| `authorization_delegations` | Delegation parties read edge | SELECT | Delegator or user delegate | Caller matches delegator/delegate | Party/non-party deployed test pending |
| `profiles` | Owner read/create/update | SELECT/INSERT/UPDATE | Authenticated owner | `id = auth.uid()` | Owner/non-owner deployed test pending |
| Athletics tables listed above | Scholar reads own rows | SELECT | Authenticated Scholar owner | `scholar_id = auth.uid()` | Structural policy check; owner/non-owner deployed test pending |

No authenticated policies are added for verification records or audit events. No authenticated insert/update/delete policy is added for role, permission, assignment, organization, consent, relationship, delegation, or audit infrastructure. Those operations remain denied pending narrow audited server workflows.

# Relationship and Consent Enforcement

`authorization_has_permission` requires all of the following for relationship-derived access:

1. the requested permission exists;
2. the relationship role has the permission in the canonical template;
3. the caller is the relationship actor and the requested subject is the Scholar;
4. relationship status is active and verification is verified;
5. effective time has begun;
6. expiration has not passed;
7. revocation is absent; and
8. when consent is required, consent is granted, effective, unexpired, and unrevoked.

Coach and Institution relationships can be recorded after server-side verification, but they have no role-permission template in this migration and therefore cannot grant Scholar data access. Employer access is limited to the three previously documented Employer Partner permissions and still requires a verified active organization membership for organization decisions.

# Service-Role Review

The prior audit identified 22 routes using `SUPABASE_SERVICE_ROLE_KEY`. This sprint adds no service-role use and changes no route. Each existing occurrence remains subject to the current audit requirement:

- authenticate the initiating caller or signed workload;
- evaluate a registered permission and bounded resource scope;
- minimize selected/returned fields;
- enforce idempotency for replay-sensitive writes;
- record required audit evidence; and
- replace service-role bypass with user-context RLS where practical.

The service role is granted execution of authorization decision helpers for bounded backend checks, but service-role possession is not itself an authorization decision. Route-by-route remediation remains open.

# Tests Added

`tests/unit/security/pbos-rls-003.test.ts` validates the migration contract:

- RLS is enabled on all 11 authorization tables;
- relationship status, verification, effective time, expiration, and revocation checks are present;
- required consent grant, effective time, expiration, and revocation checks are present;
- exactly the ten existing permission identifiers are seeded;
- unresolved Coach, College Coach, College Admissions, Brand Partner, and Community Partner permissions are not granted; and
- authorization audit events have RLS enabled with no authenticated policy.

These are structural repository tests. They do not replace migration execution and authenticated database tests from the PBOS validation matrix.

# Known Limitations

- No approved Supabase instance was available to apply the migration or inspect deployed catalog drift.
- The migration assumes `auth.users`, `public.profiles`, `public.support_invitations`, and the existing athletics tables match checked-in migration history.
- Public profile delivery is intentionally not implemented; a safe field-level projection is still required.
- Academic and Scholar Graph owner policies already existed and were not rewritten wholesale.
- Career, document, goal, connection, opportunity, and community policy phases remain incomplete.
- Relationship/consent records cannot be created by ordinary authenticated clients; audited server workflows are not yet implemented.
- No age-policy table or predicate is added because thresholds and jurisdiction rules remain unresolved.
- Audit retention, administrator provisioning/break-glass, export/share grants, and generalized service-workload identities remain unresolved.
- Existing service-role routes have not yet been remediated.

# Remaining Risks

1. Deployed out-of-band policies may overlap with new owner policies; catalog reconciliation is required before production rollout.
2. `SECURITY DEFINER` ownership and execute grants must be verified after deployment.
3. Existing JSON permission arrays and transitional profile roles are not migrated and must never override the new registry.
4. No database-level behavioral test has yet proven owner, non-owner, delegated, expired, revoked, organization, administrator, or service-role scenarios.
5. Public profile behavior may remain unavailable under strict owner-only profile RLS until a safe projection is approved.
6. Relationship type support does not equal permission approval; future maintainers must not add grants without governance.

# Required Follow-Up

1. Apply the migration in a disposable Supabase environment.
2. Inspect tables, constraints, function ownership/search paths, grants, RLS enablement, and policy overlap.
3. Run the complete behavioral scenarios in `docs/security/PBOS_RLS_VALIDATION_MATRIX.md`.
4. Implement audited server workflows for role approval, verification, relationships, consent, delegations, and audit writes.
5. Remediate the 22 service-role routes in risk order.
6. Add subsequent table-policy phases only with explicit ownership and denial tests.

# Validation Results

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run lint` | PASS | ESLint completed with no reported violations |
| `npm run build` | PASS | Next.js production build and TypeScript validation completed; 122 static pages generated |
| `npm test` | PASS | 93 test files and 319 tests passed |
| `npx vitest run tests/unit/security/pbos-rls-003.test.ts` | PASS | 1 test file and 7 authorization migration contract tests passed |
| `git diff --check` | PASS | No whitespace errors reported |
| Migration execution | NOT RUN | Neither Supabase CLI nor `psql` is installed and no approved database target was supplied |

The successful repository checks do not convert structural migration tests into deployed RLS behavior evidence. Migration application and database-level owner/denial/delegation tests remain release-blocking.
