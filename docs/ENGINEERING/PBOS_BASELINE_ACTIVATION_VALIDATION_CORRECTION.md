# PBOS Baseline Activation Validation Correction

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [PBOS Baseline Activation Architecture](./PBOS_BASELINE_ACTIVATION_ARCHITECTURE.md), [PBOS Trusted Context Authority Link Architecture](./PBOS_TRUSTED_CONTEXT_AUTHORITY_LINK_ARCHITECTURE.md)

## Purpose

This correction aligns Change Boundary validation with the constitutional distinction between changed source scope and clean baseline activation.

## Root Cause

Two related conditions caused the observed failure:

1. The canonical validator applied exact changed-file classification to every boundary type.
2. Change Inventory counted PBOS-owned runtime outputs, including the boundary and launch approval that the workflow had just persisted. Repository Context already excluded those outputs when deciding whether the source worktree was clean.

The result was contradictory repository truth: Repository Context reported a clean baseline while Change Boundary reported changed runtime evidence and rejected the baseline.

## Canonical Validation Rules

### CHANGE

A `CHANGE` boundary:

- requires at least one source change;
- requires every changed file to appear exactly once in included or excluded files;
- rejects overlap;
- requires approved and included identities to match;
- preserves repository, digest, ownership, human-evidence, and expiration validation.

### BASELINE_ACTIVATION

A `BASELINE_ACTIVATION` boundary:

- requires zero source changes;
- requires empty approved, included, and excluded file arrays;
- does not execute `CHANGE` classification equality rules;
- requires repository, branch, and commit identities;
- requires valid declaration, inventory, scope, and baseline digests;
- requires requester, business purpose, technical purpose, risk acknowledgment, and unexpired evidence.

## Governed Output Policy

`pbos/context/governed-outputs.ts` is the shared source for repository outputs that must not be interpreted as source changes. It excludes:

- all `pbos/runtime/**` artifacts;
- repository context and refresh outputs;
- governed context, lifecycle, and planning-handoff evidence reports.

Repository Context and Change Inventory now consume this same policy. Runtime evidence remains validated through artifact ownership and digest rules; excluding it from source-change classification does not make it ungoverned.

## Failure Behavior

PBOS still fails closed when:

- a change boundary has no changes;
- a changed file is omitted or classified more than once;
- a baseline contains any source change;
- a baseline contains any included or excluded path;
- repository identity or baseline digests are missing or stale;
- human evidence is incomplete or expired.

No parallel validator or boundary owner was introduced.
