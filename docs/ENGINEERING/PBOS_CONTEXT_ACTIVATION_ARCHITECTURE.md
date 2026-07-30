# PBOS Context Activation Architecture

## Purpose

Define the final trust boundary before autonomous action.

## Ownership

PBOS Context Authority owns repository observation. Context Activation owns the evidence-bound trust decision.

## Last Updated

July 30, 2026

## Requirements

Activation requires repository, commit, branch, working-tree, artifact inventory, architecture inventory, manifest digest, governance state, request identity, and approval reference. The request must bind the exact snapshot digest.

Successful activation produces `TrustedBuildContext` containing context, repository, commit, manifest, artifact, approval, and temporal identity. A dirty worktree or mismatched digest produces `BLOCKED` and no trusted context.

## Recovery

Operators must reconcile and refresh context through existing context authority. Activation does not refresh, repair, or suppress findings.

## Related Documents

- [Lifecycle Discovery](./PBOS_AUTONOMOUS_LIFECYCLE_DISCOVERY.md)
- [Lifecycle Control Plane](./PBOS_AUTONOMOUS_LIFECYCLE_CONTROL_PLANE_ARCHITECTURE.md)
