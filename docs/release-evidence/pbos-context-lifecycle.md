---
id: PBOS-CONTEXT-LIFECYCLE-001
title: PBOS Context Lifecycle
status: Implemented
classification: Release Evidence
owner: PBOS Engineering
last_updated: 2026-07-28
related:
  - docs/PPS/08_PBOS_ENGINE/PPS-803_COMMAND_SYSTEM.md
  - docs/release-evidence/pbos-context-001-implementation.md
---

# PBOS Context Lifecycle

## Purpose

Establish repository context synchronization as a governed PBOS lifecycle boundary between repository reality, constitutional planning, execution authorization, and certification evidence.

## Lifecycle

Repository observation produces a content-sensitive snapshot of Git identity, working state, PBOS runtime state, and required artifact identities. Deterministic generation binds that snapshot to a SHA-256 context identity. Certification applies the canonical fail-closed context validator. Only a passing candidate may be persisted with refresh history and a human-readable report.

The resulting command sequence is:

`pbos:context` -> `pbos:next` -> validation -> execution -> verification -> completion -> certification -> promotion.

## Canonical Ownership

- Observation: `pbos/context/observer`
- Deterministic generation: `pbos/context/generator`
- Integrity validation: `pbos/context/validator.ts`
- Candidate certification: `pbos/context/certification`
- Refresh history: `pbos/context/history`
- Human-readable evidence: `pbos/context/reports`
- Public orchestration: `pbos/context/lifecycle.ts`

The root `pbos/context` exports remain the only public context API. Subsystems do not independently write context artifacts.

## Runtime Artifacts

`pbos/runtime/repository-context.json` is the latest authoritative snapshot. `pbos/runtime/context-refresh.json` is the durable refresh history. Both are owned by `repository-context`; writes by any other owner are rejected by the PBOS runtime kernel.

Each refresh record binds the previous identity, new identity, operator reason, triggering validation conditions, timestamp, validator identity, and generation result. Invalid existing history blocks append.

## Fail-Closed Conditions

Refresh is rejected for unknown repository identity, configured remote mismatch, branch or upstream mismatch, missing required artifacts, invalid ownership, stale required artifacts, non-passing runtime validation, conflicting gate references, invalid candidate schema, or partial generation.

Refresh does not alter application code, Supabase code, planning state, authorization, lifecycle state, certification results, or promotion evidence.

## Planning Integration

The constitutional planner validates the stored context against current repository reality on every run. No gate can be selected when context is missing or divergent. Status reports context health, context identity, last refresh time, and whether refresh is required.
