# PBOS Engine v3

## Purpose
PBOS Engine v3 is the deterministic, adapter-driven, resumable engineering orchestration runtime for Playbook OS. It decides what Codex should build next by reading persistent engine state, machine-readable gates, reusable rules, and the project handbook authority hierarchy.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Documents
- Implementation authority: [../docs/MASTER_CHECKLIST.md](../docs/MASTER_CHECKLIST.md)
- Release policy: [../docs/RELEASE_PROCESS.md](../docs/RELEASE_PROCESS.md)
- Sprint sequencing: [../docs/auto_sprint.md](../docs/auto_sprint.md)
- Engineering history: [../docs/HISTORY/PLAYBOOK_HISTORY.md](../docs/HISTORY/PLAYBOOK_HISTORY.md)
- Engineering ledger: [../docs/LEDGER/ENGINEERING_LOG.md](../docs/LEDGER/ENGINEERING_LOG.md)
- Future planning only: [../docs/ROADMAP.md](../docs/ROADMAP.md)

## Authority Hierarchy
PBOS reads authority in this order:

1. `docs/MASTER_CHECKLIST.md`
2. `docs/RELEASE_PROCESS.md`
3. `docs/auto_sprint.md`
4. `docs/HISTORY/`
5. `docs/LEDGER/`
6. `docs/ROADMAP.md` for future planning only

`ROADMAP.md` must never justify implementation by itself.

## Runtime Architecture
PBOS coordinates a reusable execution pipeline: Planner → Validator → Execution Adapter → Verifier → Documentation Adapter → History Adapter → Ledger Adapter → Release Evidence Adapter → Reporting Adapter → Recommendation Engine → STOP.

PBOS separates orchestration responsibilities into focused modules:

- `engine/planner.ts` loads structured gates and selects the highest-priority eligible gate without skipping dependencies.
- `engine/rules.ts` evaluates reusable rules such as dependency safety, single-sprint selection, documentation authority, validation requirements, and release constraints.
- `adapters/registry.ts` registers planning-safe adapters for execution boundaries, documentation handoff, and release evidence.
- `commands/registry/commands.json` declares active and reserved PBOS commands, and `command-registry.ts` loads them without planner changes.
- `engine/prompts.ts` verifies prompt manifest compatibility before execution proceeds.
- `engine/recommendation.ts` generates the recommended next gate and reason.
- `engine/state.ts` maintains persistent state under `pbos/state/` so PBOS can resume after interruption.
- `engine/executor.ts` coordinates the lifecycle: planner, validator, executor boundary, documentation, ledger, report, recommendation, and stop.
- `engine/validator.ts` returns structured validation results with remediation and handbook references.
- `engine/docs.ts` verifies handbook discovery and appends PBOS history and ledger records.
- `engine/reporter.ts` creates the standardized report schema.
- `commands/next.ts` exposes the planning-mode next command.
- `commands/status.ts` prints current state and gate status without changing application code.
- `gates/` stores machine-readable gate definitions that reference the handbook.

## State Management
PBOS state is stored at `pbos/state/engine-state.json` and includes `currentGate`, `completedGates`, `blockedBy`, `lastRun`, `handbookVersion`, `validationHash`, `engineVersion`, `resumeToken`, and `executionMode`.

If state is missing, PBOS creates it before planning. Each planning run updates the current gate, blockers, last run timestamp, and resume token.

## Execution Modes
PBOS recognizes these reusable mode names: `planning`, `execution`, `audit`, `doctor`, `release`, and `ship`.

PBOS Engine v3 authorizes planning mode only. Other modes are reserved extension points for later milestones and fail safely if requested.

## Gate Discovery
The engine loads `pbos/config/pbos.config.json`, reads the configured `gatesDirectory`, and parses every `.json` file as a gate definition. Gate files must include `id`, `title`, `status`, `priority`, `dependencies`, `tasks`, `definition_of_done`, and `next_gate`.

## How `next` Works
Run:

```bash
npm run pbos:next
```

The command loads configuration, loads engine state, discovers gates, validates gate schema, builds dependency-safe eligibility, evaluates reusable rules, selects exactly one eligible gate when possible, runs planning-safe validation, updates PBOS state, appends history and ledger records, writes release evidence, recommends the next gate, and stops before making application code changes.

## Report Schema
Every PBOS command writes this report structure and preserves adapter/rule validation evidence:

```json
{
  "engineVersion": "3.0.0",
  "executionMode": "planning",
  "selectedGate": "PBOS-GATE-001",
  "completedTasks": [],
  "validationResults": [],
  "blockers": [],
  "recommendation": "",
  "duration": 0,
  "timestamp": ""
}
```

## Prompt Governance
PBOS prompts live under `pbos/prompts/` with `manifest.json`. PBOS verifies the active prompt is compatible with the configured engine version before execution continues. Historic prompts are preserved rather than overwritten.

## PBOS-ENGINE-004
The proposed next PBOS self-improvement gate should add controlled implementation adapters, richer validation adapters, release-evidence append policies, checklist update APIs, state hashing, and mode-specific integration tests without changing application features.


## Release Candidate Baseline
PBOS Engine v3 is the current planning-mode runtime baseline after release-candidate validation. Future PBOS architecture changes should be proposed through machine-readable gates and reviewed before implementation. The first real Playbook work should continue through `PBOS-GATE-001` so repository release gates become trustworthy before feature expansion.


## Release State Machine
PBOS separates engineering validation, repository promotion, and release auditing with a deterministic release state machine: DRAFT → ENGINEERING_REVIEW → ENGINEERING_APPROVED → PROMOTION_PENDING → PROMOTION_COMPLETE → AUDIT_COMPLETE → ARCHIVED. Environment limitations such as missing Git remotes or credentials keep the release in `PROMOTION_PENDING` without invalidating engineering approval.
