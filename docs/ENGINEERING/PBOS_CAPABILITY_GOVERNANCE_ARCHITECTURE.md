# PBOS Capability Governance Architecture

**Purpose:** Define the constitutional control layer governing platform capabilities, entitlements, and activation eligibility without transferring execution authority from the PBOS Kernel.

**Owner:** Playbook OS Engineering

**Last Updated:** July 29, 2026

**Related Documents:** [Playbook Constitution](../CONSTITUTION/PLAYBOOK_CONSTITUTION.md), [PBOS Engine Operating Model](./PBOS_ENGINE_OPERATING_MODEL.md), [PBOS Engine Admission Architecture](./PBOS_ENGINE_ADMISSION_ARCHITECTURE.md), [Volume 36 Execution and Workflow Architecture](../CONSTITUTION/VOLUME_36_EXECUTION_AND_WORKFLOW_ARCHITECTURE/VOLUME_36_INDEX.md)

## Architecture Decision

PBOS governs capabilities rather than commercial features.

```text
Constitution
  -> PBOS Governance
  -> PBOS Kernel
  -> Engine Operating Model
  -> Capability Governance
  -> Entitlement Decision
  -> Kernel Authorization and Engine Admission
  -> Domain Engine
  -> Experience
```

A capability is a governed platform asset. An entitlement is a verified, scoped right to request access to that asset. Activation is an eligibility decision, not execution authority.

Commercial arrangements may create entitlement proposals. They cannot authorize a user, admit an engine, certify an artifact, or execute a capability.

## Capability Definition

`CapabilityDefinition` is the immutable constitutional identity of a governed ability supplied by PBOS.

Required fields:

- `capability_id`
- `name`
- `purpose`
- `owner`
- `owning_engine_id`
- `version`
- `classification`
- `dependencies`
- `security_requirements`
- `evidence_requirements`
- `lifecycle_state`
- `definition_digest`

Supported classifications are foundation, intelligence, experience, workflow, automation, integration, AI, and governance.

The definition digest binds all content. Any ownership, dependency, security, evidence, lifecycle, engine, or version change creates a new definition identity and requires renewed governance.

Capabilities include, but are not limited to, Scholar Record, Compass, Resume Intelligence, Opportunity Intelligence, Mentorship, Career Journey, Financial Literacy, and Recruiting Intelligence. These names are architectural examples, not registered capability records.

## Capability Ownership

Every capability has one accountable owner and one owning engine.

The owner governs purpose, policy, compatibility, dependency, evidence, security, and lifecycle requirements. The owning engine supplies only declared domain computation.

Ownership does not permit:

- Self-authorization
- Self-certification
- Self-activation
- Undeclared capability expansion
- Identity mutation
- Cross-tenant access
- Replacement of Kernel admission

## Entitlement Record

`EntitlementRecord` represents a verified eligibility right for one subject to request one governed capability.

Required identity and scope:

- Entitlement identity
- Capability identity and definition digest
- Subject identity
- Beneficiary type
- Organization and tenant scope
- Issuer and grant authority
- Entitlement source
- Status
- Effective and expiration timestamps
- Evidence and policy identifiers
- Record digest

Supported beneficiary types:

- Individual
- Family
- Scholar
- Organization
- School
- District
- University
- Partner
- Enterprise
- Sponsored

Supported sources:

- Subscription
- Institution agreement
- Partner sponsorship
- Program enrollment
- Administrative approval
- Eligibility qualification

An entitlement proves only that the subject is eligible for evaluation. It does not prove identity, authority, policy approval, engine admission, or execution eligibility.

## Capability Lifecycle

The canonical lifecycle is:

```text
PROPOSED
  -> DESIGNED
  -> REVIEWED
  -> APPROVED
  -> REGISTERED
  -> AVAILABLE
  -> ACTIVATED
  -> SUSPENDED | DEPRECATED
  -> RETIRED
```

`SUSPENDED` may return to `REVIEWED`; it cannot silently reactivate. `DEPRECATED` proceeds only to `RETIRED`.

Every transition requires:

- Independent authority
- Evidence
- Validation
- Audit identity
- Expected revision
- Timestamp

No commercial event directly changes capability lifecycle.

## Entitlement Lifecycle

The entitlement lifecycle is:

