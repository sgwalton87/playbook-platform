# PBOS Advancement Engine Architecture

## Purpose

Evaluate evidence-bound milestone progression without directly editing the master manifest.

## Ownership

Milestone Advancement Authority evaluates transitions. Lifecycle Governance owns application and history.

## Last Updated

July 30, 2026

## Lifecycle

```text
DISCOVERED -> DEFINED -> BLOCKED -> READY -> PLANNED
           -> AUTHORIZED -> IN_PROGRESS -> VALIDATING -> COMPLETE -> ARCHIVED
```

Only adjacent governed transitions are permitted. `READY -> COMPLETE` fails.

## Evidence

Every request binds manifest, context, package, authorization, execution, validation, completion, requester, and timestamp identities. Completion requires successful execution, passing validation, and completion evidence.

An approved decision produces a transition digest, not a manifest edit. Applying that transition remains a future lifecycle-owned persistence operation.

## Related Documents

- [Authority Ledger](./PBOS_AUTHORITY_LEDGER_ARCHITECTURE.md)
- [Autonomous Cycle](./PBOS_AUTONOMOUS_CYCLE_ARCHITECTURE.md)
