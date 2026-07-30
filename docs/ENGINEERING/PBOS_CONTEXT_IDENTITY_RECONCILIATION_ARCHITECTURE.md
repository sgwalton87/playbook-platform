# PBOS Context Identity Reconciliation Architecture

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Trusted Build Context Architecture](./PBOS_TRUSTED_BUILD_CONTEXT_ARCHITECTURE.md)

## Purpose

Context reconciliation determines whether current repository reality is the same trusted repository, an expected continuation requiring review, or an invalid identity.

## Classification

- `VERIFIED`: no identity or content differences; activation may be evaluated.
- `REVIEW_REQUIRED`: repository identity is stable but commit, content, runtime, or artifact state changed; a human must review and canonical owners must regenerate stale artifacts.
- `REJECTED`: repository, root, remote, branch, lineage foundation, or required artifact identity is unknown or invalid.

## Inputs

The reconciler compares repository root, remote, repository identity, branch, commit, working-tree content, runtime state, artifact inventory, and artifact identities. The reality assessment additionally validates the master manifest, constitutional architecture inventory, and governance sources.

## Authority Boundaries

Reconciliation observes and classifies. It does not mutate repository context, authorize a refresh, approve activation, or infer trust. Refresh remains owned by `ContextRefreshAuthority`; activation remains owned by context activation authority; human approval remains external evidence.

## Evidence

Every report carries previous and current snapshots, deterministic differences, resolution actions, confidence, risk, recommendation, timestamp, and digest. Repeated evaluation of identical inputs produces identical evidence.
