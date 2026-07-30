# PBOS Agent Execution Activation Architecture

## Purpose

Connect admitted agent assignments to the existing governed execution runtime.

## Ownership

The execution lifecycle adapter selects provider adapters only after admission. Agents remain controlled workers.

## Last Updated

July 30, 2026

## Flow

```text
Certified Package + Trusted Context + Human Approval
        -> Governed Assignment -> Admission Evidence
        -> Adapter Selection -> Restricted Execution
        -> Result Validation -> Evidence Bundle
        -> Advancement Evaluation
```

## Codex Boundary

Codex receives the task, approved files and scope, allowed operations, validation requirements, and evidence requirements. It cannot select work, approve execution, modify governance or manifests, alter Kernel rules, advance milestones, or certify itself.

## Operator Surface

`pbos:execute` remains the existing Kernel execution command. `pbos:execution-status` reports package, agent, execution, validation, evidence, and context state without mutation.

## Related Documents

- [Admission Architecture](./PBOS_EXECUTION_ADMISSION_ARCHITECTURE.md)
- [Lifecycle Architecture](./PBOS_EXECUTION_LIFECYCLE_ARCHITECTURE.md)
