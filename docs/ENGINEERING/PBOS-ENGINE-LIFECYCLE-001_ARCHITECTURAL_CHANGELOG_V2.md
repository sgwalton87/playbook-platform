# PBOS Engine Lifecycle Architectural Change Log V2

## Purpose

Record the constitutional changes, section rationale, and migration impact introduced by Version 2 of PBOS-ENGINE-LIFECYCLE-001.

## Ownership

PBOS Engineering Governance owns this change record.

## Last Updated

August 1, 2026

## Change Decision

Version 2 preserves the Version 1 separation of Runtime, Validation, Certification, Repository Evolution, Git, and Baselines. It replaces implicit implementation assumptions with explicit constitutional subsystems and resolves the findings in `PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001`.

## Architectural Changes

| Change | Version 1 disposition | Version 2 rationale |
|---|---|---|
| Candidate Workspace | Added | Software construction requires isolated mutation outside the certified checkout |
| Candidate Change Set | Added | Validation and certification need one immutable subject identity |
| Storage Classes | Added | Paths cannot define durability, authority, or retention |
| Engineering Certification Coordinator | Replaces universal Certification Engine | Existing domain certifiers must retain authority |
| Repository Evolution Transaction | Expanded | Git, remote, baseline, and audit side effects require recoverable ordering |
| Mission Queue | Expanded from implied queue | Continuous autonomy requires durable admission, leases, retry, and history |
| Storage Ports | Added | Constitutional code must not depend on filesystem or Git layout |
| Concurrency Model | Added | Multi-mission execution requires explicit isolation and serialization |
| Recovery Model | Expanded | Every lifecycle stage needs an owner and authoritative recovery source |
| Engineering Lifecycle States | Split from gate lifecycle | Gate and engineering progression represent different subjects |
| Security and observability | Strengthened | Enterprise operation requires credential isolation and correlation |

## Section-by-Section Rationale

| Version 1 section family | Action | Rationale |
|---|---|---|
| Executive Summary, Purpose, North Star | Preserved and strengthened | Core intent remains valid; candidate isolation makes it implementable |
| Constitutional Authority | Preserved | Version 2 becomes sole authority and explicitly supersedes Version 1 |
| Root Cause Analysis | Moved to change record and assessment | Historical analysis is evidence, not a permanent normative rule |
| Engineering Principles | Merged into Constitutional Principles | Eliminates repetition and adds identity, ports, and recovery invariants |
| Four Lifecycle Domains | Expanded | Queue, workspace, coordinator, baseline, history, and observability are first-class owners |
| Runtime Domain | Preserved and constrained | Runtime may mutate candidates but never certified history |
| Validation Domain | Preserved and expanded | Results now bind candidate, toolchain, environment, and policy identities |
| Certification Domain | Split | Domain certification remains federated; engineering certification coordinates |
| Repository Evolution Domain | Preserved and expanded | Explicit journaled transaction resolves partial-failure ambiguity |
| Required Directory Structure | Removed as constitutional mandate | Directory layout is an implementation decision beneath ports |
| Lifecycle Engine | Split and strengthened | Engineering lifecycle no longer conflicts with existing gate lifecycle |
| Baseline Engine | Preserved as Baseline Authority | Baseline creation follows verified evolution, not certification alone |
| Runtime/Candidate/Certified/Repository State | Expanded into storage classes | Defines durability, visibility, retention, backup, and recovery |
| Engineering Contracts | Expanded into ports and transition contracts | Adds typed failure, concurrency, atomicity, and idempotency |
| Implementation Phases | Reordered | Candidate isolation and storage ports precede runtime migration |
| Acceptance Criteria | Strengthened | Criteria require demonstrated isolation, concurrency, and recovery |
| Guardrails | Integrated throughout | Normative rules are adjacent to their domains |
| Final Directive | Preserved and clarified | Clean checkout is caused by isolation, not by forbidding candidate changes |

## Dependency Diagram

```text
Mission Control
  -> Mission Queue
  -> Engineering Lifecycle Coordinator
  -> Runtime / Workspace Authority
  -> Validation Aggregate
  -> Domain Certifiers
  -> Engineering Certification Coordinator
  -> Repository Evolution
  -> Baseline Authority

All domains -> History / Telemetry ports
All infrastructure -> replaceable adapters
```

## Migration Impact Assessment

### Current Systems Preserved

- Kernel execution and admission authority.
- Constitutional planner selection authority.
- Mission Control operator projection.
- Repository Context Authority.
- Execution authorization and provider admission.
- Domain validation and certification owners.
- Artifact ownership registry and existing history.

### Systems Requiring Adaptation

- Runtime storage must move behind typed ports and outside tracked paths.
- Execution Fabric must receive a Candidate Workspace handle.
- Product Factory and providers must write candidate outputs rather than certified paths.
- Validation must bind results to Candidate Change Set identity.
- Certification commands must expose domain decisions to the coordinator.
- Context integration must distinguish certified base context from candidate context.
- Git and baseline behavior must move behind Repository Evolution and Baseline ports.

### Compatibility Strategy

Use dual-read/single-write adapters, shadow lifecycle decisions, opt-in candidate execution, advisory certification, dry-run evolution, and controlled deprecation. At no time may two writers own the same artifact. Historical runtime and evidence files remain preserved.

### Migration Risks

- Existing authority digests may bind repository-relative paths.
- Tracked runtime artifacts may invalidate context during relocation.
- Worktree cleanup can lose unsealed candidate changes if retention is incorrect.
- Certification aggregation can accidentally duplicate domain authority.
- Partial remote publication requires forward recovery rather than destructive rollback.

### Rollback Principle

Before remote publication, rollback restores the prior adapter configuration and retains evidence. After publication, rollback means a compensating certified evolution. Published history is never silently rewritten.

## State and Transaction Diagrams

```text
Mission: QUEUED -> ADMITTED -> EXECUTING -> CANDIDATE_READY
Trust:   VALIDATING -> VALIDATED -> CERTIFICATION_PENDING -> CERTIFIED
History: EVOLUTION_PENDING -> EVOLVING -> EVOLVED
```

```text
Prepare -> Validate -> Freeze -> Commit -> Verify -> Tag
        -> Push -> Verify Remote -> Baseline -> Finalize
```

## Architectural Decision Record

The required revisions from Assessment 001 are incorporated. No stronger alternative was found for candidate isolation, certification coordination, storage-class governance, or journaled repository evolution. The Version 2 architecture is intentionally technology-neutral and preserves existing constitutional owners.

## Related Documents

- [Version 2 Specification](./PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md)
- [Implementation Assessment](../REVIEWS/PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md)
- [Specification Certification](../REVIEWS/PBOS_ENGINE_LIFECYCLE_V2_SPECIFICATION_CERTIFICATION.md)
