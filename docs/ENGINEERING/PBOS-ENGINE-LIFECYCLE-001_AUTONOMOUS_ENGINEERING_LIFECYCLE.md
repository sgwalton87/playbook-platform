---
id: PBOS-ENGINE-LIFECYCLE-001
title: Autonomous Engineering Lifecycle
version: 2.0.0
status: Canonical
classification: Constitutional Engineering Specification
owners:
  - PBOS Engineering Governance
layer: Engineering
parent: PBOS Engineering
depends_on:
  - ARCHITECTURE.md
  - PPS-000
  - PPS-004
  - PPS-005
  - PPS-006
  - PPS-012
  - PPS-014
related:
  - PBOS Runtime
  - PBOS Kernel
  - PBOS Compiler
  - Mission Control
  - Repository Context Authority
  - PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md
supersedes:
  - PBOS-ENGINE-LIFECYCLE-001@1.0.0
last_updated: 2026-08-01
---

# Executive Architecture Decision

PBOS shall separate autonomous engineering execution from certified repository evolution through an isolated Candidate Workspace and an immutable Candidate Change Set.

Runtime executes missions in Candidate Workspaces. Validation establishes engineering confidence in Candidate Change Sets. Existing domain certifiers establish domain trust. The Engineering Certification Coordinator aggregates, but never replaces, those trust decisions. Repository Evolution alone converts a certified Candidate Change Set into durable repository history through a recoverable constitutional transaction.

The certified repository checkout is read-only to Runtime, Validation, and Mission Control. Candidate Workspaces may contain governed engineering mutations. This distinction resolves the Version 1 contradiction between building software and requiring the certified checkout to remain clean.

This Version 2 specification is the sole constitutional implementation authority for the PBOS Autonomous Engineering Lifecycle. Version 1 is superseded.

# 1. Purpose and Scope

This specification governs how PBOS queues, executes, validates, certifies, records, recovers, and evolves software engineering work. It applies to all PBOS engineering missions, providers, repositories, organizations, and future implementation technologies.

It governs architectural ownership and contracts. It does not transfer authority held by the Kernel, Constitutional Planner, Repository Context Authority, domain certifiers, Execution Fabric, or existing authorization systems.

# 2. Constitutional Principles

1. **Certified history is immutable.** Runtime cannot rewrite accepted repository history or certified evidence.
2. **Candidate mutation is explicit.** Engineering changes occur only inside an admitted Candidate Workspace.
3. **Validation creates confidence, not trust.** Validation cannot certify or evolve a repository.
4. **Certification is federated.** Domain certifiers retain authority; engineering certification aggregates their decisions.
5. **Repository Evolution is singular.** Only Repository Evolution may commit, tag, push, or advance a baseline.
6. **Identity precedes mutation.** Every mission, workspace, change set, validation, certification, and evolution has an immutable identity.
7. **Transitions are evidence-bound.** No lifecycle state changes without authority and evidence.
8. **Retries are idempotent.** Repeated delivery cannot duplicate a transition or repository effect.
9. **Failure preserves trust.** Ambiguity, corruption, conflict, or missing evidence fails closed.
10. **Infrastructure is replaceable.** Constitutional domains depend on ports, not filesystem layouts or Git commands.
11. **Human authority is preserved.** Automation may prepare and recommend; governed approvals remain mandatory where policy requires them.
12. **History represents accepted evolution.** Transient execution and telemetry are not repository history.

# 3. Constitutional Domain Model

```text
Strategic Intent
  -> Mission Queue
  -> Engineering Lifecycle Coordinator
  -> Runtime + Candidate Workspace
  -> Candidate Change Set
  -> Validation Aggregate
  -> Domain Certifications
  -> Engineering Certification Coordinator
  -> Certified Evolution Bundle
  -> Repository Evolution Transaction
  -> Repository Commit + Baseline + Historical Record
```

## 3.1 Domain Responsibilities

