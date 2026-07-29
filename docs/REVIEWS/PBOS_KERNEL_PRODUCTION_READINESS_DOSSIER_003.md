# PBOS Kernel Production Readiness Dossier 003

## Purpose

Certify the consolidated PBOS Kernel and its governed runtime envelope against
the seven blockers recorded by Production Certification 002.

## Ownership

PBOS Production Certification Board, Constitutional Stewardship, and Playbook
OS Engineering.

## Last Updated

July 29, 2026

## Executive Decision

**CERTIFIED WITH OBSERVATIONS**

The permanent execution path now has one command bus, one concrete runtime,
one pure kernel, one execution pipeline, one authorization owner, and one
durable history owner. Execution is actor-bound, authorization-bound,
fail-closed, recoverable, measured, and certified as a complete envelope.

The observation is limited to the backward-compatible generic
`Runtime.load<T>` API used by pre-kernel PBOS subsystems. The production kernel
runtime does not use it: kernel history crosses the JSON boundary as `unknown`
and is structurally validated before use. Retiring the compatibility API is a
separate repository-wide migration and is not required to trust the canonical
kernel execution path.

## Blocker Disposition

| Blocker | Disposition | Evidence |
|---|---|---|
| Governed boot and shutdown | Resolved | Legal transition table; boot, ready, shutdown, and stopped evidence on success and failure |
| Canonical recovery ownership | Resolved | `PBOSKernelRuntime` alone detects and finalizes interrupted attempts |
| Durable immutable execution envelope | Resolved | Registered `kernel-execution-history.json`, append-only finalized history, digest validation |
| Actor-bound execution | Resolved | Anonymous execution is rejected before boot; every transition records actor and authority |
| Operational metrics | Resolved | Startup, shutdown, execution, validation, certification, recovery, uptime, and outcome counters |
| Validated runtime loading | Resolved for canonical path | History loads as `unknown`; schema and certification digests are checked before use |
| Complete certification envelope | Resolved | Plan, transition, validation, kernel certification, authorization, adapter outcome, lifecycle, metrics, errors, recovery, and shutdown are certified together |

## Architecture

```text
kernel-cli
  -> kernel-command-bus
    -> PBOSKernelRuntime
      -> repository-kernel-adapter
        -> ConstitutionalExecutionKernel
      -> durable authorization loader
      -> execution engine
      -> complete-envelope certifier
      -> registered runtime history
```

Non-execution commands evaluate the same repository kernel through the command
bus. The `execute` command delegates exclusively to `PBOSKernelRuntime`.
Neither path owns a competing selection, lifecycle, recovery, or dispatch
decision.

## Lifecycle

```text
BOOTING -> READY -> EXECUTING -> CERTIFYING
  -> SHUTTING_DOWN -> STOPPED

Any pre-shutdown failure:
current state -> FAILED -> SHUTTING_DOWN -> STOPPED
```

The transition table rejects illegal edges. The bootstrap authority governs
boot and validation transitions. The durable execution authorization identity
governs execution and subsequent transitions. A missing or non-authorized
record prevents adapter dispatch.

## Recovery

The history loader validates the artifact owner, envelope structure, evidence
digest, and certification digest. If the latest record is `IN_PROGRESS`, the
runtime finalizes it as `RECOVERED` with rejected certification, records the
recovery actor, preserves it in history, and applies no state transition.
Only then may a new attempt begin.

Finalized successful and rejected attempts are append-only within the governed
history artifact. Draft writes update only `latest`; they never enter finalized
history until certified or recovered.

## Security And Trust

- Anonymous callers cannot construct an execution attempt.
- Kernel rejection, corrupt history, missing authorization, pending or denied
  authorization, and failed adapter dispatch all stop execution.
- Runtime artifact ownership enforcement restricts history writes to
  `kernel-runtime`.
- The execution adapter remains behind both kernel certification and the
  existing immutable authorization identity checks.
- No failure is caught and ignored; errors are retained in the final evidence.

## Observability

Each finalized envelope records:

- execution, actor, authorization, runtime, and kernel identities;
- plan and requested state transition;
- per-stage validation results;
- kernel and whole-envelope certification;
- lifecycle transition history;
- adapter outcome;
- timing and outcome metrics;
- errors, warnings, and recovery actions.

This evidence is sufficient to reconstruct a kernel attempt without relying on
process logs or institutional memory.

## Validation Evidence

- ESLint: zero errors; two pre-existing warnings outside kernel/runtime.
- TypeScript: `npx tsc --noEmit --incremental false` passed.
- Tests: 114 files passed; 448 tests passed; zero failures.
- PBOS status: command completed; PBOS health healthy, lifecycle synchronized,
  artifact health valid.
- PBOS correctly remained fail-closed because the working repository context
  was stale during certification; it reported context invalid and refresh
  required rather than inventing eligibility.

New runtime tests prove:

- anonymous execution rejection;
- successful complete-envelope certification;
- pending authorization blocks dispatch;
- kernel rejection records shutdown and rejected evidence;
- interrupted draft preservation and deterministic recovery.

## Remaining Observations

1. Migrate legacy PBOS consumers from `Runtime.load<T>` to explicit
   unknown-to-domain decoders, then remove the compatibility API.
2. Move the runtime history to an append-only external evidence store before
   multi-process or multi-host execution; the repository JSON artifact provides
   deterministic local governance, not distributed concurrency control.
3. Add signed evidence or an external trust anchor if the operating threat
   model includes an attacker who can rewrite both artifacts and digests.

## Certification Basis

The kernel earns production certification for the current single-process PBOS
control plane because its active execution path is singular, typed, governed,
durable, observable, resumable, and fail-closed. The observations above bound
future scale and legacy migration work; none creates an execution bypass in the
certified path.
