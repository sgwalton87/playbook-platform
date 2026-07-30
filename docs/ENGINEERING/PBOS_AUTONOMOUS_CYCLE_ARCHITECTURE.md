# PBOS Autonomous Cycle Architecture

## Purpose

Define how PBOS coordinates one complete governed construction cycle.

## Ownership

The cycle coordinator orchestrates; it owns no underlying authority.

## Last Updated

July 30, 2026

## Sequence

```text
OBSERVE -> ANALYZE -> RECOMMEND -> PACKAGE -> AUTHORIZE
        -> EXECUTE -> VALIDATE -> DOCUMENT -> ADVANCE -> NEXT
```

The cycle may proceed only while every preceding identity remains valid. Package changes invalidate approval. Context changes invalidate admission. Failed validation blocks completion. Advancement produces a request and requires lifecycle application.

## Current Execution

The live cycle completed observation and analysis, then stopped because repository context is stale. `pbos:approve` and `pbos:advance` also fail closed. `pbos:history` exposes existing Kernel runtime history without rewriting it.

## Related Documents

- [Lifecycle Control Plane](./PBOS_AUTONOMOUS_LIFECYCLE_CONTROL_PLANE_ARCHITECTURE.md)
- [Advancement Engine](./PBOS_ADVANCEMENT_ENGINE_ARCHITECTURE.md)