| Domain | Owns | Must not own |
|---|---|---|
| Mission Queue | Admission order, leases, retry, scheduling history | Mission execution or approval |
| Engineering Lifecycle Coordinator | Engineering state transitions and transition history | Work execution, validation, certification, Git |
| Runtime | Mission execution sessions | Certified history, certification, repository evolution |
| Candidate Workspace Authority | Isolated mutable workspace lifecycle | Planning, validation decisions, certification |
| Validation | Deterministic correctness findings and confidence | Trust issuance or repository mutation |
| Domain Certifiers | Trust within their constitutional domains | Global engineering certification |
| Engineering Certification Coordinator | Aggregate engineering trust decision | Replacing domain certifiers or executing work |
| Repository Evolution | Certified history mutation transaction | Runtime execution or validation |
| Baseline Authority | Certified checkpoint identity and succession | Git side effects or candidate mutation |
| Repository Context Authority | Repository reality identity and trust | Engineering certification decision |
| History Authority | Append-only lifecycle and audit records | Operational decision making |
| Observability | Telemetry projections and alerts | Lifecycle authority |

## 3.2 Permitted Dependency Direction

```text
CLI / Mission Control
  -> Lifecycle and Queue Ports
  -> Domain Contracts
  -> Infrastructure Ports
  -> Filesystem / Git / Remote / Metrics Adapters
```

Infrastructure adapters may return results but may not initiate constitutional transitions. Reverse mutation, skipped domains, and direct Runtime-to-Git access are prohibited.

# 4. Engineering Lifecycle Authority

The Engineering Lifecycle Coordinator is the singular authority for engineering lifecycle transitions. It is distinct from gate lifecycle, execution lifecycle, provider lifecycle, certification state, and release lifecycle.

## 4.1 State Machine

```text
QUEUED
  -> ADMITTED
  -> EXECUTING
  -> CANDIDATE_READY
  -> VALIDATING
  -> VALIDATED
  -> CERTIFICATION_PENDING
  -> CERTIFIED
  -> EVOLUTION_PENDING
  -> EVOLVING
  -> EVOLVED
```

Exceptional states:

```text
BLOCKED | FAILED | CANCELLED | REJECTED | SUPERSEDED | RECOVERY_REQUIRED
```

## 4.2 Transition Contract

Every transition requires:

- transition identity and idempotency key;
- mission, organization, repository, and subject identities;
- expected prior state and prior-state digest;
- requested next state;
- actor and authority identities;
- evidence references and evidence digests;
- policy and schema versions;
- timestamp from an injected trusted clock;
- transition result and transition digest.

The store shall use optimistic concurrency. A transition whose expected state or digest no longer matches fails with `CONCURRENT_TRANSITION`. No implicit retry may change the requested outcome.

## 4.3 State Entry Requirements

| State | Entry requirement |
|---|---|
| QUEUED | Valid mission identity, objective, dependencies, authority scope |
| ADMITTED | Dependencies satisfied, lease acquired, workspace capacity available |
| EXECUTING | Candidate Workspace admitted and provider authorized |
| CANDIDATE_READY | Execution ended and immutable Candidate Change Set sealed |
| VALIDATING | Validation plan bound to change-set identity |
| VALIDATED | Required validations complete and confidence policy satisfied |
| CERTIFICATION_PENDING | Required domain certification set resolved |
| CERTIFIED | Engineering certification issued for exact candidate digest |
| EVOLUTION_PENDING | Repository Evolution approval and target resolved |
| EVOLVING | Exclusive repository evolution lease acquired |
| EVOLVED | Commit, verification, required publication, baseline, and audit finalized |

# 5. Candidate Workspace Architecture

## 5.1 Purpose

A Candidate Workspace is an isolated mutable engineering environment derived from one certified repository baseline. It exists because Runtime must create real software changes while the certified checkout and accepted history remain immutable.

Candidate Workspace cannot be replaced by Runtime. Runtime owns execution sessions; Workspace Authority owns filesystem isolation, base ancestry, mutation boundaries, sealing, retention, and cleanup. Combining them would let an executor redefine its own trust boundary.

## 5.2 Ownership and Authority

