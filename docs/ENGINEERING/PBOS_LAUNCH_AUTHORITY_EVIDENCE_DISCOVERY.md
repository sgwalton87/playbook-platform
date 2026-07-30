# PBOS Launch Authority Evidence Discovery

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [PBOS Change Boundary Architecture](./PBOS_CHANGE_BOUNDARY_ARCHITECTURE.md), [PBOS Founder Launch Authority Model](./PBOS_FOUNDER_LAUNCH_AUTHORITY_MODEL.md), [PBOS Trusted Context Activation Architecture](./PBOS_TRUSTED_CONTEXT_ACTIVATION_ARCHITECTURE.md)

## Purpose

This discovery records the existing launch-authority command surface, record models, persistence ownership, and validation controls. It determines whether the current repository state has sufficient human evidence to activate a trusted PBOS build context.

## Canonical Authority Chain

```text
Git repository reality
  -> change-boundary assessment
  -> human ChangeBoundaryDeclaration
  -> authority-ledger LaunchApprovalRecord
  -> context-activation TrustedBuildContext
  -> Mission Control launch decision
```

The chain has no substitute path. Git owns observable repository state. Change Boundary owns immutable file-scope declarations. The Authority Ledger owns identity-bound approval evidence. Context Activation owns trusted-context admission. Mission Control reports the resulting state. The Kernel and execution authorities remain downstream and cannot create launch authority.

## Existing Command Surface

| Command | Responsibility | Current result |
|---|---|---|
| `npm run pbos:change-inventory` | Enumerate and classify repository changes | Assessment available |
| `npm run pbos:change-boundary` | Validate and persist a human scope declaration | `BLOCKED` |
| `npm run pbos:approve-boundary` | Validate and record an independent human decision | `BLOCKED` |
| `npm run pbos:context-reconcile` | Compare repository reality with trusted context | `REVIEW_REQUIRED` |
| `npm run pbos:context-activate` | Admit an approved snapshot as trusted context | `BLOCKED` |
| `npm run it` | Present authoritative Mission Control state | `HOLD` |

## Record Models

`ChangeBoundaryDeclaration` binds a boundary identifier to repository, commit, branch, included and excluded paths, a scope digest, purpose, requester, risk acknowledgment, creation time, and expiration. Its content identity makes mutation detectable; a changed scope requires a new declaration.

`LaunchApprovalRecord` binds a separate reviewer decision to the exact boundary identifier and digest. Validation rejects self-approval, incomplete identities, missing risk acknowledgment, expiration, non-approved decisions, and boundary digest mismatch.

`TrustedBuildContext` binds the repository snapshot to the approved boundary and approval identities plus manifest, architecture, artifact, and governance digests. Activation is denied unless every upstream authority validates.

## Persistence Ownership

| Artifact | Canonical owner | Creation rule |
|---|---|---|
| `pbos/runtime/change-boundary.json` | `change-boundary-authority` | Only after complete human scope declaration validation |
| `pbos/runtime/launch-approval.json` | `authority-ledger` | Only after identity separation and boundary-bound decision validation |
| `pbos/runtime/trusted-build-context.json` | `context-activation-authority` | Only after repository, governance, boundary, and approval validation |

No one of these runtime artifacts currently exists. Their absence is accurate runtime truth, not a repair target.

## Current Repository Assessment

The repository is on branch `pbos/post-pps300-convergence` at commit `6d92e435638dcf10c1e62f4bc250f10e15233724`. The boundary assessment observed 193 changed files and classified the candidate risk as `RED`. Every changed file requires an explicit human `INCLUDE` or `EXCLUDE` decision.

The boundary command stopped because requester identity, business and technical purposes, complete included and excluded file lists, risk acknowledgment, and expiration were not supplied. Approval then stopped because no current boundary or independent human decision existed. Context activation stopped because its required human decision evidence was absent. No command created a runtime artifact.

## Readiness Decision

Launch evidence is incomplete. The repository must remain outside trusted operating state until an identifiable requester declares the complete scope and an independent reviewer records an explicit, time-bounded decision against its immutable digest.

PBOS may assess and recommend scope. PBOS may not choose the human identities, infer risk acceptance, approve the boundary, or activate Mission Control.
