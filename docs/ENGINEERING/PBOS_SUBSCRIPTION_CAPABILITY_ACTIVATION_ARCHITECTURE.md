# PBOS Subscription Capability Activation Architecture

**Purpose:** Define the commercial governance boundary through which packages and agreements may request governed entitlements without controlling authorization or execution.

**Owner:** Playbook OS Engineering

**Last Updated:** July 29, 2026

**Related Documents:** [PBOS Capability Governance Architecture](./PBOS_CAPABILITY_GOVERNANCE_ARCHITECTURE.md), [PBOS Entitlement Engine Implementation](./PBOS_ENTITLEMENT_ENGINE_IMPLEMENTATION.md)

## Architecture Decision

PBOS does not sell features. It packages governed capabilities and permits validated commercial or institutional relationships to request scoped entitlement creation.

```text
Product Tier
  -> Approved Entitlement Bundle
  -> Agreement-Bound Commercial Request
  -> Entitlement Authority Review
  -> Governed Entitlement Record
  -> Entitlement Engine Decision
  -> Kernel Authorization
  -> Engine Admission
  -> Future Execution
```

The commercial layer ends at the entitlement request. It cannot issue the entitlement, return `ALLOW`, authorize a subject, admit an engine, or execute a capability.

## Product Tiers

The governance contract supports:

- `FREE_ACCESS`
- `PREMIUM_INDIVIDUAL`
- `FAMILY_PLAN`
- `INSTITUTION_LICENSE`
- `ENTERPRISE_LICENSE`
- `PARTNER_SPONSORSHIP`
- `PROGRAM_ACCESS`

These are packaging classifications, not permissions.

No tier is intrinsically more trusted than another. Every resulting entitlement is subject to the same identity, authority, tenant, policy, evidence, lifecycle, admission, and Kernel controls.

## Entitlement Bundle

An `EntitlementBundleDefinition` binds:

- Bundle identity and digest
- Name, owner, and version
- Product tier
- Capability identities
- Policy identities
- Approval evidence
- Lifecycle status
- Effective and expiration time

Only `APPROVED` or `ACTIVE` bundles may support entitlement requests.

Changing a capability, policy, owner, version, status, evidence record, or effective period changes the bundle digest.

## Commercial Entitlement Request

A request binds:

- Request identity and digest
- Exact bundle identity and digest
- Beneficiary
- Organization and tenant scope
- Agreement identity
- Commercial authority
- Independent entitlement issuer
- Agreement evidence
- Request timestamp

The beneficiary cannot be its own commercial authority or entitlement issuer.

A request is not an entitlement record. It cannot be presented to the Entitlement Engine as access evidence.

## Commercial Ownership

The commercial layer owns:

- Packaging
- Pricing models
- Customer and partner agreements
- Bundle proposals
- Entitlement creation requests

The commercial layer does not own:

- Identity
- Authorization
- Capability lifecycle
- Entitlement issuance
- Policy evaluation
- Engine admission
- Execution
- Evidence validation
- Certification

## Licensing And Sponsorship

Individual, family, institutional, enterprise, partner, and program arrangements use the same governance path.

A sponsor may fund access but cannot impersonate the beneficiary, cross a tenant boundary, alter capability policy, or override expiration.

An enterprise agreement may define a beneficiary population, but each entitlement must retain explicit identity, organization, tenant, source, policy, authority, time, and evidence.

## Security Model

Governance rejects:

- Unknown or altered bundles
- Unapproved bundle status
- Empty capability, policy, or evidence declarations
- Self-issued commercial access
- Missing agreement evidence
- Tenant scope without organization scope
- Expired bundle periods
- Bundle substitution
- Direct authorization or activation fields

Commercial success never converts a failed governance result into access.

## Scale Model

Definitions are global, versioned assets. Entitlement records and decisions are subject- and tenant-scoped.

Enterprise scale requires future durable services to partition records by tenant while retaining globally unique identities and append-only audit lineage.

Required operational controls include:

- Idempotent entitlement creation
- Optimistic concurrency
- Revocation propagation
- Bundle-version pinning
- Bulk grant review
- Fairness and capacity controls
- Reconciliation with agreement systems
- Durable audit and evidence retention

None of these are implemented by this architecture milestone.

## Implementation Boundary

Implemented:

- Typed product tiers
- Digest-bound entitlement bundles
- Digest-bound commercial entitlement requests
- Deterministic governance validation
- Self-issuance and bundle-substitution tests

Not implemented:

- Payment processing
- Stripe or billing integration
- Checkout
- Pricing execution
- Agreement execution
- Production entitlement issuance
- Capability activation
- Application UI

## Readiness Decision

The commercial model is structurally scalable because it packages capability identities rather than embedding feature flags or UI permissions.

Production licensing remains blocked by durable entitlement authority, authenticated commercial principals, agreement verification, persistence, revocation, concurrency, observability, and Kernel integration.