Candidate Workspace Authority is the sole owner of workspace creation, admission, sealing, quarantine, cleanup, and recovery. Runtime receives a capability-scoped workspace handle. It never receives Repository Evolution credentials or unrestricted access to the certified checkout.

## 5.3 Workspace Identity

Every workspace declares:

- workspace identity and version;
- mission and organization identities;
- repository and certified baseline identities;
- parent commit and context identities;
- provider and execution authority identities;
- allowed and prohibited paths;
- creation, lease, expiration, and retention timestamps;
- isolation policy and adapter identity;
- status and digest.

## 5.4 Workspace Lifecycle

```text
REQUESTED -> PROVISIONED -> ADMITTED -> ACTIVE -> SEALED
          -> VALIDATING -> RETAINED -> DISPOSED
```

Exceptional states are `BLOCKED`, `QUARANTINED`, `EXPIRED`, `ORPHANED`, and `RECOVERY_REQUIRED`.

## 5.5 Isolation and Mutation

- The certified base is mounted or represented read-only.
- Candidate mutations are permitted only within declared paths.
- Symlink, path traversal, submodule, generated-file, credential, and network boundaries are validated.
- Runtime state, telemetry, caches, and secrets are stored outside candidate source paths.
- One workspace cannot read or mutate another organization or mission workspace unless an explicit read-only dependency contract permits it.
- Workspace sealing prevents further mutation and produces a Candidate Change Set.

## 5.6 Repository and Git Relationship

A Git worktree may implement a Candidate Workspace, but Git is not its constitutional identity. Implementations may use copy-on-write snapshots, containers, virtual filesystems, or future technologies if they satisfy the port contract.

Runtime may use read-only Git inspection through a repository port. Runtime may not commit, tag, push, alter remotes, or update the certified branch. Repository Evolution alone performs those actions.

## 5.7 Cleanup, Retention, and Recovery

- Failed and rejected workspaces are quarantined until evidence retention requirements are met.
- Validated candidates are retained until certification disposition.
- Certified candidates are retained until evolution finalization and audit verification.
- Cleanup requires a terminal lifecycle state, retention eligibility, no active lease, and a recorded cleanup decision.
- Orphan detection uses lease expiry plus owner liveness; expiry alone never deletes evidence.
- Recovery reconstructs workspace state from the certified base, immutable change set, and history rather than trusting mutable workspace contents.

## 5.8 Interactions

| System | Interaction |
|---|---|
| Runtime | Receives scoped handle and writes candidate content |
| Validation | Reads sealed workspace or reconstructed change set |
| Certification | Consumes immutable candidate and validation identities |
| Repository Evolution | Applies certified change set to target repository transaction |
| Repository Context | Certifies base context and later observes evolved repository |
| Mission Control | Displays workspace state but cannot mutate it |
| Git | Optional adapter beneath workspace and repository ports |

# 6. Candidate Change Set

The Candidate Change Set is the immutable output of a sealed workspace. It is the unit of validation, certification, supersession, and repository evolution.

## 6.1 Required Identity

- change-set identity and schema version;
- mission, workspace, repository, organization, and parent baseline identities;
- parent commit and ancestry proof;
- canonical file inventory with modes and content digests;
- deterministic patch identity and full resulting-tree hash;
- execution evidence identity;
- validation aggregate identity, when available;
- domain and engineering certification identities, when available;
- creation authority, timestamp, and digest.

Identity is computed from canonical content and parent identity, excluding mutable projections and display timestamps. Two logically identical candidates against the same parent have the same content identity.

## 6.2 Rules

- A sealed change set is immutable.
- Validation results bind to the exact change-set digest.
- Certification cannot be transferred to a rebased or amended change set.
- Promotion requires valid ancestry, complete evidence, passing validation, required domain certifications, and engineering certification.
- Rejection records reasons and evidence; it never deletes the candidate.
- Supersession links predecessor and successor identities without rewriting either.
- Conflicting candidates require deterministic rebase or merge into a new candidate identity.
- Rollback before evolution means rejection or supersession. After published evolution, recovery uses a new compensating candidate; history is not rewritten.

# 7. Storage Class Architecture

