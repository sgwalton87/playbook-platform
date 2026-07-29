---
id: PBOS-LIFECYCLE-GOVERNANCE-001-ADR
title: PBOS Lifecycle Governance Architecture Decision
status: Accepted
classification: Architecture Decision
owner: PBOS Engineering
last_updated: 2026-07-29
related:
  - docs/PPS/08_PBOS_ENGINE/PPS-803_COMMAND_SYSTEM.md
  - docs/release-evidence/pbos-context-lifecycle.md
---

# PBOS Lifecycle Governance Architecture Decision

## Decision

Select Option B: PBOS lacks a reusable completion-evidence evaluator and end-to-end lifecycle governance orchestrator.

Existing authorities remain valid and are retained:

- `transitionGate` is the sole gate metadata transition writer.
- `promoteGate` is the sole engineering gate promotion authority.
- `completePromotedGate` is the sole completion authority.
- `planConstitutionalGate` is the sole gate selection authority.
- Runtime artifact owners remain registered in the PBOS kernel.

The new `lifecycle-governance` layer does not replace those authorities. It validates completion evidence and orders their invocation.

## Root Cause

PBOS could validate releases, promote gates, complete gates, and plan future work, but those operations required independently prepared runtime state. Completion accepted a passing release contract and promotion artifact without evaluating whether explicit evidence covered every gate definition-of-done requirement. Promotion and completion artifacts also represented only the latest result rather than durable histories.

This left a gap between implementation evidence and lifecycle truth. A completed implementation could remain `in_progress`, while manually aligning release artifacts would have bypassed constitutional ownership.

## Governed Model

The reusable workflow is:

Evidence manifest -> Evidence evaluation -> Declared validation adapters -> Release contract -> Promotion -> Completion -> Artifact reconciliation -> Context refresh -> Constitutional planning.

Each evidence manifest binds the gate identity and digest, validator identity, capture time, evidence paths and SHA-256 digests, and an exact claim for every definition-of-done requirement.

## Failure Semantics

Missing manifests, missing claims, stale evidence, digest mismatches, unsupported validation requirements, non-passing validation, promotion denial, invalid transitions, duplicate completion, invalid history, and incomplete recovery fail closed.

No file is considered proof solely because it exists. No lifecycle state is inferred or edited outside the canonical transition writer.

## History

Promotion, completion, and lifecycle governance artifacts preserve previous attempts. Each transition records previous and new state, timestamp, authority, evidence references, and content identity.
