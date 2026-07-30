# PBOS Autonomous Build Cycle Architecture

## Purpose

Define one governed development cycle without granting PBOS self-approval or self-certification.

## Ownership

PBOS orchestration coordinates the cycle. Existing authorities own every state-changing transition.

## Last Updated

July 30, 2026

## Cycle

```text
OBSERVE -> ANALYZE -> RECOMMEND -> PLAN -> PACKAGE
        -> HUMAN AUTHORIZE -> KERNEL ADMIT -> EXECUTE
        -> VALIDATE -> CERTIFY -> LIFECYCLE ADVANCE
```

## Admission Rules

The cycle stops when repository context is invalid, a dependency is unresolved, package identity changes, authorization is absent, a file is outside declared scope, validation fails, or evidence cannot be bound.

GREEN work may be automated only under an existing policy. YELLOW requires human approval. RED requires explicit human approval and separation of duties.

## Package Contract

Existing governed packages include objective, context, dependencies, required files and outputs, implementation and security requirements, validation and documentation requirements, completion criteria, recommendation digest, timestamp, and package digest. Kernel plans retain rollback and evidence references.

## Completion

Execution completion does not itself establish milestone completion. Validation and independent certification must succeed before Lifecycle Governance may request a manifest transition. The cycle coordinator cannot write the manifest.

## Current Result

The first invocation completes `OBSERVE` and `ANALYZE`, then blocks because repository context is stale. No approval request, execution, evidence claim, or state change is created.

## Related Documents

- [Master Manifest Architecture](./PBOS_MASTER_MANIFEST_ARCHITECTURE.md)
- [Governed Autonomous Execution](./PBOS_GOVERNED_AUTONOMOUS_EXECUTION.md)