No constitutional component shall infer governance from a pathname. Every artifact declares a storage class, owner, schema, subject identity, retention policy, and integrity metadata.

| Storage class | Purpose | Durability / retention | Owner and mutation authority | Validation / certification | Repository visibility | Backup / recovery |
|---|---|---|---|---|---|---|
| Ephemeral Runtime State | Active sessions, queues, temporary planning | Restart-recoverable or disposable by contract; bounded TTL | Runtime owner only | Schema, owner, session binding; never certified | Ignored and outside certified tree | Recreate from history or fail mission |
| Candidate Engineering State | Mutable workspaces and sealed candidates | Until terminal disposition plus retention | Workspace Authority; sealed content immutable | Scope and content validation; certification required for evolution | Outside certified checkout | Reconstruct from base plus change set |
| Validation State | Findings, logs, confidence aggregates | Through certification and audit period | Validation owner; aggregates immutable | Input, toolchain, policy, environment binding | Not repository history before certification | Content-addressed backup |
| Certified Engineering Evidence | Trust decisions and required evidence | Durable, append-only, legal-hold capable | Certifier or Certification Coordinator | Signature, authority, lineage, revocation status | Referenced by repository history; stored in governed evidence store | Replicated and periodically verified |
| Repository History | Commits, tags, releases, certified manifests | Permanent according to repository policy | Repository Evolution only | Certified bundle and post-write verification | Canonical | Remote replication and disaster recovery |
| Operational Telemetry | Events, logs, traces, heartbeats | Bounded hot retention; archived as policy requires | Observability pipeline | Schema, sequence, redaction | Never canonical source truth | Replicated telemetry store |
| Metrics | Aggregated operational measurements | Time-series retention policy | Metrics pipeline | Cardinality, provenance, clock checks | Not repository history | Provider retention and export |
| Caches | Derived acceleration data | Disposable | Cache owner | Key binds all material inputs | Hidden from repository | Recompute |
| Temporary Sessions | Credentials, leases, process handles | Short TTL; secrets destroyed on close | Session Authority | Principal, scope, expiry | Never visible | Not backed up; revoke and recreate |
| Historical Records | Lifecycle and audit event ledger | Append-only, long-term | History Authority | Sequence, digest chain, authority | Referenced by certified history | Replicated, verified, restore-tested |

Unknown storage classes, missing retention, or owner mismatch fail closed. Secrets may never enter candidate source, evidence, telemetry, or repository history.

# 8. Storage Ports

Constitutional domains depend on typed ports rather than paths or commands.

Required ports:

- `RuntimeStatePort`: session-scoped ephemeral state.
- `CandidateWorkspacePort`: provision, lease, seal, quarantine, dispose.
- `CandidateChangeSetPort`: immutable candidate storage and retrieval.
- `RepositoryPort`: read repository identity, ancestry, tree, and target policy.
- `RepositoryEvolutionPort`: authorized prepare/apply/verify/finalize operations.
- `TelemetryPort`: structured events and traces.
- `MetricsPort`: bounded measurements.
- `EvidencePort`: content-addressed immutable evidence.
- `HistoryPort`: append-only ordered lifecycle records.
- `ValidationPort`: submit and retrieve validation aggregates.
- `BaselinePort`: read and create certified successor baselines.
- `RepositoryContextPort`: request and retrieve context authority decisions.
- `ClockPort`: trusted time for expiry and audit.
- `LeasePort`: atomic acquire, renew, release, and fence tokens.

Each port defines typed failures, idempotency, concurrency semantics, atomicity boundary, consistency guarantee, timeout, and observability contract. Filesystem, Git, database, object store, remote API, and in-memory implementations are adapters only.

# 9. Validation Architecture

Validation remains federated by concern. A Validation Aggregate references required lint, type, test, security, dependency, governance, authorization, artifact, performance, accessibility, and repository-health results.

Every result binds to:

- Candidate Change Set identity;
- validator identity and version;
- toolchain and environment identity;
- policy version;
- input and output digests;
- start and completion timestamps;
- status, findings, and evidence.

