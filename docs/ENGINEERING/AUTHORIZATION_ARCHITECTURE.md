# Canonical Authorization Architecture

## Purpose

Define one least-privilege decision model for application routes, APIs, database policies, and consequence-bearing workflows.

## Ownership

Identity and Access Governance owns role semantics. Security Engineering owns enforcement and negative testing. Domain owners define workflow-specific approval and verification authorities.

## Last Updated

August 1, 2026

## Decision Order

1. Establish the authenticated Person from the server session.
2. Resolve a distinct canonical role; compatibility aliases cannot grant authority.
3. Resolve ownership, active relationship, institution, or global administrative scope.
4. Require the exact action: view, edit, approve, verify, or administer.
5. Apply validation, consent, youth-privacy, quota, idempotency, and state-transition rules.
6. Persist through RLS or a narrowly scoped security-definer function.
7. Audit consequence-bearing decisions with actor, subject, reason, outcome, and time.

## Access Classes

`NONE` denies the action. `OWN` limits it to the data subject. `RELATIONSHIP` requires an active scoped relationship. `INSTITUTION` requires active organization membership and tenant scope. `GLOBAL` is reserved for separately provisioned administrators and always requires audit.

Read authority never implies edit, approve, verify, or administer authority. Administrative assignment cannot occur through public onboarding. Service-role use is limited to secret-bearing infrastructure boundaries and must not substitute for end-user authorization.

## Certification Gates

Authorization is not certified until direct-route, API, RPC, and RLS tests cover anonymous, wrong-owner, expired/revoked relationship, wrong institution, wrong role, and valid actor cases against a disposable production-equivalent database.

## Related Documents

- [Role OS Architecture](../PRODUCT/ROLE_OS_ARCHITECTURE.md)
- [Platform Data Architecture](./PLATFORM_DATA_ARCHITECTURE.md)
- [Database Handbook](../DATABASE.md)
