# PBOS Next Engine Architecture

## Purpose

Define how PBOS answers “what is next?” through one deterministic authority path.

## Ownership

The Constitutional Execution Kernel owns milestone selection. Orchestration owns explanation and package preparation.

## Last Updated

July 30, 2026

## Architecture Decision

There is no independent Next selector. The operator command consumes the Kernel decision projected through `runDevelopmentOrchestration`. This preserves one selection authority across `pbos:next`, `pbos:analyze`, `pbos:recommend`, and `pbos:plan`.

## Decision Inputs

- validated repository context;
- constitutional gates;
- validated master build manifest;
- canonical objective registry;
- dependency graph;
- lifecycle and release state;
- artifact identity;
- validation contracts;
- risk and priority;
- existing approvals.

## Deterministic Order

Eligible objectives are ordered by constitutional order, weighted priority, risk, critical-path position, effort, and stable identifier. The independent Kernel certifier replays the decision. Any input or replay mismatch blocks the result.

## Output

`pbos:next` emits:

- current program and phase;
- selected milestone or `NONE`;
- risk;
- mandatory human-approval statement;
- system assessment;
- governed recommendation;
- package availability.

`pbos:plan` emits an immutable execution package only when context, dependencies, evidence, registry identity, and Kernel certification all pass.

## Human Authority

Recommendation and package preparation do not confer authorization. Approval remains identity-bound to the package digest. Execution requires authorization evidence and Kernel admission. Completion and manifest evolution require separate validation and lifecycle evidence.

## Failure Behavior

Unknown state is blocked. Missing dependencies, artifacts, validation, authority, trusted context, or certification yield no milestone and no package.

## Related Documents

- [Master Build Manifest Architecture](./PBOS_MASTER_BUILD_MANIFEST_ARCHITECTURE.md)
- [Governed Autonomous Execution](./PBOS_GOVERNED_AUTONOMOUS_EXECUTION.md)
