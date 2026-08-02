# PBOS Execution Campaign Authorization

## Purpose

Define the bounded PBOS mechanism that allows one requester and one independent
reviewer to authorize five to ten deterministic Playbook build packages.

## Ownership

Playbook OS Engineering.

## Last Updated

August 2, 2026.

## Related Documents

- [PBOS architecture](../ARCHITECTURE.md)
- [Development trust lease](./DEVELOPMENT_TRUST_LEASE_ARCHITECTURE.md)
- [Canonical development workflow](../recovery/CANONICAL_DEVELOPMENT_WORKFLOW.md)

## Authority Model

An execution campaign binds one human approval ceremony to an ordered set of
five to ten deterministic GREEN or YELLOW packages. Each entry contains the
milestone, stable package-contract digest, allowed paths, dependencies, risk,
and required validations. PBOS derives a current-context execution envelope for
each entry under the active development trust lease; the human does not approve
that internal envelope again.

Campaign authority excludes RED work, environment and Git mutation, PBOS
runtime mutation by the delegated package, PBOS authority and constitutional
code, development-trust code, kernel code, database migrations, and production
promotion.

## Operator Workflow

```bash
npm run pbos:campaign -- --limit 10
npm run pbos:approve-campaign
npm run pbos:mission
npm run pbos:campaign-status
```

`pbos:campaign` starts at the live certified planner decision rather than a
stale manifest status. `pbos:approve-campaign` collects requester, independent
reviewer, decision reason, risk acceptance, and expiration once.

## Continuation Rules

For every mission PBOS verifies that the selected package:

- is the next incomplete campaign entry;
- retains its deterministic milestone contract digest;
- has the exact approved output scope;
- remains on the approved repository and branch;
- remains GREEN or YELLOW;
- uses the approved Codex provider; and
- has an active, unexpired campaign approval.

PBOS then issues a package- and context-specific execution authorization,
persists assignment and evidence, marks the entry complete, and continues to
the next eligible campaign package. Completed entries cannot execute twice.

## Stop Conditions

PBOS pauses or rejects campaign execution for package digest changes, scope
drift, validation failure, protected PBOS changes, migrations, production
promotion, expiration, revocation, or out-of-order execution. These conditions
require a new bounded human decision; ordinary trusted descendant commits do
not.
