---
id: PPS-3652
title: Exceptional Workflow Transition Governance Standard
version: 1.0.0
status: Canonical
classification: Constitutional
owners:
  - PBOS
layer: Execution Architecture
parent: PPS-3602
depends_on:
  - PPS-3601
  - PPS-3614
  - PPS-3646
related:
  - PPS-3616
  - PPS-3653
  - PPS-3654
  - PPS-3656
last_updated: 2026-07-29
---

# Purpose

Govern every exceptional workflow-instance transition without creating an alternate lifecycle.

PPS-3601 remains the canonical execution lifecycle authority.

PPS-3602 remains workflow-instance authority.

This standard defines how deviation from the expected path remains authorized, evidenced, recoverable, and auditable.

---

# Lifecycle Alignment

Canonical normal states are:

```text
Requested -> Authorized -> Planned -> Validated
-> Eligibility Certified -> Executing -> Observed
-> Completion Evaluated -> Evidence Certified
-> Execution Certified -> Outcome Certified -> Completed
```

Exceptional states are:

```text
Rejected | Cancelled | Suspended | Paused | Failed
| Recovering | Compensating | Terminated
```

`Paused` is a governed safe interruption. `Suspended` is a governance hold. `Terminated` is an irreversible administrative terminal disposition. These specialize, but do not replace, the lifecycle in PPS-3601 and PPS-3646.

---

# Transition Contract

Every transition shall bind:

- Workflow, definition version, execution, attempt, and transition identity
- Source state and expected state version
- Target state
- Initiating authority and actor
- Owner and organization
- Trigger and purpose
- Required approvals and policy
- Preconditions and affected effects
- Evidence inventory
- Certification impact
- Recovery, compensation, and audit obligations

A stale expected state, undefined edge, missing authority, or incomplete evidence rejects the transition without mutation.

---

# Exceptional Transition Matrix

| From | To | Initiating Authority and Allowed Actors | Approval and Ownership | Evidence and Audit | Certification and Recovery Impact |
|---|---|---|---|---|---|
| Any pre-execution normal state | `Rejected` | Admission, policy, validation, or eligibility authority; authorized reviewer or governed system | Execution owner receives disposition; rejection authority must be independent where policy requires | Failed requirement, actor, rule, evidence, reason | Eligibility cannot certify; no execution recovery unless a new request resolves the rejection |
| Any non-terminal state | `Cancelled` | Declared cancellation authority; requester, owner, operator, or policy actor only within grant | Resource/effect owners approve non-cancellable or compensating disposition | Cancellation request, ordering, in-flight effects, propagation, final state | Pending certifications stop; completed effects require compensation or explicit residual outcome |
| Any non-terminal state | `Suspended` | Governance, security, policy, certification, organization, or incident authority | State owner remains accountable; hold owner controls release conditions | Hold identity, cause, scope, affected work, review date | Current trust cannot authorize new effects; resume requires full revalidation |
| `Executing` | `Paused` | Declared pause authority or safe-point controller | Execution owner remains accountable | Checkpoint, effects, leases, resources, reason | No completion recognition; resume follows PPS-3646 |
| Any active state | `Failed` | Execution owner records; validator, runtime, dependency, security, or policy evidence may trigger | Failure owner and execution owner are identified separately | Failure identity/class, last valid state, effects, evidence gaps | Execution/outcome certification cannot pass; recovery or terminal disposition required |
| `Failed`, `Suspended`, or `Paused` | `Recovering` | Recovery authority under PPS-3613/PPS-3656 | Domain owners approve affected state; incident authority coordinates | Recovery plan, authority, checkpoint, dependencies, risk | New eligibility decision required; prior failure remains immutable |
| `Failed` or `Recovering` | `Compensating` | Compensation authority declared by workflow and effect owner | Every affected effect owner approves its compensation boundary | Original and compensating operation, authority, irreversible effects | Compensation receives separate execution evidence and certification |
| `Compensating` | `Failed` | Compensation executor records; validator confirms failure | Compensation owner owns remediation and escalation | Attempt, partial reversal, residual effects | Outcome remains uncertifiable; further recovery or termination required |
| `Compensating` | `Completion Evaluated` | Workflow completion authority after compensation criteria validate | Execution owner accepts declared compensated outcome | All effects, compensation results, completion criteria | Certification evaluates the compensated outcome, never a fabricated original success |
| `Paused`, `Suspended`, or `Recovering` | Applicable prior normal state | Admission authority after release/recovery validation | Hold/recovery authority confirms conditions; execution owner resumes accountability | New attempt, context, authority, policy, version, dependencies | New eligibility certification; expired or revoked trust cannot be reused |
| Any non-terminal state | `Terminated` | Constitutional, security, organization, or accountable administrative termination authority | Required quorum or approval by risk; owner receives final disposition | Cause, authority, effects, unresolved obligations, notifications | All pending certifications reject or revoke as applicable; no resume |

No exceptional state may transition directly to `Completed`.

Completion requires the canonical completion-evaluation and typed-certification stages.

---

# Duplicate, Stale, and Competing Transitions

Transition identity and expected state version provide idempotency and compare-and-set semantics.

Duplicates reuse the established transition result and remain observable.

Stale transitions reject.

Competing valid transitions use constitutional precedence, policy, causal order, and stable identity tie-breaking. Security or authority loss takes precedence over convenience or scheduling.

Ambiguous order suspends mutation pending reconciliation.

---

# Certification Impact

Every exceptional transition shall identify affected eligibility, evidence, execution, and outcome certification.

Suspension, failure, dispute, or compromised authority may suspend or invalidate prior trust under PPS-3654.

Certification authorities do not initiate workflow transitions except where their own trust decision creates an explicit governed hold or revocation consequence.

---

# Recovery and Historical Integrity

Recovery creates a correlated attempt and new transition evidence.

Correction creates a new governed event.

Neither rewrites source state, failure, cancellation, termination, evidence, or certification history.

Unknown disposition remains blocked.

---

# Governance

No workflow can escape its lifecycle through exception handling.

Every edge has an authority, owner, evidence obligation, certification consequence, and recovery disposition.

Implementation shortcuts, database mutation, operator access, or AI action cannot create a transition not governed here and by the root lifecycle authorities.
