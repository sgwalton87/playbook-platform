---
id: PBOS-ARTIFACT-CONSISTENCY-001
title: PBOS Artifact Consistency Report
status: VALID
classification: Reconciliation Evidence
owner: PBOS Artifact Reconciliation
last_updated: 2026-07-29
---

# PBOS Artifact Consistency Report

## Result

- Artifact health: VALID
- Artifact conflicts: 0
- Refresh required: YES
- Ready for context refresh: YES
- Evaluated at: 2026-07-29T05:50:10.209Z
- Run identity: `8fd95727bedc85cf50529d2bd79d7952d5480bfde50653293b4a6fe4932f3007`

## Canonical Ownership

| Artifact | Canonical Owner | Classification | Regenerated | Evidence |
| --- | --- | --- | --- | --- |
| pbos/runtime/validation.json | runtime-validator | valid | YES | Validation gate PBOS-CONTEXT-001 was superseded by planning gate none. |
| pbos/runtime/execution.json | execution-engine | valid | YES | Execution gate PBOS-CONTEXT-001 was superseded by planning gate none. |
| pbos/runtime/next-gate.json | constitutional-planner | valid | YES | None |
| pbos/runtime/repository-context.json | repository-context | recoverable | NO | Repository context must be regenerated after runtime reconciliation. |
| pbos/state/engine-state.json | engine-state-manager | valid | NO | None |

## Unresolved Conflicts

- None

Previous artifact bodies and digests are preserved in `pbos/runtime/artifact-reconciliation.json`. Regeneration was performed only through canonical owners. No gate transition or completed history was invented.
