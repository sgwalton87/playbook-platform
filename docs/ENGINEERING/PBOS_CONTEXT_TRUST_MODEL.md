# PBOS Context Trust Model

## Purpose

Define repository context as an enterprise trust artifact and specify the
identity conditions required before it can authorize planning or execution.

## Ownership

PBOS Repository Context subsystem.

## Last Updated

July 29, 2026

## Related Documents

- [Context Authority Model](./PBOS_CONTEXT_AUTHORITY_MODEL.md)
- [Context Reconciliation Contract](./PBOS_CONTEXT_RECONCILIATION_CONTRACT.md)
- [Certification Replay Model](./PBOS_CERTIFICATION_REPLAY_MODEL.md)

## Trust Artifact

A context artifact is a signed-by-process assertion over an immutable snapshot.
Its SHA-256 identity binds the complete snapshot. Trust requires both internal
integrity and equality with current observation; a valid digest over stale
content is not execution authority.

## Required Identity Model

### Repository Identity

Resolved repository root, canonical repository identifier, configured remote
name, and normalized remote URL must agree.

### Commit Identity

Captured HEAD SHA, current HEAD SHA, branch, upstream, and behind count must
agree with constitutional configuration.

### Working Tree Identity

Clean/dirty classification, structural working-tree digest, and relevant
file-content digest must agree. Content identity prevents status-equivalent
dirty trees from sharing trust.

### Artifact Identity

Every required runtime artifact must exist, have its registered owner, match
its captured digest, reference compatible gate and branch state, and meet
status and freshness requirements.

### Environment Identity

Execution mode, repository root, branch alignment, configured remote, and
applicable release environment must match the context in which execution is
requested.

### Engine Identity

Engine version, current gate, active sprint, completed-gate history, and
execution mode must equal current canonical engine state.

### Certification Identity

Certification identity binds context version, snapshot digest, validator
identity, validation result, timestamp, and previous/new context linkage.
Certification identity changes whenever any bound input changes.

## Validity Rules

Context is trustworthy enough for execution only when:

- schema version is supported;
- artifact identity recomputes exactly;
- capture time is valid and within the freshness window;
- all seven identity domains validate;
- current gate equals active sprint;
- runtime validation is a legitimate `PASS`;
- no required artifact conflict exists;
- independent candidate certification passes;
- the consumer revalidates immediately before its governed decision.

Every condition is conjunctive. Partial validity is invalid.

## Expiration Rules

The current implementation expires context after 24 hours. Expiration does not
destroy historical integrity. It removes active authority and requires a new
observation and certification.

Future policy may shorten the window by execution class or risk, but may never
extend an already expired artifact retroactively.

## Invalidation Rules

Immediate invalidation occurs on:

- root, remote, repository, branch, upstream, or HEAD change;
- working-tree structure or content change;
- engine or lifecycle state change;
- artifact creation, deletion, owner mismatch, digest change, stale timestamp,
  invalid validation status, or incompatible gate/branch reference;
- unsupported schema or broken artifact digest;
- missing current observation.

Invalidation is detected, not manually issued. The validator records the
reason.

## Recovery Rules

Recovery requires:

1. stop planning, certification, authorization, and execution;
2. classify artifact conflicts through the reconciliation owner;
3. regenerate stale inputs through their canonical owners;
4. invoke context refresh with reason and current observation;
5. independently certify before publication;
6. append previous/new identity history;
7. regenerate planning handoff;
8. replay kernel certification.

No step may edit prior context or certification history.

## Trust Decision

Context is trustworthy enough for execution when its certified identity equals
current repository and runtime reality at the decision boundary, and every
dependent artifact proves the same context lineage. Prior certification cannot
be carried forward by assumption.
