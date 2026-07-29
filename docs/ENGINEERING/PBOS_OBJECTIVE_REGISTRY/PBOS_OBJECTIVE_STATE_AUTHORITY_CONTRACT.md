# PBOS Objective State Authority Contract

## Document Status

Status: Canonical  
Authority: Playbook Operating System (PBOS)  
Layer: Objective Governance  
Owner: PBOS Lifecycle Governance  
Effective: July 29, 2026

## Purpose

Define who may act, validate, approve, produce evidence, audit, and persist every objective-related decision without creating competing authority.

## Architectural Position

PBOS separates four powers:

1. A domain authority produces a decision or evidence.
2. An independent validator verifies the decision and its scope.
3. PBOS Lifecycle Governance approves or denies an adjacent objective transition.
4. The Objective Registry State Writer persists the approved transition.

No actor or subsystem owns all four powers. This contract governs objective authority; it does not replace the internal lifecycles of Planning Handoff, the Constitutional Planner, Execution Authorization, Execution Engine, or Certification Framework.

## Authority Principles

### Single Ownership

Every decision, artifact, and mutation has one canonical owner. Shared responsibility means explicit producer, validator, transition authority, writer, and auditor roles, not multiple writers.

PBOS Lifecycle Governance is the sole objective transition authority. The Objective Registry State Writer is the sole objective-state persistence path.

### Separation Of Duties

- A creator cannot approve their own objective when independent approval is required.
- A reviewer cannot approve unresolved findings they authored.
- An approver cannot produce the validation evidence they approve where policy requires independence.
- Certification cannot persist `CERTIFIED`.
- Execution cannot authorize itself.
- The State Writer cannot decide policy.
- Auditors are always read-only.

### Least Authority

Authority is limited by organization, tenant, objective type, lifecycle action, affected system, risk, value, time, and purpose. An approval for one objective revision or transition grants no authority over another.

Organization policy may narrow platform authority but cannot weaken PBOS constitutional controls.

### Auditability

Every successful and denied action records authenticated identities, authority grants, organization scope, objective revision, evidence, decision, timestamps, reasons, context, and tamper-evident event identity.

No state change may rely on an undocumented verbal, positional, or implied authority.

### Fail-Closed Authority

Missing, ambiguous, expired, revoked, cross-tenant, conflicting, or unverifiable authority denies the action and preserves current state.

## Authority Matrix

| Capability | Authority Owner | Validator | Evidence | Audit Record |
| --- | --- | --- | --- | --- |
| Objective Creation | Objective Registry Intake Authority; action requested by an Authorized Creator | Identity, organization-scope, schema, source-authority, and duplication validators | creator/grant identities, organization, source digest, objective/revision identity, purpose | creation attempt, validation results, accepted `PROPOSED` event or denial |
| Objective Approval | Lifecycle Governance Approval Authority; action performed by scoped Approver | approval-scope, review-completeness, quorum, conflict-of-interest, grant, and revision validators | review package, resolved findings, approval decision, approver grant, revision digest | approver identity, decision, reasons, scope, timestamp, evidence digests |
| Objective Registration | PBOS Lifecycle Governance | Registry uniqueness, metadata, ownership, authority, architecture, dependency, and evidence-definition validators | creation/review/approval chain, registry and objective digests | `REVIEWED → REGISTERED` transition envelope and write receipt |
| Eligibility Evaluation | Objective Evaluator produces assessment; PBOS Lifecycle Governance owns eligibility decision | context, dependency, evidence, architecture, organization-policy, freshness, and blocking-condition validators | evaluation identity/rules version, context, dependency and evidence snapshots, reasons | evaluation attempt and `REGISTERED → ELIGIBLE` decision |
| Planning Handoff | Planning Handoff owns the handoff artifact | context, registry, objective, dependency, evidence, lineage, and freshness validators | handoff identity/digest, eligible objective revision, context and evidence snapshots | handoff attempt, result, reasons, lineage digest; no direct state write |
| Gate Selection | Constitutional Planner | constitutional eligibility, dependency, lifecycle, release, artifact, and deterministic-order validators | planner decision, gate identity/digest, alternatives and reasons, handoff identity | planner run and `ELIGIBLE → PLANNED` transition evidence |
| Execution Authorization | Execution Authorization Authority | objective/gate, contract, work-package, approver, scope, immutable-reference, expiry, and separation-of-duties validators | authorization decision identity, contract/work-package digests, approver grant, scope and expiry | authorization request, decision, reasons, and `PLANNED → AUTHORIZED` evidence |
| Execution Completion | Execution Engine owns terminal execution result; Lifecycle Governance owns transition to validation | authorization freshness, adapter scope, execution identity, repository result, interruption/recovery, and evidence-package validators | dispatch/execution identities, adapter version, inputs/outputs, terminal result, recovery history | execution events and `EXECUTING → VALIDATING` transition decision |
| Certification | Certification Framework owns certification decision; Lifecycle Governance owns objective transition | complete traceability, validation, success criteria, objective revision, exception, and critical-finding validators | validation identities/results, certification identity, success mapping, full lineage | certification attempt, decision, reasons, and `VALIDATING → CERTIFIED` transition |
| Archival | PBOS Lifecycle Governance Retention Authority | certification, legal hold, retention, active dependency, organization obligation, and operational-handoff validators | certification identity, retention policy, dependency result, archival approval | `CERTIFIED → ARCHIVED` transition and final event-chain digest |
| Objective State Persistence | Objective Registry State Writer | transition-envelope signature, Lifecycle Governance approval, adjacent state, expected version, idempotency, tenant, and previous-event digest validators | approved transition envelope | immutable write receipt, resulting version/digest, or denial |
| Independent Audit | Authorized Auditor | audit-scope, purpose, tenant, retention, and read-only access validators | audit grant and requested evidence scope | access log, integrity result, findings; never a state mutation |

