# PBOS Entitlement Engine Implementation

**Purpose:** Document the deterministic entitlement decision engine that evaluates capability eligibility without executing capabilities or replacing Kernel authority.

**Owner:** Playbook OS Engineering

**Last Updated:** July 29, 2026

**Related Documents:** [PBOS Capability Governance Architecture](./PBOS_CAPABILITY_GOVERNANCE_ARCHITECTURE.md), [PBOS Engine Operating Model](./PBOS_ENGINE_OPERATING_MODEL.md)

## Implementation Decision

The Entitlement Engine is implemented as an isolated PBOS governance module.

It consumes existing Kernel identity, authority, and engine-admission contracts. It returns a content-bound `CapabilityActivationDecision`.

It does not:

- Execute a capability
- Issue authorization
- Admit an engine
- Certify a subject
- Mutate PBOS runtime truth
- Create production entitlements
- Implement billing

## Components

### Capability Registry

Stores defensive copies of validated, digest-bound capability definitions. Registration requires a recognized independent authority and a committed lifecycle state.

### Entitlement Registry

Stores defensive copies of validated entitlement records. Registration requires a recognized grant authority and rejects self-granted records.

### Capability Policy Registry

Stores validated, digest-bound policy definitions. Duplicate policy identities are rejected.

### Policy Evaluation

Evaluation checks:

- Policy identity and capability digest
- Beneficiary type
- Entitlement source
- Effective time and expiration
- Required permissions
- Required evidence
- Current policy status

### Activation Decision Service

`EntitlementEngine.evaluate` returns:

- `ALLOW`
- `DENY`
- `SUSPEND`
- `EXPIRED`
- `REQUIRES_REVIEW`

Only exact, current, single-entitlement, policy-compliant, tenant-matched, authority-backed, engine-admitted requests can return `ALLOW`.

`ALLOW` remains advisory. The Kernel must independently validate the governed action and current engine admission before execution.

### Evidence Recorder

The instance-scoped evidence recorder creates immutable, digest-bound decision evidence and rejects duplicate evidence identities.

It is not a durable evidence store.

## Runtime Flow

```text
Capability Request
  -> Identity Validation
  -> Capability Lookup
  -> Entitlement Lookup
  -> Organization and Tenant Match
  -> Entitlement Time and Status
  -> Policy Evaluation
  -> Kernel Authority Envelope Validation
  -> Engine Admission Decision Validation
  -> Evidence Availability
  -> Advisory Activation Decision
  -> Decision Evidence
  -> Future Kernel Governed Action
```

## Identity And Scope Binding

The decision binds:

- Request
- Actor and subject
- Capability definition digest
- Entitlement record digest
- Organization and tenant
- Policy identity
- Authority scope
- Engine admission decision digest
- Evidence identifiers
- Evaluation time

Cross-tenant and cross-organization records are denied even when the capability and subject identifiers otherwise match.

## Failure Semantics

- Missing entitlement: `DENY`
- Expired entitlement: `EXPIRED`
- Suspended capability or entitlement: `SUSPEND`
- Invalid authority: `DENY`
- Invalid policy: `DENY`
- Missing evidence: `REQUIRES_REVIEW`
- Multiple active entitlements: `REQUIRES_REVIEW`
- Missing or rejected engine admission: `DENY`
- Unknown capability: `DENY`

Unknown state never becomes `ALLOW`.

## Security Boundaries

The implementation prevents:

- Self-registration
- Self-granted entitlement
- Unrecognized issuers
- Cross-tenant entitlement use
- Expired access
- Policy bypass
- Evidence omission
- Engine admission bypass
- Capability definition substitution
- Entitlement substitution
- Mutable registry references

Authentication, durable authorization issuance, certification issuance, signatures, persistence, and distributed consistency remain owned elsewhere.

## Testing

Tests prove:

- Valid entitlement allows eligibility
- Missing entitlement denies
- Expired entitlement expires
- Cross-tenant entitlement denies
- Invalid authority denies
- Suspended capability suspends
- Invalid policy denies
- Missing evidence requires review
- Self-granted and unauthorized records reject
- Decision evidence is immutable

## Operational Boundary

All registries are instance-scoped and process-local to preserve test isolation and avoid creating competing runtime truth.

Durable capability, entitlement, policy, and evidence history requires a separately governed persistence authority.
