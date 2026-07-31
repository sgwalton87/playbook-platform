# PBOS Recovery Orchestration Architecture

## Purpose

Define the canonical architecture for deterministic PBOS recovery analysis and
guided orchestration. Recovery Orchestration coordinates existing authorities;
it does not own repository truth, human approval, refresh, activation, or
lifecycle state.

## Ownership

PBOS Recovery Orchestration owns diagnosis, dependency ordering, recovery-plan
rendering, and next-action explanation. Canonical artifact owners retain all
mutation authority.

## Last Updated

July 30, 2026

## Related Links

- [Recovery architecture inspection](../release-evidence/PBOS_RECOVERY_ARCHITECTURE_INSPECTION_001.md)
- [Recovery execution plan](../release-evidence/PBOS_RECOVERY_EXECUTION_PLAN_001.md)
- [Refresh authority architecture](PBOS_REFRESH_AUTHORITY_ARCHITECTURE.md)

## Architecture Decision

PBOS recovery shall be implemented as a read-only orchestration layer over
existing validators and authority stores. It shall construct one immutable
assessment from repository reality, compare every authority edge, classify the
current recovery state, and recommend exactly one permitted transition.

The orchestrator may dispatch a transition only when:

- the operator explicitly requests execution;
- required human evidence already exists or is supplied through the canonical
  command;
- the assessment identity remains unchanged;
- the target canonical owner independently revalidates the request.

The orchestrator cannot override a canonical owner.

## Architectural Position

```text
Operator or governed agent
  -> Recovery Orchestrator
     -> Repository Context Reconciliation
     -> Change Boundary Authority
     -> Authority Ledger
     -> Context Refresh Authority
     -> Repository Context Authority
     -> Context Activation Authority
  -> Recovery Plan and Evidence References
```

Recovery Orchestration is a coordinator above these authorities, not a new
authority beside them.

## Recovery Assessment Contract

A future `RecoveryAssessment` should contain:

- assessment ID and deterministic digest;
- repository, remote, branch, HEAD, and content identities;
- stored and proposed context identities;
- current recovery state;
- artifact health and ownership;
- boundary, launch, refresh, and activation validation results;
- first causal failure;
- all downstream impacts;
- one next permitted transition;
- expected read and write sets;
- required human roles and separation of duties;
- rollback and re-analysis conditions;
- timestamp for evidence freshness, excluded from deterministic diagnosis
  identity where appropriate.

Unknown, unreadable, or multiply owned artifacts produce `BLOCKED`, never a
best-effort recommendation.

## Deterministic Diagnosis

Evaluation order is fixed:

1. Repository identity and working tree.
2. Required artifact existence and registered ownership.
3. Stored repository-context validity.
4. Reconciliation state and difference codes.
5. Change-boundary validity.
6. Launch-approval validity.
7. Refresh-approval validity and application state.
8. Refreshed-context identity.
9. Trusted-context validity.
10. Planning eligibility.

The first failed prerequisite determines the next action. Later failures remain
visible as consequences but cannot reorder the recovery sequence.

## State and Transition Ownership

| Recovery State | Observed By | Transition Owner |
|---|---|---|
| `BLOCKED` | Recovery Orchestrator | None until diagnosis completes |
| `INSPECTION_REQUIRED` | Recovery Orchestrator | Recovery Orchestrator, read-only |
| `CHANGE_BOUNDARY_REQUIRED` | Change Boundary validator | Change Boundary Authority |
| `BOUNDARY_APPROVED` | Authority Ledger validator | Authority Ledger |
| `CONTEXT_REFRESH_REQUIRED` | Repository Context Reconciliation | Context Refresh Authority |
| `REFRESH_APPROVED` | Context Refresh validator | Context Refresh Authority |
| `TRUST_ACTIVATION_READY` | Context Activation validator | Repository Context and Activation authorities |
| `TRUSTED` | Context readiness validator | No recovery mutation required |

These are orchestration states derived from canonical evidence. They must not
be persisted as a competing lifecycle truth.

## Authority Separation

