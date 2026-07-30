# PBOS Engine Admission Architecture

**Purpose:** Define the canonical Kernel boundary for registering and admitting domain-specific engines without activating them or transferring execution authority.

**Owner:** Playbook OS Engineering

**Last Updated:** July 29, 2026

**Related Documents:** [PBOS Kernel Enterprise Governance Contract Architecture](./PBOS_KERNEL_ENTERPRISE_GOVERNANCE_CONTRACT_ARCHITECTURE.md), [PBOS Enterprise Engine Governance Constitution](./PBOS_ENTERPRISE_ENGINE_GOVERNANCE_CONSTITUTION.md), [Volume 36 Execution and Workflow Architecture](../CONSTITUTION/VOLUME_36_EXECUTION_AND_WORKFLOW_ARCHITECTURE/VOLUME_36_INDEX.md)

## Architecture Decision

PBOS establishes one Engine Admission boundary inside the existing Kernel public API.

The Kernel remains the sole execution authority.

Domain engines declare capabilities and requirements. They do not register, authorize, certify, admit, activate, or dispatch themselves.

This milestone creates typed contracts, deterministic validation, a canonical manifest catalog, and admission decisions. It does not create an engine runtime or activate an engine.

## Admission Flow

```text
Engine Definition
  -> Engine Manifest
  -> Manifest Content Identity
  -> Authorized Registration
  -> Capability and Contract Validation
  -> Authority Validation
  -> Lifecycle Compatibility
  -> Dependency Availability
  -> Evidence Capability
  -> Current Certification
  -> Kernel Admission Decision
  -> Future Kernel Dispatch
```

Every stage fails closed.

No future dispatcher may accept a manifest, registration record, authority grant, or certification independently. It must accept a current `ADMITTED` decision bound to the exact manifest digest and request identity.

Admission does not execute the engine. It proves only that the exact registered engine is currently eligible to participate in a separately governed Kernel action.

## Engine Manifest

`EngineManifest` is the immutable declaration of an engine's constitutional execution surface.

Required identity and ownership:

- `engine_id`
- `name`
- `purpose`
- `owner`
- `version`
- `classification`
- `lifecycle_state`
- `manifest_version`
- `manifest_digest`

Required execution contracts:

- `capabilities`
- `authority_scope`
- `required_permissions`
- `input_contracts`
- `output_contracts`
- `lifecycle_requirements`
- `evidence_requirements`
- `security_requirements`
- `certification_requirements`
- `operational_requirements`
- `dependencies`

The manifest digest is a SHA-256 content identity derived from every manifest field except the digest itself.

Any capability, contract, scope, permission, lifecycle, evidence, certification, or dependency change produces a new digest and requires governed registration and certification.

## Engine Classifications

The contract supports:

- `INTELLIGENCE`
- `EXPERIENCE`
- `WORKFLOW`
- `AUTOMATION`
- `AI`
- `INTEGRATION`
- `GOVERNANCE`

Classification does not grant authority.

The admission layer contains no classification-specific domain logic.

## Engine Lifecycle

Engine lifecycle responsibilities are separated:

```text
PROPOSED -> DESIGNED -> REVIEWED -> APPROVED -> REGISTERED
REGISTERED -> ACTIVE -> MONITORED -> UPDATED -> REVIEWED
ACTIVE | MONITORED -> SUSPENDED | DEPRECATED
SUSPENDED -> REVIEWED | RETIRED
DEPRECATED -> RETIRED
```

The lifecycle authority owns committed engine state.

The manifest declares compatible states.

The registration catalog records manifest identity.

The admission authority verifies that current lifecycle state is compatible.

The Kernel alone may use a successful admission decision for future dispatch.

Suspension, restriction, deprecation, retirement, or incompatible state rejects admission unless the exact manifest explicitly and constitutionally permits that state.

## Registration Model

`CertifiedEngineManifestRegistry` is the canonical in-process catalog boundary.

Registration requires:

