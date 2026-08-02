# PBOS Transition Lifecycle Architecture

## Purpose

Define the canonical PBOS repository-transition workflow as one requester authorization ceremony, one independent reviewer authorization ceremony, and autonomous completion of approved internal context operations.

## Ownership

Owned by Playbook OS Engineering. PBOS Transition Orchestration coordinates the lifecycle; Change Boundary Authority, Authority Ledger, Context Refresh Authority, and Context Activation Authority retain ownership of their evidence.

## Last Updated

August 2, 2026

## Related Documents

- [Architecture handbook](../ARCHITECTURE.md)
- [PBOS recovery execution plan](../release-evidence/PBOS_RECOVERY_EXECUTION_PLAN_001.md)
- [Canonical development workflow](../recovery/CANONICAL_DEVELOPMENT_WORKFLOW.md)

## Operator Workflow

The normal operator surface contains two commands:

```text
npm run pbos:transition
  -> inspect repository
  -> create immutable proposal
  -> record requester approval once
  -> pause at REQUESTER_APPROVED

npm run pbos:approve
  -> load the pending proposal and requester identity
  -> record one independent reviewer decision
  -> pause at REVIEWER_APPROVED

npm run pbos:transition
  -> validate unchanged proposal scope
  -> refresh context when required
  -> activate trusted context
  -> validate and complete
```

The requester never re-enters evidence during reviewer approval. The reviewer does not enter requester evidence. Resuming `pbos:transition` after approval requires no new human input.

## Transition State Machine

```text
DRAFT
  -> PROPOSED
  -> REQUESTER_APPROVED
  -> REVIEWER_APPROVED
  -> CONTEXT_REFRESH_PENDING
  -> CONTEXT_REFRESHED
  -> TRUSTED_CONTEXT_ACTIVE
  -> VALIDATED
  -> COMPLETE
```

Only adjacent transitions are valid. `pbos/runtime/transition-lifecycle.json` records the current proposal and append-only state history under owner `transition-orchestrator`.

The proposal binds repository, branch, commit, clean change-inventory identity, change type, purpose, and risk. PBOS runtime outputs are system-managed and excluded from source scope so authorized internal evidence generation does not invalidate the proposal.

If source scope, branch, commit, or clean-inventory identity changes, PBOS rejects the prior authorization and creates a new proposal. Expired authorization also blocks continuation.

## Authority Model

The transition coordinator orchestrates existing authorities; it does not replace them:

| Authority | Evidence | Human ceremony |
| --- | --- | --- |
| Transition Orchestrator | Proposal and lifecycle history | None |
| Change Boundary Authority | Baseline declaration | Requester ceremony |
| Authority Ledger | Proposal-bound launch decision | Reviewer ceremony |
| Context Refresh Authority | Derived refresh approval and applied context | Reuses the approved boundary evidence |
| Context Activation Authority | Trusted build context | Reuses the approved boundary evidence |

Human authorization remains mandatory for source modification, execution authorization, migrations, production promotion, and irreversible operations. This transition lifecycle only automates repository inspection, replaceable observation generation, reconciliation, context refresh, activation, validation, and evidence persistence after the exact scope has been approved.

## Approval Model

Requester approval records identity, decision, reason, risk acknowledgment, expiration, proposal scope, and boundary evidence. Reviewer approval records an independent identity, decision, review reason, risk acknowledgment, expiration, and the same proposal-bound boundary identity.

The reviewer expiration cannot exceed requester authorization. Requester and reviewer identities must differ. Rejected, expired, malformed, or scope-mismatched evidence fails closed.

The approved launch record is the single reviewer authority reused internally for context refresh and activation. PBOS does not prompt for a separate refresh or activation approval.

## Internal Recovery Commands

The following commands remain available for incident response, testing, administrative repair, and forensic recovery:

- `pbos:change-boundary`
- `pbos:approve-boundary`
- `pbos:approve-refresh`
- `pbos:refresh`
- `pbos:context-activate`
- `pbos:context-reconcile`

They are not required in the normal operator lifecycle. Recovery operators must preserve each authority's ownership rules and must not manually edit runtime evidence.

## Repository Relocation

A clean baseline may be refreshed from a rejected historical context only when the current repository assessment is clean and its artifact, manifest, and governance states validate. The only accepted reconciliation differences are missing historical context, repository-root relocation, commit advancement, and valid artifact inventory or identity changes.

Repository identity, remote identity, branch identity, dirty source content, missing artifacts, or invalid governance are not autonomously accepted. Those conditions remain blocked for explicit recovery.

## Status Reporting

`pbos:status` reports:

- `Transition State`
- `Authorization Status`
- `Context Status`
- `Execution Status`

Pending transition authority is reported as `PENDING_TRANSITION` rather than collapsing every intermediate state into generic invalid context. Execution remains `NOT_STARTED` throughout baseline activation and still requires its separate package-bound authorization.

## Recovery and Resumption

Every command loads the durable proposal before acting. Repeating a command is safe:

- `PROPOSED` resumes requester authorization.
- `REQUESTER_APPROVED` directs the operator to `pbos:approve`.
- `REVIEWER_APPROVED` resumes autonomous completion.
- Intermediate refresh or activation states resume at their next adjacent state.
- `COMPLETE` reports the existing successful result without creating new authority.

PBOS never silently skips a state. A failure records the last completed state, reports the cause, and permits deterministic resumption after the cause is resolved.

After `COMPLETE`, the resulting requester and reviewer authority issues a durable
development trust lease. Ordinary descendant commits advance context automatically;
only protected boundary changes require exception approval. See
[Development Trust Lease Architecture](./DEVELOPMENT_TRUST_LEASE_ARCHITECTURE.md).
