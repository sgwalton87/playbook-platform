# PBOS Authority Ledger Architecture

## Purpose

Preserve immutable institutional memory for approval, decision, authorization, and revocation.

## Ownership

Human Authorization owns approval decisions. The Authority Ledger owns append-only correlation records.

## Last Updated

July 30, 2026

## Rules

Approvals bind requester, approver, package, context, scope, risk, time, and expiration. Self-approval is rejected. Authorization must reference an existing approved record with matching package and context identities. Revocation requires an existing authorization, actor, reason, and timestamp.

Duplicate or rewritten identifiers are rejected. Ledger snapshots are content-addressed. The ledger does not grant approval; it records decisions issued by authority.

## Current Persistence Boundary

The typed append-only ledger is implemented. Durable runtime persistence is intentionally withheld until a canonical artifact owner, decoder, recovery contract, and activation evidence source are established.

## Related Documents

- [Context Activation](./PBOS_CONTEXT_ACTIVATION_ARCHITECTURE.md)
- [Advancement Engine](./PBOS_ADVANCEMENT_ENGINE_ARCHITECTURE.md)