Parallel validation is permitted for independent checks. Aggregate completion waits for every required result. Missing, stale, cancelled, unknown, or mismatched results fail closed. Cached results are reusable only when all material identities match.

# 10. Engineering Certification Coordinator

## 10.1 Decision

PBOS shall implement an Engineering Certification Coordinator, not a universal Certification Engine.

## 10.2 Authority and Limits

The coordinator owns the aggregate engineering certification decision for one Candidate Change Set. It may request, verify, and correlate domain certifications. It may not issue domain certification, execute validations, modify candidates, generate repository context independently, or evolve a repository.

## 10.3 Inputs

- Candidate Change Set and parent baseline identities;
- immutable Validation Aggregate;
- required domain certifications and revocation state;
- Repository Context Authority decision;
- repository health and target policy;
- requester, reviewer, and approval evidence;
- certification policy version.

## 10.4 Outputs

```text
CERTIFIED | REJECTED | BLOCKED | EXPIRED | REVOKED | SUPERSEDED
```

The output includes certification identity, exact subject digest, participating domain decisions, policy, authority, conditions, expiration, revocation propagation rules, evidence, and digest.

## 10.5 Relationships

- Runtime cannot call certification until lifecycle state permits it.
- Validation supplies confidence evidence but cannot approve trust.
- Domain certifiers retain final authority in their scopes.
- Repository Context Authority supplies context trust; the coordinator cannot replace it.
- Repository Evolution admits only current, unrevoked engineering certification.
- Baseline Authority consumes finalized evolution evidence, not certification alone.

Conflicting domain decisions block certification. Revocation or expiration before finalization blocks evolution. Revocation after evolution creates an incident and remediation candidate; it never silently rewrites history.

# 11. Mission Queue and Scheduler

## 11.1 Mission Contract

Every mission declares identity, objective, organization, repository, requester, authority, dependencies, priority, risk, required capabilities, input contracts, expected outputs, evidence requirements, retry policy, timeout, cancellation policy, and idempotency key.

## 11.2 Queue Ownership

Mission Queue owns persistence, ordering, dependency readiness, leases, retries, cancellation requests, and history. Scheduler selects admitted work subject to policy and capacity. Neither may approve, execute, validate, or certify missions.

## 11.3 Scheduling Rules

- Dependency satisfaction precedes admission.
- Priority is deterministic within a policy version.
- Fairness prevents one organization or class from starvation.
- Capacity and rate limits provide backpressure.
- A mission has at most one active fenced lease.
- Lease renewal requires the current fence token.
- Duplicate delivery reuses the mission idempotency key.
- Retry creates an attempt identity under the same mission identity.
- Cancellation is cooperative until policy authorizes forced termination.
- Timeouts move work to `RECOVERY_REQUIRED`; they do not imply failure or completion.
- Restart reconstructs queue projections from durable mission history.

## 11.4 Mission History

Admission, lease, attempt, dependency, cancellation, timeout, retry, completion, and recovery events are append-only. Mutable queue projections are disposable and reconstructable.

# 12. Concurrency and Consistency Model

## 12.1 Execution and Workspace Concurrency

Multiple missions may execute concurrently only in isolated workspaces. Shared writable workspaces are prohibited. Read-only dependencies are content-addressed and version-bound.

## 12.2 Validation Concurrency

Independent validators may run concurrently. Validators may not mutate the sealed candidate. Result aggregation is deterministic by rule identity, not completion time.

## 12.3 Certification Ordering

Certification decisions for the same Candidate Change Set are serialized by subject revision. Domain certifications may complete in parallel. A newer candidate supersedes, but does not mutate, an older certification request.

## 12.4 Repository Evolution Ordering

One fenced evolution lease exists per repository target. Evolution is serialized at the target branch. Before commit, ancestry and target head are revalidated. Head drift creates `CONFLICT`; it never triggers an implicit merge.

## 12.5 Conflict Resolution

Conflicting candidates are resolved by producing a new change set through an authorized rebase, merge, or regeneration mission. PBOS records both predecessors. It never transfers validation or certification to the new digest.

