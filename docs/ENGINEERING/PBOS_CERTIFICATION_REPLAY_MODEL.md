# PBOS Certification Replay Model

## Purpose

Define how PBOS invalidates environmental assumptions and independently
reconstructs certification after repository context changes.

## Ownership

The context validator detects change. The independent kernel certifier owns
decision replay. Artifact history owners preserve prior evidence.

## Last Updated

July 29, 2026

## Replay Principle

A certification proves correctness only for its bound inputs. Context change
does not prove the old decision wrong; it proves the old certification is no
longer authoritative for current execution.

## Replay Flow

```text
Repository context change detected
  -> previous certification loses active authority
  -> previous evidence remains immutable
  -> context owner captures and certifies new context
  -> planning-handoff owner regenerates lineage
  -> kernel reconstructs registry and dependency snapshot
  -> kernel replays eligibility, priority, risk, and decision
  -> independent certifier compares replay identity
  -> new certification identity is generated
```

## Replay Triggers

Replay is mandatory after:

- context identity change or expiration;
- HEAD, branch, remote, root, or working-tree content change;
- engine version, gate, sprint, mode, completed history, or release-state
  change;
- objective registry or dependency evidence change;
- required artifact identity or validation-state change;
- plan, contract, work package, or authorization identity change;
- recovery from interrupted or failed execution.

## Evidence Requirements

A replay attempt must retain:

- prior context and certification identities;
- invalidation reason;
- new context and planning-handoff identities;
- objective and registry identities;
- dependency and evidence snapshot identities;
- decision and plan digests;
- validator identity and deterministic findings;
- replay outcome and timestamp.

Missing prior evidence blocks claims of continuity. It does not block creation
of a wholly new certification when all current authority is independently
established.

## Decision Outcomes

### Identical Decision

An identical selected objective and decision digest under a new context still
requires a new certification identity. Equality proves deterministic agreement,
not continuity of authority.

### Different Decision

A changed eligible set or selected objective is a new governed decision.
Previous authorization cannot transfer.

### Governed Idle

If no registered objective is eligible, replay certifies or rejects the
no-selection result. PBOS never invents work to satisfy replay.

### Rejected Replay

Any missing, stale, corrupt, ambiguous, or mismatched input produces
`REJECTED`, no transition request, and no execution.

## Preserved History

Previous context, handoff, decision, certification, and authorization artifacts
remain evidence of what PBOS knew and decided at that time. New attempts append
correlated records. No current artifact may rewrite a certified predecessor.

## Current Replay Status

The stored repository context and planning handoff reference commits older than
current HEAD. Kernel certification is correctly rejected. No replay may claim
success until the context and planning handoff owners generate current,
identity-bound evidence.

## Replay Answer

PBOS proves a prior decision remains valid after environmental change only by
recomputing it from newly certified context and comparing content identities.
It never carries certification forward by declaration.
