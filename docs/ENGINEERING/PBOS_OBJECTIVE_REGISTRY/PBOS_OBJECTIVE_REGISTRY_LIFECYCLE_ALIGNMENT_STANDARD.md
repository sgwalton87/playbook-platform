# PBOS Objective Registry Lifecycle Alignment Standard

## Document Status

Status: Canonical  
Authority: Playbook Operating System (PBOS)  
Layer: Objective Governance  
Owner: PBOS Lifecycle Governance  
Effective: July 29, 2026

## 1. Executive Summary

PBOS objectives cross strategic intake, planning, authorization, execution, validation, and certification. If each subsystem interprets objective state independently, PBOS cannot reliably answer what is authorized, which evidence is current, or who may advance work. At enterprise scale, that ambiguity permits skipped controls, duplicate writers, stale approvals, false completion, and irreconcilable audit history.

This standard establishes one canonical objective lifecycle and one state authority model. PBOS Lifecycle Governance is the sole transition decision authority. The Objective Registry is the canonical state custodian and its State Writer is the only persistence path. Other subsystems produce or validate evidence; none may independently mutate objective state.

The architectural outcome is a ten-state, adjacent-only lifecycle:

```text
PROPOSED
→ REVIEWED
→ REGISTERED
→ ELIGIBLE
→ PLANNED
→ AUTHORIZED
→ EXECUTING
→ VALIDATING
→ CERTIFIED
→ ARCHIVED
```

## Authority And Precedence

This standard is the authoritative vocabulary for objective state. Where earlier Objective Registry, Planning Handoff, implementation, certification, or review documents use another objective lifecycle, those terms are historical or subsystem-local and cannot be written as current objective state.

This standard does not merge gate, release, authorization-decision, execution, or certification-attempt lifecycles. Those systems retain their own internal state machines while emitting evidence for objective transitions.

## Lifecycle Alignment Analysis

Earlier vocabularies exposed implementation mechanics as objective states or omitted enterprise control points. The canonical model makes these decisions:

| Earlier term | Canonical treatment | Reason |
| --- | --- | --- |
| `SUBMITTED` | Proposal submission event within `PROPOSED` | Submission does not establish a new governance authority. |
| `REVIEWED` | Canonical objective state | Enterprise review must be visible before registration. |
| `APPROVED` | Approval evidence required to enter `REGISTERED` | Approval is a decision artifact, not a durable objective phase. |
| `EVALUATED` | Evaluation evidence required to enter `ELIGIBLE` | Evaluator completion does not itself authorize progression. |
| `HANDOFF_READY` | Eligibility/handoff readiness evidence | Readiness is part of eligibility. |
| `HANDED_OFF` or `CONSUMED` | Planning Handoff evidence required to enter `PLANNED` | Handoff translates intent but owns no lifecycle state. |
| `AUTHORIZED` | Canonical objective state | Execution approval must be observable and distinct from planning. |
| `VALIDATING` | Canonical objective state | Execution completion is not certification; validation must be explicit. |
| `COMPLETED` | Replaced by `CERTIFIED` | Completion without certification is ambiguous. `CERTIFIED` is the governed outcome state. |
| Certification `UNDER_REVIEW`, `EXPIRED`, `REVOKED` | Certification-attempt states or dispositions | They do not become objective lifecycle states. Revocation blocks progression and creates evidence. |

Migration from a retired term requires an immutable migration event recording source term, target state, objective revision, authority, evidence, timestamp, and both content digests. Silent reinterpretation is prohibited.

## 2. Canonical Objective Lifecycle

