# PBOS Context Refresh Lifecycle Governance

## Purpose

Govern restoration of repository trust without silent refresh or destruction of context history.

## Authority

The existing repository context lifecycle remains the sole snapshot writer. `ContextRefreshAuthority` controls admission to that lifecycle and requires reconciliation-bound approval evidence.

## Lifecycle

`INVALID -> DETECTED -> REVIEW_REQUIRED -> APPROVED -> REFRESHING -> VERIFIED -> TRUSTED`.
Transitions are sequential. Approval requires an identified approver and immutable evidence. Identity mismatch or invalid reconciliation fails closed.

## Security And Evidence

The request binds requester, reason, reconciliation digest, approver, evidence, timestamp, state, and digest. The `pbos:refresh` command is observational and performs no mutation.
