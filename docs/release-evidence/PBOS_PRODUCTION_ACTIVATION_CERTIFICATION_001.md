# PBOS Production Activation Certification 001

## Executive Summary

PBOS context refresh and context activation previously had separate authority inputs with no governed handoff. A refresh could reach `APPLIED` and persist the new repository context, while activation continued to require a change boundary and launch approval even when the applied refresh approval was the current independent human authority. RUN IT then requested another refresh approval instead of activating the already approved context.

The activation authority now accepts either of two explicit, validated evidence paths: a valid boundary plus launch approval, or a matching applied context refresh approval. RUN IT recognizes applied refresh evidence as `CONTEXT_ACTIVATION_REQUIRED`, invokes the canonical activation owner, and resumes orchestration.

## Current Architecture

| Stage | Input | Output | Owner | Digest | Validation | Failure behavior |
|---|---|---|---|---|---|---|
| Context refresh | Reconciliation and refresh approval | Repository context and applied approval | Context Refresh Authority | Reconciliation, context, approval | Repository, branch, commit, previous/proposed identity, expiration | No refresh |
| Repository context | Current repository snapshot | `repository-context.json` | Repository Context | Snapshot identity | Repository and artifact consistency | Context invalid |
| Activation discovery | Repository context and authority artifacts | Activation snapshot | Context Activation Authority | Snapshot digest | Reconciliation, inventories, governance, authority | Activation blocked |
| Trusted activation | Activation snapshot and human evidence | Trusted build context | Context Activation Authority | Request, decision, outcome, context | Authority identity, reviewer, risk, expiration, clean repository | No trusted artifact |
| Context status | Trusted context and repository reality | Readiness assessment | Context Readiness | Context/repository digest | Commit, manifests, artifacts, architecture, expiration | Planning blocked |
| RUN IT | Recovery assessment | Exact transition or execution | Operator Orchestrator | Plan digest | All upstream authorities | Fail closed with next command |

## Lifecycle Map

```text
Refresh Approval APPROVED
→ Context Refresh APPLIED
→ Applied Approval Validated Against Refreshed Context
→ CONTEXT_ACTIVATION_REQUIRED
→ Context Activation Authority
→ Trusted Build Context
→ PLANNING_ALLOWED
→ Package
→ Approval
→ Assignment and Admission
→ Dispatch
→ Evidence Validation
→ Lifecycle Advancement
```

## Remaining Gaps

No known code gap remains between an applied refresh and trusted context activation. A refresh approval cannot be reused after source content, commit, repository, branch, reconciliation, or proposed-context identity changes.

## Changes Implemented

- Added an explicit activation authority type and identity to activation snapshots.
- Validated applied refresh approval against the stored refreshed context and current repository identity.
- Added refresh-linked activation evidence using the existing requester, independent reviewer, decision reason, risk acknowledgment, expiration, and digest.
- Updated activation validation to accept either canonical authority path without weakening either.
- Updated recovery selection so an applied, valid refresh advances to activation rather than requesting duplicate approval.
- Preserved legacy trusted-context history and boundary/launch activation compatibility.
- Added success and fail-closed lifecycle tests.

## Security Controls

- Applied state is mandatory for refresh-linked activation.
- Refresh approval decision must be `APPROVED`.
- Repository, branch, commit, reconciliation, previous/proposed context, resulting context, reviewer, expiration, and digest remain validated.
- Changed source state invalidates prior activation authority.
- Activation persists only a `TRUSTED` outcome.
- Providers retain no context, approval, admission, certification, or lifecycle authority.

## Test Results

Focused tests cover boundary-linked activation, refresh-linked activation, missing evidence, digest mismatch, rejection, expiration, dirty repository, committed reconciliation, applied-refresh continuation, and deterministic operator behavior. Full lint, TypeScript, tests, build, recovery, context, status, and RUN IT commands are certification requirements.

## RUN IT Demonstration

Before the implementation was edited, the repository had a verified refreshed context and matching applied approval. The corrected state resolver classifies that evidence as `CONTEXT_ACTIVATION_REQUIRED`. After the implementation changed source files, RUN IT correctly selected `CHANGE_BOUNDARY_REQUIRED`; it did not reuse the earlier approval against new content.

## Activation Status

**IMPLEMENTATION COMPLETE; CURRENT SOURCE TRANSITION REQUIRES GOVERNED APPROVAL.**

Trusted activation is executable through RUN IT once the current implementation is admitted through the change-boundary lifecycle. No runtime artifact was manually altered and no trusted state was fabricated.

## Production Readiness Assessment

**CERTIFIED WITH OPERATIONAL AUTHORITY REQUIRED.**

The refresh-to-trust architecture is complete and fail-closed. End-to-end provider execution additionally requires current trusted context, an eligible package, human execution approval, and an available enabled provider.

