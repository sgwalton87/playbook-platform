# PBOS Execution Admission Architecture

## Purpose

Define the final checkpoint before an execution agent may act.

## Ownership

PBOS Agent Execution Admission owns the admission decision. It grants no planning, approval, lifecycle, or certification authority.

## Last Updated

July 30, 2026

## Required Correlation

Admission requires:

- trusted build context;
- immutable execution package and certification digest;
- valid unexpired approval bound to package and context;
- registered agent;
- governed assignment bound to package, context, approval, and agent;
- required capability match;
- disjoint allowed and prohibited scope.

Each identity is preserved in `ExecutionAdmissionEvidence`. Any missing or mismatched value produces a rejected decision.

## Failure Behavior

Missing context, approval, package certification, agent, assignment, capability, scope, or unexpired authority blocks execution. No default agent or inferred approval is permitted.

## Related Documents

- [Execution Lifecycle](./PBOS_EXECUTION_LIFECYCLE_ARCHITECTURE.md)
- [Agent Permission Architecture](./PBOS_AGENT_PERMISSION_ARCHITECTURE.md)
