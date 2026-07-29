# PBOS Execution Transition Contract

## Purpose

Define the enforceable boundary between constitutional decision,
authorization, runtime execution, and resulting evidence.

## Ownership

The execution kernel owns decision and transition-request construction. The
`execution-authorization` owner owns approval state. The execution engine owns
adapter dispatch and the execution artifact. Registered State Writers alone may
apply lifecycle mutations.

## Last Updated

July 29, 2026

## Related Documents

- [PBOS Execution Context Trust Model](./PBOS_EXECUTION_CONTEXT_TRUST_MODEL.md)
- [PBOS Execution Kernel Certification Model](./PBOS_EXECUTION_KERNEL_CERTIFICATION_MODEL.md)
- [PPS-4003 Kernel Lifecycle](../CONSTITUTION/VOLUME_40_PBOS_KERNEL_ARCHITECTURE/PPS-4003_KERNEL_LIFECYCLE.md)
- [PPS-4009 Kernel Security](../CONSTITUTION/VOLUME_40_PBOS_KERNEL_ARCHITECTURE/PPS-4009_KERNEL_SECURITY.md)

## Contract Boundary

```text
Execution Kernel Decision
  -> Independent Certification
  -> Immutable Transition Request
  -> Durable Authorization Validation
  -> Execution Adapter Dispatch
  -> Outcome and Validation Evidence
  -> Authorized State Writer
```

No arrow is optional. A downstream system may reject an upstream artifact but
may not repair, reinterpret, or replace it.

## Before Transition

### Valid Context

Repository context must validate immediately before the decision. Its
repository, commit, working-tree, runtime, and required-artifact identities must
match the current observation.

### Certified Decision

Certification status must be `CERTIFIED`, the replayed decision digest must
match, and the selected objective must have a content-addressed execution plan.
Certification with missing plan or selected-objective mismatch is invalid.

### Authorized Objective

The selected objective must be registered, `READY`, dependency-complete,
unblocked, authority-bound, and identical to the objective referenced by the
planning handoff, contract, work package, and authorization.

### Approved Plan

The execution contract and work package must exist and match their immutable
authorization references. Authorization must be `AUTHORIZED` with approver
identity, approval reason, reviewed evidence, and decision timestamp.

## Transition Request

A transition request is a proposal, not a mutation. It must include:

- deterministic request identity;
- objective identity;
- previous and requested lifecycle states;
- constitutional authority;
- decision digest;
- certification digest;
- observation timestamp.

Before runtime execution, the authorization boundary must additionally bind:

- authorization identity;
- execution-contract identity and digest;
- work-package identity and digest;
- execution actor identity and delegated authority scope.

The current kernel request contract does not yet include authorization identity
or execution actor identity. Therefore the authorization service and execution
engine must retain these as separate mandatory dispatch inputs. Merging them
into one persisted transition envelope requires a future governed schema and
cannot be inferred from current artifacts.

## During Transition

The runtime must:

1. revalidate request, decision, plan, context, contract, work package, and
   authorization identities;
2. record execution actor and authorization authority;
3. use the request timestamp as historical input and record actual dispatch
   time separately;
4. emit structured correlation and execution identifiers;
5. collect adapter input, output, diagnostics, and artifact changes;
6. stop immediately on identity, authorization, validation, or adapter failure.

Partial lifecycle mutation is prohibited. The runtime may stage work, but only
an authorized State Writer may commit a transition after required validation.

## After Transition

The outcome package must include:

- execution identity and transition-request identity;
- objective, decision, certification, and authorization identities;
- actor identity;
- adapter outcome and diagnostics;
- exact artifact changes and their before/after digests;
- post-execution validation results;
- success or failure classification;
- rollback procedure and rollback outcome when invoked;
- evidence and certification timestamps.

A successful adapter call without complete evidence is not a certified
transition. A failed transition appends failure and recovery evidence and
preserves prior valid state.

## Failure And Rollback

Failure before dispatch produces no runtime change. Failure during dispatch:

- terminates subsequent work;
- records the last verified boundary;
- invokes only a constitutionally registered rollback procedure;
- never fabricates the pre-transition state;
- never rewrites certified history;
- requires fresh validation and certification before retry.

Ambiguous outcome is treated as failure and requires operator reconciliation.

## Planning Handoff Reconciliation

`pbos/runtime/planning-handoff.json` is owned exclusively by
`planning-handoff` and produced by `npm run pbos:planning-handoff`.

At review time its latest record:

- is `GOVERNED_IDLE`;
- contains no objective identity;
- references commit `dd3d5a5f5211f43cffe8946221765911bce32a4a`;
- references context identity
  `3be183298b985ebac8060e8e90143ae4d1aadfa2f28bf3be2329daca4ecb49ca`;
- preserves three content-addressed history records.

It is truthful historical evidence but is stale relative to current HEAD and
context.

Regeneration occurs only after:

1. artifact reconciliation reports no unresolved conflict;
2. repository context is canonically refreshed and validates;
3. the objective registry is loaded from its canonical source;
4. objective and dependency evidence validates.

The planning-handoff owner then creates a new record, validates lineage,
computes `recordId`, and appends it to history. Existing records are never
deleted, reordered, or edited. If no objective is registered, the only valid
result remains a new identity-bound `GOVERNED_IDLE` record.

## Minimum Observability

Operators require one correlated view containing:

- kernel state: blocked, certified, or executing;
- context state: identity, captured time, validity, and failure reasons;
- planning state: handoff identity, selected objective or governed idle;
- certification state: decision, plan, validator, evidence, and findings;
- transition state: absent, pending authorization, authorized, dispatched,
  failed, rolled back, or completed;
- authorization state and approver;
- historical decision and transition identities.

Minimum metrics include context rejection count, certification outcome count,
authorization state count, transition attempts, dispatch failures, rollback
attempts, and end-to-end decision-to-outcome duration.

## Controlled Execution Readiness

The architecture is ready to remain fail-closed and to evaluate controlled
execution. It is not currently eligible to execute because:

- repository context is stale;
- planning handoff is bound to an older context and commit;
- no objective is registered or selected;
- authorization is `PENDING`;
- no current certified plan exists.

The permitted next action is governed context refresh followed by
planning-handoff regeneration and kernel recertification. This document does
not authorize those actions and no transition was executed during its creation.
