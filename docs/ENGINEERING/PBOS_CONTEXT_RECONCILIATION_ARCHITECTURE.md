# PBOS Context Reconciliation Architecture

## Purpose

Define the read-only trust boundary that compares stored PBOS repository context with current repository, Git, runtime, artifact inventory, and content identity before planning.

## Ownership And Authority

Repository Context remains the sole owner of trusted context creation and refresh. `RepositoryContextReconciliation` observes and reports differences; it cannot save, replace, delete, or certify context. Context mutation remains restricted to the governed context lifecycle.

## Reconciliation Lifecycle

`DETECTED` identifies a possible discrepancy. `ANALYZING` evaluates identity and evidence. `RECONCILING` represents an explicitly authorized external remediation. `VERIFIED` means stored and observed identity agree. `REJECTED` means trust cannot be established. The current implementation returns the terminal observational result, while intermediate states define future workflow authority.

## Validation Contract

Reconciliation compares repository identity, root, remote, branch, commit, working-tree content digest, runtime identity, artifact inventory, and artifact content identity. Missing stored context, any mismatch, or ambiguous ownership fails closed.

## Evidence And Recovery

The report preserves previous and current snapshots, differences, resolution actions, timestamp, confidence, and a deterministic digest. Recovery requires the canonical context or artifact owner to regenerate evidence; reconciliation never overwrites trusted state.

## Constitutional Guarantee

Invalid context blocks governed planning. Verified context enables assessment but does not authorize execution, certification, lifecycle mutation, or autonomous action.
