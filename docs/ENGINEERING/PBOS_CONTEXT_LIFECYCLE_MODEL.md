# PBOS Context Lifecycle Model

## Purpose

Define how PBOS creates, validates, activates, invalidates, supersedes, and
preserves context truth over time.

## Ownership

PBOS Repository Context subsystem, with transition authority separated as
defined below.

## Last Updated

July 29, 2026

## Lifecycle

```text
CREATED -> CAPTURED -> VALIDATED -> CERTIFIED -> ACTIVE
                                              |
                                              v
                                        INVALIDATED
                                              |
                                              v
                                      REFRESH_REQUIRED
                                              |
                                              v
                                        SUPERSEDED
                                              |
                                              v
                                          ARCHIVED
```

Validation or certification failure moves the candidate to `INVALIDATED`
without making it active.

## State Contracts

| State | Entry Conditions | Exit Conditions | Authority | Required Evidence | Failure Behavior |
|---|---|---|---|---|---|
| `CREATED` | Governed refresh request with reason | Observation begins | Runtime operator invokes context owner | Request reason and actor/process trace | Reject empty or unauthorized request |
| `CAPTURED` | One repository snapshot completed | Candidate generated | Repository Adapter | Root, remote, Git, content, runtime, artifact snapshot | Missing observation invalidates candidate |
| `VALIDATED` | Candidate passes every deterministic rule | Independent certification begins | Context Validator | Findings, expected root, observation and candidate identities | Any finding moves to `INVALIDATED` |
| `CERTIFIED` | Independent replay passes | Atomic publication | Context Certification | Validator/version, timestamp, candidate identity | Certification failure invalidates candidate |
| `ACTIVE` | Certified candidate and refresh history published | Invalidation or expiration | `repository-context` owner | Active context and refresh record | Publication failure retains previous history and blocks |
| `INVALIDATED` | Current observation conflicts or validation fails | Refresh requirement accepted | Context Validator | Reasons and detection time | Planning and execution remain blocked |
| `REFRESH_REQUIRED` | Invalid/expired context needs new truth | New `CREATED` request or unresolved block | Context Lifecycle authority | Previous identity, reason, triggering conditions | Ambiguity remains fail-closed |
| `SUPERSEDED` | New certified context becomes active | Archival retention processing | `repository-context` owner | Previous/new identity link | Cannot regain active authority |
| `ARCHIVED` | Superseded evidence retained under policy | No normal exit | Context History owner | Immutable artifact and lineage | Never delete or rewrite certified history |

## Transition Rules

- Only adjacent forward transitions are valid.
- `ACTIVE` cannot be assigned directly.
- `INVALIDATED` and `REFRESH_REQUIRED` are non-executable states.
- `SUPERSEDED` and `ARCHIVED` are historical states, never recovery sources.
- A new context receives a new identity; refresh never mutates the old identity.
- Publication of context and refresh history must be atomic from the consumer's
  perspective.

## Current Implementation Mapping

The current artifact schema represents `CAPTURED`, `CERTIFIED`, and effective
`ACTIVE` through `capturedAt`, snapshot identity, candidate certification, and
publication. Validation dynamically derives `INVALIDATED` and
`REFRESH_REQUIRED`. Refresh history represents supersession.

The lifecycle state names are not currently persisted as a dedicated field.
Therefore this model is canonical architecture, while machine-enforced explicit
state transitions are only partially implemented. No runtime JSON should be
manually extended to add these states.

## Historical Preservation

`context-refresh.json` appends records containing previous identity, new
identity, reason, triggering conditions, timestamp, and validator. History
validation must precede append. A correction is a new record, never an edit.

## Lifecycle Answer

PBOS manages context truth as a sequence of independently certified,
content-addressed observations. Only one may be active for a consumer decision;
all predecessors remain immutable historical evidence.
