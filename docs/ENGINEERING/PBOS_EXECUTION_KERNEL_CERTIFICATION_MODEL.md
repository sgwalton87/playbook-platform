# PBOS Execution Kernel Certification Model

## Purpose

Define how PBOS independently proves that an execution decision was correct for
one immutable repository, objective, dependency, planning, and authorization
state.

## Ownership

The PBOS independent certifier owns certification decisions. The planner owns
recommendations, the repository-context owner owns context, the planning
handoff owns objective lineage, and the authorization owner owns approval.
No subsystem may certify its own output.

## Last Updated

July 29, 2026

## Related Documents

- [PBOS Execution Context Trust Model](./PBOS_EXECUTION_CONTEXT_TRUST_MODEL.md)
- [PBOS Execution Transition Contract](./PBOS_EXECUTION_TRANSITION_CONTRACT.md)
- [PPS-4013 Kernel Certification](../CONSTITUTION/VOLUME_40_PBOS_KERNEL_ARCHITECTURE/PPS-4013_KERNEL_CERTIFICATION.md)
- [PBOS Objective Traceability Model](./PBOS_OBJECTIVE_REGISTRY/PBOS_OBJECTIVE_TRACEABILITY_MODEL.md)

## Certification Question

PBOS proves an execution decision was correct by reconstructing the decision
from independently validated, content-addressed inputs and comparing the replay
result with the proposed decision and plan. Agreement is necessary but not
sufficient: context, authority, evidence, and authorization must also be valid.

## Certification Inputs

### Objective Identity

The selected objective identity binds its identifier, description, lifecycle
projection, constitutional authority, dependencies, blockers, approvals,
validation contracts, evidence, risk, effort, outputs, and completion rules.
Unregistered or identity-less objectives are ineligible.

### Registry Identity

The registry digest binds:

- registry authority and identifier;
- declared roots;
- every objective and its complete governance metadata.

The certifier recomputes this digest. A mismatch is
`REGISTRY_DIGEST_MISMATCH` and blocks planning and transition.

### Repository Context Identity

Certification consumes the repository root, remote, HEAD, branch, working-tree
content digest, validation result, and repository-context artifact identity.
Repository identity is certified by the context owner before kernel input is
constructed.

### Dependency Snapshot Identity

Dependency identity binds every dependency identifier, lifecycle state, and
objective identity at evaluation time. The DAG validator independently checks
duplicates, invalid identifiers, missing roots, parents, children and
dependencies, inconsistent relationships, cycles, orphans, and unreachable
objectives.

### Planning Handoff Identity

The planning handoff record binds:

- repository identity and commit;
- context identity;
- objective identity, or governed idle;
- registry identity;
- dependency snapshot identity;
- evidence identity;
- lifecycle state;
- record identity and immutable history.

A handoff bound to a previous commit or context remains history but cannot be
used as current certification input.

### Authorization Identity

Execution authorization binds:

- authorization record identifier and version;
- gate or objective identifier;
- execution-contract identifier, version, path, and digest;
- work-package identifier, version, path, and digest;
- decision state;
- approver identity, reason, reviewed evidence, and decision timestamp.

Only `AUTHORIZED` passes. `PENDING`, `DENIED`, missing, or identity-mismatched
authorization blocks adapter dispatch. Kernel decision certification cannot
substitute for authorization.

## Certification Process

```text
Validate repository context
  -> validate constitution and registry identity
  -> validate complete dependency graph
  -> replay eligibility
  -> replay weighted priority and deterministic ordering
  -> compare replayed decision digest
  -> validate plan-to-objective identity
  -> validate evidence references and digests
  -> produce certification result
  -> validate durable authorization before dispatch
```

The replay uses the same published deterministic rules but does not trust the
planner's selected output. Identical inputs must produce an identical decision,
plan, event sequence, report, and certification identity.

## Certification Outputs

### Certification Identity

The certification digest binds status, validator identity, decision digest,
plan digest, findings, and evidence identities.

### Evidence Identity

Evidence contains the constitution digest, registry digest, repository-content
digest, dependency snapshot, planning handoff, and applicable authorization
references. Evidence is content-addressed; a path without a digest is invalid.

### Decision Identity

The decision digest binds the selected objective, eligible set, blocked set, and
deterministic rationale.

### Replay Result

Replay records whether independently computed selection identity equals the
proposed decision. Disagreement produces `DECISION_REPLAY_MISMATCH`.

## Failure Behavior

Certification returns `REJECTED` when any required input is absent, stale,
invalid, inconsistent, or cannot be independently reconstructed. A rejected
result:

- creates no state-transition request;
- cannot reach authorization dispatch;
- cannot write an execution artifact;
- marks the failed stage and every subsequent stage `FAIL`;
- preserves diagnostics and evidence identities;
- does not alter prior certification history.

Unexpected errors are not converted into success or observations.

## Immutable Evidence

Certification evidence must be:

- content-addressed;
- bound to a timestamp supplied by the immutable observation;
- correlated by execution and correlation identifiers;
- append-only after certification;
- reproducible from retained inputs;
- attributable to a named validator and artifact owner.

Corrections require a new certification attempt referencing the superseded
attempt. Certified records are never edited.

## Current Certification State

Current kernel certification is legitimately `REJECTED` because repository
context does not match HEAD or working-tree content. The current authorization
artifact is also `PENDING` for historical gate `PBOS-ENGINE-005`. No approved
objective or current execution plan exists. These conditions prove fail-closed
behavior; they are not evidence of a certification defect.

## Minimum Operational Evidence

Operators must be able to retrieve:

- current kernel status and selected objective;
- context validity and context identity;
- decision, plan, and certification digests;
- all failed validation findings;
- pending or rejected transition identity;
- authorization status and immutable references;
- prior decision and certification attempts;
- resulting execution and validation evidence.

Until machine-readable kernel decision and certification history has a
registered durable artifact owner, CLI reports are operational diagnostics and
must not be treated as durable certification history.
