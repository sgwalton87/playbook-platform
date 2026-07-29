# PBOS Kernel Runtime Migration 001

## Purpose

Record the migration from duplicate PBOS runtime orchestration to the certified
constitutional Kernel and determine whether the Kernel is the exclusive
production execution authority.

## Ownership

PBOS Release Authority, Constitutional Stewardship, Runtime Engineering, and
Playbook OS Engineering.

## Last Updated

July 29, 2026

## 1. Executive Summary

**KERNEL MIGRATION CERTIFIED WITH OBSERVATIONS**

The migration replaces the former factory, registry, provider, phase-runner,
runtime-manager, adapter, and parallel engine hierarchy with one command bus,
one concrete runtime, one pure constitutional Kernel, and one dispatch-capable
execution engine. Static enforcement proves that no production module other
than `PBOSKernelRuntime` invokes the execution engine.

The migration preserves the independent authorization validation in the
execution engine. It also removes a reconciliation authority leak: artifact
reconciliation now evaluates eligibility without invoking the dispatch-capable
engine.

The observation concerns PBOS maintenance commands such as context refresh,
artifact reconciliation, gate lifecycle governance, and constitutional-volume
certification. They remain distinct governance artifact owners and do not
dispatch platform execution. They are not alternate runtimes, but a future
command-envelope standard should give these administrative operations the same
actor-bound audit envelope.

## 2. Migration Overview

The pre-migration repository contained two architectural generations at once:
a constitutional decision kernel and a configurable runtime scaffold with
factories, registries, providers, adapters, phase runners, managers, and
multiple command entrypoints.

The post-migration architecture retains the smallest set of concrete owners:

- `kernel-cli.ts`: executable Kernel CLI;
- `kernel-command-bus.ts`: command dispatch;
- `kernel-runtime.ts`: boot, lifecycle, recovery, execution, observability, and
  complete-envelope certification;
- `kernel-repository-adapter.ts`: repository observation and typed Kernel input;
- `ConstitutionalExecutionKernel`: deterministic planning and certification;
- `execution/index.ts`: eligibility enforcement and the sole adapter-dispatch
  boundary.

## 3. Files Reviewed

The migration reviewed:

- every production and test file under `pbos/kernel/**`;
- every file under `pbos/runtime/**`;
- all PBOS command entrypoints in `pbos/commands/**`;
- `package.json` PBOS scripts;
- execution, authorization, reconciliation, planner, lifecycle, release,
  context, health, and constitutional certification integrations;
- PPS-4000 through PPS-4013 and prior Kernel certification evidence.

## 4. Files Modified

Primary modified files:

- `package.json`
- `pbos/commands/execute.ts`
- `pbos/commands/next.ts`
- `pbos/commands/status.ts`
- `pbos/execution/index.ts`
- `pbos/reconciliation/reconcile.ts`
- `pbos/kernel/artifact-ownership.ts`
- `pbos/kernel/artifacts.ts`
- `pbos/kernel/identity.ts`
- `pbos/kernel/runtime.ts`
- `pbos/kernel/types.ts`
- `pbos/kernel/execution/*`
- `pbos/runtime/kernel-runtime.ts`

Primary additions:

- `pbos/commands/kernel-cli.ts`
- `pbos/commands/kernel-command-bus.ts`
- `pbos/engine/kernel-repository-adapter.ts`
- `pbos/runtime/kernel-runtime.test.ts`
- `pbos/runtime/execution-authority.test.ts`

## 5. Files Removed

The migration removes the obsolete:

- Kernel adapters;
- bootstrap directory and runtime constructors;
- contract wrappers;
- duplicate command engine and command registry;
- configurable execution engine and pipeline;
- phase runner and phase result hierarchy;
- providers and service registries;
- duplicate lifecycle, recovery, state, scheduler, registry, context, and
  observability owners;
- runtime factory, manager, registry, state manager, and adapter;
- legacy orchestrator directory;
- obsolete PBOS root entrypoints.