## 12.6 Locking

- Optimistic concurrency governs lifecycle state and immutable artifact creation.
- Pessimistic fenced leases govern workspace mutation and repository evolution.
- Locks have bounded leases and monotonic fence tokens.
- Lock acquisition order is repository -> target -> candidate to prevent deadlock.
- A process losing its lease must stop mutation immediately.

## 12.7 ACID Interpretation

- **Atomicity:** Each lifecycle transition and artifact seal is all-or-nothing. Repository Evolution uses a journaled multi-step transaction.
- **Consistency:** Invariants are validated before and after every transition.
- **Isolation:** Workspaces isolate candidate writes; evolution serializes target writes.
- **Durability:** Certified evidence, history, and finalized evolution survive acknowledged completion.

# 13. Repository Evolution Transaction

Repository Evolution is the only authority permitted to modify certified repository history.

```text
PREPARE -> VALIDATE -> FREEZE -> COMMIT -> VERIFY_COMMIT
        -> TAG -> PUSH -> VERIFY_REMOTE -> BASELINE
        -> FINALIZE
```

## 13.1 Transaction Steps

| Step | Required behavior | Failure response |
|---|---|---|
| Prepare | Load certified bundle, target, authority, policy, idempotency key | Block without mutation |
| Validate | Revalidate certification, ancestry, head, signatures, repository health | Block without mutation |
| Freeze | Acquire fenced evolution lease and freeze target expectation | Release lease; record rejection |
| Commit | Apply exact change set and create deterministic signed commit metadata | Restore pre-commit local target if unpublished |
| Verify Commit | Compare resulting tree and commit to certified identities | Quarantine and compensate before publication |
| Tag | Create required signed tag bound to transaction | Remove unpublished tag or retry idempotently |
| Push | Publish exact commit/tag using evolution credentials | Enter recovery; never assume publication state |
| Verify Remote | Read remote identity and ancestry independently | Retry verification or suspend evolution |
| Baseline | Create successor baseline from verified remote and certification evidence | Forward recovery; published commit remains historical truth |
| Finalize | Append audit record, release lease, update projections | Retry idempotently from journal |

## 13.2 Recovery and Compensation

Every step writes an append-only transaction journal before and after side effects. On restart, Repository Evolution inspects local and remote reality and resumes idempotently.

- Before publication, rollback may restore the prior local target and remove unpublished transaction artifacts.
- After publication, history is never rewritten automatically. Recovery completes missing tag, baseline, and audit steps or creates an authorized compensating evolution.
- Force push, destructive reset, and deletion of published evidence are constitutionally prohibited.
- Partial remote ambiguity suspends all evolution for the target until independently reconciled.

# 14. Baseline Architecture

A baseline is a certified checkpoint, not a runtime snapshot. It contains baseline identity, predecessor, repository and commit identities, tree digest, lifecycle and component versions, mission set, candidate identities, validation aggregate, engineering and domain certifications, evolution transaction, context identity, provenance, timestamp, and digest.

Baseline Authority creates exactly one successor for a finalized evolution transaction. Forks require explicit branch lineage. Baseline advancement cannot occur directly from Runtime, Validation, Certification, or Git adapters.

# 15. Recovery Architecture

Recovery is a governed lifecycle, not exception handling.

| Stage | Recovery authority | Recovery source | Required behavior |
|---|---|---|---|
| Mission Queue | Queue Authority | Mission event history and lease state | Requeue only retry-eligible attempts; fence stale workers |
| Runtime | Runtime Recovery | Session checkpoint and execution evidence | Resume or fail attempt without inventing output |
| Workspace | Workspace Authority | Base baseline, change set, lease journal | Reconstruct, quarantine, or dispose according to evidence |
| Validation | Validation Authority | Immutable inputs and result ledger | Rerun missing checks; never infer PASS |
| Certification | Certification Coordinator | Candidate, validations, domain decisions | Re-evaluate current trust and revocations |
| Repository Evolution | Evolution Authority | Transaction journal plus local/remote reality | Roll back unpublished work or forward-recover published work |
| Repository Context | Repository Context Authority | Current repository reality and prior context history | Reconcile through existing approval lifecycle |
| Baseline | Baseline Authority | Verified evolution and predecessor chain | Complete missing successor or suspend lineage |

