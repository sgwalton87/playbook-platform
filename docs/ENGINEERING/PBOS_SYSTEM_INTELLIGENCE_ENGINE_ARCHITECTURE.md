# PBOS System Intelligence Engine Architecture

## Purpose

Define deterministic, read-only assessment of repository, architecture, capabilities, engines, governance, lifecycle, documentation, and validation state.

## Authority

System Intelligence observes evidence produced by canonical owners. It does not select gates, mutate lifecycle state, refresh context, certify outcomes, or execute work.

## Snapshot Contract

Every snapshot contains identity, timestamp, source references, digest, confidence, validation status, and findings. `PBOSSystemAssessment` consolidates current maturity, completed and incomplete domains, blocked dependencies, risks, recommended focus, and evidence references.

## Determinism

Identical Kernel input, constitutional registry, runtime state, and observation timestamp produce identical snapshots and assessment digests. Lists used for evidence and findings are normalized before digest generation.

## Failure Behavior

Missing repository context, invalid runtime context, absent constitutional identity, or rejected Kernel certification produces a blocked or structural assessment. Unknown evidence is never inferred as valid.

## Integration

The Kernel remains the execution and constitutional selection authority. System Intelligence supplies explainable evidence to governed planning and status reporting.
