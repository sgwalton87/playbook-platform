# PBOS Recovery Architecture Inspection 001

## Purpose

Document the read-only architecture inspection of the governed repository
context recovery path. This report does not authorize or perform recovery.

## Owner

Playbook OS Engineering.

## Last Updated

July 30, 2026

## Current State

| Property | Observed value |
|---|---|
| Repository | `playbook-platform` |
| Branch | `pbos/post-pps300-convergence` |
| HEAD | `88307c4436ecddc3735f14150c5872ff6260506e` |
| Working tree before this report | Clean |
| Reconciliation recommendation | `HUMAN_REVIEW_REQUIRED` |
| Reconciliation state | `REVIEW_REQUIRED` |
| Change boundary | Invalid |
| Launch approval | Invalid |

The npm command named `pbos:context-refresh` does not exist. The canonical
implemented command is `npm run pbos:refresh`.

## Root Cause

The stored authority chain is internally historical rather than current:

1. The latest change boundary is
   `CHANGE-BOUNDARY-30b89401cbe6f649`, digest
   `ac22e06f7a89f83e3048faae72fd3ef61dd3684ba76fab799433923f469abe8b`.
   It is bound to commit `f19f48fc646937c12ba6983498cc010ba2b797d8`,
   not current HEAD `88307c4436ecddc3735f14150c5872ff6260506e`.
2. The latest launch approval is
   `LAUNCH-APPROVAL-e2c823b73e89118c`. It references boundary
   `BASELINE_ACTIVATION-BOUNDARY-0e3cc778f887db38`, digest
   `1abbb910d636775f8ec7495bb5185e7742285c24db1fabb327c45d77c23f84da`.
   That is not the latest change boundary identity or digest.
3. The latest refresh approval is
   `CONTEXT-REFRESH-APPROVAL-c1fff4a9b4967365`. It is already `APPLIED`
   and is bound to reconciliation
   `410b257f2eba33bd69334d7f194dccc68e63a17ba0636d6e95c5652c27b6237c`,
   commit `f19f48fc646937c12ba6983498cc010ba2b797d8`, and proposed context
   `1c6d8d0ff07ec706445394815a2c58c3a317b260bda820c9b022dd13e725f1fa`.
   It cannot be replayed for the current reconciliation.

The launch approval therefore fails both temporal repository binding and direct
boundary identity validation. The refresh approval independently fails current
commit, reconciliation digest, previous context, proposed context, and state
requirements.

## Artifact Lifecycle Map

```text
Git and runtime observation
  -> ContextReconciliationReport (computed, not persisted by reconcile)
  -> ChangeBoundaryDeclaration
     pbos/runtime/change-boundary.json
  -> LaunchApprovalRecord
     pbos/runtime/launch-approval.json
  -> ContextRefreshApprovalRecord
     pbos/runtime/context-refresh-approval.json
  -> RepositoryContextArtifact + ContextRefreshArtifact
     pbos/runtime/repository-context.json
     pbos/runtime/context-refresh.json
     docs/release-evidence/pbos-context-refresh.md
  -> refresh approval APPLIED history entry
     pbos/runtime/context-refresh-approval.json
  -> TrustedBuildContext
     pbos/runtime/trusted-build-context.json
```

All JSON files in this map are durable runtime artifacts with registered
canonical owners. `pbos-context-refresh.md` is tracked human-readable evidence.
No command in this lifecycle uses a temporary state file.

History-bearing stores append the previous `latest` record to `history` before
persisting a new latest record. They do not delete prior authority evidence.

## Command Dependency Map

### `npm run pbos:change-boundary`

Implementation:

- `pbos/commands/kernel-cli.ts`
- `pbos/commands/founder-evidence-input.ts`
- `pbos/commands/kernel-command-bus.ts`
- `pbos/context/change-boundary/inventory.ts`
- `pbos/context/change-boundary/authority.ts`
- `pbos/context/change-boundary/store.ts`

Direct reads:

- Git root, HEAD, branch, status, and every non-governed changed file.
- `pbos/runtime/change-boundary.json` for existing history.

Additional baseline-activation reads:

- `pbos/runtime/repository-context.json`
- `pbos/state/engine-state.json`
- `pbos/runtime/next-gate.json`
- `pbos/runtime/repository.json`
- `pbos/runtime/validation.json`
- `pbos/runtime/execution.json`
- `pbos/runtime/execution-contract.json`
- `pbos/runtime/work-package.json`
- `pbos/runtime/execution-authorization.json`
- Every `pbos/gates/*.json`
- `pbos/manifests/playbook-master-manifest.yaml`
- Every file under `docs/CONSTITUTION/`
- `CODEX.md`
- `docs/ARCHITECTURE.md`
- `pbos/runtime/launch-approval.json`

Writes:

- `pbos/runtime/change-boundary.json`, durable runtime authority artifact.

### `npm run pbos:approve-boundary`

Implementation:

- `pbos/commands/kernel-command-bus.ts`
- `pbos/authority/launch/authority.ts`
- `pbos/authority/launch/store.ts`

