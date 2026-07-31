# PBOS Autonomous Operator Experience Architecture 001

## Purpose

Define the governed operator experience that translates human intent into one
deterministic PBOS lifecycle transition without transferring authority from
canonical lifecycle owners.

## Ownership

PBOS Operator Experience owns intent parsing, presentation, and safe
orchestration. Repository Context, Change Boundary, Context Refresh, Context
Activation, Execution, and Release authorities retain their existing decision
and mutation rights.

## Last Updated

July 31, 2026

## Related Links

- [Recovery Orchestration Architecture](../ENGINEERING/PBOS_RECOVERY_ORCHESTRATION_ARCHITECTURE.md)
- [Recovery Execution Plan](PBOS_RECOVERY_EXECUTION_PLAN_001.md)
- [Engineering Constitution](../../CODEX.md)

## Architecture Decision

`pbos:run` is the single operator entry point for `RUN_IT`. It consumes the
canonical recovery assessment rather than implementing a second lifecycle
selector. The assessment determines current phase, ordered dependencies,
artifact health, and the next permitted transition. Operator Experience turns
that decision into concise automatic-action evidence or one human action.

```text
RUN_IT intent
  -> canonical recovery evidence collector
  -> canonical recovery state machine
  -> operator transition adapter
  -> safe read-only executor
  -> human authority queue or no-action report
```

## Intent Model

`RUN_IT` is active. `REPAIR`, `VERIFY`, `BUILD`, `RELEASE`, `DEPLOY`, and
`CERTIFY` are typed future intents, but they do not gain execution authority
merely by existing in the contract. Unsupported command paths remain
fail-closed.

Human intent describes the outcome. PBOS owns selection among `CHANGE`,
`RECONCILE`, `REFRESH`, `ACTIVATE`, and `NONE`. The operator is never asked to
choose boundary type, artifact producer, validator order, or recovery sequence.

## State Machine

| Canonical recovery decision | Operator transition | Authority behavior |
|---|---|---|
| `CHANGE_BOUNDARY_REQUIRED` | `CHANGE` | Request boundary evidence |
| `APPROVE_BOUNDARY_REQUIRED` | `CHANGE` | Request independent approval |
| `APPROVE_REFRESH_REQUIRED` | `RECONCILE` | Request reconciliation-bound approval |
| `REFRESH_REQUIRED` | `REFRESH` | Report authorized transition readiness |
| `CONTEXT_ACTIVATION_REQUIRED` | `ACTIVATE` | Request explicit activation |
| `NONE` | `NONE` | Report trusted/no action |

The mapping is total and static. Unknown canonical recovery states cannot be
represented by the TypeScript contract.

## Authority Model

Operator Experience may automatically inspect repository state, discover
artifacts, invoke validators, calculate deterministic digests, select the
canonical next transition, and render reports.

It may not create boundaries, approve decisions, activate context, authorize
execution, release, deploy, or certify. Those actions remain behind their
canonical commands and validators. The first implementation intentionally does
not mutate the repository; a valid approval makes a transition eligible but
does not allow Operator Experience to impersonate the owning authority.

## Human Approval Queue

When authority is unavoidable, the report includes:

- the exact reason approval is required;
- the causal validation finding;
- previous and proposed context identities;
- exactly one canonical command.

Stale, rejected, expired, mismatched, or missing evidence is never converted to
approval. Re-running `pbos:run` after the canonical authority records a valid
decision deterministically advances the recommendation.

## Runtime Artifact Treatment

The operator consumes existing runtime artifacts only through their canonical
loaders and validators. Governed `pbos/runtime/**` outputs remain excluded from
source change inventory by Change Boundary Authority. Operator Experience does
not reinterpret them as source changes or persist a competing operator state.

## Determinism

The plan digest covers intent, canonical assessment identity, selected
transition, automatic actions, and human action. Wall-clock timestamps are not
part of the plan body. Equal validated state produces the same plan ID, digest,
transition, and report.

## Failure Handling

Missing repository context, invalid artifacts, conflicting identities, stale
approvals, or invalid governance references remain findings in the canonical
assessment. Operator Experience reports the earliest permitted transition and
performs no mutation. Parser errors and unknown intent values fail explicitly.

## Certification Position

This change establishes a governed operator facade, not autonomous lifecycle
authority. Automatic continuation across mutations requires a future,
constitutionally approved dispatch contract that revalidates the assessment
digest immediately before each owner executes. Until then, human approval and
owner-command execution remain explicit security boundaries.