Boundary approval answers: “May this exact repository scope become a candidate
for activation?”

Refresh approval answers: “May this exact previous-to-proposed context
transition replace repository context?”

Context activation answers: “Does the refreshed, verified context satisfy every
trust prerequisite?”

Execution authorization answers: “May an admitted execution package run?”

These decisions are not interchangeable. `pbos:authorize` currently creates no
decision and has no role in context recovery.

## Orchestration Modes

### Analyze

Default and read-only. Loads evidence, validates every edge, and emits one plan.
It writes no runtime or evidence artifact.

### Explain

Expands the causal chain, ownership, expected mutations, and rollback behavior.
It remains read-only.

### Execute Next

Future optional mode. It may call only the single canonical command identified
by the unchanged assessment. Human evidence must be collected by that command.
The orchestrator must stop after one transition and re-analyze.

There is no multi-step unattended recovery mode.

## Operator and Agent Experience

Output must be both human-readable and machine-readable. Human output follows
Current State, Cause, Impact, Required Action, Expected Changes, Approval, and
Verification. Machine output uses stable reason codes and explicit artifact
identities.

An AI agent may:

- inspect and explain;
- compare identities;
- prepare a non-authoritative plan;
- invoke an explicitly authorized next command.

An AI agent may not:

- invent requester or reviewer evidence;
- approve its own action;
- reuse historical decisions;
- refresh or activate because a plan recommends doing so;
- suppress a changed assessment.

## Expected Write Sets

The recovery plan must predict mutations before execution:

| Transition | Allowed writes |
|---|---|
| Boundary creation | `pbos/runtime/change-boundary.json` |
| Boundary approval | `pbos/runtime/launch-approval.json` |
| Refresh approval | `pbos/runtime/context-refresh-approval.json` |
| Context refresh | `repository-context.json`, `context-refresh.json`, `context-refresh-approval.json`, `pbos-context-refresh.md` |
| Trust activation | `pbos/runtime/trusted-build-context.json` |

Any observed write outside the declared set fails the transition and requires
inspection.

## Failure and Rollback

Recovery fails closed on:

- repository mutation after assessment;
- missing or ambiguous ownership;
- invalid digest or identity;
- stale, rejected, revoked, expired, or applied approval;
- self-approval where independence is required;
- unexpected write-set expansion;
- failed post-transition verification.

No rollback deletes evidence. If a transition partially writes, canonical
owners must validate which artifacts committed, preserve them as evidence, and
require reconciliation before retry. A retry is a new governed attempt, not a
replay of stale authority.

## Observability and Evidence

Each analysis should expose:

- assessment digest;
- source artifact digests;
- current and proposed states;
- reason codes;
- responsible authority;
- expected writes;
- approval roles;
- verification command.

If persisted evidence is later required, a separate evidence owner must be
registered. The read-only `pbos:recover` command must not persist its own output
by default because doing so would change the baseline it is diagnosing.

## Command Design

Proposed command:

```text
npm run pbos:recover
```

Recommended options:

- `--format human|json`
- `--explain`
- `--execute-next`
- `--assessment-digest <digest>`

`--execute-next` requires the current assessment digest and fails when
recomputed reality differs. It cannot run approval commands without explicit
human input.

Add `pbos:context-refresh` as a compatibility alias to the existing
`pbos:refresh`, or remove the alternate name from operational documentation.
The canonical transition order remains `approve-refresh` before `refresh`.

## Validation Model

Architecture certification requires tests proving:

- repeated unchanged analysis is deterministic;
- stale approvals are never recommended for reuse;
- the first missing prerequisite selects one next action;
- a dirty tree prevents baseline activation;
- an assessment change invalidates execute-next;
- predicted write sets match canonical owners;
- analysis performs no writes;
- execution stops after one transition;
- human separation of duties remains enforced.

## Future Evolution

Implementation should reuse current loaders and validators rather than
introduce a recovery-specific copy of authority logic. A typed dependency graph
may later support additional recovery domains, but repository-context recovery
must remain the first certified flow.
