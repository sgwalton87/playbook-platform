# PBOS Execution Context Trust Model

## Purpose

Define when PBOS may trust that an execution decision represents the repository
and runtime state that actually exists, and define the only governed recovery
path when that trust is lost.

## Ownership

The `repository-context` artifact owner observes, certifies, and publishes
repository context. The PBOS Kernel consumes context but cannot create, repair,
or approve it.

## Last Updated

July 29, 2026

## Related Documents

- [PBOS Constitutional Execution Kernel](./PBOS_CONSTITUTIONAL_EXECUTION_KERNEL.md)
- [PBOS Runtime Isolation](./PBOS_RUNTIME_ISOLATION.md)
- [PBOS Execution Kernel Certification Model](./PBOS_EXECUTION_KERNEL_CERTIFICATION_MODEL.md)
- [PPS-4005 Kernel State Management](../CONSTITUTION/VOLUME_40_PBOS_KERNEL_ARCHITECTURE/PPS-4005_KERNEL_STATE_MANAGEMENT.md)
- [PPS-4009 Kernel Security](../CONSTITUTION/VOLUME_40_PBOS_KERNEL_ARCHITECTURE/PPS-4009_KERNEL_SECURITY.md)

## Trust Statement

PBOS may trust that it is operating on reality only when a certified repository
context artifact:

1. identifies the configured repository root, remote, and repository identity;
2. matches the currently observed branch, upstream, and HEAD commit;
3. matches the working-tree structure and relevant file-content digest;
4. matches the PBOS engine version, active gate, completed history, sprint, and
   execution mode;
5. binds every required runtime artifact to its registered owner and current
   digest;
6. is within the governed freshness window;
7. independently validates immediately before planning, certification, and
   execution.

Trust is a current observation, not a property inherited from a previously
valid run.

## Repository Identity

Repository identity is the conjunction of:

- the resolved repository root;
- the configured remote name;
- the normalized configured remote URL;
- the canonical repository identifier `playbook-platform`.

Changing any element creates a different trust boundary. An unknown remote,
alternate checkout, symlinked unexpected root, or unconfigured repository
identity fails closed.

## Commit Identity

Commit identity is the exact Git HEAD SHA captured by the context owner. Branch
name alone is insufficient because a branch can move. Upstream must equal the
configured remote branch and the observed branch must not be behind its
upstream.

A context bound to a different HEAD is historical evidence. It cannot authorize
new planning or execution.

## Working Tree Identity

Working-tree identity includes:

- clean or dirty classification;
- structural working-tree digest;
- relevant file-content digest.

The content digest prevents two dirty trees with the same path-level Git status
from sharing an identity. Generated context outputs are suppressed from their
own input identity where the context observer explicitly governs that
suppression; arbitrary source files are never suppressed.

## Artifact Identity

Every required artifact is trusted only when:

- it exists;
- its registered owner matches `RuntimeArtifactOwnership`;
- its content digest matches the captured digest;
- its gate, branch, status, and timestamp are consistent where applicable;
- validation artifacts report a legitimate `PASS`;
- its age does not exceed the governed freshness limit.

Artifact existence without identity, ownership, and content validation does not
establish trust.

## Context Refresh Authority

Only the `repository-context` owner may refresh:

- `pbos/runtime/repository-context.json`;
- `pbos/runtime/context-refresh.json`;
- the associated context-refresh evidence report.

The governed command is `npm run pbos:context`. It requires a non-empty reason,
observes the repository, constructs a candidate, independently certifies the
candidate against the same observation, appends refresh history, and writes
only after certification succeeds.

The Kernel, planner, status command, authorization service, and human operators
are consumers. None may edit context JSON or fabricate a `PASS`.

## Expiration

Context expires when its age exceeds the configured maximum, currently 24
hours. Expiration is evaluated against the current time during validation.
Historical context remains evidence but loses execution authority.

## Invalidation

Context becomes invalid immediately when any bound identity changes, including:

- repository root, remote, branch, upstream, or HEAD;
- working-tree structure or relevant content;
- engine version, active gate, sprint, mode, or completed-gate history;
- required artifact existence, ownership, digest, gate, status, or freshness;
- conflict between current gate and active sprint.

Invalidation does not delete or rewrite the previous artifact.

## Recovery

The governed recovery sequence is:

```text
Detect invalid context
  -> stop planning and execution
  -> reconcile conflicting artifacts through their canonical owners
  -> invoke repository-context refresh with an auditable reason
  -> certify the candidate against a fresh observation
  -> append context-refresh history
  -> regenerate planning handoff through the planning-handoff owner
  -> rerun kernel certification
```

If artifact ownership is ambiguous, evidence is missing, or candidate
certification fails, recovery terminates without changing context authority.

## Current Reconciliation Finding

At review time:

- repository HEAD is `5b1feeb41be5befccb4ad251bf46778494cf177f`;
- stored repository context references
  `b155ccc9e629bf3da3dfd296e3b968a33b1cce69`;
- stored planning handoff references
  `dd3d5a5f5211f43cffe8946221765911bce32a4a`.

Both artifacts remain valid historical evidence. Neither is current execution
authority. PBOS must remain fail-closed until canonical context refresh and
planning-handoff regeneration occur.

## Guarantees

- Context cannot be self-certified by the execution kernel.
- Previous validity cannot authorize a changed repository.
- Refresh never rewrites refresh history.
- Missing or conflicting identity is never inferred.
- Context recovery cannot bypass artifact ownership.