| State Name | Purpose | Entry Requirements | Exit Requirements | Authority Owner | Evidence Required |
| --- | --- | --- | --- | --- | --- |
| `PROPOSED` | Preserve authorized strategic intent before governance acceptance. | Objective and revision identity; creator and organization authority; source; purpose; owner; initial success definition. | Complete review package and resolved blocking intake defects. | Objective Registry intake under Lifecycle Governance policy. | Creation event, authority grant, source digest, proposal digest. |
| `REVIEWED` | Record that required strategic, architecture, security, data, accessibility, operational, and organization reviews occurred. | Proposal is complete; required reviewers are independent and authorized; findings are recorded. | Required findings resolved or explicitly accepted; authorized approval is present. | Lifecycle Governance review authority. | Review identities, findings, resolutions, approval decision, reviewed revision digest. |
| `REGISTERED` | Establish the objective as canonical governed strategic truth. | Review and approval valid; uniqueness and duplication checks pass; metadata, dependencies, evidence requirements, and ownership are complete. | Deterministic eligibility evaluation passes for the current revision and context. | Objective Registry as custodian; transition approved by Lifecycle Governance. | Registration event, approval chain, registry identity, objective digest, dependency declaration. |
| `ELIGIBLE` | Confirm the registered objective may enter constitutional planning. | Context, authority, architecture alignment, dependencies, evidence definitions, organization policy, and blocking conditions pass. | Valid Planning Handoff and Constitutional Planner decision bind exactly one gate or governed planning result. | Lifecycle Governance, using Objective Evaluator and Planning Handoff validation. | Eligibility evaluation, context identity, dependency/evidence snapshots, handoff identity. |
| `PLANNED` | Bind the objective to a constitutional gate and governed sequence without authorizing execution. | Objective remains eligible; Handoff lineage is valid; Constitutional Planner selects a gate; no competing active plan exists. | Execution contract and work package validate; explicit authorization decision is `AUTHORIZED`. | Constitutional Planner owns gate selection; Lifecycle Governance owns the objective transition. | Handoff identity, planner decision, gate identity/digest, plan lineage. |
| `AUTHORIZED` | Record explicit permission for the planned scope to execute. | Contract, work package, gate, objective, approver, scope, immutable references, expiry, and separation of duties validate. | Authorized adapter dispatch begins within scope and validity window. | Execution Authorization authority; Lifecycle Governance records the objective transition. | Authorization identity, decision, approver grant, contract/work-package digests, expiry. |
| `EXECUTING` | Represent authorized implementation in progress. | Valid unexpired authorization; adapter and execution identity; dispatch scope matches authorized artifacts. | Execution reaches a governed terminal result and required validation package is complete enough to begin validation. | Execution Engine owns execution; Lifecycle Governance owns the objective transition. | Dispatch and execution identities, adapter version, input/output digests, interruption/recovery events. |
| `VALIDATING` | Prove the exact execution satisfies declared technical, governance, security, and success requirements. | Execution terminal evidence exists; repository result and required validators bind to the execution identity. | All mandatory validation passes and certification review accepts the complete traceability chain. | Runtime and declared validators produce evidence; Certification Framework evaluates it; Lifecycle Governance owns transition. | Validation plan, validator identities/versions, results, logs/evidence digests, exception decisions. |
| `CERTIFIED` | Establish the governed objective outcome as legitimately achieved. | Full objective-to-certification lineage verifies; success criteria pass; no unresolved critical findings; certification decision is approved. | Retention, legal hold, dependency, operational handoff, and archival requirements pass. | Certification Framework owns certification decision; Lifecycle Governance owns objective state. | Certification identity, success-criteria mapping, complete lineage, decision authority, timestamp. |
| `ARCHIVED` | Retain immutable objective truth after active governance ends. | Certification is durable; active dependencies and obligations are resolved; retention/legal policy approves archival. | No forward exit. A successor requires a new objective/revision identity and relationship. | Objective Registry retention authority under Lifecycle Governance. | Archival approval, retention policy, dependency check, final event-chain digest. |

## Dispositions

`BLOCKED`, `REJECTED`, `EXPIRED`, `REVOKED`, `FAILED`, and `SUPERSEDED` are dispositions, not forward states. A disposition:

- preserves the current objective state;
- records reason, authority, evidence, and remediation;
- may invalidate eligibility, planning, or authorization;
- cannot move an objective backward by editing history;
- requires a new adjacent transition attempt after remediation.

## 3. Lifecycle Ownership Model

### Singular Authority Model

- **PBOS Lifecycle Governance:** sole authority that approves or denies objective transitions.
- **Objective Registry:** canonical custodian of current state and immutable history.
- **Objective Registry State Writer:** sole persistence mechanism for an approved transition envelope.
- **PBOS Kernel:** enforces artifact writer ownership.

### Subsystem Responsibilities

| Subsystem | Owns | May Observe | May Request | May Modify Objective State |
| --- | --- | --- | --- | --- |
| Objective Registry | Objective identity, revisions, metadata, current state, history | All authorized objective evidence | Creation, registration, archival | Only its State Writer using an approved envelope |
| Planning Handoff | Context-bound translation of eligible intent | `REGISTERED`, `ELIGIBLE`, relevant evidence | Eligibility or planning transition with evidence | No |
| Constitutional Planner | Gate selection and sequence | Eligible objective/handoff evidence | `ELIGIBLE → PLANNED` | No |
| Lifecycle Governance | Transition policy and approval | Every transition input and result | Any adjacent transition within authority policy | Approves; does not bypass State Writer |
| Execution Authorization | Authorization decision | Planned objective, gate, contract, work package | `PLANNED → AUTHORIZED` | No |
| Execution Engine | Authorized dispatch and execution result | Authorized lineage and scope | `AUTHORIZED → EXECUTING`, then validation readiness | No |
| Certification Framework | Validation assessment and certification decision | Complete execution and validation lineage | `VALIDATING → CERTIFIED` | No |

### Transition Ownership

