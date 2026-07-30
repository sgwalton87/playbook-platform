# PBOS Engine Operating Model

**Purpose:** Establish the canonical capability-management layer through which PBOS proposes, governs, admits, observes, evolves, and retires domain engines.

**Owner:** Playbook OS Engineering

**Last Updated:** July 29, 2026

**Related Documents:** [Playbook Constitution](../CONSTITUTION/PLAYBOOK_CONSTITUTION.md), [PBOS Engine Admission Architecture](./PBOS_ENGINE_ADMISSION_ARCHITECTURE.md), [PBOS Kernel Enterprise Governance Contract Architecture](./PBOS_KERNEL_ENTERPRISE_GOVERNANCE_CONTRACT_ARCHITECTURE.md), [Volume 36 Execution and Workflow Architecture](../CONSTITUTION/VOLUME_36_EXECUTION_AND_WORKFLOW_ARCHITECTURE/VOLUME_36_INDEX.md)

## Architecture Decision

PBOS establishes one engine operating model between the Kernel and domain engines.

```text
Constitution
  -> PBOS Governance
  -> Enterprise Control Plane
  -> PBOS Kernel
  -> Engine Operating Model
  -> Admitted Domain Engine
  -> Playbook Experience
```

The operating model governs capability participation. It does not become a second runtime, execution engine, authorization authority, certification authority, or domain implementation framework.

The Kernel remains the sole execution authority. An engine can compute only after the Kernel accepts a current admission decision bound to the exact manifest, authority, lifecycle, dependency, evidence, security, operational, and certification state.

## Definition Of An Engine

An engine is a governed, versioned domain computation boundary that accepts declared input contracts, performs declared capabilities within an independently granted authority scope, and returns declared output and evidence contracts.

An engine is not:

- An identity authority
- An authorization service
- A certification authority
- A lifecycle authority
- A presentation layer
- A hidden execution path
- A replacement for the Scholar Record

Engines may implement domain logic, computation, derived intelligence, or recommendations. Experiences own presentation and interaction. The Kernel owns execution admission and dispatch.

## Engine Identity Model

Every engine is represented by an immutable `EngineManifest` with a SHA-256 content identity.

Required identity:

- `engine_id`
- `name`
- `purpose`
- `owner`
- `version`
- `classification`
- `lifecycle_state`
- `manifest_version`
- `manifest_digest`

Required capability and trust declarations:

- `capabilities`
- `dependencies`
- `authority_scope`
- `required_permissions`
- `input_contracts`
- `output_contracts`
- `lifecycle_requirements`
- `evidence_requirements`
- `security_requirements`
- `certification_requirements`
- `operational_requirements`

Changing any declared field changes the manifest digest. The prior manifest remains historical evidence; the changed manifest requires review, registration, and certification under its new identity.

## Engine Classification

The governed classifications are:

- `INTELLIGENCE`
- `EXPERIENCE`
- `WORKFLOW`
- `AUTOMATION`
- `INTEGRATION`
- `AI`
- `GOVERNANCE`

Classification describes responsibility. It grants no permission and creates no execution eligibility.

Classification-specific policy may narrow requirements but cannot weaken Kernel admission, independent authority, evidence, security, certification, or lifecycle controls.

## Authority Model

### Kernel Authority

The Kernel exclusively owns:

- Execution admission
- Dispatch eligibility
- Identity-bound admission decisions
- Enforcement of current authorization
- Enforcement of evidence and certification prerequisites
- Refusal of ungoverned execution

### Engine Authority

An admitted engine owns only:

- Declared domain logic
- Declared domain computation
- Declared outputs
- Declared recommendations
- Required execution evidence production

An engine cannot expand its manifest, authorize itself, certify itself, change its lifecycle, register itself, or invoke itself outside Kernel dispatch.

### Experience Authority

An experience owns:

- Presentation
- Accessible user interaction
- Workflow experience
- Display of governed engine results

