# PBOS Kernel Production Readiness Dossier 004

## Purpose

Determine whether the deterministic PBOS Kernel has satisfied every operational
blocker recorded in Production Certification 002 and can serve as the permanent
single-process PBOS runtime.

## Ownership

PBOS Production Release Board, Constitutional Stewardship, Security,
Reliability, Runtime Engineering, and Playbook OS Engineering.

## Last Updated

July 29, 2026

## Executive Summary

**CERTIFIED**

All seven certification blockers are eliminated in the canonical execution
path. The implementation adds no configurable runtime framework: one concrete
runtime owns boot, lifecycle, recovery, execution, observability, shutdown, and
whole-envelope certification around the existing deterministic Kernel.

Runtime JSON is no longer trusted through an unchecked generic cast. The shared
loader accepts only finite JSON values and every domain consumer explicitly
decodes its artifact before use. Actor-bound transition evidence now includes
the execution, authorization, requested transition, approved transition,
timestamp, and reason on every lifecycle edge.

## Certification Findings Addressed

1. Governed boot and shutdown: fixed legal transition table and one lifecycle
   owner.
2. Canonical recovery: interrupted drafts are finalized as rejected recovery
   evidence without applying state.
3. Durable envelope: drafts, finalized history, evidence digests, and
   certification digests have one registered owner.
4. Actor-bound execution: anonymous execution is rejected and every transition
   has complete attribution.
5. Metrics: required durations, uptime, and counters are recorded without
   entering Kernel decision input.
6. Validated loading: unchecked `Runtime.load<T>` was removed.
7. Complete certification: the finalized envelope covers startup through
   shutdown and outcome.

## Evidence Matrix

| Blocker | Implementation | Validation | Tests |
|---|---|---|---|
| 1 | `PBOSKernelRuntime`, legal transition table | Illegal edges throw; success and failure stop | Lifecycle sequence and failure shutdown |
| 2 | `recoverInterruptedHistory` | Prior finalized history is digest-checked; no transition applied | Interrupted draft recovery |
| 3 | registered Kernel history artifact | Every finalized record verifies evidence and certification digests | Success, rejection, recovery history |
| 4 | expanded `RuntimeTransition` | Actor required; authorization and transition identities required | Anonymous rejection and full transition attribution |
| 5 | `RuntimeMetrics` | Non-negative measured values; fixed execution counters | Successful and rejected envelope metrics |
| 6 | finite `JsonValue` loader and explicit domain decoders | Malformed artifacts throw before consumption | Authorization, contract, certification decoder rejection |
| 7 | `certifyEvidence` over finalized evidence | Certification digest covers complete final payload | Successful and rejected complete envelopes |

## Architecture Before

```text
CLI
  -> competing command/orchestrator paths
  -> runtime factories and registries
  -> runtime managers and phase runners
  -> adapters/providers
  -> planning, validation, execution
```

Lifecycle, state, recovery, and construction ownership were duplicated or
represented by placeholder abstractions.

## Architecture After

```text
Kernel CLI
  -> Kernel Command Bus
    -> PBOSKernelRuntime
      -> Repository Kernel Adapter
        -> ConstitutionalExecutionKernel
      -> Durable Authorization
      -> Execution Eligibility
      -> Adapter Dispatch
      -> Whole-Envelope Certification
      -> Governed History
```

Only `PBOSKernelRuntime` calls the dispatch-capable execution engine. Only the
execution engine can invoke the adapter.

## Dependency Graph

```text
commands -> runtime -> repository adapter -> kernel
runtime -> authorization -> execution engine -> infrastructure adapter
kernel -> deterministic graph and decision engines
runtime/domain consumers -> JsonValue loader -> explicit artifact decoders
```

The Kernel has no upward dependency on commands, runtime, repository, or
application infrastructure. No dynamic registry, provider, IoC container,
reflection, plugin loader, or abstract factory exists in the active path.

## Lifecycle Diagram

```text
START
  -> BOOTING
  -> READY
  -> EXECUTING
  -> CERTIFYING
  -> SHUTTING_DOWN
  -> STOPPED

BOOTING | READY | EXECUTING | CERTIFYING
  -> FAILED
  -> SHUTTING_DOWN
  -> STOPPED
```

Every recorded transition contains:

- execution identity;
- actor identity;
- authorization identity;
- prior state;
- requested transition;
- approved transition;
- timestamp;
- reason.

## Recovery Flow

```text
Load history as validated JSON
  -> decode and verify every finalized digest
  -> detect latest IN_PROGRESS draft
  -> record recovery actor and reason
  -> finalize prior attempt as RECOVERED / REJECTED
  -> append recovery evidence
  -> apply no state transition
  -> begin new validated execution
```

Corrupt or ambiguous recovery evidence terminates construction.

## Execution Envelope

The envelope persists:

- runtime execution and Kernel execution identities;
- actor and authorization identities;
- command and requested time;
- plan, decision-derived transition request, and Kernel versions;
- lifecycle history and stage validation results;
- Kernel certification and adapter outcome;
- metrics, errors, warnings, and recovery actions;
- final outcome and complete-envelope certification.

