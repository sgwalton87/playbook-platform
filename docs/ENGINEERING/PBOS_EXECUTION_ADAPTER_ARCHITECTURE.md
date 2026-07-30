# PBOS Execution Adapter Architecture

## Purpose

Define how approved tasks are delegated to implementation providers without transferring PBOS authority.

## Ownership

`AgentExecutor` owns assignment enforcement. Adapters own provider-specific task delivery only.

## Last Updated

July 30, 2026

## Adapter Contract

Adapters receive an approved `ExecutionTask` and return execution identity, agent identity, status, artifact inventory, validation results, evidence references, and timestamps.

`CodexExecutionAdapter` delegates only this contract. It receives no planner, approval writer, manifest writer, Kernel policy, or certification capability.

## Result Validation

The executor rejects unassigned tasks, identity mismatch, artifacts outside allowed scope, artifacts inside prohibited scope, and missing evidence. Results are content-addressed only after validation.

## Existing Runtime Integration

The adapter framework complements, rather than replaces, `IsolatedImplementationRunner` and the Kernel runtime. Production dispatch requires their existing authorization and admission checks.

## Related Documents

- [Agent Permission Architecture](./PBOS_AGENT_PERMISSION_ARCHITECTURE.md)
- [First Governed Build](./PBOS_FIRST_GOVERNED_PRODUCT_BUILD_ARCHITECTURE.md)
