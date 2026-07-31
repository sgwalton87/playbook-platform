# PBOS Final Activation Certification 001

## Architecture Status

PBOS has one governed operator entry point: `npm run it`. The command resolves repository and context state before invoking planning or execution. Human approvals remain external authority inputs; all other eligible transitions are selected and resumed by PBOS.

The authoritative dependency graph is:

```text
Operator Intent
→ Repository and Context Evidence
→ Deterministic Recovery Decision
→ Human Context Authority when required
→ Trusted Context Mutation
→ Constitutional Planning Decision
→ Certified Execution Package
→ Human Execution Approval
→ Execution Authority and Provider Authorization
→ Provider Identity Resolution
→ Task Assignment and Admission
→ Controlled Provider Dispatch
→ Execution Evidence
→ Validation and Advancement Assessment
→ Milestone Lifecycle Record
```

## Completed Systems

- Source-change, committed-transition, fresh-repository, and governed-runtime state classification
- Automatic continuation after approved context reconciliation
- Constitutional planning and package generation
- Durable human approval and execution authority
- Certified provider and registered-agent identity resolution
- Assignment and admission correlation
- Controlled Codex CLI dispatch
- Provider, authorization, command, file, validation, timestamp, and digest evidence
- Evidence-gated milestone advancement
- Recovery from persisted evidence without duplicate provider dispatch
- Idempotent milestone transition persistence

Legacy `authorize`, `first-build`, and `cycle` command surfaces delegate to the canonical approval or RUN IT paths and no longer own independent orchestration.

## Security Model

PBOS fails closed for stale context, source changes without boundaries, missing or expired approval, provider or agent mismatch, stale assignment, scope violation, missing validation, missing evidence, and invalid advancement identity. Providers cannot approve, certify, admit, or advance themselves.

Committed reconciliation does not invent authority. PBOS derives baseline and launch artifacts only after a valid reconciliation-bound refresh approval, using the existing canonical builders and the same independent reviewer evidence.

## RUN IT Lifecycle Demonstration

```text
npm run it
→ inspect state
→ request the exact human approval when required
→ operator supplies approval
→ npm run it
→ automatically resume context, planning, assignment, or validation
→ dispatch only when PBOS_CODEX_EXECUTION_ENABLED=true
→ persist evidence
→ validate completion
→ record eligible milestone advancement
```

If execution already completed, RUN IT loads matching package and approval evidence and advances without redispatching the provider.

## Test Results

Focused recovery, operator, provider identity, assignment, admission, runner, evidence, and advancement tests validate successful and fail-closed paths. Repository lint, TypeScript, full tests, and production build are required certification checks.

## Remaining Blockers

No known missing code connection remains in the RUN IT control path. Actual production dispatch still requires:

- a repository state admitted through context governance;
- current independent human approvals;
- an eligible constitutional milestone;
- an installed and available certified provider binary;
- explicit `PBOS_CODEX_EXECUTION_ENABLED=true` deployment configuration.

These are operational authorities and dependencies, not bypassable software defaults.

## Known Limitations

- PBOS executes one milestone and one provider assignment at a time.
- Provider process isolation relies on the configured Codex sandbox and operating-system process controls.
- Unrecognized validation commands produce no PASS evidence and block advancement.
- Human approval remains a separate operator interaction; PBOS resumes when RUN IT is invoked after approval.

## Certification Decision

**CERTIFIED WITH OPERATIONAL CONDITIONS**

The orchestration path is structurally complete and fail-closed. Live certification requires a governed clean context, current human approval, and a real provider execution against an eligible package. PBOS must not claim that live result before those conditions exist.