## Metrics Model

Metrics include startup, shutdown, execution, validation, certification,
recovery, and uptime duration in milliseconds plus execution, success, and
failure counters. They are observed after decisions and cannot influence
eligibility, priority, planning, authorization, or dispatch.

## Authorization Model

The bootstrap authority is explicit for construction and validation
transitions. Before execution, the runtime loads the canonical durable
authorization artifact through an explicit decoder and requires `AUTHORIZED`.
The execution engine independently validates authorization, contract, work
package, gate, artifact identity, and immutable digests. Missing, pending,
denied, corrupt, or mismatched authorization terminates dispatch.

## Evidence Persistence Model

`pbos/runtime/kernel-execution-history.json` has the registered owner
`kernel-runtime`. Draft attempts update `latest`; only finalized certified,
rejected, or recovered records enter history. Each final record has an evidence
digest and certification digest. Loading rejects altered finalized evidence.

The current repository artifact is appropriate for the certified
single-process control plane. Distributed concurrency requires an external
append-only store and remains outside this certification scope.

## Risk Register

| Risk | Status | Control |
|---|---|---|
| Anonymous execution | Closed | Actor required before boot |
| Alternate dispatch | Closed | Static authority test |
| Invalid JSON/domain artifact | Closed | JSON validation and explicit decoders |
| Interrupted attempt | Closed | Canonical recovery finalization |
| Silent shutdown omission | Closed | Shutdown recorded on success and failure |
| Artifact tampering by filesystem administrator | Accepted for local runtime | Digest validation; external signing required for distributed threat model |
| Concurrent multi-host writers | Out of current scope | External transactional evidence store required before distributed operation |

## Technical Debt Remaining

No technical debt remains that blocks the current production runtime.

Future enterprise distribution work:

- transactional append-only external history;
- signed evidence or external trust anchor;
- uniform actor-bound envelopes for administrative governance commands.

These items do not expose a second execution path or weaken current
single-process fail-closed behavior.

## Performance Impact

The migration removes factory construction, service discovery, registry lookup,
provider lookup, adapter wrapping, and configurable phase traversal. Added
overhead is limited to required hashing, schema decoding, fixed lifecycle
records, metrics observation, and evidence persistence. Kernel decision
complexity and deterministic ordering are unchanged.

## Security Impact

- Runtime construction fails on invalid history or JSON.
- Domain artifacts fail before mutation or dispatch.
- Every lifecycle edge is attributable.
- Authorization remains independently enforced twice.
- Failed certification prevents a successful outcome.
- Recovery never invents state or bypasses validation.
- No fallback or silent continuation exists.

## Files Modified

Operational runtime and Kernel:

- `pbos/runtime/kernel-runtime.ts`
- `pbos/kernel/runtime.ts`
- `pbos/kernel/artifact-ownership.ts`
- `pbos/kernel/artifacts.ts`
- `pbos/kernel/identity.ts`
- `pbos/commands/kernel-command-bus.ts`
- `pbos/execution/index.ts`
- `pbos/reconciliation/reconcile.ts`

Runtime artifact consumers were changed only to replace unchecked generic loads
with explicit domain decoders.

## Files Removed

The earlier consolidation removed duplicate runtime managers, runtime
registries, runtime factories, phase runners, adapters, providers, bootstrap
variants, state managers, orchestrators, and parallel Kernel engines. No
additional architecture was reintroduced during blocker remediation.

## Files Added

- `pbos/runtime/artifact-decoders.ts`
- `pbos/runtime/artifact-decoders.test.ts`
- `pbos/runtime/kernel-runtime.test.ts`
- `pbos/runtime/execution-authority.test.ts`
- this production readiness dossier.

## Validation Results

- `npm run lint`: passed with zero errors and two pre-existing warnings outside
  the runtime migration.
- `npx tsc --noEmit`: passed.
- `npx tsc --noEmit --incremental false`: passed during trust-boundary
  validation.
- `npm test`: 116 files passed; 454 tests passed; zero failures.
- `npm run build`: production build passed; 122 static pages generated.
- Focused operational validation: 17 files and 114 tests passed across runtime,
  authorization, constitution, context, lifecycle, planning, reconciliation,
  and interface certification.
- `git diff --check`: passed.
- Protected-path check: no `app/**`, `supabase/**`, or constitutional document
  changes.
- PBOS status: command passed; PBOS health healthy, lifecycle synchronized, and
  artifact health valid. Repository context remained correctly fail-closed as
  stale with refresh required.

No assertion, validation, authorization requirement, or fail-closed behavior was
disabled or weakened.

## Final Certification Recommendation

**CERTIFIED**

The PBOS Kernel is recommended as the permanent execution core of the current
single-process Playbook Operating System runtime. Every blocker from Production
Certification 002 has a concrete owner, fail-closed implementation, durable
evidence, and executable validation. The architecture is smaller than the
replaced runtime and preserves the deterministic Kernel as its center.
