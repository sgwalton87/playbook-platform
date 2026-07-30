# PBOS Execution Agent Orchestration Discovery

## Purpose

Identify existing execution authority before adding a governed agent workforce.

## Ownership

Playbook OS Engineering.

## Last Updated

July 30, 2026

## Decision

PBOS already has agent-action governance, engine admission, human authorization, isolated implementation execution, Kernel runtime execution, evidence lineage, lifecycle advancement, and context activation. A second runtime or selector would duplicate authority.

The missing capability is a restricted workforce registry plus an assignment contract that binds an approved package, trusted context, human authority, agent capability, file scope, validation, and evidence.

## Canonical Flow

```text
Kernel Selection -> Package -> Human Approval -> Task Assignment
                 -> Restricted Agent -> Existing Isolated Runner
                 -> Evidence -> Validation -> Advancement Request
```

## Current Constraint

Repository context is invalid, no certified package exists, and no authority record exists. Assignment and first-build execution must therefore fail closed.

## Related Documents

- [Execution Agent Architecture](./PBOS_EXECUTION_AGENT_ARCHITECTURE.md)
- [Execution Adapter Architecture](./PBOS_EXECUTION_ADAPTER_ARCHITECTURE.md)
