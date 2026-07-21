# Sprint Execution Protocol

## Status

Canonical governance protocol.

## Purpose

This protocol defines how Playbook sprint work is planned, executed, verified, documented, and handed off. It exists to keep execution aligned with the governance architecture: every sprint must protect product intent, engineering quality, documentation truth, and institutional memory.

## Scope

This protocol applies to all sprint work across product, engineering, design, data, documentation, and operations.

It governs:

- Sprint intake and scope definition.
- Implementation discipline.
- Documentation obligations.
- Verification requirements.
- Handoff, release, and archival expectations.

## Governance Principles

1. **Canonical truth first.** Existing canonical documents must be checked before new decisions, new documents, or new architecture are created.
2. **Smallest safe change.** Sprint work should change only what is required to satisfy the approved objective.
3. **No silent scope expansion.** New features, architecture changes, dependencies, data model changes, or product behavior changes require explicit sprint scope.
4. **Verification before completion.** Work is not complete until the required checks have been run or explicitly documented as blocked by an environment limitation.
5. **Documentation follows reality.** Any meaningful change to behavior, architecture, product language, or process must update the appropriate documentation in the same sprint.
6. **History is preserved.** Sprint outcomes, major decisions, and releases must be recorded in the appropriate ledger, changelog, release note, or sprint log.

## Sprint Lifecycle

### 1. Intake

Before implementation begins, the sprint owner must identify:

- The sprint objective.
- The files, systems, or documents expected to change.
- The canonical references that govern the work.
- The verification commands required for completion.
- Any explicit non-goals.

If the request limits the work to a specific file or directory, that limit is binding.

### 2. Discovery

Before editing, the implementer must:

- Read applicable `AGENTS.md` instructions.
- Check existing canonical documentation before creating new documentation.
- Inspect current implementation patterns before adding new ones.
- Confirm whether the work touches application code, documentation only, infrastructure, or generated artifacts.

Discovery must not modify files.

### 3. Execution

During execution, the implementer must:

- Keep changes minimal and directly tied to the sprint objective.
- Avoid modifying unrelated files.
- Avoid opportunistic refactors unless explicitly requested.
- Avoid application code changes during documentation-only sprints.
- Preserve existing naming, formatting, architecture, and documentation conventions unless the sprint objective requires changing them.
- Treat generated files as generated; update source inputs when practical.

### 4. Documentation

Documentation changes must be:

- Placed in the correct canonical directory.
- Written as durable operating guidance, not temporary commentary.
- Consistent with existing terminology.
- Clear about status, scope, ownership, and verification expectations.
- Cross-referenced only when the referenced document is already canonical or intentionally part of the sprint.

A new document should be created only when an existing canonical document cannot accurately hold the required guidance.

### 5. Verification

Verification must be selected according to the change type:

- **Documentation-only change:** confirm the intended file exists, inspect the diff, and verify no unintended files changed.
- **Application code change:** run the relevant unit, lint, type, build, or integration checks required by the touched area.
- **Data model or migration change:** verify schema, migration order, rollback risk, and affected repositories or services.
- **UI change:** run relevant checks and capture a screenshot when the change is perceptible in a runnable web application.
- **Process or governance change:** verify the document is located correctly, the scope is explicit, and the protocol does not conflict with higher-priority instructions.

A failed verification may be accepted only when the failure is caused by an environment limitation and the limitation is documented in the handoff.

### 6. Completion

A sprint is complete only when:

- The approved objective is satisfied.
- No unrelated files remain changed.
- Required verification has been run or documented as blocked.
- Documentation is updated where required.
- The git diff has been reviewed.
- The work has been committed on the current branch.
- Pull request metadata has been prepared when required by the delivery workflow.

## Engineering Contract

The Engineering Contract is the minimum standard for implementation work.

Every sprint must honor the following contract:

1. **Respect scope.** Modify only files necessary for the objective.
2. **Protect application behavior.** Do not change runtime behavior unless the sprint explicitly requires it.
3. **Protect architecture.** Do not introduce new architectural patterns without an approved decision record or canonical architecture update.
4. **Protect dependencies.** Do not add, remove, or upgrade dependencies unless explicitly required.
5. **Protect data.** Do not change schemas, migrations, seed data, or persistence behavior without explicit scope and verification.
6. **Protect users.** Do not weaken authentication, authorization, privacy, safety, accessibility, or trust boundaries.
7. **Protect maintainability.** Prefer clear, idiomatic, local changes over clever abstractions.
8. **Protect documentation truth.** Update documentation when the sprint changes how the system works or how the team operates.
9. **Protect repository integrity.** Leave the working tree with only intentional changes.
10. **Protect delivery quality.** Run the appropriate verification commands before claiming completion.

## Verification Standard

The Verification Standard defines how completion claims are proven.

### Required Evidence

Every sprint handoff must include:

- A summary of what changed.
- File references for meaningful changes.
- The exact verification commands or checks that were run.
- The result of each command or check.
- Any warnings caused by environment limitations.

### Verification Levels

#### Level 0 — Inspection

Use for documentation-only or metadata-only changes.

Required checks:

- Confirm the intended file or metadata changed.
- Review the diff.
- Confirm no unrelated files changed.

#### Level 1 — Local Static Verification

Use for code changes that do not require a full application build.

Required checks may include:

- Lint.
- Type checking.
- Unit tests for touched modules.
- Targeted validation scripts.

#### Level 2 — Runtime Verification

Use for user-facing, integration, workflow, or application behavior changes.

Required checks may include:

- Build.
- Integration tests.
- End-to-end checks.
- Manual runtime walkthrough.
- Screenshot evidence for visible UI changes.

#### Level 3 — Release Verification

Use for release, deployment, migration, security, or irreversible operational changes.

Required checks may include:

- Full build and test suite.
- Migration validation.
- Rollback review.
- Release notes.
- Ledger or changelog update.
- Explicit risk and mitigation notes.

### Verification Result Language

Verification results must be reported as:

- **Pass** when the command or check succeeds.
- **Warning** when the command cannot complete because of an environment limitation.
- **Fail** when the command fails because of an implementation or agent error.

Warnings do not erase the requirement to describe what happened and why.

## Sprint Guardrails

The following actions are prohibited unless explicitly requested by the sprint objective:

- Modifying application code during a documentation-only sprint.
- Changing package manager lockfiles.
- Adding dependencies.
- Reformatting unrelated files.
- Moving canonical documents without updating documentation governance.
- Deleting historical records.
- Rewriting release history, ledger entries, or archived documents.
- Creating duplicate canonical sources of truth.

## Handoff Checklist

Before handoff, confirm:

- [ ] The sprint objective is satisfied.
- [ ] The change set contains only intentional files.
- [ ] The Engineering Contract has been honored.
- [ ] The correct Verification Standard level was applied.
- [ ] Verification results are ready to report.
- [ ] Documentation has been updated when required.
- [ ] Git status has been checked.
- [ ] Changes have been committed on the current branch.
- [ ] Pull request metadata has been prepared when required.

## Ownership

This protocol is owned by Playbook governance and engineering leadership. Changes to this protocol should be treated as governance changes and verified at Level 0 or higher depending on scope.
