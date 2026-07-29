---
id: PPS-3646
title: Execution Interruption, Cancellation, and Continuation Standard
version: 1.0.0
status: Canonical
classification: Constitutional
owners:
  - PBOS
layer: Execution Architecture
parent: PPS-3614
depends_on:
  - PPS-3602
  - PPS-3613
  - PPS-3623
  - PPS-3624
related:
  - PPS-3617
  - PPS-3645
  - PPS-3647
  - PPS-3648
last_updated: 2026-07-29
---

# Purpose

Establish the constitutional architecture governing interruption, pause, cancellation, recovery, and continuation of governed execution.

An interrupted execution is not permission to continue.

Continuation is a new governed decision made from preserved evidence.

---

# Scope

Applies to synchronous, asynchronous, distributed, long-running, human-assisted, automated, and AI-assisted execution.

---

# Constitutional Principles

Interrupted execution shall preserve:

- Stable execution and attempt identity
- Explicit state ownership
- Immutable history
- Checkpoint integrity
- Revalidated authority
- Idempotent continuation
- Governed compensation
- Independent certification
- Fail-closed uncertainty

---

# Interrupted Execution Lifecycle

| State | Meaning | State Authority | Required Evidence |
|---|---|---|---|
| `RUNNING` | An admitted attempt is actively executing | Execution owner within admitted authority | Attempt, context, authorization, policy, ordered events |
| `PAUSED` | Execution stopped at a governed safe point by an authorized decision | Pause authority declared by workflow policy | Pause request, actor, reason, checkpoint, affected resources |
| `INTERRUPTED` | Execution stopped without a completed governed pause | Interruption detector records; execution owner accepts disposition responsibility | Detection, last confirmed event, uncertain effects, checkpoint status |
| `RECOVERING` | A recovery authority is evaluating or performing governed recovery | Recovery authority under PPS-3613 | Recovery authorization, plan, validation, dependencies |
| `RESUMED` | Continuation has been admitted from a validated checkpoint | Execution admission authority under PPS-3614 | New attempt, checkpoint, revalidation, idempotency, continuation decision |
| `FAILED` | Execution cannot satisfy completion criteria or safe continuation | Execution owner records; independent validator evaluates | Failure classification, effects, compensation, unresolved conditions |
| `COMPLETED` | Declared completion criteria are satisfied | Workflow state authority under PPS-3602 | Outputs, criteria evaluation, complete event and evidence lineage |

`RESUMED` is a recorded continuation transition and enters `RUNNING` under a new or explicitly correlated attempt identity.

`FAILED` and `COMPLETED` are terminal for an attempt. Recovery creates correlated governed execution; it does not rewrite a terminal attempt.

---

# Transition Rules

Permitted transitions are:

- `RUNNING` to `PAUSED`, `INTERRUPTED`, `FAILED`, or `COMPLETED`
- `PAUSED` to `RESUMED`, `FAILED`, or a governed cancellation outcome
- `INTERRUPTED` to `RECOVERING` or `FAILED`
- `RECOVERING` to `RESUMED` or `FAILED`
- `RESUMED` to `RUNNING`

Every transition requires an identified authority, a valid predecessor state, transition-specific evidence, and an append-only history entry.

An undefined transition shall fail closed.

---

# Checkpoint Ownership

The execution owner is accountable for checkpoint creation.

The evidence steward is accountable for checkpoint integrity and retention.

A checkpoint shall bind:

- Checkpoint identity
- Workflow definition and version
- Workflow instance and execution attempt
- Verified context and authorization snapshot
- Applicable policy
- Completed, pending, and uncertain work
- Confirmed external effects
- Resource versions, locks, leases, and fencing state
- Dependency state
- Evidence digest
- Producer identity and governed time

A checkpoint is evidence.

It is not authority to resume.

Missing, conflicting, stale, or unverifiable checkpoint data blocks continuation.

---

# Continuation Authority

If execution stops at 63 percent, the execution owner owns the disposition obligation, the recovery authority owns recovery evaluation, and the admission authority owns the decision to permit a continuation attempt.

Continuation requires revalidation of:

- Identity and delegated authority
- Repository and execution context
- Authorization and policy
- Workflow and executable version
- Dependencies and blocking conditions
- Capacity and organization boundaries
- Checkpoint integrity
- Idempotency and effect state
- Compensation requirements

The certifier remains independent and cannot authorize continuation.

---

# Cancellation Model

Cancellation is a governed request, not an assumed immediate outcome.

Cancellation shall define:

- Request identity and authorized actor
- Target workflow, attempt, and scope
- Cancellable and non-cancellable boundaries
- Child execution propagation
- In-flight effect handling
- Compensation obligations
- Completion condition
- Evidence and certification impact

When completion and cancellation compete, the constitutionally ordered transition with proven committed state prevails. Ambiguous ordering blocks further effects until reconciliation.

External effects that cannot be cancelled shall be recorded and either accepted through authorized disposition or compensated under PPS-3609.

---

# Compensation Requirements

Compensation shall:

- Be explicitly declared
- Have separate execution identity and authority
- Preserve the original effect
- Be idempotent
- Produce its own evidence
- Record incomplete or irreversible remediation

Compensation does not erase failure or make an interrupted attempt retroactively complete.

---

# Failure and Adversarial Examples

- A process loss after an external effect but before checkpoint persistence enters `INTERRUPTED`; it cannot blindly retry.
- An expired authorization blocks resume even when a checkpoint is valid.
- A modified workflow definition requires compatibility validation or a new governed execution.
- A late worker cannot resume after a newer fenced attempt owns the resource.
- An operator cannot relabel an interrupted attempt as completed.
- A cancellation request cannot erase an already committed, ordered transition.
- A recovery service cannot self-authorize continuation.
- AI may recommend recovery but cannot own the transition or certify its result.

---

# Evidence Requirements

Evidence shall include interruption detection, lifecycle transition, checkpoint identity and digest, authority, policy, confirmed and uncertain effects, cancellation, recovery, compensation, continuation validation, new attempt identity, and final disposition.

Evidence shall support independent execution, outcome, and evidence certification.

---

# Security and Governance

Every pause, cancellation, recovery, and continuation decision shall enforce identity, authority, organization scope, policy, evidence access, and audit requirements.

PPS-3613 owns recovery architecture.

PPS-3614 owns execution admission and governance.

This standard owns interruption, cancellation, and continuation semantics.

Unknown state, ambiguous ownership, or incomplete evidence shall fail closed.