An experience cannot grant engine authority, alter engine output provenance, bypass Kernel admission, or mutate the Scholar Record without a separately authorized workflow.

### Independent Authorities

Governance Enforcement owns policy decisions. Lifecycle Management owns committed engine state. Validation Authority owns validation results. Certification Authority owns certification state. Security Governance owns security review. Evidence Authority owns evidence integrity.

No one of these decisions implies another.

## Engine Lifecycle

The canonical lifecycle is:

```text
PROPOSED
  -> DESIGNED
  -> REVIEWED
  -> APPROVED
  -> REGISTERED
  -> ACTIVE
  -> MONITORED
  -> UPDATED
  -> REVIEWED

ACTIVE | MONITORED
  -> SUSPENDED
  -> REVIEWED | RETIRED

ACTIVE | MONITORED
  -> DEPRECATED
  -> RETIRED
```

Every transition requires:

- An authority identity independent of the engine
- Evidence identifiers
- Validation identifiers
- An audit record identifier
- A timestamp
- An expected revision for concurrency control
- An adjacent transition defined by the lifecycle

Skipped transitions fail closed. Engines cannot silently appear, activate, disappear, or return from retirement.

`UPDATED` represents a materially changed engine awaiting renewed review. It is not executable merely because an earlier version was active.

## Admission Flow

```text
Engine Proposal
  -> Manifest Creation
  -> Manifest Digest
  -> Dependency Graph Validation
  -> Capability Review
  -> Authority Validation
  -> Security Requirements Validation
  -> Authorized Registration
  -> Lifecycle Compatibility
  -> Evidence Capability Validation
  -> Operational Requirements Validation
  -> Certification Validation
  -> Kernel Admission Decision
  -> Future Kernel Dispatch
```

Admission requires the exact registered manifest and current independent authority. It rejects missing or hidden capabilities, permissions, scopes, dependencies, evidence, security controls, operational controls, and certifications.

Admission is not activation or execution. It proves current eligibility for the Kernel to consider dispatch through its existing execution path.

## Registration Model

`CertifiedEngineManifestRegistry` is the canonical registration boundary in the current implementation.

It requires:

- A valid content-bound manifest
- A recognized registration authority
- An identified registrar
- Matching manifest and registration identities
- A valid registration timestamp
- `REGISTERED` registration status
- A unique engine identity

It stores defensive copies and rejects duplicate or substituted content.

The current registry is process-local and creates no runtime truth. Durable, concurrency-safe registration history remains a future operationalization requirement.

## Dependency Model

The engine dependency graph is constructed only from declared manifest dependencies.

It produces:

- Engine identities
- Deterministic topological execution order
- Blocked engine identities
- Missing dependency findings
- Duplicate identity findings
- Self-dependency findings
- Circular dependency findings
- A content digest

The graph never invents a dependency or treats an unavailable dependency as satisfied.

Dependencies express required engine participation, not authority inheritance. A dependent engine cannot acquire the permissions, certification, or trust state of its dependency.

## Execution Model

There is one execution route:

```text
Governed Kernel Action
  -> Current Engine Admission Validation
  -> Kernel Dispatch Eligibility
  -> Declared Engine Input Contract
  -> Domain Computation
  -> Declared Output Contract
  -> Required Evidence
  -> Kernel Reporting and Certification Boundary
```

The operating model does not provide an engine dispatcher. Future dispatch integration must consume a current admission decision and enter the existing Kernel execution pipeline.

An engine must not:

- Invoke an alternate adapter or runtime
- Accept undeclared inputs
- emit undeclared authoritative outputs
- Mutate identity or authority truth
- Certify its own result
- Continue after authority, lifecycle, dependency, security, evidence, or certification invalidation

## Operational Model

Every operational snapshot must identify:

- Engine identity
- Manifest digest
- Version
- Observation timestamp
- Health
- Availability
- Performance latency
- Error count
- Evidence identifiers
- Satisfied operational requirement identifiers
- Governance compliance

