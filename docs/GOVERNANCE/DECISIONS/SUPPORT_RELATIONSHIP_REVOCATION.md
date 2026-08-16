# Support Relationship Revocation

## Decision

Every active support relationship must have a deterministic revocation path.

Revocation preserves the relationship record for audit/history while immediately removing all relationship permissions.

## Authorized actors

Either party to the relationship may terminate it:

- the Scholar who owns the support relationship; or
- the authenticated connected supporter.

No unrelated user, institution, or administrator may revoke a relationship through this contract.

## Revocation behavior

Revocation is an atomic transition:

- `status` becomes `removed`;
- `permissions` becomes an empty set;
- `ended_at` records the termination time;
- `ended_by` records the authenticated actor;
- `end_reason` may preserve an optional human-readable reason.

The row is not deleted.

## Auditability

Preserving the relationship row maintains evidence of:

- who was connected;
- which Scholar owned the relationship;
- the relationship type;
- its source invitation;
- when access ended; and
- who ended it.

## API boundary

`POST /api/support-relationships/revoke` invokes the authenticated database revocation primitive. The API may not independently broaden who can revoke.

## UI requirement

The current `/support-network` visual map is demo/static data and must not be used to represent live revocation state.

A Remove Access action shall be exposed only when a live relationship surface is connected to canonical `support_relationships` data. Removed relationships may be presented as historical state when appropriate but shall never appear active.

## PBOS release gate

Production certification requires governed migration application and acceptance proving:

- Scholar-owner revocation succeeds;
- supporter self-revocation succeeds;
- unrelated-user revocation fails;
- revoked permissions are empty immediately;
- active-only queries no longer return the relationship;
- audit metadata is retained;
- repeated revocation fails closed rather than mutating history again.
