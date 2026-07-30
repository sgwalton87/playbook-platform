# PBOS Autonomous Build Orchestrator Discovery

## Purpose

Identify existing PBOS authority before extending autonomous product construction.

## Ownership

Playbook OS Engineering.

## Last Updated

July 30, 2026

## Decision

PBOS already contains the required control-plane capabilities. The build orchestrator therefore extends the existing orchestration composition root and Constitutional Execution Kernel. It does not create a second planner, authorization service, execution runtime, or lifecycle writer.

## Authority Inventory

| Concern | Canonical implementation | Authority |
|---|---|---|
| Repository truth | `pbos/context/**` | Context Authority |
| Constitutional gate planning | `pbos/planner/**` | Constitutional Planner |
| Objective selection | `pbos/kernel/execution/**` | PBOS Kernel |
| System intelligence | `pbos/orchestration/intelligence/**` | Observation only |
| Dependency assessment | `pbos/orchestration/dependency-engine/**` | Kernel-derived assessment |
| Recommendation | `pbos/orchestration/recommendation/**` | Kernel decision projection |
| Plan governance | `pbos/orchestration/planning/**` | Governed recommendation projection |
| Package generation | `pbos/orchestration/prompt-generator/**` | Package preparation only |
| Product package compilation | `pbos/product-factory/**` | Deterministic specification compiler |
| Human approval | `pbos/orchestration/authorization/**` | Human Authorization Gateway |
| Execution admission | `pbos/orchestration/execution-runtime/**` | Kernel admission |
| Execution | `pbos/runtime/kernel-runtime.ts` | Kernel runtime |
| Lifecycle mutation | `pbos/lifecycle/**` | Lifecycle Governance |
| Certification | Kernel and domain certification authorities | Independent from execution |
| Command dispatch | `pbos/commands/kernel-command-bus.ts` | Single command bus |

## Duplication Findings

The requested `pbos/build-intelligence`, `pbos/planning/next-engine`, and `pbos/autonomous-loop` names would duplicate operational capabilities already present under `pbos/orchestration`. They are not introduced as competing systems.

The new `pbos/manifests` subsystem owns only build-roadmap declaration, parsing, validation, and identity. It does not select, authorize, execute, certify, or mutate milestone state.

## Canonical Flow

```text
Repository Context + Gates + Master Build Manifest
                    |
                    v
        Kernel Objective Registry
                    |
                    v
 Constitutional Execution Kernel
                    |
                    v
 System Intelligence and Governed Recommendation
                    |
                    v
     Deterministic Execution Package
                    |
                    v
      Human Authorization Gateway
                    |
                    v
           Kernel Admission
                    |
                    v
      Governed Execution and Validation
```

## Constraints Preserved

- The Kernel remains the sole selector.
- Manifest status is declarative input, not runtime truth.
- Unknown dependencies reject manifest loading.
- Invalid repository context blocks selection.
- Package generation cannot authorize execution.
- Human approval cannot certify completion.
- No command directly rewrites the manifest.

## Related Documents

- [Development Orchestration Engine](./PBOS_DEVELOPMENT_ORCHESTRATION_ENGINE_ARCHITECTURE.md)
- [Governed Autonomous Execution](./PBOS_GOVERNED_AUTONOMOUS_EXECUTION.md)
