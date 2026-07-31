# PBOS Recovery Execution Plan 001

## Purpose

Define the reviewed, non-executing recovery plan for restoring PBOS repository
context trust without reusing stale authority or modifying lifecycle truth
outside canonical commands.

## Owner

Playbook OS Engineering.

## Last Updated

July 30, 2026

## 1. Current State Assessment

| Property | Current value |
|---|---|
| Repository identity | `playbook-platform` |
| Branch identity | `pbos/post-pps300-convergence` |
| Current commit | `ee504ec26b2587d2310af9491302a784e69bcddf` |
| Working tree before this plan | `CLEAN` |
| Context trust | Not current; trusted context is bound to an older commit |
| Recovery evidence | `PBOS_RECOVERY_ARCHITECTURE_INSPECTION_001.md` |
| Planning artifact | `VALID_IDLE` |
| Execution authorization | `PENDING` for historical gate `PBOS-ENGINE-005` |

Current blockers:

- Stored repository context was captured at commit
  `fd6793bd423ff1ae8d998c96b95d6594ac08947c`.
- Latest change boundary is bound to commit
  `f19f48fc646937c12ba6983498cc010ba2b797d8`.
- Latest launch approval references a different boundary than the latest
  boundary artifact.
- Latest refresh approval is already `APPLIED` to an older reconciliation.
- Latest trusted context is bound to commit
  `f19f48fc646937c12ba6983498cc010ba2b797d8`.

Existing evidence remains valid as history. It is not valid authority for the
current commit.

## 2. Root Cause Analysis

Trusted context became invalid because repository HEAD advanced after context,
boundary, refresh, and activation identities were issued. PBOS binds authority
to immutable identities. Advancing HEAD changes repository reality even when
the working tree is clean.

Previous approvals cannot be reused because:

- launch approval binds one exact change-boundary ID and digest;
- refresh approval binds repository, branch, commit, reconciliation digest,
  previous context, and proposed context;
- an `APPLIED` refresh decision is terminal evidence for its prior transition;
- trusted context binds the activation snapshot, boundary, launch approval, and
  activation decision.

PBOS correctly blocked activation because accepting any historical link would
separate human intent from the repository state actually being activated.

Identity meanings:

| Identity | Meaning |
|---|---|
| Repository identity | Stable repository name, root, remote, branch, HEAD, and observed content |
| Context identity | Digest of the complete observed repository and required runtime snapshot |
| Approval identity | Immutable human decision record and evidence binding |
| Launch identity | Boundary-scoped approval authorizing activation consideration |
| Refresh identity | Reconciliation-scoped approval authorizing one context replacement |

## 3. Artifact Lifecycle Map

| Artifact | Owner | Created By | Consumed By | Class | Approval | Invalidation Conditions |
|---|---|---|---|---|---|---|
| `pbos/runtime/repository.json` | Repository Intelligence | Repository analysis producer | Context, validator, execution | Runtime, replaceable | No direct approval | Canonical regeneration, branch or repository analysis change |
| `pbos/runtime/repository-context.json` | Repository Context | Context refresh | Planner, execution | Runtime, replaceable | Approved refresh required | Repository, branch, commit, content, runtime, or artifact identity changes |
| `pbos/runtime/context-refresh.json` | Repository Context | Context refresh | Planner, status, audit | Runtime, durable history | Approved refresh required | History remains valid; latest ceases to describe current reality after identity change |
| `pbos/runtime/next-gate.json` | Constitutional Planner | Planner | Validator, execution, status | Runtime, replaceable | No direct approval | Planner input, context, lifecycle, or dependency change |
| `pbos/runtime/execution-contract.json` | Execution Contract | Contract generator | Work package, authorization, execution | Runtime, durable | Governed gate required | Gate or contract identity mismatch |
| `pbos/runtime/work-package.json` | Work Package | Work-package generator | Authorization, execution | Runtime, durable | Governed contract required | Contract, gate, scope, or package digest mismatch |
| `pbos/runtime/execution-authorization.json` | Execution Authorization | Authorization generator | Decision and execution | Runtime, durable | Explicit decision required | Contract, package, scope, decision, or expiration mismatch |
| `pbos/runtime/change-boundary.json` | Change Boundary Authority | `pbos:change-boundary` | Activation, audit, Mission Control | Runtime, durable history | Requester evidence | Repository, commit, branch, inventory, baseline digest, scope, or expiration mismatch |
| `pbos/runtime/launch-approval.json` | Authority Ledger | `pbos:approve-boundary` | Activation, Mission Control, audit | Runtime, durable history | Independent reviewer | Boundary ID/digest mismatch, requester mismatch, expiration, rejection, revocation |
| `pbos/runtime/context-refresh-approval.json` | Context Refresh Authority | `pbos:approve-refresh` | Refresh, Mission Control, audit | Runtime, durable history | Independent reviewer | Repository, branch, commit, reconciliation, context, expiration, rejection, or prior application |
| `pbos/runtime/trusted-build-context.json` | Context Activation Authority | `pbos:context-activate` | Planner, execution admission, status | Runtime, durable history | Valid boundary and launch approval | Repository reality mismatch, expiration, invalid boundary, invalid launch approval |
| `docs/release-evidence/pbos-context-refresh.md` | Repository Context | Context refresh | Human review | Tracked generated evidence | Inherits refresh authority | Regenerated only by canonical refresh |