## Canonical Mutation Rule

Every objective state change follows:

```text
Authorized Request
→ Domain Evidence
→ Independent Validation
→ Lifecycle Governance Decision
→ Objective Registry State Writer
→ Immutable Audit Record
```

The State Writer accepts only the adjacent transitions defined in `PBOS_OBJECTIVE_REGISTRY_LIFECYCLE_ALIGNMENT_STANDARD.md`. A subsystem-local status cannot be promoted into objective state without this chain.

## Authority Boundaries

### Objective Registry

Owns:

- objective and revision identities;
- strategic metadata and organization ownership;
- current canonical state;
- immutable transition history;
- evidence references;
- state-writer interface.

Does not own:

- eligibility decision;
- gate selection;
- execution authorization;
- execution result;
- validation or certification decision.

### Planning Handoff

Owns context-bound handoff evidence translating an eligible objective into planner input.

May observe authorized registered and eligible objective data. May request progression using its evidence. Cannot create or approve objectives, select gates, authorize execution, or write objective state.

### PBOS Planner

The Constitutional Planner owns deterministic gate selection and sequencing. It consumes valid Handoff evidence and emits a gate-binding decision.

It cannot create strategic intent, approve objectives, authorize execution, change certification, or persist objective state.

### Lifecycle Governance

Owns objective transition policy and the approval or denial of every adjacent transition. It verifies that the responsible domain authority and validators supplied required evidence.

It cannot fabricate evidence or bypass the State Writer. Its decision is necessary but not sufficient for persistence.

### Execution Authorization

Owns the explicit authorization decision for a planned execution scope. It cannot select the gate, dispatch execution, validate its own result, or write objective state.

Objective approval, registration, eligibility, Handoff, and planning never imply authorization.

### Execution Engine

Owns adapter dispatch, execution progress, interruption/recovery, and terminal result evidence within an authorized scope.

It cannot authorize itself, expand scope, certify success, archive an objective, or write objective state.

### Certification Framework

Owns certification criteria, evidence evaluation, decision, and certification history. It may support `VALIDATING → CERTIFIED`.

It cannot create objectives, select gates, authorize or execute work, fabricate completion evidence, override Lifecycle Governance, or persist objective state.

### PBOS Kernel

Owns artifact-writer registration and write enforcement. It prevents non-owners from modifying governed artifacts but does not make business or lifecycle decisions.

### Auditor

Owns no operational decision. Audit authority is read-only, time-bound, purpose-bound, tenant-scoped, and independently recorded.

## Evidence Responsibility

The subsystem making a domain decision owns its evidence:

