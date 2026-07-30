# PBOS Human Launch Authority Discovery

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Founder Launch Authority Model](./PBOS_FOUNDER_LAUNCH_AUTHORITY_MODEL.md)

## Purpose

This discovery identifies the missing human authority between a declared repository change boundary and trusted-context activation.

## Existing Authority

Change-boundary authority owns file-scope declarations. The authority ledger owns auditable decisions. Context activation owns trusted-context admission. Mission Control owns presentation. Execution authority is downstream and cannot authorize repository trust.

The package-specific `ApprovalRecord` cannot safely represent repository launch scope because its identity is bound to an execution package. The correct integration is a boundary-specific launch approval that produces an ordinary authority-ledger decision as immutable evidence.

## Gap

Prior activation accepted a context decision but did not require a separately durable, scope-bound, separation-of-duties launch approval. Mission Control also lacked explicit boundary, approval, and context status.

## Decision

Add `LaunchApprovalRecord`, owned by `authority-ledger`, binding requester, independent reviewer, decision, reason, risk acknowledgment, exact boundary digest, timestamp, expiration, and ledger decision evidence. Context activation must bind and validate this approval before creating trusted state.

