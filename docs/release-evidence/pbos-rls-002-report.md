# PBOS-RLS-002 Authorization Infrastructure Design Report

**Version:** 1.0.0
**Status:** Design Complete; Human Governance Required Before Schema Implementation
**Owner:** Playbook OS Engineering and Security
**Last Updated:** July 27, 2026
**Sprint:** `PBOS-RLS-002`

## Purpose

Record the authorization infrastructure design produced from the canonical Playbook security architecture without creating migrations, RLS policies, production tables, application code, or behavior changes.

## Completed Work

- Created [PBOS Authorization Domain Model](../SECURITY/PBOS_AUTHORIZATION_DOMAIN_MODEL.md).
- Defined reusable authorization primitives for users, role assignments, permission definitions/grants, relationships, organizations/memberships, consent, verification, delegation, and audit.
- Identified existing reusable records and the missing canonical records that require future schema decisions.
- Defined the complete action vocabulary: VIEW, CREATE, UPDATE, DELETE, APPROVE, ADMINISTER, DELEGATE, EXPORT, and SHARE.
- Mapped all ten existing permission identifiers to description, action semantics, data domain, current applicable relationship roles, and risk without adding a grant.
- Defined a registry record contract that rejects duplicate and overlapping permissions.
- Defined Scholar relationships with Parent/Guardian, Mentor, Educator, Coach, Institution, and Employer, including status, verification, dates, expiration, revocation, and consent requirements.
- Defined versioned, purpose-bound consent records and invariants that prevent consent from creating permissions.
- Defined audit events for authentication, authorization failure, permission change, consent creation/revocation, sensitive access, administrative action, export, deletion, and correction.
- Defined audit structure, actor/service identity, payload minimization, and retention governance.
- Completed a PBOS-RLS-003 readiness review.

## Files Changed

- `docs/SECURITY/PBOS_AUTHORIZATION_DOMAIN_MODEL.md` — new canonical authorization infrastructure design.
- `docs/release-evidence/pbos-rls-002-report.md` — this release evidence report.

No application, component, library, PBOS runtime, migration, or SQL policy file changed.

## Validation Performed

| Validation | Result | Evidence |
| --- | --- | --- |
| `git diff --check` | PASS | No whitespace errors reported |
| Markdown structure/reference validation | PASS | Required headings present; all local links resolve |
| `npm test` | PASS | 92 test files and 312 tests passed |
| `git status --short` | PASS | Only the two documentation files changed before commit |
| Permission registry check | PASS | Exactly ten existing permission identifiers; all nine required action types represented |
| Prohibited-path check | PASS | No application or migration changes |

## Remaining Risks

1. The deployed Supabase catalog remains unavailable for reconciliation.
2. Working table names are not approved migration names.
3. The repository lacks canonical role-assignment, organization-membership, consent, generalized verification, delegation, and authorization-audit records.
4. Current JSON permission arrays and transitional profile role fields require a compatibility/backfill decision.
5. Coach, recruiting, admissions, brand, counselor, and Transition-Aged Youth authorization remains unresolved.
6. Numeric age thresholds and guardian/Scholar consent combinations require jurisdiction-aware human decisions.
7. Administrative provisioning, purpose approval, break-glass access, and audit review are unresolved.
8. Export/share authority and audit/consent retention require Legal/Compliance and Security approval.
9. `playbook_events` and domain-specific share/relationship records have not been proven sufficient for security audit or delegation guarantees.
10. No schema threat model, migration plan, rollback/backfill plan, or safe authorization fixtures exist yet.

## PBOS-RLS-003 Readiness

### Ready

- Constitutional invariants and action vocabulary.
- Existing permission registry inventory.
- Domain contracts and required lifecycle data.
- Reuse/missing infrastructure analysis.
- Relationship, consent, and audit designs.
- Deny-by-default validation expectations.

### Blocked

- Human governance decisions.
- Deployed catalog reconciliation.
- Exact schema, key, state-transition, retention, and compatibility approval.

### Missing

- Threat model and ADR/schema proposal.
- Approved entity relationships and migration names.
- Backfill/rollback plan and safe test fixtures.

### Requires Human Decision

Role/relationship grants, Coach/Institution/Employer scope, age and consent, organization verification, administrator controls, export/share authority, reuse versus new tables, and retention.

## Recommended Next Gate

**PBOS-RLS-003 — schema proposal and threat-model review, conditionally.** It may begin only after named human owners resolve the blocking governance questions and the deployed catalog is reconciled. It must not create or deploy tables, grants, migrations, or RLS policies until the schema/ADR and test plan are approved.

If those prerequisites are not available, remain on `PBOS-RLS-002` as blocked by governance rather than inferring permissions or selecting a feature gate.

## Change Boundary Confirmation

- Application behavior changed: **No**
- Application code changed: **No**
- Production tables changed: **No**
- Migrations created: **No**
- RLS policies created: **No**
- Permissions invented or granted: **No**
- Unknown authorization treated as allowed: **No**
