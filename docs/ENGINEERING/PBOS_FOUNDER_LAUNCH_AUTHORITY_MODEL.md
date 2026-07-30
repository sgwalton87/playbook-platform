# PBOS Founder Launch Authority Model

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Human Launch Authority Discovery](./PBOS_HUMAN_LAUNCH_AUTHORITY_DISCOVERY.md)

## Workflow

Inspect -> Define change boundary -> Approve scope -> Stabilize approved commit -> Reconcile repository -> Activate trusted context -> Run Mission Control.

## Roles

The requester declares purpose and exact approved/excluded scope. An independent reviewer accepts or rejects that scope and its risk. The authority ledger records the decision. Context activation verifies repository, boundary, approval, reviewer, artifacts, manifest, architecture, governance, and time. Mission Control reports but cannot modify these authorities.

## Approval Contract

The record includes approval identity, requester, reviewer, `APPROVED` or `REJECTED`, reason, risk acknowledgment, boundary scope identity, timestamp, expiration, ledger decision, and digest.

Self-approval, anonymous identity, missing rationale, missing risk acknowledgment, expired approval, boundary mismatch, ledger mismatch, or digest corruption fails closed. Rejections remain valid historical decisions but cannot activate context.

## Commands

`npm run pbos:change-inventory` displays every changed file and its classification.

`npm run pbos:change-boundary` displays branch, commit, file count, maximum risk, and review count, then requires a complete human declaration.

`npm run pbos:approve-boundary` requires requester, independent reviewer, decision, reason, risk acknowledgment, expiration, and a current boundary.

`npm run pbos:context-activate` additionally requires the matching approved launch record and matching reviewer identity.

## Runtime Ownership

`pbos/runtime/change-boundary.json` is owned by change-boundary authority. `pbos/runtime/launch-approval.json` is owned by authority ledger. `pbos/runtime/trusted-build-context.json` is owned by context activation. Each artifact preserves history and no owner may write another owner's truth.

