# PBOS Execution Agent Architecture

## Purpose

Define the governed workforce that performs approved PBOS tasks without acquiring decision authority.

## Ownership

PBOS owns selection, authorization, lifecycle, and certification. Agents own only assigned execution and evidence return.

## Last Updated

July 30, 2026

## Registry

The registry supports code generation, test execution, documentation, design generation, validation, and analysis agents. Every record binds identifier, provider, version, type, capabilities, permissions, status, trust level, and timestamps.

All default agents are `RESTRICTED`. Registration is immutable and duplicate identifiers are rejected.

## Prohibited Authority

Agents cannot select milestones, approve execution, modify the manifest, change Kernel policy, issue certification, or alter authority rules.

## Failure Behavior

Unknown, suspended, revoked, incapable, or insufficiently permissioned agents cannot receive tasks.

## Related Documents

- [Permission Architecture](./PBOS_AGENT_PERMISSION_ARCHITECTURE.md)
- [Discovery](./PBOS_EXECUTION_AGENT_ORCHESTRATION_DISCOVERY.md)
