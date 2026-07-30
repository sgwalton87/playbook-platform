# PBOS Development Orchestration Engine Architecture

**Purpose:** Define the governed intelligence layer that analyzes PBOS state, explains the canonical next milestone, and generates implementation packages without acquiring planning or execution authority.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026  
**Related:** [Autonomous Development Model](./PBOS_AUTONOMOUS_DEVELOPMENT_MODEL.md), [PBOS Architecture](../ARCHITECTURE.md)

## Architecture Decision

Development orchestration consumes the constitutional planner and Kernel decision. It does not introduce a second selector.

```text
Repository context
  -> constitutional planner
  -> Kernel eligibility and decision
  -> system intelligence
  -> dependency explanation
  -> canonical recommendation
  -> Codex execution package
  -> human approval
  -> governed execution
  -> validation and evidence
```

## System Intelligence

The engine produces deterministic snapshots for:

- repository identity, branch, commit, and content;
- constitutional architecture and gaps;
- completed, incomplete, and blocked capabilities;
- engine mode, version, active gate, and validation health;
- lifecycle, certification, validation, and governance conflicts.

Every snapshot binds identity, source references, timestamp, confidence, validation status, findings, and digest. Missing repository context or invalid governance is represented as `INVALID`, never inferred as healthy.

## Dependency Reasoning

`MilestoneEligibilityAssessment` evaluates prerequisites, dependencies, blockers, risk, strategic importance, implementation readiness, and evidence.

States:

- `READY`
- `BLOCKED`
- `WAITING_EXTERNAL_INPUT`
- `NOT_READY`
- `COMPLETED`

The dependency engine explains the Kernel result. It cannot change objective state or make an ineligible objective eligible.

## Recommendation Authority

`NextMilestoneRecommendation` copies the milestone selected by the constitutional planner through the Kernel. It records rationale, dependency result, risk, impact, confidence, blockers, evidence, timestamp, digest, and the explicit `PBOS-CONSTITUTIONAL-PLANNER` authority.

When the Kernel selects nothing, orchestration recommends nothing and reports blockers. It never invents a milestone.

Priority remains constitutional:

1. Mission alignment
2. Dependency readiness
3. Blocking resolution
4. User value
5. Architectural leverage
6. Risk reduction

Activity, file count, commit count, and complexity are not value signals.

## Codex Package

`CodexExecutionPackage` contains mission, repository context, current state, dependencies, required changes, implementation, security, validation, documentation, completion criteria, recommendation binding, timestamp, digest, and mandatory human approval.

Generation requires:

- one canonical selected milestone;
- certified Kernel decision;
- dependency state `READY`;
- matching Kernel execution plan;
- 100 percent recommendation confidence.

## Command Integration

- `pbos:analyze`: emits intelligence, eligibility, and recommendation without persistence.
- `pbos:next`: retains the existing Kernel-backed constitutional selection path.
- `pbos:plan`: emits a Codex package only when the Kernel plan is certified.
- `pbos:status`: reports the same Kernel decision as the development recommendation.

No command writes a competing planning artifact.

## Evidence And Audit

Recommendations bind constitution, registry, repository content, Kernel decision, and certification digests. Repeated inputs produce identical decisions and package content.

## Failure Behavior

Missing context, invalid architecture, unknown dependencies, lifecycle conflict, invalid governance, missing validation evidence, or failed Kernel certification blocks recommendation confidence and package generation.