| Transition | Evidence Producer | Validator | Transition Authority | Canonical Writer |
| --- | --- | --- | --- | --- |
| Create `PROPOSED` | Authorized Creator | Identity and intake validators | Lifecycle Governance intake policy | Objective Registry State Writer |
| `PROPOSED → REVIEWED` | Governance Reviewers | Review coverage and independence validator | Lifecycle Governance | Objective Registry State Writer |
| `REVIEWED → REGISTERED` | Objective Owner and Approver | Registry, authority, uniqueness, metadata validators | Lifecycle Governance | Objective Registry State Writer |
| `REGISTERED → ELIGIBLE` | Objective Evaluator and Planning Handoff | Context, dependency, evidence, architecture, organization validators | Lifecycle Governance | Objective Registry State Writer |
| `ELIGIBLE → PLANNED` | Planning Handoff and Constitutional Planner | Handoff lineage and planner eligibility validators | Lifecycle Governance | Objective Registry State Writer |
| `PLANNED → AUTHORIZED` | Execution Authorization | Contract, work package, scope, authority validators | Lifecycle Governance | Objective Registry State Writer |
| `AUTHORIZED → EXECUTING` | Execution Engine | Authorization freshness and adapter dispatch validators | Lifecycle Governance | Objective Registry State Writer |
| `EXECUTING → VALIDATING` | Execution Engine | Terminal execution, repository, and evidence-package validators | Lifecycle Governance | Objective Registry State Writer |
| `VALIDATING → CERTIFIED` | Certification Framework | Full traceability and success-criteria validators | Lifecycle Governance | Objective Registry State Writer |
| `CERTIFIED → ARCHIVED` | Objective Owner/Retention Authority | Retention, legal hold, dependency, operational handoff validators | Lifecycle Governance | Objective Registry State Writer |

## 4. Invalid Transition Rules

PBOS must reject:

- any skipped, backward, or unknown transition;
- any transition from `ARCHIVED`;
- registration without completed review and approval;
- eligibility without current context, dependency, authority, and evidence validation;
- planning without `ELIGIBLE` state and valid Planning Handoff lineage;
- planning selected by Objective Registry or Planning Handoff rather than Constitutional Planner;
- authorization without a planned gate, contract, work package, immutable references, and authorized approver;
- execution without current `AUTHORIZED` state or after authorization expiry/revocation;
- execution outside authorized scope;
- validation without an exact terminal execution identity;
- certification without all mandatory validation and complete traceability;
- archival without certification, retention approval, and dependency resolution;
- direct mutation by any evidence producer;
- mutation by manual artifact editing;
- transition based on stale context, superseded objective revision, revoked grant, digest mismatch, cross-organization scope, or conflicting active plan;
- “completion” asserted without validation and certification.

Every denial appends a non-mutating attempt event. Failure never erases or rewrites prior state.

## 5. Enterprise Audit Requirements

Every successful or denied transition attempt records:

- event, transition request, and idempotency identities;
- objective, revision, organization, tenant, and current-state version identities;
- previous, requested, and resulting states;
- requestor, reviewers, approver, validators, State Writer, and their authority grants;
- Planning Handoff, gate, authorization, execution, validation, and certification identities where applicable;
- evidence references, content digests, schema and validator versions;
- repository and context identities where applicable;
- request, decision, write, and observation timestamps;
- decision, reasons, dispositions, and remediation;
- previous event digest and current event digest.

History is append-only and tamper-evident. Corrections and redactions use superseding events and governed tombstones. Context refresh never changes historical truth; it only determines whether old evidence may authorize a new action.

Concurrent requests require optimistic state-version comparison and idempotent results. Audit access is read-only, organization-scoped, purpose-bound, retained under policy, and exportable without exposing another tenant.

## 6. PBOS Integration Impact

### Objective Registry

The Registry stores only canonical states from this standard. Earlier states require explicit migration evidence. The Registry rejects direct writes and accepts only Lifecycle Governance-approved transition envelopes.

### Planning Handoff

Handoff may evaluate `REGISTERED` objectives and produce evidence supporting `ELIGIBLE`. It may translate an `ELIGIBLE` objective into a context-bound planning artifact. Handoff has no objective state of its own and cannot select a gate or persist a transition.

### Constitutional Planner

The Planner remains the sole gate-selection authority. Its decision and gate binding are required evidence for `ELIGIBLE → PLANNED`. It cannot create objectives, approve execution, or write objective state.

### Lifecycle Governance

Lifecycle Governance applies this adjacent-transition policy independently from internal gate and release state machines. It approves or denies transitions but persists them only through the Objective Registry State Writer.

### Execution Authorization

Authorization is an explicit objective state because enterprise audit must distinguish planned work from executable work. An objective approval, gate selection, or handoff is never execution authorization.

### Certification Framework

Certification-attempt states remain internal to Certification. Only a passing, current certification decision with complete lineage can support `VALIDATING → CERTIFIED`. Certification cannot write objective state or fabricate completion.

## Conformance And Failure Conditions

Alignment is valid only when:

- all producers and consumers use this vocabulary;
- every transition is adjacent and has one authority and one writer;
- retired terms cannot enter current-state storage;
- required evidence identities are machine-validatable;
- stale, unauthorized, duplicate, cross-tenant, or incomplete transitions fail closed;
- conformance tests prove Planner, Handoff, Authorization, Execution, and Certification cannot mutate objective state.

## Architecture Decision

One canonical lifecycle now exists. State custody, transition authority, evidence production, and persistence are distinct. Every transition has an owner, validator, writer, and evidence contract. No subsystem may interpret its local process state as objective lifecycle truth.