The repository diff removes more than 3,000 lines from the retired
kernel/runtime architecture while adding the concrete governed runtime and its
tests.

## 6. Runtime Components Retired

| Retired component | Reason |
|---|---|
| Runtime factories | Duplicated construction authority |
| Runtime registries | Enabled mutable runtime selection |
| Service providers | Indirection without multiple supported implementations |
| Runtime managers | Competed with Kernel lifecycle ownership |
| Phase runners | Duplicated orchestration |
| Kernel adapters | Wrapped interfaces without enforcing a boundary |
| State managers | Competed with canonical artifact owners |
| Bootstrap variants | Created multiple construction paths |

## 7. Runtime Components Migrated

| Responsibility | Canonical owner |
|---|---|
| CLI | `kernel-cli` |
| Command dispatch | `kernel-command-bus` |
| Runtime construction | `PBOSKernelRuntime` |
| Repository context composition | `kernel-repository-adapter` |
| Objective scheduling | Constitutional Kernel |
| Dependency resolution | Kernel dependency graph |
| Validation | Kernel validation stages plus execution eligibility |
| Certification | Kernel certifier and runtime envelope certifier |
| Authorization | Execution authorization subsystem |
| Adapter dispatch | Execution engine |
| Recovery | `PBOSKernelRuntime` |
| History and metrics | Kernel execution envelope |

## 8. Execution Flow Before

```text
Multiple CLI files
  -> orchestrator or command implementation
  -> runtime manager / phase runner / adapter
  -> planner and validators
  -> execution engine
  -> optional certification
```

Construction and lifecycle ownership could vary by entrypoint.

## 9. Execution Flow After

```text
CLI
  -> Kernel Command Bus
    -> PBOSKernelRuntime
      -> Repository Kernel Adapter
        -> Constitutional Kernel
          -> Dependency Graph
          -> Planning
          -> Validation
          -> Certification
          -> Reporting
      -> Authorization Validation
      -> Execution Eligibility
      -> Adapter Dispatch
      -> Complete-Envelope Certification
      -> Durable History
```

Reconciliation uses only `evaluateExecutionEligibility`; it cannot dispatch an
adapter.

## 10. Dependency Graph Before

```text
commands
  -> orchestrator
  -> runtime manager
  -> runtime registry/factory
  -> providers/adapters
  -> phase pipeline
  -> planner/validator/certifier
  -> infrastructure
```

Several layers represented configuration points that had only one valid
implementation and therefore created duplicate authority rather than useful
extensibility.

## 11. Dependency Graph After

```text
commands -> command bus -> runtime
runtime -> repository adapter -> kernel
runtime -> authorization -> execution engine -> dispatch adapter
kernel -> dependency graph and deterministic engines
kernel/runtime -> governed artifact infrastructure
```

The Kernel has no upward import into commands, runtime, repository adapters, or
application infrastructure. Static relative-import analysis and the TypeScript
build identify no dependency cycle.

## 12. Ownership Matrix

| Capability | Owner | Prohibited competing owner |
|---|---|---|
| Boot and shutdown | Kernel runtime | Commands, planner |
| Lifecycle | Kernel runtime | Runtime manager, phase runner |
| Execution | Kernel runtime | Reconciliation, planner |
| Dispatch | Execution engine | Commands, reconciliation |
| Pipeline | Kernel runtime and fixed execution sequence | Configurable phase runners |
| Context composition | Repository adapter | Global context providers |
| Scheduler | Kernel priority engine | Planner refresh |
| Objective registry | Kernel input registry | Runtime registry |
| Runtime state | Certified execution envelope | State managers |
| Validation | Kernel and eligibility validators | Commands |
| Certification | Kernel and envelope certifiers | Adapter |
| Recovery | Kernel runtime | Bootstrap or manager |
| Observability | Execution envelope | Process-only logs |
| Dependencies | Kernel graph engine | Planner |

