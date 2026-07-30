# PBOS Entitlement Authority Model

**Purpose:** Define who may issue, suspend, revoke, evaluate, and consume durable PBOS entitlement truth.

**Owner:** Playbook OS Engineering

**Last Updated:** July 29, 2026

**Related Documents:** [PBOS Capability Registry Architecture](./PBOS_CAPABILITY_REGISTRY_ARCHITECTURE.md), [PBOS Entitlement Engine Implementation](./PBOS_ENTITLEMENT_ENGINE_IMPLEMENTATION.md), [PBOS Engine Admission Architecture](./PBOS_ENGINE_ADMISSION_ARCHITECTURE.md)

## Authority Decision

An issuer record and a trusted issuer are different facts.

An issuer is trusted only when its latest durable record is:

- `VERIFIED`
- `ACTIVE`
- Within its validity period
- Scoped for `entitlement.issue`
- Allowed to grant the requested capability
- Bound to the same organization and tenant
- Not revoked

An entitlement grants eligibility for evaluation. It never grants execution authority.

## Authority Matrix

| Capability | Authority | Validator | Durable Evidence |
|---|---|---|---|
| Capability registration | Capability Registration Authority | Capability contract and dependency validation | Capability record and event |
| Capability transition | Capability Lifecycle Authority | State, adjacency, authority, evidence, validation | Transition, revised projection, event |
| Issuer registration | Issuer Registration Authority | Identity, scope, verification, lifecycle, validity | Issuer record and event |
| Entitlement issuance | Trusted Capability Issuer | Capability, issuer, tenant, scope, duplicate, time validation | Entitlement record and event |
| Entitlement evaluation | Entitlement Engine | Identity, policy, authority, entitlement, revocation | Activation decision |
| Revocation | Revocation Authority | Target, authority, evidence, validation | Revocation and revised projection |
| Decision persistence | Activation Decision Authority | Decision and evidence identity binding | Decision, evidence, event |
| Execution | PBOS Kernel | Governed action and engine admission | Kernel execution evidence |
| Certification | Certification Authority | Independent certification rules | Certification evidence |

No row inherits authority from another.

## Persistent Entitlement

A `PersistentEntitlementRecord` binds:

- Entitlement and subject
- Organization and tenant
- Capability
- Issuer
- Source
- Status
- Issue, expiration, and revocation times
- Policy
- Evidence
- Revision
- Content digest

Supported sources:

- Individual subscription
- Family plan
- School license
- District agreement
- University partnership
- Enterprise license
- Sponsored program
- Administrative grant

Source explains why issuance was requested. It does not create trust.

## Issuer Registration

Issuer registration requires an independent registration authority.

A `CapabilityIssuerRecord` declares:

- Issuer and workload identity
- Organization and tenant
- Authority operations
- Allowed capabilities
- Verification and lifecycle state
- Credential references
- Validity
- Revision and digest

Credential references are not credentials. Production trust requires a future authenticated credential verifier.

## Issuance Rules

Issuance fails when:

- Issuer is unknown
- Issuer is unverified, suspended, retired, revoked, not yet valid, or expired
- Capability is unavailable
- A capability dependency is unavailable
- Capability is outside issuer scope
- Issuer lacks `entitlement.issue`
- Organization or tenant differs
- Entitlement identity already exists
- Equivalent active scoped grant already exists
- Record digest or required fields are invalid

The entitlement is appended only after every rule passes.

## Multi-Tenant Authority

Issuer organization and tenant must exactly equal entitlement organization and tenant.

An issuer trusted in one tenant has no authority in another tenant. Parent organizations, sponsors, partners, and commercial systems receive no implicit descendant scope.

Delegation must appear as separately validated authority. It cannot be inferred from organization hierarchy.

## Revocation Authority

Revocation is independent from issuance.

A recognized revocation authority may revoke:

- One entitlement
- One issuer
- One capability
- One organization

Revocation requires target, authority, reason, evidence, validation, timestamp, and digest.

Future eligibility checks consume latest projection and revocation history. Revoked access cannot be restored by replaying an earlier entitlement or issuer revision.

## Activation Decision Authority

The Entitlement Engine may persist:

- Subject and scope
- Capability and digest
- Entitlement reference
- Policy result
- Authority result
- Kernel reference
- Decision
- Timestamp
- Evidence digest

Allowed decisions remain `ALLOW`, `DENY`, `SUSPEND`, `EXPIRED`, and `REQUIRES_REVIEW`.

An `ALLOW` record does not execute. It is an input to a separately governed Kernel action.

## Kernel Boundary

The future integration path is:

```text
Kernel Governed Request
  -> Verified Identity
  -> Durable Capability Lookup
  -> Durable Entitlement Lookup
  -> Policy Evaluation
  -> Existing Authorization
  -> Current Engine Admission
  -> Kernel Dispatch
  -> Evidence
```

The durable control plane cannot call a domain engine or construct a Kernel authorization record.

## Audit And Accountability

Every persisted mutation records:

- Acting authority
- Subject
- Evidence
- Payload identity
- Commit sequence
- Prior event identity
- Timestamp

Audit sequence is deterministic even when clocks differ. Timestamp disputes do not reorder committed truth.

## Failure Model

Unknown or ambiguous issuer, scope, capability, entitlement, revocation, policy, authority, evidence, revision, or Kernel state fails closed.

Commercial status cannot resolve a governance failure.