Health is valid only when the snapshot binds the exact current manifest and satisfies every declared operational requirement.

The current implementation evaluates deterministic snapshots. It does not create a monitoring service, service-level objectives, alerts, persistent history, or automatic remediation.

## Evidence Model

Evidence is required at proposal review, lifecycle transition, registration, admission, execution, monitoring, update, suspension, deprecation, and retirement.

Evidence must be:

- Identity-bound
- Content-bound where applicable
- Produced by a declared owner
- Independently validated
- Preserved across supersession
- Referenced by audit records
- Unavailable for silent rewriting

An evidence declaration proves a requirement exists. It does not prove the evidence itself is valid. Validation and certification remain separate authorities.

## Security Model

The operating model prevents:

- Unauthorized registration
- Hidden capability execution
- Permission or scope escalation
- Engine-owned authorization
- Engine-owned certification
- Manifest substitution
- Certification replay across versions
- Lifecycle bypass
- Missing dependency continuation
- Security and operational requirement suppression
- Silent retirement

Future durable registration must additionally provide authenticated principals, signed decisions, tenant isolation, optimistic concurrency, append-only history, revocation propagation, and disaster recovery.

## Retirement Model

An engine becomes retirement-eligible only from `DEPRECATED` or `SUSPENDED`.

Retirement requires:

- Independent retirement authority
- Deprecation notice
- Migration plan
- Dependency impact review
- Data impact review
- Evidence preservation record
- Certification closure
- Validation evidence
- Timestamped audit identity

Retirement does not delete history, evidence, manifests, execution records, or certification decisions. Consumers must complete migration or fail closed.

## Scholar Record Principle

The Playbook Constitution defines the Scholar Record as the constitutional source of truth.

All engines must:

- Consume governed Scholar Record data through declared contracts
- Produce derived intelligence or recommendations with provenance
- Preserve record ownership and verification state
- Request authorized workflows for canonical mutation

No engine may replace the Scholar Record, create competing identity truth, or silently promote derived output into authoritative record state.

## Initial Engine Sequence

The first design candidate is the Scholar Record Foundation Engine because all role, intelligence, opportunity, mentorship, career, and financial capabilities depend on canonical governed records.

Candidate sequence:

1. Scholar Record Foundation
2. Identity/Profile integration boundary
3. Role Operating System composition boundary
4. Compass
5. Resume Intelligence
6. Opportunity Intelligence
7. Mentorship
8. Career Journey
9. Financial Literacy

This is a design dependency recommendation, not a registered graph or activation decision. No candidate currently has a canonical manifest and admission evidence package.

The Scholar Record candidate cannot be activated until identity/profile contracts, mutation authority, evidence ownership, security requirements, operational requirements, durable registration, and certification inputs are explicit and validated.

## Failure And Recovery

Every failure is assigned to its canonical owner:

- Manifest defect: Engine Governance
- Dependency conflict: Dependency Governance
- Authority failure: Governance Enforcement
- Security failure: Security Governance
- Lifecycle failure: Lifecycle Management
- Evidence failure: Evidence Authority
- Validation failure: Validation Authority
- Certification failure: Certification Authority
- Runtime failure: Kernel and Resilience authorities

Failure produces no implicit lifecycle transition or execution. Recovery requires corrected evidence and a new governed decision. Prior decisions remain historical.

## Implementation Boundary

Implemented:

- Typed manifest and classifications
- Content digest validation
- Authorized in-process registration
- Fail-closed admission
- Deterministic lifecycle transition validation
- Deterministic dependency graph validation
- Identity-bound health evaluation
- Retirement eligibility validation
- Adversarial unit tests

Not implemented:

- Durable engine registry
- Lifecycle state writer and history store
- Engine dispatcher
- Monitoring collection service
- Certification issuance
- Candidate engine manifests
- Engine activation
- Scholar Record engine domain logic

This boundary preserves the Kernel as the only execution authority.
