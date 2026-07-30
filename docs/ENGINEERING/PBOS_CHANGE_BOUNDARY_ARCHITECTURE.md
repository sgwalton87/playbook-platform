# PBOS Change Boundary Architecture

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Change Boundary Discovery](./PBOS_CHANGE_BOUNDARY_DISCOVERY.md)

## Contract

`ChangeInventory` binds repository, commit, branch, changed-file identities, ownership, risk, and content digests. `ChangeBoundaryDeclaration` binds the inventory content identity, requester, complete approved and excluded lists, purpose, risk acknowledgment, creation time, expiration, and digest.

Every changed file must appear exactly once across approved and excluded files. Duplicate classification, omissions, scope drift, unknown ownership, expiration, identity mismatch, or digest corruption fails closed.

## Ownership

`change-boundary-authority` exclusively owns `pbos/runtime/change-boundary.json`. Successful declarations are durable and preserve prior declarations in history. The authority does not stage or commit files, approve context, refresh context, or execute work.

## Context Binding

Trusted-context activation now requires a current valid change-boundary identity. The final trusted context records that identity alongside repository, commit, branch, manifest, artifact, architecture, governance, reviewer, and temporal identities.

A valid declaration does not permit a dirty operating environment by itself. Approved work must still reach its reviewed commit boundary, excluded work must not influence execution, and the final repository snapshot must pass reconciliation.

## Commands

`npm run pbos:change-inventory` performs read-only classification.

`npm run pbos:change-boundary` requires explicit environment-provided requester identity, approved and excluded file lists, purpose, risk acknowledgment, and expiration. Missing or inconsistent inputs write no runtime artifact.

The command also produces `ChangeBoundaryAssessment`, including repository, commit, branch, included and excluded files, per-file `IN_SCOPE`, `OUT_OF_SCOPE`, or `REQUIRES_REVIEW`, maximum risk, owner identity, and creation time.