```text
PROPOSED -> ACTIVE
ACTIVE -> SUSPENDED | EXPIRED | REVOKED
SUSPENDED -> ACTIVE | REVOKED | EXPIRED
EXPIRED | REVOKED -> terminal
```

Activation evaluation accepts only `ACTIVE` entitlements that are effective, unexpired, identity-bound, tenant-bound, capability-bound, policy-bound, and authority-backed.

Renewal creates a governed new record or revision. It does not rewrite expired history.

## Authority Model

### PBOS Kernel

The Kernel owns final identity validation, authorization, execution admission, evidence integrity enforcement, certification consumption, and dispatch.

### Capability Governance

Capability Governance owns definitions, ownership, lifecycle rules, entitlement policy requirements, activation rules, and registries.

### Entitlement Engine

The Entitlement Engine may evaluate evidence and return `ALLOW`, `DENY`, `SUSPEND`, `EXPIRED`, or `REQUIRES_REVIEW`. It cannot execute, authorize, certify, or activate an engine.

### Commercial Authority

Commercial systems own packaging, pricing models, agreements, and requests to create entitlements. They cannot issue Kernel authority or trust.

### Engines And Experiences

Engines own domain computation and declared outputs. Experiences own presentation and interaction. Neither controls entitlement truth or authorization.

## Dependency Model

A capability depends only on registered capability identities declared in its definition.

Governance must reject:

- Missing dependencies
- Self-dependencies
- Circular dependencies
- Unregistered dependencies
- Dependencies in suspended, deprecated, or retired states
- Hidden engine coupling

Dependency satisfaction grants no inherited entitlement or authority. Every requested capability requires its own governed decision unless a policy explicitly defines a separately registered bundle.

## Activation Decision

The activation decision flow is:

```text
Capability Request
  -> Verified Identity
  -> Capability Lookup
  -> Entitlement Lookup
  -> Tenant and Organization Match
  -> Effective-Time Evaluation
  -> Capability Lifecycle Evaluation
  -> Entitlement Policy Evaluation
  -> Independent Authority Validation
  -> Engine Admission Reference Validation
  -> Evidence Decision
  -> Kernel Consideration
```

Only `ALLOW` may proceed to Kernel consideration. `ALLOW` is not authorization and cannot be dispatched directly.

## Security Model

The architecture fails closed against:

- Self-granted capabilities
- Engine-controlled permissions
- UI-controlled authorization
- Cross-tenant or cross-organization use
- Expired or not-yet-effective access
- Unauthorized sponsorship
- Hidden activation
- Definition or entitlement substitution
- Policy omission
- Missing evidence
- Suspended capability or entitlement use

Every decision binds the capability definition digest, entitlement digest, subject, organization, tenant, policy, authority, and evaluation time.

## Multi-Organization Model

Entitlements are scoped to an individual context or an explicit organization and tenant boundary.

Delegated administrators may request or issue entitlements only through independently validated authority scoped to the same organization, tenant, subject, capability, and operation.

An institutional agreement does not create cross-tenant visibility. A sponsor does not become the beneficiary's identity authority. Shared capability definitions remain global; entitlement records remain scoped.

## Evidence Model

Capability decisions require evidence of:

- Definition identity
- Entitlement identity and source
- Issuer authority
- Subject identity
- Organization and tenant scope
- Policy evaluation
- Effective time
- Capability and entitlement lifecycle
- Engine admission reference
- Decision outcome

Evidence is append-only and preserves denials, expiration, suspension, revocation, and supersession.

## Commercial Boundary

PBOS does not monetize features directly.

```text
Commercial Package
  -> Entitlement Bundle Definition
  -> Entitlement Creation Request
  -> Governed Entitlement Record
  -> Capability Evaluation
  -> Kernel Authority
```

Revenue can explain why an entitlement was requested. It cannot explain why execution was authorized.

## Failure And Recovery

Unknown identity, capability, entitlement, policy, scope, authority, dependency, evidence, lifecycle, admission, or certification state results in denial or review. It never results in implicit access.

Recovery requires the canonical owner to correct or supersede the invalid artifact. Historical decisions remain immutable.

## Implementation Boundary

Phase 1 establishes constitutional ownership and contracts.

Phase 2 may implement deterministic, process-local registries and decision evaluation without capability execution or runtime truth mutation.

Phase 3 may define commercial packages and entitlement bundles only after Phase 2 validation passes. Payment processing, billing, checkout, pricing execution, and application UI remain outside scope.
