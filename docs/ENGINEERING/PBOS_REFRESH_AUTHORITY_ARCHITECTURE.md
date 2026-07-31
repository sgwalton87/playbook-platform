# PBOS Context Refresh Authority Architecture

## Purpose

Define the governed authority boundary that permits repository context refresh
after reconciliation requires human review. This authority does not activate a
trusted context and cannot replace Context Activation Authority.

## Ownership

PBOS Context Refresh Authority owns refresh approval creation, validation,
persistence, application state, and history. Repository Context Authority
remains the only owner that may generate repository context and refresh
artifacts. Context Activation Authority remains the only owner that may create
trusted build context.

## Last Updated

July 30, 2026

## Related Links

- [PBOS architecture](../ARCHITECTURE.md)
- [Context authority reconciliation](PBOS_CONTEXT_AUTHORITY_RECONCILIATION_ARCHITECTURE.md)

## Authority Flow

```text
Repository observation
  -> reconciliation REVIEW_REQUIRED
  -> independent refresh decision
  -> immutable refresh approval
  -> approval validation
  -> repository context refresh
  -> approval APPLIED
  -> separate trusted-context activation
```

`pbos:approve-refresh` creates the decision artifact. `pbos:refresh` is the
only command consumer that may present that evidence to Context Refresh
Authority and invoke Repository Context Authority.

## Artifact Contract

`pbos/runtime/context-refresh-approval.json` is owned by
`context-refresh-authority`. Its latest record and preserved history bind:

- requester and independent reviewer identities;
- decision, reason, risk acknowledgment, timestamp, and expiration;
- repository, branch, and commit identities;
- reconciliation assessment digest;
- previous and proposed context identities;
- lifecycle state and resulting context identity;
- deterministic record and history digests.

The lifecycle is `APPROVED -> APPLIED` or terminal `REJECTED`. Application
creates a new immutable history entry; it does not rewrite the approved
decision.

## Validation Rules

Refresh fails closed unless the approval digest is valid, the decision is
`APPROVED`, identities are present and independent, the decision is unexpired,
and every repository and reconciliation binding matches current observation.
Rejected, expired, missing, stale, or modified evidence cannot authorize
refresh.

After Repository Context Authority produces the proposed identity, Refresh
Authority records `APPLIED`. A different result identity is rejected.

## Failure Behavior

No approval means no refresh. Validation failure produces no context mutation.
Approval does not imply trusted-context activation. A successful refresh leaves
activation pending so a separate authority can evaluate the refreshed context.

## Operator Contract

`npm run pbos:approve-refresh` supports explicit arguments and interactive
evidence entry. `npm run pbos:refresh` consumes only the persisted canonical
artifact. Mission Control reports the refresh approval as `MISSING`, `INVALID`,
or `VALID` and directs the operator to trusted-context activation only after
refresh application is proven.
