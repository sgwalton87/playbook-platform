# PBOS Agent Permission Architecture

## Purpose

Restrict execution agents to explicitly approved operations and files.

## Ownership

PBOS Agent Permission Policy owns permission evaluation. Human and Kernel authorities define scope.

## Last Updated

July 30, 2026

## Allowed Permissions

- `READ_APPROVED_SCOPE`
- `CREATE_APPROVED_FILES`
- `MODIFY_APPROVED_FILES`
- `RUN_TESTS`
- `RUN_VALIDATION`

Anything outside this vocabulary is rejected. Governance and certification capabilities are always forbidden.

## Assignment Boundary

An assignment requires trusted context, an approved authority record, an immutable execution package, a known agent, matching capabilities, non-empty allowed scope, disjoint prohibited scope, validation requirements, and evidence requirements.

## Related Documents

- [Execution Agent Architecture](./PBOS_EXECUTION_AGENT_ARCHITECTURE.md)
- [Execution Adapter Architecture](./PBOS_EXECUTION_ADAPTER_ARCHITECTURE.md)
