# PBOS-RLS-001 Next Patch Set Draft (2026-08-10)

## Executive Snapshot

`PBOS-RLS-001` table-coverage remediation is complete. This draft captures the **next policy hardening batch** for explicit operation boundaries and support-route consistency.

## Context

- Matrix status from `docs/release-evidence/pbos-rls-001-matrix.json`:
  - `rlsEnabledTables: 45`
  - `tablesMissingPolicies: 0`
- QA remains blocked by missing Playwright tooling and cannot close the gate in this runtime.
- Service-role audit is clean (`serviceRoleRoutes=0`) and will not block the proposed follow-on patch set itself.

## Patch set objective

Produce a deterministic, least-privilege refinement migration set that:

1. keeps current ownership logic unchanged for user-owned reads/writes;
2. ensures all high-risk service-route-adjacent policies are operation-scoped;
3. removes ambiguity between route-managed actor permissions and policy-managed ownership.

## Draft artifact target

- New migration file: `supabase/migrations/20260814_rls_hardening_patch_set.sql`
- Supporting test target: `scripts/collect-rls-matrix.mjs` (policy precedence scan continues to be the machine validator).

## Draft policy diffs (proposed only)

### Patch 1 — support-route visibility normalization

- Normalize notification and playbook-event policy symmetry:
  - keep existing ownership checks for own-user and active support-relationship paths;
  - enforce operation-scoped create/read/update/delete forms consistently with explicit `with check` where writes occur.

### Patch 2 — reviewer-only management clarity

- Ensure moderation policies remain explicit by operation:
  - view
  - insert
  - update
  - (delete remains excluded until deletion workflow is introduced)

### Patch 3 — catalog-read minimization

- Keep active-only filtering for catalog surfaces:
  - `brand_partners`
  - `store_products`

### Patch 4 — operator verification

- Re-run:
  - `npm run rls:matrix`
  - `npm run sec:audit`
  - `node scripts/test-synthetic.mjs` (once Playwright is available)
- Confirm policy list and precedence remain stable in `pbos-rls-001-matrix.json`.

## Proposed commit sequence

1. Create and apply `supabase/migrations/20260814_rls_hardening_patch_set.sql`.
2. Execute migration only in an environment with controlled DBA access.
3. Update:
   - `docs/release-evidence/pbos-rls-001-audit.md`
   - `docs/release-evidence/pbos-rls-001-matrix.json`
   with the new scan result before advancing PBOS mission states.

## Completion criteria

- Coverage remains at zero missing policy tables.
- No policy statement broadening is introduced.
- Evidence is regenerated and appended to release evidence.