## 4. Recovery State Machine

| State | Entry Condition | Transition Requirement | Required Artifact | Human Approval | Failure Conditions |
|---|---|---|---|---|---|
| `BLOCKED` | Context no longer matches repository reality | Inspect without mutation | Existing runtime and Git evidence | No | Missing or unreadable evidence |
| `INSPECTION_REQUIRED` | Cause is not yet classified | Establish deterministic diagnosis | Recovery inspection | No | Ambiguous owner or conflicting identities |
| `CHANGE_BOUNDARY_REQUIRED` | Repository is understood and recovery scope known | Create current boundary | `change-boundary.json` | Requester evidence | Dirty baseline, unclassified change, identity or digest mismatch |
| `BOUNDARY_APPROVED` | Current boundary validates | Independent boundary decision | `launch-approval.json` | Yes | Self-approval, stale boundary, rejection, expiration |
| `CONTEXT_REFRESH_REQUIRED` | Reconciliation remains `REVIEW_REQUIRED` with valid boundary chain | Review exact proposed context | Current reconciliation | No mutation yet | Repository changes after boundary |
| `REFRESH_APPROVED` | Exact reconciliation reviewed | Create refresh decision | `context-refresh-approval.json` | Yes | Stale digest, mismatched context, rejection, expiration |
| `TRUST_ACTIVATION_READY` | Approved refresh is applied and reconciliation is `VERIFIED` | Evaluate activation | Refreshed context plus boundary and launch approval | Existing approval chain | Dirty tree, invalid inventory, mismatched activation snapshot |
| `TRUSTED` | Activation validation passes | Persist trusted context | `trusted-build-context.json` | Valid independent launch approval | Any validation finding |

Rollback never rewrites history. Before refresh, rollback means abandoning the
pending proposal and creating new evidence for changed reality. After refresh,
rollback means reconciling to another observed state through a new boundary and
approval chain.

## 5. Command Dependency Map

The governed order is:

```text
pbos:context-reconcile
  -> pbos:change-boundary
  -> pbos:approve-boundary
  -> pbos:context-reconcile
  -> pbos:approve-refresh
  -> pbos:refresh
  -> pbos:context-reconcile
  -> pbos:context-activate
```

`pbos:context-refresh` is not currently implemented. Documentation must use
`pbos:refresh` until an alias exists. Refresh cannot precede refresh approval.

| Command | Requires | Outputs |
|---|---|---|
| `pbos:context-reconcile` | Git state, stored context, manifest, architecture, governance, required runtime artifacts | Computed report to stdout; no persisted mutation |
| `pbos:change-boundary` | Current inventory, identities, purposes, risk acceptance, expiration; clean tree for baseline activation | `pbos/runtime/change-boundary.json` |
| `pbos:approve-boundary` | Current boundary, requester, independent reviewer, decision evidence, expiration | `pbos/runtime/launch-approval.json` |
| `pbos:approve-refresh` | Exact current `REVIEW_REQUIRED` reconciliation and independent decision evidence | `pbos/runtime/context-refresh-approval.json` |
| `pbos:refresh` | Current `APPROVED` refresh record with exact identity matches | Repository context, refresh history, refresh report, approval transitioned to `APPLIED` |
| `pbos:context-activate` | `VERIFIED` reconciliation, clean tree, valid boundary and launch approval | `pbos/runtime/trusted-build-context.json` |

## 6. Operator Experience Requirements

Every blocked recovery response must present:

```text
Current State:
The lifecycle state and authoritative artifact.

Cause:
The first invalid identity or missing dependency.

Impact:
The capabilities that remain prohibited.

Required Action:
Exactly one next canonical command.

Expected Changes:
Every file that command may write and its owner.

Approval:
The required requester, reviewer, and separation-of-duties rule.

Verification:
The command and expected state proving success.
```

Generic `Decision: BLOCKED` output is insufficient unless accompanied by this
causal and operational context.

## 7. Future Command Proposal

```text
npm run pbos:recover
```

Default behavior must be read-only and produce:

```text
PBOS RECOVERY PLAN

Current State:
...

Detected Issue:
...

Required Transition:
...

Commands Required:
1. ...

Artifacts Expected:
...

Human Approvals Required:
...

Estimated Working Tree Impact:
...

Proceed? YES/NO
```

The prompt is informational unless a separately authorized execution mode is
explicitly selected. `NO` is the default. Analysis must pin one repository
snapshot so repeated runs against unchanged input produce the same diagnosis.

## 8. Safety Requirements

- Preserve fail-closed behavior.
- Never reuse stale, rejected, expired, revoked, or `APPLIED` approvals.
- Never silently regenerate identity-bound artifacts.
- Never mutate runtime state during analysis.
- Never combine boundary and refresh authority.
- Never infer human identity or approval.
- Present exactly one deterministic next transition.
- Recompute the plan if repository state changes.
- Preserve all history during governed transitions.

## Completion Criteria

This execution plan is complete when operators can identify the current state,
the single next transition, its owner, expected files, required approval, and
verification method without executing a recovery mutation.
