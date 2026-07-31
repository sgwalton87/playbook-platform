# PBOS Recovery Orchestrator Implementation 001

## Purpose

Record implementation evidence for the deterministic, read-only PBOS recovery
assessment command.

## Owner

Playbook OS Engineering.

## Last Updated

July 30, 2026

## Architecture Decision

Recovery orchestration is implemented as three layers:

1. A read-only collector composes existing repository-context discovery,
   boundary and launch validation, refresh validation, and trusted-context
   readiness.
2. A pure assessment engine maps validated facts to one recovery phase and one
   next governed transition.
3. A formatter presents causal guidance, expected artifacts, approval
   requirements, and verification commands.

The orchestrator does not persist a recovery state. Recovery phases are derived
views of canonical repository and authority artifacts. Existing authority
owners remain unchanged.

## Command Behavior

```text
npm run pbos:recover
```

The command:

- observes repository, context, and trust state;
- identifies the first unmet recovery prerequisite;
- reports one recommended transition;
- reports the complete remaining governed sequence;
- predicts canonical artifact writes without performing them;
- identifies requester and independent-reviewer requirements;
- returns verification commands;
- terminates with `Mutation: NOT PERFORMED`.

The command returns a successful diagnostic result even when recovery is
required. A blocked context is an assessed system state, not a command failure.

## Assessment Contract

`PBOSRecoveryAssessment` contains:

- deterministic assessment identity and digest;
- observation timestamp;
- repository state;
- context and reconciliation state;
- trust and authority state;
- recovery requirement;
- diagnosis;
- current phase;
- recommended transition;
- remaining command sequence;
- expected artifacts and owners;
- approval requirements;
- validation commands.

The timestamp is excluded from the assessment digest. This preserves an audit
capture time while ensuring unchanged evidence produces the same identity and
rendered output.

## State Transitions

```text
CONTEXT_INVALID
  -> CHANGE_BOUNDARY_REQUIRED
  -> APPROVE_BOUNDARY_REQUIRED
  -> APPROVE_REFRESH_REQUIRED
  -> REFRESH_REQUIRED
  -> CONTEXT_ACTIVATION_REQUIRED
  -> TRUSTED
```

The implemented sequence places refresh approval before refresh. This is the
order enforced by Context Refresh Authority. The orchestrator does not expose
an alternate flow.

Derived phases:

- `TRUSTED`
- `CONTEXT_INVALID`
- `CHANGE_BOUNDARY_CREATED`
- `BOUNDARY_APPROVED`
- `REFRESH_APPROVED`
- `TRUST_ACTIVATION_READY`

## Safety Guarantees

- Evidence collection uses existing loaders and validators.
- No recovery-specific approval or lifecycle authority exists.
- The command contains no `Runtime.save`, filesystem write, refresh, activation,
  execution, or approval call.
- Stale or `APPLIED` refresh approvals are never recommended for reuse.
- Expected artifact paths are descriptions, not generated artifacts.
- The first failed prerequisite deterministically owns the next action.
- Existing mutation commands remain independently fail closed.

## Tests

Automated coverage proves:

- blocked context requires recovery;
- trusted context requires no recovery;
- unchanged inputs produce deterministic identity and output;
- changed inputs produce a different digest;
- actual command dispatch leaves Git filesystem state unchanged;
- all existing recovery command registrations remain available.

## Validation Results

- Focused recovery tests: 6 passed.
- Full repository tests: 654 passed across 166 test files.
- ESLint: passed.
- Next.js production build: passed, including TypeScript and 122 static pages.
- `npm run pbos:recover`: passed and reported `Mutation: NOT PERFORMED`.
- Git state before and after recovery assessment: identical.
- Runtime artifact diff: none.
- Approval or lifecycle mutation: none.

## Future Extension Opportunities

- Add stable machine-readable JSON output.
- Add `--explain` for expanded causal evidence.
- Add assessment-digest pinning.
- Add a separately governed `--execute-next` mode that stops after one
  canonical transition.
- Add `pbos:context-refresh` as a compatibility alias for `pbos:refresh`.

Any execution extension must require explicit operator intent, recompute the
assessment, reject changed reality, and delegate mutation to the existing
canonical command.