- Valid immutable manifest
- Matching engine and manifest identities
- Recognized registration authority
- Identified registrar
- Valid registration timestamp
- `REGISTERED` status
- No existing engine identity

The registry rejects:

- Unknown registration authority
- Engine-owned registration authority
- Duplicate registration
- Same engine identity with different content
- Missing or invalid manifest requirements
- Suspended or revoked registration

The registry stores and returns defensive copies. A caller cannot mutate registered truth through a retained object reference.

Registration is not activation, admission, authorization, certification, or execution.

## Validation Model

`validateEngineManifest` verifies:

- Identity, purpose, owner, version, and governed classification
- Manifest content digest
- At least one declared capability
- Unique capability and operation identities
- Non-empty authority, permission, input, output, lifecycle, evidence, security, certification, and operational requirements
- Unique dependency identities
- No self-dependency

`validateEngineRegistration` additionally verifies:

- Registration identity and chronology
- Engine and manifest identity match
- Current `REGISTERED` state
- Separation between engine identity and registration authority

`validateEngineAdmissionRequest` additionally verifies:

- Registered manifest identity
- Current independent execution authority
- Exact owner and engine binding
- Every capability is authorized
- No hidden capability is present
- Every required permission and authority scope is granted
- Lifecycle compatibility
- Every dependency is available
- Every evidence requirement is available
- Every security requirement is available
- Every operational requirement is available
- Every required certification exists, is current, has evidence and validation, and binds the exact engine and manifest digest
- The engine is not its own execution or certification authority

All findings are explicit and deterministic.

Unknown, missing, duplicated, stale, mismatched, denied, suspended, revoked, or unavailable state rejects admission.

## Security Boundaries

The framework prevents:

- Unauthorized registration through an allowlisted registration authority
- Hidden capabilities through exact manifest-to-authority comparison
- Privilege escalation through required permission and scope comparison
- Engine-owned authorization through identity separation
- Engine-owned certification through issuer separation
- Manifest substitution through content digest binding
- Certification replay across versions through subject digest binding
- Lifecycle bypass through exact lifecycle identity and compatible state
- Dependency bypass through explicit availability
- Evidence suppression through required evidence capability declarations
- Mutable registry truth through defensive copying

The framework does not authenticate users, issue authority, validate external signatures, create certification, or operate engines. Those remain owned by their canonical authorities.

## Kernel Ownership

The Kernel owns:

- Admission validation orchestration
- Registered manifest identity comparison
- Deterministic admission decision
- Future dispatch eligibility

Domain authorities own:

- Engine purpose and capability meaning
- Engine owner and lifecycle
- Permissions and resource scope
- Input and output contract meaning
- Evidence requirements
- Dependencies

Governance Enforcement owns policy and authority decisions.

Validation Authority owns validation results.

Certification Authority owns certification state.

The engine owns none of these trust decisions.

## Admission Decision

`KernelEngineAdmissionAuthority` returns:

- Request identity
- Engine identity
- Manifest digest
- `ADMITTED` or `REJECTED`
- Complete findings
- Deterministic decision digest

An admission decision is bound to one request and one immutable manifest.

It does not survive manifest changes, authority loss, lifecycle change, dependency loss, evidence unavailability, or certification invalidation.

Future execution integration must revalidate admission at the Kernel dispatch boundary and must not add an alternate engine execution path.

## Failure and Recovery

Admission failure produces no execution side effect.

Remediation occurs through the owning authority:

- Manifest defects return to engine governance.
- Registration defects return to registration authority.
- Authority defects return to Governance Enforcement.
- Lifecycle defects return to Lifecycle Management.
- Dependency defects return to the dependency owner.
- Evidence defects return to evidence and validation authorities.
- Certification defects return to Certification Authority.

A corrected submission creates a new admission request and decision.

Prior rejection evidence remains immutable.

## Current Implementation Boundary

The implementation exports `EngineAdmission` from the existing Kernel public API.

No runtime artifact, global registry, command, activation record, engine instance, or alternate dispatcher is created.

All existing execution continues through the single Kernel path.
