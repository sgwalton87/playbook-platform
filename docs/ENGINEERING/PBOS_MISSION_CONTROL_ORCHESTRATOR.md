# PBOS Mission Control Orchestrator

## Purpose

PBOS Mission Control provides one operator command for the governed development lifecycle without creating a new planning, authority, execution, evidence, or lifecycle owner.

## Ownership

Playbook OS Engineering owns the command experience. Canonical PBOS subsystems retain authority for every decision and mutation they already govern.

## Last Updated

July 31, 2026

## Architecture

`npm run pbos:mission` coordinates this sequence:

```text
System status
  -> Constitutional planning
  -> Existing RUN_IT lifecycle
  -> Authority reuse or human approval pause
  -> Provider dispatch and live telemetry
  -> Evidence validation
  -> Evidence-gated milestone advancement
  -> Next canonical planning analysis
```

Mission Control invokes `run` exactly once. The existing RUN_IT command remains the canonical lifecycle coordinator for recovery, execution package creation, authority resolution, assignment, admission, provider dispatch, evidence, and advancement. Mission Control invokes `next` again only after advancement is complete.

## Governance Boundaries

- The constitutional planner alone selects milestones.
- Existing authority validators decide whether approval can be reused.
- Missing or invalid approval pauses the mission and identifies the governed approval command.
- The execution fabric alone admits and dispatches providers.
- Provider telemetry remains owned by `execution-provider-telemetry`.
- Evidence validation alone permits milestone advancement.
- Failed assessment, planning, execution, evidence, or recovery never produces synthetic completion.

## Operator States

Mission Control reports `BLOCKED`, `WAITING_FOR_AUTHORITY`, `READY`, `ACTIVE`, `REVIEW`, `COMPLETE`, or `FAILED`. Each terminal state identifies the current condition and next governed action. Provider events and heartbeats continue to stream from the canonical Codex adapter while Mission Control waits for execution.

## Failure and Recovery

Assessment or planning failure stops before execution. Recovery findings are reported with their canonical command. Provider timeout or failure cannot advance a milestone. Existing validated evidence may be recovered by RUN_IT, preserving duplicate-execution prevention.

## Related Links

- [PBOS Development Orchestration Engine Architecture](./PBOS_DEVELOPMENT_ORCHESTRATION_ENGINE_ARCHITECTURE.md)
- [PBOS Recovery Orchestration Architecture](./PBOS_RECOVERY_ORCHESTRATION_ARCHITECTURE.md)
- [PBOS Engine Admission Architecture](./PBOS_ENGINE_ADMISSION_ARCHITECTURE.md)
