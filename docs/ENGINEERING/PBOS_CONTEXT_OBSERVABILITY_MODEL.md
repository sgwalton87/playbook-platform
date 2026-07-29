# PBOS Context Observability Model

## Purpose

Define the minimum operational visibility required to understand current
context authority, invalidation, reconciliation, and certification replay.

## Ownership

Context owners emit context evidence. Kernel and certification owners emit
decision evidence. PBOS operational reporting correlates evidence without
modifying it.

## Last Updated

July 29, 2026

## Operator Questions

At any moment an operator must be able to answer:

- What context identity is active?
- What identity preceded it?
- What repository commit and content does it bind?
- Is it valid, expired, invalidated, or awaiting refresh?
- Why did invalidation occur?
- Which certification was bound to it?
- Has replay started, passed, or failed?
- Why is execution blocked?

## Required Context View

The operational view must expose:

- current and previous context identities;
- schema and validator versions;
- repository, branch, commit, remote, and content digest;
- captured time, age, and expiration time;
- effective lifecycle state;
- validation status and complete findings;
- refresh reason and triggering conditions;
- context owner and certification identity.

## Required Replay View

Replay visibility must include:

- prior and candidate context identities;
- planning-handoff record and registry identities;
- objective identity or governed idle;
- dependency and evidence snapshot identities;
- decision and plan digests;
- certification status, validator, findings, and digest;
- replay start/completion times and correlation identity.

## Required Execution View

Execution blocking must distinguish:

- context invalid;
- context expired;
- artifact conflict;
- planning handoff stale;
- no eligible objective;
- certification rejected;
- authorization pending or denied;
- transition unavailable;
- adapter or post-validation failure.

Generic `blocked` without the owning stage and evidence is insufficient.

## Structured Events

Context operations should emit immutable events for:

- observation captured;
- candidate generated;
- validation passed or failed;
- certification passed or rejected;
- context activated;
- context invalidated;
- refresh required;
- context superseded;
- planning handoff regenerated;
- certification replay started and completed.

Every event requires timestamp, correlation identity, context identity,
producer, validator where applicable, status, input/output digests, and evidence
references.

## Metrics

Minimum metrics:

- active-context age;
- validation and certification outcome counts;
- invalidations by reason;
- refresh attempts, successes, and failures;
- artifact conflicts by owner;
- replay attempts and outcomes;
- context-to-handoff and context-to-certification latency;
- executions blocked by context;
- time spent in `REFRESH_REQUIRED`.

Metrics are observational and cannot alter decisions.

## History And Retention

Operators require chronological access to context refresh, planning handoff,
kernel decision, certification, authorization, and execution evidence. History
must be queryable by context, correlation, objective, decision, and
certification identity.

Certified records are immutable. Redaction or retention enforcement must
preserve identity and audit evidence under constitutional policy.

## Current Implementation Maturity

### Operational

- `pbos:status` reports context validity, identity, last refresh, refresh
  requirement, artifact health, planning health, kernel decision, certification
  status, and report digest.
- Context validation returns deterministic detailed findings.
- Context refresh and planning handoff preserve append-only history.
- Kernel emits fourteen structured stage events in deterministic order.

### Partial

- Context lifecycle state is inferred rather than persisted.
- Kernel decision and certification are rendered but lack a registered durable
  history artifact.
- Cross-artifact correlation is distributed across identities rather than one
  operator timeline.

### Missing

- actor identity for refresh and replay;
- persisted replay status;
- context-specific metrics and alert thresholds;
- durable correlated decision/certification history;
- an atomic reconciliation attempt record.

## Readiness

Current observability is sufficient for controlled human-operated diagnosis and
fail-closed execution. It is insufficient for unattended autonomous context
reconciliation because replay progress, actor authority, and durable
certification history are not yet centrally observable.
