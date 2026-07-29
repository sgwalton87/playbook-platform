# PBOS Constitutional Execution Kernel

## Purpose

This document defines the reference implementation of the PBOS constitutional
decision kernel. The kernel converts immutable repository, runtime,
constitutional, and objective-registry inputs into one deterministic decision,
an execution plan, independent certification, a report, and a proposed state
transition.

## Ownership

Playbook OS Engineering owns the implementation. PBOS constitutional governance
owns the decision policy. Artifact owners and lifecycle state writers retain
exclusive mutation authority.

## Last Updated

July 29, 2026

## Related Documents

- [Engineering Constitution](../../CODEX.md)
- [Architecture Handbook](../ARCHITECTURE.md)
- [PBOS Runtime Isolation](./PBOS_RUNTIME_ISOLATION.md)
- [PBOS Objective Traceability Model](./PBOS_OBJECTIVE_REGISTRY/PBOS_OBJECTIVE_TRACEABILITY_MODEL.md)

## Authority Model

The constitutional planner remains the sole repository gate-selection
authority. The repository adapter projects that planner's gates, completed
history, eligibility results, release state, validation state, and repository
context into the technology-neutral kernel contract. The kernel applies the
published ordering and independently certifies the result. It does not create
gates, dependencies, evidence, approvals, or lifecycle facts.

The kernel never writes runtime state. Its final output is an immutable
`StateTransitionRequest`. A registered state writer must validate and apply that
request through the existing lifecycle boundary. Certification is necessary but
does not itself authorize execution or mutate state.

## Execution Pipeline

```text
Repository Context
  -> Repository Validation
  -> Constitution Validation
  -> Objective Registry
  -> Objective State
  -> Dependency Graph
  -> Eligibility
  -> Priority
  -> Risk
  -> Decision
  -> Execution Plan
  -> Certification
  -> Reporting
  -> State Transition Request
```

A successful evaluation records all fourteen stages in this order. A failed
validation remains visible in its stage event and makes certification fail
closed. Later outputs cannot convert a failed prerequisite into authority.

## Determinism Contract

`KernelInput` includes an explicit `observedAt` value and immutable content
digests. The kernel does not read the clock, filesystem, network, environment,
or random source. Identifiers are derived from canonical SHA-256 input
identities. Events use deterministic zero-duration reference measurements.
Given byte-equivalent semantic input, the decision, plan, certification,
transition request, JSON report, Markdown report, and event history are
byte-identical.

Repository observation is an adapter responsibility. The adapter uses the
captured repository-context timestamp instead of generating a new timestamp.

## Objective State Projection

The execution-kernel projection recognizes:

`UNKNOWN`, `PLANNED`, `READY`, `BLOCKED`, `IN_PROGRESS`, `PAUSED`, `DEFERRED`,
`COMPLETED`, `CANCELLED`, and `ARCHIVED`.

Only `READY` is eligible. This projection does not replace the canonical
Objective Registry lifecycle or grant state-mutation authority. It represents
the objective's execution eligibility at one immutable observation.

## Dependency Integrity

The graph validator performs indexed, linear graph construction and validates:

- duplicate and invalid objective identifiers;
- missing roots, parents, children, and dependencies;
- inconsistent parent-child references;
- dependency cycles;
- objectives orphaned from declared roots;
- objectives unreachable through the ownership hierarchy.

Any finding invalidates the complete graph and blocks every objective. The
topological result is stable because identifiers and adjacency lists are
ordered deterministically.

## Eligibility And Priority

An objective is eligible only when it is `READY`, the graph is valid, its
authority and validation contract exist, every dependency is `COMPLETED`, every
required approval is present, and no blocker remains.

Priority is explicit:

```text
score =
  constitutional * 0.30 +
  strategic      * 0.25 +
  engineering    * 0.20 +
  business       * 0.15 +
  operational    * 0.10
```

Weights must total 100. Selection order is constitutional order ascending,
weighted priority descending, risk ascending, critical-path membership first,
effort ascending, then objective identifier lexically. This preserves
constitutional sequence and provides a stable final tie break.

## Execution Plan Contract

The plan binds objective identity, authority, dependencies, validations,
artifact evidence, approvals, outputs, certification requirements, rollback,
risk, effort, success criteria, and failure criteria. Its identifier and digest
derive from the registry and decision identities. Missing selected-artifact
identity causes independent certification to reject the plan.

## Independent Certification

The certifier validates repository and runtime context, constitution and
registry identity, registry content digest, graph integrity, plan-to-decision
identity, and selected evidence identity. It then independently replays
eligibility, priority, and decision selection and compares decision digests.
Certification produces evidence and a digest but never changes lifecycle state.

## Event And Reporting Contract

Every stage event records:

- timestamp;
- correlation, execution, and objective identifiers;
- stage;
- input and output digests;
- validator identity;
- deterministic duration;
- pass or fail status;
- evidence digests.

Reports are available as canonical machine-readable JSON and stable
human-readable Markdown. Historical retention is delegated to registered
artifact owners; the kernel never overwrites history.

## Integration

The commands `pbos:next`, `pbos:plan`, `pbos:report`, and `pbos:certify` invoke
the same repository kernel. `pbos:status` consumes that kernel alongside
operational health. `pbos:execute` requires a certified plan and transition
request before entering the existing durable authorization and adapter-dispatch
lifecycle.

The existing execution authorization remains an independent control. Kernel
certification cannot replace an `AUTHORIZED` execution artifact.

## Failure And Recovery

Unknown identity, invalid context, invalid graph, inconsistent digest, missing
evidence, invalid priority configuration, or replay disagreement rejects
certification. No transition request is issued. Operators correct or
canonically regenerate the owning artifact, refresh repository context through
its owner, and rerun the same input. Previous evidence is retained.

## Performance Model

Graph storage and traversal are `O(V + E)` with stable boundary sorting.
Eligibility, priority, risk projection, and plan construction are linear.
Selection sorts only eligible objectives, `O(R log R)`, where `R <= V`.
Implementation avoids nested objective scans in graph validation. Performance
qualification should exercise 100, 1,000, 10,000, and 100,000 objective
registries and record runtime, peak memory, graph findings, and output digest.

## Constitutional Guarantees

- The constitutional planner remains the single repository selection authority.
- The kernel is deterministic and explainable.
- No missing fact is inferred.
- Invalid inputs fail closed.
- State mutation remains exclusive to governed writers.
- Certification is independently replayed.
- Plans and reports are content-addressed.
- History and rollback requirements remain explicit.
