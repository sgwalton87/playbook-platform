# PBOS Trusted Context Activation Architecture

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Trusted Context Discovery](./PBOS_TRUSTED_CONTEXT_GO_LAUNCH_DISCOVERY.md)

## Purpose

Trusted context activation converts a verified repository snapshot and explicit human decision into a time-bounded operating authority.

## Governed Sequence

Observed reality -> reconciliation -> canonical artifact regeneration -> approved context refresh -> verified reconciliation -> human activation decision -> activation validation -> durable trusted-context history -> Mission Control reassessment.

Each arrow is an authority boundary. Reconciliation cannot approve. Refresh cannot invent human identity. Human approval cannot override a dirty tree or rejected technical predicate. Activation cannot repair repository state.

## Human Evidence Contract

Activation requires requester identity, reviewer identity, `APPROVED` or `REJECTED`, review reason, context-bound evidence references, explicit risk acknowledgment, timestamp, and future expiration. Anonymous, expired, mismatched, corrupted, or technically ineligible decisions fail closed.

## GO Boundary

Context may contribute to `GO` only when repository identity, commit, branch, manifest, artifacts, architecture, and governance all match the activated context and the context has not expired. Planning, execution authority, agent admission, and evidence readiness remain independent downstream requirements.

## Failure And Recovery

`REVIEW_REQUIRED` produces `HOLD`. Rejected identity or corrupted governance produces `ABORT`. Failed activation writes no trusted state. Recovery requires approved worktree stabilization, canonical refresh, fresh reconciliation, and a new human decision.