- Registry Intake: creation and registration inputs.
- Reviewer/Approver: review and approval decisions.
- Evaluator: eligibility assessment.
- Planning Handoff: context and lineage.
- Planner: gate selection and reasons.
- Authorization: execution decision and scope.
- Execution Engine: dispatch and terminal result.
- Validators: technical and governance validation results.
- Certification: certification decision.
- State Writer: transition write receipt.

Human-readable reports are projections and cannot replace machine-readable evidence identities and digests.

## Transition Envelope

Every mutation requires:

- transition request and idempotency identities;
- objective, revision, organization, tenant, and current-state version identities;
- previous and requested adjacent states;
- authenticated requestor and authority grant;
- evidence producer and artifact identities;
- validator decisions and versions;
- Lifecycle Governance approval identity;
- evidence references and content digests;
- repository/context identity where applicable;
- request, expiry, decision, and write timestamps;
- expected previous event digest.

The State Writer has no discretion to fill a missing field or infer evidence.

## Conflict Resolution

### Detection

An authority conflict exists when:

- two systems claim the same decision or artifact;
- a non-owner attempts mutation;
- evidence assigns different owners;
- two transition requests compete for the same state version;
- organization and platform authority conflict;
- an internal subsystem status is presented as objective state.

### Immediate Response

PBOS must:

1. freeze the disputed transition;
2. preserve current state;
3. record every claim and attempted write;
4. deny downstream planning, authorization, execution, or certification dependent on the dispute;
5. notify the responsible governance authorities.

There is no last-write-wins, administrator override, runtime inference, or silent reconciliation.

### Resolution Order

1. Apply the canonical lifecycle standard.
2. Apply this authority contract and kernel artifact ownership.
3. Validate organization/tenant scope and active authority grants.
4. Compare objective revision, expected state version, idempotency, evidence, and event chain.
5. If authority remains ambiguous, require a constitutional governance decision or amendment.

Only Lifecycle Governance may approve the resolved adjacent transition, and only the State Writer may persist it. Resolution appends a conflict-resolution event; it never rewrites history.

### Concurrent Valid Claims

Optimistic state-version comparison permits only one successful mutation. Idempotent duplicates return the original result. A different valid request based on the stale version is denied and must be reevaluated against current truth.

## Enterprise Participation Standard

### Internal Teams

Internal role or seniority does not imply authority. Actions require scoped grants and separation of duties.

### Institutional Customers

Districts, universities, employers, and organizations may act only within their tenant, contract, objective type, risk, and delegated-administration scope.

### Enterprise Partners

Partners may propose or supply evidence under contract. They receive no platform transition, planning, authorization, execution, or certification authority unless an explicit narrower grant provides it.

### Ecosystem Developers

Developers may submit governed proposals or integration evidence. Code ownership, marketplace participation, or API access never grants objective governance authority.

Cross-organization objectives retain one identity with explicit participant roles and approvals. Copying objectives into competing registries is prohibited.

## Audit Requirements

An independent auditor must reconstruct:

- who requested, reviewed, approved, validated, decided, wrote, and observed;
- which grant was valid at each action;
- which organization and objective revision were in scope;
- which evidence and context supported the decision;
- whether separation of duties held;
- whether any conflict, denial, retry, revocation, or emergency action occurred.

History is append-only and tamper-evident. Correction uses a superseding event. Revocation blocks future action without erasing historically valid decisions.

## Emergency Authority

Emergency authority may suspend or block progression. It cannot skip states, authorize execution, certify success, delete evidence, overwrite history, or bypass organization isolation. Every use requires an incident identity, reason, bounded duration, and independent retrospective review.

## Validation Standard

The authority model is valid only when conformance evidence proves:

- every mutation has exactly one transition authority and one writer;
- no subsystem can write another subsystem’s artifact;
- Handoff and Planner cannot create objectives or authorize execution;
- Execution cannot authorize or certify itself;
- Certification cannot create completion state;
- stale, cross-tenant, self-approved, evidence-free, or conflicting actions fail closed;
- every decision has a complete audit record.

## Final Authority Statement

PBOS Lifecycle Governance alone authorizes objective transitions. Objective Registry State Writer alone persists them. Each domain subsystem owns only its decision evidence. No subsystem can override another, and unresolved authority conflicts preserve current state and stop progression.
