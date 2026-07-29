---
id: PPS-3645
title: Execution Concurrency and Idempotency Standard
version: 1.0.0
status: Canonical
classification: Constitutional
owners:
  - PBOS
layer: Execution Architecture
parent: PPS-3614
depends_on:
  - PPS-3603
  - PPS-3604
  - PPS-3617
  - PPS-3619
  - PPS-3621
  - PPS-3622
related:
  - PPS-3640
  - PPS-3646
  - PPS-3647
  - PPS-3648
last_updated: 2026-07-29
---

# Purpose

Establish the constitutional architecture governing concurrent execution, resource conflict, deterministic ordering, and idempotent outcomes.

Concurrency increases execution capacity.

Concurrency shall not create competing constitutional truth.

Idempotency ensures repeated delivery or evaluation does not create duplicate constitutional outcomes.

---

# Scope

Applies to:

- Concurrent commands
- Parallel workflow branches
- Distributed execution attempts
- Retried execution
- Duplicate event delivery
- Shared governed resources
- Cross-organization execution
- Automated and AI-assisted execution
- Future concurrent execution technologies

---

# Constitutional Principles

Concurrent and idempotent execution shall preserve:

- Stable identity
- Explicit resource ownership
- Deterministic ordering
- Declared isolation
- Conflict visibility
- At-most-one constitutional effect per idempotency boundary
- Immutable attempt evidence
- Fail-closed uncertainty
- Human accountability

Technical concurrency shall never determine constitutional precedence.

---

# Concurrency Model

Every concurrent execution shall define:

- Execution request identity
- Workflow instance identity
- Execution attempt identity
- Concurrency domain
- Governed resource identities
- Resource versions
- Read and write intent
- Isolation requirement
- Conflict-detection rule
- Ordering rule
- Stable tie-breaker
- Conflict outcome
- Retry eligibility
- Evidence requirements

Executions conflict when their declared or observed effects cannot both satisfy the governing resource invariant.

Unknown effect scope shall be treated as conflicting.

---

# Concurrent Execution Identity

Every execution attempt shall have a unique attempt identity related to one execution request.

Attempt identity shall bind:

- Request identity
- Executable identity and version
- Workflow instance identity when applicable
- Actor and organization identities
- Authority identity
- Context identity
- Idempotency key
- Resource scope
- Attempt number
- Parent attempt when retried or resumed

Concurrent attempts shall never share attempt identity.

Attempts associated with the same idempotency key remain distinct evidence records while resolving to one constitutional result.

---

# Resource Ownership

Every governed resource shall have:

- Resource identity
- Resource type
- Accountable owner
- Organization scope
- Current constitutional version
- Permitted mutation authority
- Concurrency policy
- Evidence requirements

Execution shall not mutate a resource outside its admitted resource scope.

Ownership does not grant unconditional mutation authority.

Authority, policy, lifecycle, and expected resource version remain required.

---

# Conflict Detection

Conflict detection shall evaluate:

- Resource identity
- Expected version
- Observed version
- State transition
- Declared invariant
- Active lease or lock
- Concurrent admitted attempts
- Dependency state
- Organization boundary
- Side-effect state

A conflict exists when:

- Expected and observed versions differ
- Two attempts claim exclusive ownership
- State transitions are mutually incompatible
- Dependencies no longer support admission
- A lease or fencing token is invalid
- An effect cannot be proven unique
- Organization or policy boundaries disagree

Undetected conflict risk shall not be interpreted as permission.

---

# Deterministic Ordering

When two valid actions compete for the same governed resource, PBOS shall evaluate:

1. Constitutional authority
2. Policy and organization boundary
3. Explicit dependency order
4. Declared constitutional priority
5. Governed effective time
6. Stable execution request identity

An action failing a higher-order requirement is ineligible regardless of lower-order position.

The stable identity tie-breaker shall be declared before conflict and shall not depend on arrival race, process scheduling, network latency, or storage iteration order.

The winning action may proceed only after its preconditions are revalidated.

The losing action shall become rejected, deferred, suspended, or retry-eligible according to its governing policy.

Both decisions shall produce evidence.

---

# Optimistic Concurrency

Optimistic concurrency is permitted when:

- Conflict frequency is acceptably bounded
- Effects can be withheld until version validation
- The expected resource version is explicit
- A failed comparison produces no ungoverned side effect
- Retry or rejection behavior is declared

An optimistic transition shall commit only when the expected constitutional version equals the authoritative current version.

Version conflict shall create a recorded conflict outcome.

It shall not silently overwrite current truth.

---

# Pessimistic Concurrency

Pessimistic locking is permitted when exclusive access is constitutionally necessary.

Every lock or lease shall define:

- Lock identity
- Resource scope
- Owning attempt identity
- Granting authority
- Acquisition order
- Effective time
- Expiration
- Fencing token or equivalent stale-owner protection
- Renewal authority
- Release condition
- Recovery owner

Locks shall be bounded.

Indefinite, ownerless, or unverifiable locks are prohibited.

Distributed participants shall reject effects from an expired or superseded lock holder.

---

# Deadlock and Starvation

Executions requiring multiple governed resources shall declare a stable acquisition order.

Potential deadlock shall be detected through:

- Wait relationships
- Lease duration
- Dependency cycles
- Progress evidence
- Resource ownership evidence

Deadlock resolution shall select a governed victim using declared priority and the stable identity tie-breaker.

