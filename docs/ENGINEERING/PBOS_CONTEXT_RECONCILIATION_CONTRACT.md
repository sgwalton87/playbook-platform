# PBOS Context Reconciliation Contract

## Purpose

Define the governed data and authority contract connecting repository
observation, context publication, planning handoff, kernel evaluation, and
certification replay.

## Ownership

Repository Adapter observes. Repository Context owns context publication.
Planning Handoff owns planning lineage. The Kernel evaluates. Independent
Certification determines certification outcome.

## Last Updated

July 29, 2026

## Participants

```text
Repository Adapter
  -> Context Generator
  -> Context Validator and Certifier
  -> Repository Context Owner
  -> Planning Handoff Owner
  -> Execution Kernel
  -> Independent Certification
```

## Inputs

Reconciliation requires:

- expected repository root and configured remote;
- current repository/Git/working-tree observation;
- canonical engine and lifecycle state;
- required runtime-artifact inventory and ownership registry;
- previous context and refresh history, when present;
- canonical objective registry;
- previous planning-handoff history;
- explicit refresh reason.

No undocumented input may affect the result.

## Outputs

Successful reconciliation produces:

- certified repository-context candidate;
- appended context-refresh record linking previous and new identity;
- regenerated planning-handoff record linked to the new context;
- deterministic kernel decision;
- independent certification result;
- operator diagnostics and correlation identities.

It does not produce execution authorization or apply a state transition.

## Identity Requirements

All outputs must bind:

- repository, commit, working-tree, environment, and engine identities;
- context and previous-context identities;
- objective and registry identities, or explicit governed idle;
- dependency and evidence snapshot identities;
- decision, plan, and certification identities;
- producer, validator, and registered owner.

Cross-artifact identity disagreement is a hard failure.

## Validation Requirements

1. Inspect artifact consistency without modifying truth.
2. Reject ambiguous ownership or invalid durable history.
3. Validate current observation against constitutional configuration.
4. Certify context candidate before publication.
5. Validate context history before append.
6. Reevaluate objective eligibility from the canonical registry.
7. Validate planning lineage and history before append.
8. Replay kernel decision and certification.

Each producer may write only its registered artifacts.

## Failure States

| Failure | Required Result |
|---|---|
| Unknown repository or remote | Context rejected |
| Stale/mismatched HEAD or content | `REFRESH_REQUIRED` |
| Conflicting artifact owner or identity | Reconciliation blocked |
| Invalid context history | Publication blocked |
| Invalid objective registry or dependency | Planning blocked |
| Handoff bound to old context | Handoff not current authority |
| Replay disagreement | Certification rejected |
| Publication partially fails | No execution; operator reconciliation required |

## Recovery

Recovery invokes canonical owners in dependency order:

```text
Artifact owner regeneration
  -> context refresh
  -> planning-handoff regeneration
  -> kernel replay
  -> independent certification
```

Recovery never deletes evidence, invents missing transitions, transfers
authorization, or activates execution.

## Current Contract Assessment

Existing implementation provides repository observation, digest-based context
generation, independent context certification, owner-enforced publication,
append-only refresh history, planning lineage, handoff history, and
deterministic kernel replay.

Missing controls:

- one persisted reconciliation transaction spanning context through
  certification;
- durable machine-readable kernel decision and certification history;
- explicit context lifecycle-state artifact;
- actor identity on refresh and certification attempts;
- atomic cross-owner publication semantics.

These gaps require implementation before autonomous reconciliation.
