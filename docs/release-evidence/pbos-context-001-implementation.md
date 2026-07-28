# PBOS-CONTEXT-001 Repository Context Verification

## Purpose
This document records the implementation architecture and validation contract for the PBOS repository context verification layer. The layer prevents the PBOS runtime execution phase from operating against an unknown repository, a changed Git state, or conflicting runtime artifacts.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 28, 2026

## Related Documents
- [Engineering Constitution](../../CODEX.md)
- [Architecture Handbook](../ARCHITECTURE.md)
- [PBOS Engine](../../pbos/README.md)
- [Release Process](../RELEASE_PROCESS.md)

## Architecture
PBOS captures a versioned `repository-context.json` artifact before governed runtime execution. The artifact contains:

- Canonical repository root, remote name, remote URL, and repository identity.
- Current branch, commit SHA, upstream branch, ahead/behind counts, and working-tree digest.
- PBOS engine version, current gate, completed gates, active sprint, and execution mode.
- Existence, gate identity, timestamp, and SHA-256 digest for required runtime artifacts.
- A SHA-256 identity covering the complete captured snapshot.

The PBOS runtime validates the stored context immediately before its execution phase. A failed validation records a runtime blocker and returns a failed phase result without invoking any execution engine. Existing contract, work-package, authorization, and adapter controls remain downstream and cannot weaken the context boundary.

## Validation Rules
Execution fails closed when any of these conditions is true:

1. The context artifact is missing, malformed, unsupported, stale, or identity-invalid.
2. The Git top-level directory is not the expected repository root.
3. The configured `origin` remote or canonical repository URL differs.
4. Repository identity is not `playbook-platform`.
5. The branch differs from the captured branch, lacks its matching upstream, or is behind upstream.
6. The commit SHA or working-tree state differs from the captured state.
7. Engine version, current gate, completed gates, active sprint, or execution mode changed.
8. The current gate and active sprint disagree.
9. A required runtime artifact is missing, stale, modified, or references a gate outside the current or completed gate set.

## Required Artifacts
The context snapshot covers:

- `pbos/runtime/repository.json`
- `pbos/runtime/next-gate.json`
- `pbos/runtime/validation.json`
- `pbos/runtime/execution.json`
- `pbos/runtime/execution-contract.json`
- `pbos/runtime/work-package.json`
- `pbos/runtime/execution-authorization.json`

## Lifecycle
The governed lifecycle is:

Context Capture → Repository Verification → Git Verification → Runtime Verification → Artifact Verification → Execution Phase Eligibility → Existing Authorization Controls.

Context capture is explicit. PBOS does not silently replace a missing or stale context during execution. Any intentional repository, Git, planning, runtime, or artifact change requires a new context capture before execution can become eligible.

## Test Evidence
Automated tests cover:

- Valid context acceptance.
- Missing context rejection.
- Unknown repository rejection.
- Branch and upstream mismatch rejection.
- Commit mismatch rejection.
- Runtime gate conflict rejection.
- Artifact gate conflict rejection.
- Stale context and runtime artifact rejection.
- Context identity tampering rejection.
- Runtime execution-engine suppression when context validation fails.
- Normal runtime execution flow when context validation passes.

## Definition of Done
PBOS-CONTEXT-001 implementation is complete when the repository context artifact is generated, the runtime blocks invalid context before execution, focused and repository-wide validation pass, and any detected stale legacy runtime artifacts remain reported rather than bypassed.