Reads:

- `pbos/runtime/change-boundary.json`
- Existing `pbos/runtime/launch-approval.json` for history preservation.

Writes:

- `pbos/runtime/launch-approval.json`, durable authority-ledger artifact.

### `npm run pbos:approve-refresh`

This command is mandatory even though it was not listed in the requested
command inventory.

Implementation:

- `pbos/commands/kernel-command-bus.ts`
- `pbos/context/refresh/approval.ts`
- `pbos/context/refresh/store.ts`

Reads:

- The complete context-discovery input set listed under baseline activation.
- `pbos/runtime/change-boundary.json`
- `pbos/runtime/launch-approval.json`
- Existing `pbos/runtime/context-refresh-approval.json` for history.

Writes:

- `pbos/runtime/context-refresh-approval.json`, durable reconciliation-bound
  authority artifact.

### `npm run pbos:refresh`

Implementation:

- `pbos/commands/kernel-command-bus.ts`
- `pbos/context/refresh/authority.ts`
- `pbos/context/refresh/approval.ts`
- `pbos/context/lifecycle.ts`

Reads:

- The complete context-discovery input set.
- `pbos/runtime/context-refresh-approval.json`
- Existing `pbos/runtime/repository-context.json`
- Existing `pbos/runtime/context-refresh.json`

Writes:

- `pbos/runtime/repository-context.json`, replaceable runtime truth artifact.
- `pbos/runtime/context-refresh.json`, durable refresh history.
- `docs/release-evidence/pbos-context-refresh.md`, tracked generated evidence.
- `pbos/runtime/context-refresh-approval.json`, durable history with the
  validated approval transitioned from `APPROVED` to `APPLIED`.

It does not create trusted context.

### `npm run pbos:context-activate`

Implementation:

- `pbos/commands/kernel-command-bus.ts`
- `pbos/context/activation/service.ts`
- `pbos/context/activation/authority.ts`

Reads:

- The complete context-discovery input set.
- `pbos/runtime/change-boundary.json`
- `pbos/runtime/launch-approval.json`
- Existing `pbos/runtime/trusted-build-context.json` for history.

Writes:

- `pbos/runtime/trusted-build-context.json`, durable context-activation
  authority artifact.

Activation requires reconciliation `VERIFIED`, a clean working tree, valid
artifact and governance inventories, a current boundary, and a matching
approved launch decision.

### `npm run pbos:authorize`

Implementation:

- `pbos/commands/kernel-command-bus.ts`

Reads:

- No files.

Writes:

- No files.

The current command is an informational placeholder that returns `PENDING`.
It is unrelated to context recovery and must not be substituted for boundary,
refresh, or activation authority.

## Safe Recovery Sequence

The minimal governed path is:

1. Finish or remove this inspection report through the intended repository
   workflow so the working tree is clean at the baseline capture point.
2. Run `npm run pbos:context-reconcile` and retain its current identities for
   human review. This command computes state and writes nothing.
3. Run `npm run pbos:change-boundary` with
   `boundary_type=BASELINE_ACTIVATION`. A clean inventory is mandatory.
4. Run `npm run pbos:approve-boundary` using an independent reviewer. The
   approval must reference the newly created boundary, not a historical one.
5. Run `npm run pbos:context-reconcile` again. Confirm the boundary and launch
   approval validate against the same repository, branch, commit, inventory,
   and baseline digests.
6. Run `npm run pbos:approve-refresh` with an independent reviewer. This binds
   the exact reconciliation digest and previous/proposed context identities.
7. Run `npm run pbos:refresh`. Confirm `APPLIED`; do not edit its outputs.
8. Run `npm run pbos:context-reconcile`. It must now report `VERIFIED`.
9. Run `npm run pbos:context-activate`. Activation consumes the current
   boundary and launch approval and writes only trusted-context history.
10. Validate with `pbos:context-status`, `pbos:next`, and `pbos:status`.

Do not regenerate `repository.json` between steps 3 and 9 unless its canonical
owner requires it. A regeneration changes an inventoried artifact digest and
invalidates the reconciliation-bound approval chain.

## Recommended PBOS Improvements

Add a read-only command:

```text
npm run pbos:recover-context -- --dry-run
```

It should:

- compute the current reconciliation once;
- validate boundary, launch approval, refresh approval, refreshed context, and
  trusted context as one dependency chain;
- print each artifact identity, expected identity, owner, state, and exact
  invalidation reason;
- emit the next single permitted command;
- detect when a report or other non-governed file prevents baseline activation;
- never create evidence, approvals, refreshes, or activation in dry-run mode.

A separately authorized `--execute-next` mode could dispatch only the next
already-approved transition. It must never synthesize human evidence, reuse an
`APPLIED` refresh approval, or combine boundary approval with refresh approval.

Also add `pbos:context-refresh` as an explicit alias for `pbos:refresh`, or
standardize documentation on the existing name. The current naming mismatch
unnecessarily complicates operational recovery.
