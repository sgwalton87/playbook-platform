---
id: PBOS-ARTIFACT-CONSISTENCY-001
title: PBOS Artifact Consistency Report
status: VALID
classification: Reconciliation Evidence
owner: PBOS Artifact Reconciliation
last_updated: 2026-07-31
---

# PBOS Artifact Consistency Report

## Result

- Artifact health: VALID
- Artifact conflicts: 0
- Refresh required: YES
- Ready for context refresh: YES
- Evaluated at: 2026-07-31T01:13:28.189Z
- Run identity: `37eab4f2e1d2f33e1aa8802c92c297d38367d0f778fb7234a5a9a27a3972c606`

## Canonical Ownership

| Artifact | Canonical Owner | Classification | Regenerated | Evidence |
| --- | --- | --- | --- | --- |
| pbos/runtime/validation.json | runtime-validator | valid | YES | None |
| pbos/runtime/execution.json | execution-engine | valid | YES | None |
| pbos/runtime/next-gate.json | constitutional-planner | valid | YES | None |
| pbos/runtime/repository-context.json | repository-context | recoverable | NO | Repository context must be regenerated after runtime reconciliation. |
| pbos/state/engine-state.json | engine-state-manager | valid | NO | None |

## Unresolved Conflicts

- None

Previous artifact bodies and digests are preserved in `pbos/runtime/artifact-reconciliation.json`. Regeneration was performed only through canonical owners. No gate transition or completed history was invented.