## 13. Legacy Architecture Removed

No legacy runtime manager, runtime registry, runtime factory, phase runner,
kernel runtime adapter, runtime bootstrap, or duplicate Kernel execution engine
remains. A regression test checks that these paths are not restored.

## 14. Security Assessment

- Actor identity is required before boot.
- Kernel rejection prevents authorization and dispatch.
- Authorization must be durable and `AUTHORIZED`.
- Contract, work-package, and authorization identity checks remain enforced.
- Only the Kernel runtime can invoke the execution engine.
- Only the execution engine can invoke the adapter.
- Invalid runtime history, illegal lifecycle transitions, or interrupted
  evidence fail closed.
- Reconciliation cannot dispatch execution.

No dependency injection container, dynamic service registry, reflection-based
loading, or mutable execution provider remains.

## 15. Performance Assessment

The migration removes registry lookup, service lookup, factory construction,
adapter wrapping, and configurable phase traversal from startup. Runtime
overhead is limited to fixed lifecycle transitions, deterministic hashing,
artifact persistence, and certification. Those costs are required governance
evidence and are measured in the execution envelope.

## 16. Test Coverage Assessment

The suite covers:

- deterministic Kernel selection and graph failures;
- command bus routing;
- anonymous actor rejection;
- successful boot through shutdown;
- authorization blocking;
- Kernel certification rejection;
- interrupted execution recovery;
- finalized history preservation;
- single execution-engine caller;
- adapter isolation;
- absence of retired runtime authorities.

## 17. Constitutional Compliance Verification

| Constitutional concern | Result |
|---|---|
| Single Kernel authority | Pass |
| Deterministic planning | Pass |
| Governed lifecycle | Pass |
| Typed stable core | Pass |
| State transition request ownership | Pass |
| Immutable event/history evidence | Pass for local runtime |
| Authorization and fail-closed dispatch | Pass |
| Observability and reconstruction | Pass |
| Recovery | Pass |
| Performance proportionality | Pass |
| Complete independent certification | Pass |

Constitutional documents were not modified.

## 18. Risks Remaining

1. Repository JSON history provides local append-only governance but not
   distributed concurrency control.
2. Evidence digests detect accidental or unauthorized mutation within PBOS but
   are not externally signed.
3. Administrative governance commands need a common actor-bound operation
   envelope before multi-operator enterprise deployment.

## 19. Technical Debt Remaining

- Migrate legacy PBOS artifact consumers from unchecked `Runtime.load<T>` to
  explicit unknown-to-domain decoders.
- Introduce an external evidence trust anchor before multi-host execution.
- Standardize governance-command audit envelopes without merging their
  constitutionally separate artifact ownership.

None of these items exposes an alternate adapter-dispatch path.

## 20. Production Readiness Assessment

The Kernel is ready to serve as the permanent execution core for the current
single-process PBOS environment. It is materially simpler than the replaced
architecture, preserves authorization and validation guarantees, produces
complete evidence, and has an executable regression guard around exclusive
execution ownership.

`pbos:status` correctly remains fail-closed when repository context is stale.
Context recovery must occur through its canonical governance command; the
Kernel does not invent eligibility or mutate context to make itself executable.

## 21. Final Certification

**KERNEL MIGRATION CERTIFIED WITH OBSERVATIONS**

Objective evidence:

- exactly one production caller of `runExecutionEngine`;
- exactly one adapter-dispatch module;
- one Kernel CLI and command bus for planning and execution commands;
- one concrete runtime constructor;
- retired runtime authorities are absent;
- 448 tests passed before the final authority regression test was added;
- targeted migration tests pass;
- TypeScript validation passes;
- lint has zero errors;
- no `app/**`, `supabase/**`, constitutional document, or runtime truth JSON was
  modified by the migration.

The observations concern future enterprise distribution and uniform auditing of
administrative governance commands, not execution-authority duplication.
