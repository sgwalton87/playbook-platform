# PBOS Development Trust Lease Architecture

## Purpose

Define durable repository trust after initial PBOS activation so ordinary descendant commits advance trusted context automatically while material boundary changes require exception approval.

## Ownership

Owned by Playbook OS Engineering. Development Trust Authority owns lease issuance, validation, advancement evidence, expiration, and revocation. Existing execution, migration, and production-promotion authorities retain their independent decision boundaries.

## Last Updated

August 2, 2026

## Related Documents

- [Architecture handbook](../ARCHITECTURE.md)
- [Transition lifecycle architecture](./TRANSITION_LIFECYCLE_ARCHITECTURE.md)
- [Canonical development workflow](../recovery/CANONICAL_DEVELOPMENT_WORKFLOW.md)

## Trust Model

PBOS separates three identities:

1. **Baseline authority** records the requester and independent reviewer decision established by `pbos:transition` and `pbos:approve`.
2. **Development trust lease** carries that authority across allowed descendant commits on the governed branch until expiration or revocation.
3. **Repository observation** records the current commit, context, artifacts, and validation evidence and may advance automatically under a valid lease.

Changing an observation does not invalidate baseline authority. PBOS appends advancement evidence and refreshes trusted context when lineage and scope remain within the lease.

## Automatic Advancement

Normal PBOS commands inspect the lease before planning or status evaluation. A clean commit advances automatically when:

- repository, remote, and branch identities match the lease;
- the current commit descends from the lease's current commit;
- the branch is not behind its upstream;
- authorization is active and unexpired;
- the original launch approval remains valid;
- no protected scope changed; and
- repository context and artifacts validate after refresh.

PBOS then refreshes repository context, creates a new trusted-context record, appends lease advancement evidence, and continues the requested command. The operator does not run `pbos:transition` again.

Replaceable PBOS runtime outputs and generated release evidence are excluded from source scope. Their regeneration may trigger an automatic context refresh but never a new human ceremony.

## Development Changes

Ordinary uncommitted application or documentation changes do not revoke the lease. PBOS reports `DEVELOPMENT_CHANGES_PENDING` and waits for a commit before advancing the trusted context. Execution remains governed by package-bound authorization.

Uncommitted protected changes report `EXCEPTION_APPROVAL_REQUIRED`. PBOS does not silently extend authority to governance-sensitive work.

## Exception Boundaries

The following require explicit exception or domain-specific approval:

- `AGENTS.md` and `CODEX.md`;
- GitHub workflow changes;
- constitutional documentation and implementation;
- PBOS authority, activation, kernel, trust, and lease policy;
- Supabase migrations;
- dependency manifest or lockfile changes;
- repository, remote, or governed-branch changes;
- non-descendant history or force-push behavior;
- an upstream-behind state;
- expired, revoked, missing, or replaced authority;
- production promotion and irreversible operations.

These boundaries do not add a routine approval layer. They are exceptions to the durable lease.

## Runtime Evidence

`pbos/runtime/development-trust-lease.json` is owned by `development-trust-authority`. It records:

- baseline and current commit identities;
- repository, remote, and branch identity;
- requester, reviewer, and approval evidence identity;
- protected scopes;
- expiration and status; and
- append-only advancement evidence.

The lease is system-managed runtime evidence and is never manually edited.

## Operator Experience

After the initial two-person activation, normal development is:

```text
feature work
  -> validation
  -> commit
  -> next PBOS command
  -> automatic trust advancement
  -> governed planning continues
```

Status reports `Development Trust Lease: ACTIVE`, `Trust Advancement: CURRENT` or `ADVANCED`, and `Exception Approval: NOT_REQUIRED` for normal work.

## Preserved Human Governance

The lease authorizes context continuity, not unrestricted execution. Human authority remains mandatory for package-bound execution where required, source-scope exceptions, migrations, production promotion, irreversible actions, and other protected decisions. PBOS cannot use the lease to broaden scope or bypass a domain authority.