Recovery requires incident identity, affected subjects, authority, plan, evidence, validation, outcome, and audit record. A recovery action cannot grant broader authority than the failed action. Unknown or contradictory reality suspends mutation.

# 16. Security Architecture

- Runtime and providers receive least-privilege candidate capabilities.
- Repository Evolution credentials are isolated from Runtime, Validation, and candidate processes.
- Human and service identities are verified principals with organization and delegation scope.
- Secrets are injected through session ports and excluded from artifacts, patches, telemetry, and history.
- Candidate inputs and outputs undergo path, dependency, malware, secret, license, and policy scanning.
- Evidence and certification use integrity protection and support signing and key rotation.
- Tenant isolation applies to workspaces, queues, evidence, metrics, history, and recovery.
- Compromised credentials, revoked authority, policy changes, or certifier revocation block new transitions and trigger impact assessment.

# 17. Observability and Metrics

One correlation chain connects mission, attempt, workspace, execution, change set, validation, domain certification, engineering certification, evolution, commit, baseline, and release.

Every transition emits a structured event containing trace identity, monotonic sequence, subject, prior and next state, authority, evidence, policy, outcome, and duration. Telemetry is not lifecycle truth.

Required operational measurements include queue lag, lease loss, workspace age, validation latency, certification backlog, evolution duration and failure, recovery time, provider saturation, candidate conflict rate, storage growth, and stale evidence. Cardinality and retention are governed.

# 18. Determinism and Reproducibility

- Canonical serialization defines every digest.
- Set-like collections are sorted before identity calculation.
- Clocks, random identities, environment, toolchains, models, and policies are explicit inputs.
- Scheduling order uses declared deterministic tie-breakers.
- Provider nondeterminism is captured in evidence and cannot alter constitutional selection rules.
- Replay validates prior decisions against recorded inputs; it does not silently substitute current policy.

# 19. Failure Rules

PBOS fails closed when:

- an owner or storage class is unknown;
- a candidate base or ancestry is invalid;
- a workspace escapes its scope;
- a lease or fence token is stale;
- lifecycle state or digest conflicts;
- validation is missing, stale, or mismatched;
- a required domain certification is absent, expired, revoked, or conflicting;
- engineering certification does not bind the exact candidate;
- repository target reality changes after freeze;
- remote publication cannot be proven;
- baseline lineage is ambiguous;
- recovery cannot establish authoritative reality.

Failure records evidence and a deterministic recovery state. It never fabricates completion, deletes history, or broadens authority.

# 20. Implementation Architecture and Migration

Implementation shall adapt existing PBOS owners rather than create parallel systems.

## Phase 0: Contract and Inventory

Classify every artifact and mutation point. Implement no behavioral change. Acceptance requires complete ownership, storage, and compatibility mapping.

## Phase 1: Lifecycle Coordination

Introduce the engineering state reducer, transition validator, and history port in shadow mode. Existing commands remain authoritative until evidence supports cutover.

## Phase 2: Candidate Workspace

Introduce opt-in isolated workspaces and immutable change sets. Execution Fabric integrates through a scoped handle. Existing direct execution remains compatibility-only and cannot claim Version 2 certification.

## Phase 3: Storage Separation

Introduce typed ports and atomic adapters. Use dual-read/single-write migration. Move ephemeral state outside tracked repository paths without rewriting history.

## Phase 4: Validation Aggregate

Compose existing validators into candidate-bound immutable aggregates. Do not replace domain validators.

## Phase 5: Engineering Certification

Introduce coordinator in advisory mode, then make certified decisions mandatory for evolution admission.

## Phase 6: Repository Evolution and Baselines

Implement dry-run, local-only, and finally governed remote adapters. Activate each level only after recovery tests pass.

## Phase 7: Mission Queue and Concurrency

