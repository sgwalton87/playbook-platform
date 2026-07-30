# PBOS Baseline Activation Boundary Discovery

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [PBOS Change Boundary Architecture](./PBOS_CHANGE_BOUNDARY_ARCHITECTURE.md), [PBOS Trusted Context Activation Architecture](./PBOS_TRUSTED_CONTEXT_ACTIVATION_ARCHITECTURE.md)

## Purpose

This discovery evaluates whether the existing Change Boundary Authority can govern activation of a clean repository baseline.

## Existing Architecture

The `ChangeBoundaryDeclaration` is constructed and validated by `pbos/context/change-boundary/authority.ts`, persisted by `pbos/context/change-boundary/store.ts`, and owned by `change-boundary-authority`. Launch Approval binds its decision to the resulting boundary digest. Context Activation reloads the declaration, compares it with current repository inventory, and admits it only with valid launch approval.

The existing model represented only file-level change scope. Its identity included repository, branch, commit, inventory, human purpose, risk acceptance, and expiration, but it lacked a boundary type and the context digests required to distinguish a clean baseline activation from an empty change set.

## Finding

A clean repository is a legitimate activation subject, but it is not a change boundary. Treating both cases identically leaves the constitutional meaning of an empty file classification ambiguous.

The smallest correct extension is a discriminated declaration under the existing authority:

- `CHANGE` governs a complete classification of a changed worktree.
- `BASELINE_ACTIVATION` governs an empty worktree bound to current repository and PBOS context identities.

No new store, artifact, approval path, or context owner is required.

## Canonical Identity Sources

Baseline identity must come from the same repository discovery used by Context Activation:

| Binding | Source |
|---|---|
| Repository, branch, commit | Git-backed repository snapshot |
| Context digest | Current `RepositoryContextSnapshot` content |
| Manifest digest | Master build manifest loader |
| Architecture digest | Constitutional architecture inventory |
| Artifact digest | Required runtime artifact inventory |
| Governance digest | Canonical governance source inventory |

Context Activation must recompute and compare these values. A declaration cannot establish its own truth merely by containing non-empty digests.

## Decision

Extend `ChangeBoundaryDeclaration` and its existing validator. Preserve the owner `change-boundary-authority`, runtime location, approval binding, and immutable history model.
