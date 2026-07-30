# PBOS Capability Registry Architecture

**Purpose:** Define the durable authoritative registry, history, consistency, recovery, and observability model for governed PBOS capabilities.

**Owner:** Playbook OS Engineering

**Last Updated:** July 29, 2026

**Related Documents:** [PBOS Capability Governance Architecture](./PBOS_CAPABILITY_GOVERNANCE_ARCHITECTURE.md), [PBOS Entitlement Authority Model](./PBOS_ENTITLEMENT_AUTHORITY_MODEL.md), [PBOS Engine Operating Model](./PBOS_ENGINE_OPERATING_MODEL.md)

## Architecture Decision

PBOS establishes one durable capability control-plane authority backed by an explicit persistence adapter.

```text
Governed Command
  -> Recognized Authority
  -> Contract Validation
  -> Current Projection Validation
  -> Expected Revision
  -> Exclusive Write Lock
  -> Append Record Revision
  -> Append Hash-Chained Event
  -> State Digest
  -> Atomic Durable Replacement
```

The persisted state is not a mutable cache. It is the durable source of capability, entitlement, issuer, revocation, decision, and governance-evidence truth for this implementation boundary.

No state file is created on module import. A caller must explicitly initialize a configured location through the `DurableCapabilityControlPlane`.

## Canonical Records

The control plane stores:

- `CapabilityRegistryRecord`
- `CapabilityLifecycleTransitionRecord`
- `PersistentEntitlementRecord`
- `CapabilityIssuerRecord`
- `CapabilityRevocationRecord`
- `CapabilityActivationDecisionRecord`
- `CapabilityGovernanceEvidenceRecord`
- `CapabilityControlPlaneEvent`

Each governed object has a SHA-256 content digest.

Capability, entitlement, and issuer changes append a new record revision. Prior revisions are never overwritten.

## Capability Registry

A durable capability record identifies:

- Capability
- Name and description
- Owning engine
- Owner identity
- Classification and version
- Dependencies
- Security requirements
- Evidence requirements
- Lifecycle state
- Approval authority
- Creation and update timestamps
- Content digest

Initial registration requires:

- Revision 1
- `PROPOSED` state
- Recognized registration authority
- Matching approval authority
- Available declared dependencies
- Valid digest

Duplicate capability identity is rejected.

## Capability Lifecycle

The persistent lifecycle is:

```text
PROPOSED -> DESIGNED -> APPROVED -> AVAILABLE -> ACTIVATED
AVAILABLE | ACTIVATED -> SUSPENDED | DEPRECATED
SUSPENDED -> AVAILABLE | DEPRECATED | RETIRED
DEPRECATED -> RETIRED
```

Every transition requires an independently recognized authority, exact previous state, reason, evidence, validation, timestamp, transition identity, and digest.

The transition and resulting capability projection are committed atomically in one control-plane revision.

## Persistence Model

The filesystem adapter provides:

- Explicit configured path
- Owner-only file and lock creation mode
- Exclusive lock-file creation
- Expected-revision optimistic concurrency
- Exactly one revision per transaction
- Temporary-file write
- File synchronization
- Atomic rename
- Directory synchronization
- Lock release in `finally`

A pre-existing lock fails closed. The implementation does not guess that a lock is stale or delete it automatically.

## Immutable History

Every mutation appends one hash-chained event containing:

- Sequence
- Event identity and type
- Subject and authority
- Evidence references
- Timestamp
- Payload digest
- Previous event digest
- Event digest

The state digest covers every record and event.

Loading fails when:

- Metadata is invalid
- A required collection is missing
- A record digest differs
- State digest differs
- Event ordering differs
- Event chain differs
- Immutable identities are duplicated
- Revision differs from event count

## Consistency Model

The current adapter provides single-writer, linearizable commits within one shared filesystem boundary.

Consistency rules:

- Readers accept only fully renamed states.
- Writers serialize through exclusive lock ownership.
- Writers must name the expected prior revision.
- Stale writers fail and must reload.
- Duplicate grants are rejected against latest projections.
- Sequence, not wall-clock time, establishes audit order.
- Revocation becomes authoritative when its transaction commits.
- Future reads evaluate the latest capability, entitlement, issuer, and revocation truth.

This is not a distributed consensus system. Network filesystems, multiple regions, replicas, and partitions require a future transactional datastore and consensus-backed authority.

## Revocation

Supported revocation targets:

- Entitlement
- Issuer
- Capability
- Organization

Entitlement and issuer revocations append revised projections. Capability revocation atomically appends a lifecycle transition to `SUSPENDED`. Organization revocation remains an explicit blocking event.

Every future entitlement lookup checks committed revocations before returning eligibility.

No prior grant, issuer record, capability state, or decision is deleted.

## Observability

The control-plane health projection reports:

- Registry revision
- Capability inventory
- Available capabilities
- Active entitlements
- Revoked entitlements
- Trusted issuers
- Activation history
- Security-event count
- Latest event digest
- State digest

It exposes governance state, not business analytics.

## Failure And Recovery

Failure behavior:

- Missing store: fail closed
- Corrupt JSON: fail closed
- Digest mismatch: fail closed
- Stale revision: reject
- Lock ambiguity: reject
- Interrupted temporary write: canonical state remains unchanged
- Unknown authority: reject
- Missing target: reject

Recovery requires an operator to prove lock ownership, validate the last canonical state, preserve orphaned files as incident evidence, and retry from the current revision.

No automated repair rewrites history.

## Security Boundary

The canonical public module exports the governed control-plane factory, not the low-level persistence store.

The control plane does not issue Kernel authorization, engine admission, certification, or execution. It produces durable governance truth for those independent authorities to consume.

## Current Limit

The implementation is production-quality for a single durable filesystem authority and deterministic local testing.

Enterprise deployment still requires:

- Authenticated command principals
- Credential verification rather than credential references
- Signed records or equivalent datastore trust
- Database transactions
- Backup and restore operations
- Multi-region consensus
- Retention and legal-hold policy
- Operational alerting
- Kernel adapter certification