Begin with one worker and durable leases. Increase concurrency only after isolation, conflict, fairness, and recovery evidence exists.

## Phase 8: Legacy Retirement

Stop legacy writers, verify all consumers, preserve historical artifacts, and remove compatibility projections through governed deprecation.

## Phase 9: Enterprise Certification

Demonstrate multiple missions, repository cleanliness, restart recovery, certification aggregation, one verified evolution, successor baseline, security boundaries, scale, and audit reconstruction.

Every phase requires unit, contract, integration, lifecycle, migration, recovery, concurrency, security, and regression tests appropriate to its risk. Each phase has a documented rollback to the prior adapter configuration. No phase may introduce two authoritative writers.

# 21. Acceptance Criteria

Version 2 is implemented only when objective evidence proves:

1. The certified checkout remains unchanged during multiple engineering missions.
2. All engineering mutations occur in isolated Candidate Workspaces.
3. Every sealed candidate has immutable content and ancestry identity.
4. Runtime and Validation cannot access Repository Evolution credentials.
5. Validation produces candidate-bound aggregates without issuing trust.
6. Domain certifiers retain authority.
7. Engineering Certification aggregates current, unrevoked trust.
8. Repository Evolution is the only Git mutation path.
9. Evolution recovers deterministically from every injected failure boundary.
10. Baselines advance only after verified evolution.
11. Mission delivery is durable, leased, idempotent, fair, and restart-safe.
12. Concurrent candidates remain isolated and conflicts create new identities.
13. Storage classes, retention, backup, and recovery are enforced.
14. Complete lineage can be reconstructed from intent through baseline.
15. Existing PBOS fail-closed guarantees and authorized commands remain compatible or are governably deprecated.

# 22. Architectural Glossary

**Baseline:** Certified repository checkpoint created after finalized evolution.

**Candidate Change Set:** Immutable, content-addressed engineering result sealed from a Candidate Workspace.

**Candidate Workspace:** Isolated mutable environment derived from one certified baseline.

**Certified Checkout:** Read-only repository projection representing accepted history.

**Domain Certification:** Trust decision owned by a specialized constitutional authority.

**Engineering Certification:** Aggregate trust decision for one candidate; it does not replace domain certification.

**Engineering Confidence:** Validation-based assessment of correctness, not authorization or trust.

**Engineering Lifecycle:** State progression from queued mission through evolved repository history.

**Evolution Bundle:** Candidate, validation, certification, authority, and target evidence admitted to Repository Evolution.

**Fence Token:** Monotonic lease value preventing stale workers from mutating state.

**History Record:** Append-only constitutional event used to reconstruct decisions.

**Idempotency Key:** Stable identity ensuring repeated delivery produces one logical effect.

**Mission Attempt:** One execution attempt under an immutable mission identity.

**Mission Queue:** Durable owner of admitted mission ordering, leases, and retry history.

**Operational Telemetry:** Observable events and metrics that describe operation but do not define lifecycle truth.

**Repository Evolution:** Singular authority and transaction that records certified engineering history.

**Repository Context:** Repository reality and trust decision owned by Repository Context Authority.

**Runtime State:** Ephemeral execution information with no authority to establish durable trust.

**Storage Class:** Constitutional durability, ownership, retention, visibility, backup, and recovery category.

**Validation Aggregate:** Immutable set of candidate-bound validation results and confidence decision.

# 23. Final Constitutional Directive

PBOS shall execute continuously in governed Candidate Workspaces, validate immutable Candidate Change Sets, aggregate trust through existing certification authorities, and evolve repository history only through a verified Repository Evolution transaction.

The clean certified checkout is a consequence of isolation, not the absence of engineering mutation. Git is an adapter, not an authority. Mission Control is an operator surface, not a lifecycle owner. Runtime performs work, Validation establishes confidence, domain certifiers establish scoped trust, Engineering Certification coordinates trust, Repository Evolution records accepted history, and Baseline Authority records certified succession.

Any implementation that bypasses these boundaries, writes directly to certified history, creates competing owners, transfers certification across changed content, or cannot recover authoritative reality is non-conforming and must fail closed.
