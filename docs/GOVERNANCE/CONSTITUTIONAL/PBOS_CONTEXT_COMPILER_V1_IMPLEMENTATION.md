# PBOS Context Compiler V1 Implementation

## Purpose

Records the implemented PBOS-ENGINE-CONTEXT-001 foundation and its governance boundaries.

## Ownership

PBOS / Constitutional Governance

## Last Updated

July 26, 2026

## Related Documents

- [PBOS Context Compiler Specification](./PBOS_CONTEXT_COMPILER_SPECIFICATION.md)
- [PPS Governance Approval Queue](./PPS_GOVERNANCE_APPROVAL_QUEUE.json)
- [PPS Governance Handoff](./PPS_GOVERNANCE_HANDOFF.md)

## Implemented Scope

V1 provides typed constitutional-source, governance-decision, canonical-registry, rule, constraint, provenance, failure, and Runtime Context contracts under `pbos/context/`.

The compiler:

- Accepts only verified canonical sources represented in a validated registry.
- Verifies source content against its SHA-256 digest.
- Requires exact registry agreement for identifier, location, owner, and version.
- Resolves every declared dependency before compilation.
- Rejects pending, rejected, or revoked governance decisions.
- Sorts inputs and uses canonical serialization for deterministic digests.
- Emits document inventory, validated rules, constraints, dependency edges, exclusion records, and source, registry, governance, and context digests.
- Attaches source document, identifier, version, digest, compilation timestamp, and validation state to every compiled rule.

## Fail-Closed Boundaries

Compilation throws structured failures for missing authority, unresolved dependencies, invalid digests, pending governance, conflicting authority, and invalid sources. It does not read or modify PPS files directly, apply governance decisions, infer replacement authority, or compile the repository's currently unresolved constitutional graph.

## Determinism Boundary

The caller supplies the compilation timestamp as an explicit input. Identical inputs, including that timestamp, produce identical Runtime Context and context digests. Ambient time and filesystem ordering do not enter compilation.

## Current Limitation

V1 is a domain foundation, not a repository source loader or production context artifact. The current PPS corpus remains blocked by constitutional verification, so no repository-wide Runtime Context is emitted or certified.
