# PBOS Planning Handoff Architecture

## Purpose

Define the governed bridge between completed constitutional work and a future, explicitly authorized planning objective.

## Ownership

PBOS Architecture owns the objective registry contract. The Planning Handoff subsystem owns objective evaluation and planning evidence. The Constitutional Planner remains the sole gate-selection authority. Gate lifecycle governance remains the sole transition authority.

## Last Updated

July 29, 2026

## Existing Architecture Assessment

The constitutional planner in `pbos/planner/` is the single runtime gate selector. It evaluates gate metadata, dependency completion, required artifacts, repository context, validation, and release state. Gate JSON is the canonical completion truth. `pbos/lifecycle/` owns activation, promotion, and completion transitions. `pbos/constitution/` owns constitutional-volume discovery and certification. The kernel artifact registry assigns one writer to every runtime artifact.

All configured gates are complete. A planner result with no eligible gate is therefore a valid idle state, not a failure. Roadmaps and constitutional documents describe intent but do not authorize runtime work merely by existing.

## Architectural Decision

Planning handoff is a pre-execution recommendation boundary. It evaluates only entries in `pbos/planning/handoff/objectives.json`. The initial registry is intentionally empty because no future objective was authorized by this implementation directive.

The subsystem never creates a gate, changes a gate, activates execution, dispatches an adapter, or mutates lifecycle state.

## Handoff Lifecycle

```text
completed gate truth
  -> registered constitutional objectives
  -> authority and dependency validation
  -> deterministic eligibility evaluation
  -> context-lineage-bound planning evidence
  -> human-governed gate registration and activation
  -> constitutional planner
  -> governed execution
```

## Authority Model

| Responsibility | Canonical authority |
| --- | --- |
| Introduce an objective | Reviewed objective registry |
| Prove originating authority | Existing repository authority reference |
| Evaluate objective eligibility | Planning Handoff evaluator |
| Write handoff evidence | Planning Handoff writer |
| Register or change gates | Existing gate governance process |
| Select an executable gate | Constitutional Planner |
| Change lifecycle state | Lifecycle Governance |
| Dispatch implementation | Execution Engine after authorization |

No responsibility has overlapping writers.

## Objective Contract

Each objective contains deterministic identity, title, description, originating authority, constitutional parent, owner, prerequisite objectives, required artifacts, required evidence, priority, lifecycle state, eligibility criteria, validation requirements, and blocking conditions.

The supported lifecycle is:

```text
PROPOSED -> REGISTERED -> ELIGIBLE -> PLANNED
         -> EXECUTING -> COMPLETED -> ARCHIVED
```

The registry records authorized lifecycle facts. Evaluation does not silently mutate a registered objective to `ELIGIBLE`.

## Lineage Contract

Every handoff binds:

- repository identity and HEAD commit
- repository context identity
- objective content identity
- complete registry identity
- dependency snapshot identity
- required artifact and evidence content identity
- objective lifecycle state

Missing context, unhealthy runtime artifacts, unprovable authority, corrupt history, or incomplete lineage fails closed.

## Runtime Artifacts

`pbos/runtime/planning-handoff.json` is durable and owned by `planning-handoff`. It contains the latest result and append-only historical attempts. `docs/release-evidence/pbos-planning-handoff-report.md` is its human-readable projection.

The report is a governed context output. It is excluded from working-tree context hashing because it is derived from an already-bound context identity; objective sources and the registry remain part of repository content identity.

## Governed Idle

An empty valid registry produces `GOVERNED_IDLE`. This state means no authorized objective exists. PBOS does not infer work from roadmap prose, document names, incomplete volumes, or repository changes.

## Related Links

- [PBOS Architecture](../../ARCHITECTURE.md)
- [Release Process](../../RELEASE_PROCESS.md)
- [PBOS Runtime Isolation](PBOS_RUNTIME_ISOLATION.md)
