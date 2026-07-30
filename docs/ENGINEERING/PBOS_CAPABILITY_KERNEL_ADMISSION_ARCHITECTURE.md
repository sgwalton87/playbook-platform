# PBOS Capability Kernel Admission Architecture

**Purpose:** Define the canonical, fail-closed boundary through which governed capabilities may become eligible for PBOS engine admission.

**Owner:** Playbook OS Engineering

**Last Updated:** July 29, 2026

**Related Documents:** [PBOS Capability Governance Architecture](./PBOS_CAPABILITY_GOVERNANCE_ARCHITECTURE.md), [PBOS Capability Registry Architecture](./PBOS_CAPABILITY_REGISTRY_ARCHITECTURE.md), [PBOS Entitlement Authority Model](./PBOS_ENTITLEMENT_AUTHORITY_MODEL.md), [PBOS Engine Admission Architecture](./PBOS_ENGINE_ADMISSION_ARCHITECTURE.md)

## Architecture Decision

PBOS establishes one Kernel-owned capability admission gate. The Kernel consumes capability governance through typed truth-source and evidence-sink ports; it does not import or assume ownership of the durable capability subsystem.

Capability Governance supplies current, digest-bound facts. The Kernel alone evaluates those facts and issues `ADMITTED`, `DENIED`, `SUSPENDED`, or `REQUIRES_REVIEW`.

Admission establishes eligibility only. It does not activate a capability, invoke an engine, authorize execution, dispatch work, validate an outcome, or issue certification.

## Authority Chain

```text
Subject
  -> Identity
  -> Authority
  -> Entitlement
  -> Capability
  -> Kernel Capability Admission
  -> Kernel Engine Admission
  -> Future Governed Execution Lifecycle
```

Each link is bound by immutable identity and organizational scope. A missing, stale, mismatched, revoked, or ambiguous link fails closed.

Revenue, subscription, partnership, or institutional status may cause an entitlement authority to issue eligibility. None of those conditions creates Kernel execution authority.

## Admission Contracts

`CapabilityAdmissionRequest` binds:

- Request, subject, tenant, and organization identity
- Capability and owning engine identity
- Requested action
- Entitlement, policy, and authority references
- Request time
- SHA-256 content identity

`CapabilityAdmissionDecision` binds:

- Decision and request identity
- Governed outcome
- Fixed Kernel authority
- Complete deterministic findings
- Evidence reference
- Timestamp and digest

The decision authority is the non-configurable `PBOS-KERNEL-CAPABILITY-ADMISSION` authority. Callers and engines cannot substitute another decision owner.

## Truth Resolution

The durable capability adapter resolves one point-in-time proof containing:

- Control-plane revision and state digest
- Capability projection, lifecycle, owner, engine, dependencies, evidence, and security requirements
- Entitlement identity, status, scope, expiry, issuer, policy, and evidence
- Issuer trust, scope, and capability authority
- Policy result and supporting evidence
- Active capability, entitlement, issuer, or organization revocations
- Proof content digest

The proof is a Kernel input, not a recommendation that the Kernel must accept.

## Validation Model

The Kernel validates:

- Request identity and content digest
- Subject identity, organization, tenant, validity period, and exact request binding
- Authority identity, subject, capability, scope, operation, and validity period
- Capability identity, owner engine, lifecycle, dependencies, evidence, and security requirements
- Entitlement identity, subject, capability, organization, tenant, status, expiry, policy, and evidence
- Issuer identity, trust, organization, tenant, and capability scope
- Policy identity, outcome, and evidence
- Active revocations
- Control-plane and proof identity

Unknown capabilities, expired or revoked entitlements, cross-tenant use, invalid engines, absent evidence, and missing security requirements cannot be admitted.

## Engine Admission Handoff

`KernelCapabilityEngineAdmissionHandoff` enforces ordering:

```text
Capability Admission
  -> only when ADMITTED
Engine Identity Match
  -> Existing Kernel Engine Admission Authority
  -> Execution Eligibility
```

A rejected capability request never reaches engine admission. An admitted capability still fails if the engine is invalid or its independent engine admission requirements are not satisfied.

The existing `KernelEngineAdmissionAuthority` remains the sole engine selector. No engine may self-invoke, self-authorize, or self-certify.

## Evidence and Replay

Every attempt creates:

- A deterministic Kernel decision
- A digest-bound capability admission evidence artifact
- Source evidence identities
- Capability, entitlement, policy, organization, tenant, engine, and control-plane bindings
- A canonical serialized decision-and-evidence payload
- A payload digest
- An immutable activation-decision projection and append-only control-plane event

Evidence persistence uses the revision observed during validation. If governance truth changes before persistence, including concurrent revocation, the optimistic revision fence rejects the attempt and returns no admission result.

This preserves replayability: an auditor can verify the original request digest, proof revision, decision digest, evidence payload digest, and event-chain identity.

## Security Boundaries

The boundary prevents:

- Cross-tenant and cross-organization entitlement use
- Capability-to-engine substitution
- Hidden capability or action escalation
- Expired identity, authority, entitlement, or issuer use
- Revocation races
- Engine-owned admission, authorization, or certification
- Evidence omission
- Mutation of durable truth through a stale writer

Issuer credential authentication and distributed consensus remain external prerequisites for enterprise multi-region operation.

## Observability

Admission results persist in the canonical capability control-plane history. Operators can correlate request, decision, evidence, subject, capability, entitlement, engine, policy, revision, and Kernel authority.

No runtime files are written by merely constructing the gate. Durable writes occur only when an admission attempt is explicitly evaluated.

## Failure Behavior

Validation failures produce governed non-admission decisions and evidence. Persistence or revision failures throw and produce no successful handoff. Invalid evidence receipts throw. Engine identity mismatch throws before engine admission.

The boundary does not catch and ignore trust failures, synthesize missing facts, or convert incomplete evidence into approval.

## Implementation Boundary

This milestone implements admission contracts, validation, durable evidence integration, and ordered engine handoff.

It does not implement:

- Capability activation
- Domain engine behavior
- Execution dispatch
- Billing or subscriptions
- Marketplace behavior
- Identity credential verification
- Certification issuance
- Distributed control-plane consensus

## Future Evolution

Before production engine activation, PBOS requires identity-backed issuer credentials, transactional distributed persistence, operational recovery evidence, and an execution-lifecycle binding that consumes both current capability and engine admission without weakening either authority.

