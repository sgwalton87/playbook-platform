# Playbook Platform Recovery Runbook

## Purpose

Define the minimum reversible recovery sequence for failed application deployments and database migrations. This runbook is not evidence that a restore rehearsal has passed.

## Ownership

Platform Reliability owns application recovery. Database Operations owns backup and restore. Security Incident Response owns containment decisions. The Release Manager records evidence.

## Last Updated

August 1, 2026

## Application Recovery

1. Declare the incident, timestamp it, assign an incident commander, and preserve logs.
2. Disable affected beta capabilities through the governed exposure control; do not bypass authorization.
3. Roll back to the last immutable deployment that passed release gates.
4. Verify readiness, login, a read-only Scholar path, and audit ingestion before reopening writes.
5. Record cause, affected users/data, decision log, validation evidence, and follow-up owner.

## Database Recovery

1. Stop affected writes and retain the failed migration/version evidence.
2. Prefer a forward corrective migration for released schemas. Never edit an applied migration.
3. For data loss or corruption, restore the approved backup into an isolated environment first.
4. Validate migration ledger, row counts, referential integrity, RLS, representative authorization, and application compatibility.
5. Require Database Operations and the incident commander to approve production cutover.

## Required Rehearsal Evidence

At least one production-equivalent backup/restore exercise must record recovery point, recovery time, commands, migration ledger, integrity checks, RLS tests, sign-off, and unresolved risks. Until that artifact exists, `CONTROL:RECOVERY` remains blocked.

## Related Documents

- [Release Process](../RELEASE_PROCESS.md)
- [Database Handbook](../DATABASE.md)
- [System Audit](../REVIEWS/PLAYBOOK_PLATFORM_SYSTEM_AUDIT_001.md)
