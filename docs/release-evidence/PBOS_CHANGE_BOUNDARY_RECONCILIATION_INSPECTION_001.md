# PBOS Change Boundary Reconciliation Inspection 001

## Purpose

Determine why a canonically regenerated repository-intelligence artifact does
not appear in PBOS source-change inventory and identify the governed recovery
path without weakening change-boundary validation.

## Owner

Playbook OS Engineering.

## Last Updated

July 30, 2026

## Current State

| Property | Observed value |
|---|---|
| Repository | `playbook-platform` |
| Branch | `pbos/post-pps300-convergence` |
| Commit | `b54ec84649b78411324f56a494addeab84218768` |
| Git-visible change before this report | `pbos/runtime/repository.json` |
| PBOS change inventory count | `0` |
| Inventory identity | `CHANGE-INVENTORY-4f53cda18c2baa0c` |
| Inventory content identity | `c12c76789640920387b4224d537bf2af634d70136dcd564a2b58090e1d5b382f` |

Recovery orchestration is implemented and repository intelligence was
regenerated through its canonical owner. Context recovery remains blocked
pending a current boundary and approval chain.

Observed failure:

```text
Change boundary requires at least one changed file.
Every changed file must be classified exactly once.
```

## Artifact Ownership

`pbos/runtime/repository.json` is registered in
`pbos/kernel/artifact-ownership.ts` with:

| Contract | Value |
|---|---|
| Owner | `repository-intelligence` |
| Producer | `pbos repository` / `pbos/commands/repository.ts` |
| Consumers | Context, validator, execution |
| Persistence | Replaceable |
| Cleanup | Replace on next canonical run |

Its expected lifecycle is:

```text
Repository Intelligence observation
  -> repository.json replacement
  -> repository-context observation detects artifact identity change
  -> reconciliation REVIEW_REQUIRED
  -> BASELINE_ACTIVATION boundary binds current baseline digests
  -> independent launch approval
  -> reconciliation-bound refresh approval
  -> context refresh
  -> trusted-context activation
```

`repository.json` is runtime truth produced by its owner. It is not a
human-authored source file and must not be admitted into a source-change
boundary as though it were implementation scope.

## Change Inventory Findings

Producer:

- `createChangeInventory` in
  `pbos/context/change-boundary/inventory.ts`.

Detection:

- Reads `git status --porcelain=v1 --untracked-files=all -z`.
- Normalizes each reported path.
- Excludes paths accepted by `isGovernedRuntimeOutput`.
- Classifies only remaining source, documentation, product, governance, and
  repository files.

Runtime handling:

- `isGovernedRuntimeOutput` returns true for every path beginning with
  `pbos/runtime/`.
- The current modified `pbos/runtime/repository.json` is therefore detected by
  Git and intentionally excluded before classification.
- The read-only `pbos:change-inventory` command consequently returned
  `changes: []`.

Classification rules for non-runtime files:

| Path | Owner | Domain | Risk | Initial status |
|---|---|---|---|---|
| `pbos/kernel/**`, `docs/CONSTITUTION/**` | PBOS Constitutional Governance | Governance | Red | Review required |
| Other `pbos/**` | PBOS Engineering | Control plane | Yellow | Review required |
| `app/**`, `supabase/**` | Playbook Product Engineering | Product | Yellow | Review required |
| `docs/**` | Playbook OS Engineering | Documentation | Green | Approved candidate |
| Other paths | Playbook Platform Engineering | Repository | Yellow | Review required |

No runtime file reaches these classification rules.

## Root Cause

The failure is an existing command-sequence and boundary-mode mismatch, not a
missing lifecycle integration.

PBOS has two distinct boundary contracts:

### `CHANGE`

- Requires one or more non-governed changed files.
- Requires every changed file to be approved or excluded exactly once.
- Correctly rejects an empty source-change inventory.

### `BASELINE_ACTIVATION`

- Requires an empty source-change inventory.
- Requires empty approved, included, and excluded file lists.
- Binds repository, commit, branch, context, manifest, architecture, artifact,
  and governance identities.
- Represents activation after canonical runtime regeneration.

The attempted boundary used `CHANGE` semantics against an inventory containing
zero classifiable source changes. The first error reports that `CHANGE` cannot
be empty. The classification error is the same validator confirming that an
empty inventory cannot satisfy a source-change declaration.

The regenerated repository artifact is still governed. Its identity is carried
by the baseline activation digests generated through
`discoverTrustedContext`, not by adding it to `approved_files`.

## Recommended Resolution

Decision: **Existing command sequence correction.**

No code change is required.

Safe sequence:

1. Complete and commit this inspection through the normal repository workflow.
   The report itself is a source-document change and prevents clean baseline
   activation until committed.
2. Regenerate `pbos/runtime/repository.json` through Repository Intelligence
   after the final commit so it reflects the final HEAD.
3. Run `npm run pbos:change-inventory`.
4. Confirm `changes: []`; runtime-only modifications are expected to remain
   excluded.
5. Run `npm run pbos:change-boundary`.
6. Select or explicitly pass `boundary_type=BASELINE_ACTIVATION`.
7. Provide requester, business purpose, technical purpose, risk acceptance,
   and expiration. Do not provide file classifications.
8. Continue through:

```text
pbos:approve-boundary
  -> pbos:context-reconcile
  -> pbos:approve-refresh
  -> pbos:refresh
  -> pbos:context-reconcile
  -> pbos:context-activate
```

Do not add `pbos/runtime/repository.json` to the source-change inventory. Doing
so would duplicate artifact ownership and make routine canonical runtime
generation appear as ungoverned implementation scope.

## Existing Test Evidence

`pbos/context/change-boundary/change-boundary.test.ts` already proves:

- empty `CHANGE` boundaries fail;
- every source change must be classified exactly once;
- clean `BASELINE_ACTIVATION` succeeds with complete identity evidence;
- baseline activation rejects changed repositories;
- baseline file classifications must remain empty;
- runtime outputs are excluded from change-boundary inventory.

The failure is therefore covered behavior, not an uncovered defect.

## Remaining Recovery Steps

After this report enters a clean committed baseline:

1. Regenerate repository intelligence.
2. Create a `BASELINE_ACTIVATION` boundary.
3. Obtain independent boundary approval.
4. Reconcile and obtain a new refresh approval.
5. Apply the refresh.
6. Verify reconciliation.
7. Activate trusted context.
8. Confirm governed planning readiness.