Victim selection, released resources, compensation, and retry eligibility shall be evidenced.

Priority shall not permit indefinite starvation.

Starvation thresholds and escalation ownership shall be declared by the applicable capacity policy.

---

# Idempotent Execution Contract

Every effect-producing operation shall define an idempotency contract containing:

- Idempotency key
- Key authority
- Request identity
- Executable identity and version
- Organization scope
- Operation identity
- Effect boundary
- Result identity
- Retention period
- Duplicate behavior
- Failure behavior
- Partial-effect behavior
- Retry relationship

An idempotency key shall be stable for one authorized logical request and shall not be reused for unrelated intent.

The same command delivered ten times shall produce:

- One admitted logical execution
- One constitutional result
- Distinct duplicate-delivery evidence
- Result reuse or governed pending status for duplicates

---

# Duplicate Detection

Duplicate detection shall occur before a new effect is admitted.

Duplicate evaluation shall determine whether the original request is:

- Pending
- Executing
- Completed
- Failed before effects
- Failed after possible effects
- Compensating
- Uncertain

Duplicate detection shall compare identity, authority, scope, executable version, and effect boundary.

Matching only a caller-provided key is insufficient when the governed identity differs.

Conflicting reuse of an idempotency key shall fail closed and produce a security and audit event.

---

# Result Reuse

When the original execution completed successfully, an authorized duplicate may receive the recorded result reference.

Result reuse shall:

- Preserve the original execution identity
- Preserve the original result identity
- Record the duplicate request
- Revalidate access to the result
- Avoid repeating effects

Result reuse does not create a new outcome certification.

It references the existing typed certification decisions.

---

# Failure Replay

When the original execution failed before any effect, policy may authorize a new attempt linked to the same logical request.

When the original execution failed after a confirmed effect, duplicate execution shall not repeat the effect.

When effect state is uncertain:

- Execution shall fail closed
- Reconciliation shall determine authoritative effect state
- Recovery or compensation authority shall own the next decision
- A duplicate shall not be treated as a fresh request

Failure replay shall preserve every failed attempt.

---

# Partial Execution

Partial execution shall define:

- Confirmed effects
- Confirmed non-effects
- Uncertain effects
- Remaining operations
- Compensation requirements
- Recovery authority
- Resume eligibility
- Duplicate handling

No retry, duplicate, or continuation may repeat a confirmed non-idempotent effect.

Unknown partial state shall block continuation until reconciliation or governed compensation establishes a safe boundary.

---

# State Transition Examples

## Competing Update

Two authorized attempts read resource version `7`.

Attempt A wins the declared tie-breaker and commits version `8`.

Attempt B fails expected-version validation, records a conflict, reloads governed state, and becomes retry-eligible or rejected according to policy.

Attempt B shall not overwrite version `8`.

## Duplicate Command

Ten deliveries share one valid idempotency contract.

The first admitted attempt owns effect production.

The remaining deliveries record duplicate evidence and receive pending status or the existing result reference.

## Exclusive Resource

Two attempts request an exclusive lease.

The declared ordering rule grants one bounded lease and fencing token.

The other attempt waits, defers, or fails according to its capacity and timeout policy.

---

# Failure Examples

- Version mismatch rejects a transition without side effects.
- Expired lease rejects a stale holder's mutation.
- Reused idempotency key with different authority blocks both new interpretation and effect.
- Lost duplicate registry availability blocks effect-producing admission.
- Uncertain external effect triggers reconciliation rather than blind retry.
- Deadlock triggers governed victim selection and preserves all wait evidence.

---

# Adversarial Examples

- An actor cannot gain priority by resubmitting the same request with new arrival timestamps.
- A runtime cannot win a race by committing before constitutional tie-breaking.
- A stale lock holder cannot mutate after lease replacement.
- A caller cannot hide a second action behind an existing idempotency key.
- A retry cannot erase or replace failed attempt evidence.
- A duplicate request cannot reuse a result outside its authorization and organization scope.
- Human intervention cannot authorize an overwrite that contradicts higher constitutional authority or immutable history.

---

# Human Intervention

Human intervention is required when:

- Policy conflict cannot be resolved
- Effect state remains uncertain
- Compensation requires accountable risk acceptance
- Cross-organization authority conflicts
- Resource ownership is ambiguous
- Automated conflict escalation reaches its governed threshold

Human intervention shall not:

- Rewrite ordering evidence
- Reuse unrelated idempotency identity
- Treat uncertainty as success
- Override constitutional authority
- Conceal duplicate effects

---

# Evidence Requirements

Concurrency and idempotency evidence shall include:

- Competing attempt identities
- Resource identities and versions
- Read and write intent
- Isolation policy
- Ordering inputs and result
- Tie-breaker
- Lock, lease, and fencing evidence
- Conflict decision
- Idempotency contract
- Duplicate deliveries
- Result reuse
- Attempt lineage
- Partial and uncertain effects
- Retry, compensation, and recovery decisions

Evidence shall support execution certification, outcome certification, and evidence certification.

---

# Governance

PPS-3614 owns execution governance.

PPS-3617 owns distributed execution boundaries.

PPS-3622 owns retry policy.

This standard owns concurrency conflict and idempotency meaning.

Implementations may use different concurrency mechanisms.

They shall produce the same constitutional decision from the same governed inputs.

When conflict, uniqueness, or effect state cannot be proven, execution shall fail closed.
