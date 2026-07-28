# PBOS-PLANNER-001 Constitutional Planning Engine

## Purpose

Certify deterministic, fail-closed constitutional gate planning.

## Ownership

Playbook OS Engineering

## Last Updated

July 28, 2026

## Related Links

- [PBOS architecture](../ARCHITECTURE.md#pbos-governed-execution)
- [PBOS runtime architecture](../../pbos/README.md#runtime-architecture)
- [Release process](../RELEASE_PROCESS.md)

## Architecture

```text
Constitutional gate metadata
            |
            v
Strict schema loader -> Dependency graph integrity
                              |
Repository context ----------+
Runtime validation -----------+-> Gate eligibility
Release state ---------------+        |
Required artifacts ----------+        v
Blocking conditions ----------------> Deterministic selector
                                           |
                                           v
                                  One gate or no-gate reason
                                           |
                              +------------+-------------+
                              v                          v
                       pbos next report           pbos status health
```

## Selection Contract

Every gate declares its identifier, description, dependencies, produced and
required artifacts, blocking conditions, completion state, priority, and
lifecycle stage. Missing or malformed metadata rejects the corpus.

Eligibility requires complete dependencies, valid repository context, existing
required artifacts, an executable lifecycle state, a release state that permits
execution, a passing gate-matched validation artifact, an acyclic dependency
graph, and no declared blocking condition.

Eligible gates are ordered by ascending lifecycle stage, descending priority,
then ascending canonical identifier. The first item is the only recommendation.
When none qualify, every gate-specific blocker is reported.

## Runtime Evidence

`pbos/runtime/constitutional-planning.json` records graph statistics, completed
and blocked gates, validation identity, selection reasoning, deliverables, and
the one recommended gate or a deterministic no-gate result.

## Safety Properties

- Unknown gates and dependencies are never invented.
- Dependency cycles and missing dependency nodes fail closed.
- Repository context and release state cannot be bypassed.
- Validation for one gate cannot authorize another gate.
- Existing authorization and execution controls remain downstream of planning.

## Authority Consolidation

`planConstitutionalGate` is the only function authorized to select a gate.
Engine rule evaluation consumes its report and cannot select independently.
The planner command, planning refresh, `pbos next`, and `pbos status` all
delegate to this boundary. Both runtime planning artifacts are emitted from the
same decision.

Completed gate history is derived only from gate metadata where `status` is
`complete` and `completion_state` is `satisfied`. Engine state no longer stores
a duplicate completion list.

Required artifacts are checked for file presence, readability, non-empty
content, known runtime schema, permitted gate identity, declared content or
snapshot identity, and timestamp freshness where the artifact provides a
timestamp.

Repository context identity includes the repository root, configured remote,
HEAD commit, tracked binary diff, and SHA-256 identities for untracked file
content. A content change therefore invalidates context even when Git porcelain
classification is unchanged.
