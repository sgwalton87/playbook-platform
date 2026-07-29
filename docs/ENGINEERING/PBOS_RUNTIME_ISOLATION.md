# PBOS Runtime Isolation

## Purpose

Define constitutional ownership, mutation, validation, isolation, cleanup, and
recovery rules for PBOS runtime artifacts and PBOS tests.

## Ownership

Playbook OS Engineering

## Last Updated

July 28, 2026

## Related Links

- [PBOS architecture](../ARCHITECTURE.md#pbos-governed-execution)
- [PBOS engine](../../pbos/README.md)
- [Release process](../RELEASE_PROCESS.md)
- [Planner implementation](../release-evidence/pbos-planner-001-implementation.md)

## Runtime Lifecycle

```text
Repository Context
  -> Planning Context
  -> Gate Selection
  -> Execution Contract
  -> Work Package
  -> PENDING Authorization
  -> Authorization Decision
  -> Execution Eligibility
  -> Adapter Dispatch
  -> Completion
  -> Evidence
  -> Governed Retention or Replacement
```

Repository and validation artifacts establish observed facts. The
constitutional planner owns the planning decision. A selected gate authorizes
creation of an execution contract and work package, which are bound by digest
into one authorization artifact. Creation stops in `PENDING`. Approval or
denial mutates only that artifact. Resume loads the durable artifacts, validates
their identities, and dispatches only when the decision is `AUTHORIZED`.

## Runtime Artifact Inventory

The executable ownership registry is
`pbos/kernel/artifact-ownership.ts`.

| Artifact | Canonical owner | Creation and update | Consumers | Persistence and cleanup |
| --- | --- | --- | --- | --- |
| `repository.json` | Repository Intelligence | Repository observation | Context, validator, execution | Replace on the next repository run |
| `next-gate.json` | Constitutional Planner | Constitutional decision only | Validator, execution, status | Replace on the next planning run |
| `constitutional-planning.json` | Constitutional Planner | Constitutional decision only | Status and evidence | Replace on the next planning run |
| `validation.json` | Runtime Validator | Validation run | Context, planner, execution | Replace on the next validation run |
| `execution.json` | Execution Engine | Execution evaluation | Context, workflow, evidence | Replace on the next execution run |
| `execution-contract.json` | Execution Contract | First request for an immutable gate identity | Work package, authorization, execution | Durable; remove only by governed transition |
| `work-package.json` | Work Package | Valid contract | Authorization and execution | Durable; remove only by governed transition |
| `execution-authorization.json` | Execution Authorization | Valid contract and work package | Decision service and execution | Durable; terminal decisions are immutable |
| `repository-context.json` | Repository Context | Explicit context capture | Planner and execution | Replace only by explicit recapture |
| `workflow.json` | Workflow Engine | Workflow run | Doctor and evidence | Replace on the next workflow run |
| `doctor.json` | Doctor Engine | Doctor run | Operator | Replace on the next doctor run |
| `manifest.json` | Runtime Kernel | Runtime initialization | Runtime Kernel | Durable; governed replacement |
| `promotion.json` | Release Promotion | Successful promotion | Completion and planner | Durable; governed replacement |
| `activation.json` | Gate Lifecycle | Successful activation | Lifecycle audit and evidence | Durable; governed replacement |
| `completion.json` | Gate Lifecycle | Successful completion | Lifecycle audit and evidence | Durable; governed replacement |
| `runtime-state.json` | Runtime Phase Manager | Phase transitions | Phase manager and doctor | Durable; governed replacement |
| `repository-analysis.json` | Repository Inspector | Repository inspection | Operator and evidence | Replace on the next inspection |
| `execution-history.json` | Execution History | Execution history reporting | Operator and evidence | Durable; governed replacement |

Release contracts and human-readable reports live under
`docs/release-evidence/`. The release subsystem owns them; they are evidence,
not mutable runtime authority.

## Runtime Ownership

- Every artifact path has exactly one owner in `RuntimeArtifactOwnership`.
- Only the named producer may create or replace an artifact.
- Consumers must load the canonical path through `Artifacts`.
- A consumer may validate an artifact but must not repair or recreate it.
- Ownership uncertainty is a runtime blocker.
- Commands may default to the repository root. Tests must provide an explicit
  isolated root.

The `Runtime` kernel enforces these rules. Reads of unregistered
`pbos/runtime/` paths fail, and every canonical write must present the owner
registered in `RuntimeArtifactOwnership`.

## Creation Rules

- Prerequisite artifacts must validate before downstream creation.
- Planning artifacts require a constitutional planner decision.
- Contract creation requires a selected gate and passing execution context.
- Work-package creation requires a valid contract.
- Authorization creation requires immutable contract and work-package
  identities and always initializes as `PENDING`.
- Approval and denial never create a missing authorization artifact.

## Mutation Rules

- Replaceable observation artifacts may be rewritten only by their owner.
- Contract and work-package content is immutable after authorization binding.
- Authorization may transition from `PENDING` to `AUTHORIZED` or `DENIED`.
- `AUTHORIZED` and `DENIED` decisions cannot be overwritten or reverted.
- Completion and activation are governed lifecycle transitions with evidence.

## Test Isolation Rules

Every PBOS test that touches files must:

1. Create a unique temporary root.
2. Establish every repository, planning, validation, and lifecycle prerequisite.
3. Pass the root explicitly to the subsystem under test.
4. Assert the expected artifact identities and state transitions.
5. Clean the temporary root in `afterEach`.
6. Assert cleanup completed.

Tests must not read or write repository `pbos/runtime/` state. Tests must not
depend on artifacts created by another test, a previous command, or a developer
session. `PbosRuntimeTestHarness` is the canonical utility for JSON runtime
fixtures.

## Cleanup Rules

- Temporary test roots are recursively deleted after every test.
- Repository runtime artifacts are never deleted merely to prepare a test.
- Replaceable production artifacts are superseded by their canonical producer.
- Durable artifacts require a documented lifecycle transition before removal.
- Cleanup failure fails the test; it is not ignored.

## Restoration Rules

Temporary-root isolation is preferred to snapshot restoration. When interaction
with an external fixture makes restoration unavoidable, the test must capture
existence and byte content before mutation, restore both exactly, and verify the
restored digest. Repository runtime artifacts must never be used as disposable
fixtures.

## Validation Rules

- JSON artifacts must parse and satisfy their subsystem schema.
- Gate-bound artifacts must match the selected or permitted dependency gate.
- Declared identities and digests must match content.
- Timestamped artifacts must satisfy freshness policy.
- Runtime authorization must bind the exact contract and work package.
- Dispatch requires `AUTHORIZED`; all other states block.

## Failure Modes

PBOS fails closed for missing prerequisites, unknown ownership, invalid schema,
stale context, mismatched gate identity, digest drift, missing authorization,
non-authorized decisions, invalid transitions, and cleanup leakage.

No failure handler may fabricate authorization, downgrade validation, or infer
a gate from stale ambient state.

## Recovery Guidance

1. Identify the canonical owner from `RuntimeArtifactOwnership`.
2. Inspect the failed artifact without mutating it.
3. Re-run the owner command for replaceable artifacts.
4. For durable artifacts, repair the prerequisite or execute the documented
   lifecycle transition; never overwrite the decision in place.
5. Recapture repository context after intentional runtime changes.
6. Re-run validation before resuming execution.

## Constitutional Guarantees

- One owner per runtime artifact.
- One constitutional planning authority.
- Fail-closed execution and authorization.
- Deterministic artifact paths and lifecycle transitions.
- Immutable authorization bindings and terminal decisions.
- Explicit test prerequisites with no ambient runtime dependency.
- Temporary-root cleanup with no repository runtime leakage.
