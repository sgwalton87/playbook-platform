# PBOS Trusted Context Authority Link Architecture

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [PBOS Baseline Activation Architecture](./PBOS_BASELINE_ACTIVATION_ARCHITECTURE.md), [PBOS Founder Launch Authority Model](./PBOS_FOUNDER_LAUNCH_AUTHORITY_MODEL.md), [PBOS Trusted Context Activation Architecture](./PBOS_TRUSTED_CONTEXT_ACTIVATION_ARCHITECTURE.md)

## Purpose

This architecture defines how Trusted Build Context Activation consumes existing Change Boundary and Launch Approval evidence without requesting a duplicate human decision.

## Authority Chain

```text
ChangeBoundaryDeclaration
  -> LaunchApprovalRecord
  -> authority-linked activation resolution
  -> ContextActivationRequest
  -> ContextActivationDecision
  -> existing Context Activation validator
  -> TrustedBuildContext
```

The link introduces no new authority or persistence owner. Change Boundary remains the source of requester and repository scope. Launch Approval remains the source of reviewer decision, reason, risk acceptance, and approval lifetime. Context Activation remains the only authority allowed to create trusted context.

## Evidence Resolution

`createAuthorityLinkedActivationEvidence` loads the latest boundary and launch approval through their canonical stores. `resolveAuthorityLinkedActivation` validates:

- boundary presence and current-context validity;
- boundary identifier and digest correlation;
- requester identity continuity;
- reviewer identity and separation of duties;
- approval decision equal to `APPROVED`;
- non-empty decision reason and risk acknowledgment;
- approval and boundary expiration;
- activation snapshot references to the exact boundary and approval digests;
- authority-ledger decision correlation.

Missing or invalid evidence produces findings and no activation evidence.

## Derived Activation Records

After validation, PBOS derives rather than recollects:

| Activation field | Canonical source |
|---|---|
| Requester | `ChangeBoundaryDeclaration.requester_identity` |
| Reviewer | `LaunchApprovalRecord.reviewer_identity` |
| Decision | Validated `APPROVED` launch decision |
| Reason | `LaunchApprovalRecord.decision_reason` |
| Risk acknowledgment | `LaunchApprovalRecord.risk_acknowledgment` |
| Expiration | Earliest boundary or approval expiration |
| Evidence references | Boundary digest, approval digest, repository assessment, reconciliation, activation snapshot |

The generated request and decision retain their own immutable digests because they represent the Context Activation authority’s evaluation event, not a second human approval.

## Validation Boundary

Authority resolution does not make a context trusted. The existing `activateBuildContext` validator still requires:

- valid repository and context identity;
- verified reconciliation;
- clean repository state;
- valid artifact, architecture, manifest, and governance evidence;
- valid boundary and approval identities;
- matching request, decision, and snapshot digests;
- non-expired activation lifetime.

Only a `TRUSTED` outcome may be persisted by `context-activation-authority`.

## Command Behavior

`npm run pbos:context-activate` no longer reads:

- `PBOS_CONTEXT_REQUESTER_ID`;
- `PBOS_CONTEXT_REVIEWER_ID`;
- `PBOS_CONTEXT_DECISION`;
- `PBOS_CONTEXT_REASON`;
- `PBOS_CONTEXT_RISK_ACKNOWLEDGEMENT`;
- `PBOS_CONTEXT_EXPIRATION`.

It loads canonical artifacts, resolves evidence, invokes the existing validator, and persists only a successful trusted context. A blocked resolution reports findings and writes nothing.

## Failure Behavior

PBOS fails closed for:

- missing boundary or approval;
- invalid current boundary;
- changed boundary or approval digest;
- requester mismatch;
- reviewer mismatch;
- rejected, revoked, expired, or otherwise non-approved decisions;
- incomplete decision evidence;
- repository or reconciliation failure;
- any downstream Context Activation validation finding.

No fallback to manual activation values exists.
