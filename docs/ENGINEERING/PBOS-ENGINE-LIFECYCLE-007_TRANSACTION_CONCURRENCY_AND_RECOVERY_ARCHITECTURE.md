# PBOS Transaction, Concurrency, and Recovery Architecture

**Mission ID:** PBOS-ENGINE-LIFECYCLE-007  
**Classification:** Constitutional Engineering / Enterprise Architecture / Mission Critical / Foundational Infrastructure  
**Status:** Canonical Architecture Specification  
**Owner:** Playbook OS Engineering  
**Last Updated:** August 1, 2026

## Purpose

This specification establishes the constitutional guarantees by which PBOS preserves engineering correctness during concurrency, interruption, partial failure, recovery, and implementation change.

It defines one common transaction protocol without creating a universal transaction engine. Every constitutional subsystem retains ownership of its local atomic state. The Engineering Lifecycle Coordinator owns cross-domain progression and recovery orchestration through an immutable Engineering Transaction Envelope, but it cannot perform another subsystem's mutation, validation, certification, or repository recovery.

The architecture distinguishes three guarantees:

1. **Local atomicity:** one authority commits one state transition or artifact seal completely or not at all.
2. **Constitutional atomicity:** PBOS recognizes an engineering outcome only when every required domain decision is durably complete and bound to one transaction.
3. **Distributed continuity:** after an externally visible effect, PBOS preserves history and moves forward through governed recovery rather than claiming impossible global rollback.

This is the simplest architecture that preserves correctness across filesystems, databases, object stores, Git, remote repositories, cloud services, future storage systems, and distributed agents.

## Authority

This specification derives authority from and preserves the ownership established by:

- `PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md`
- `PBOS-ENGINE-LIFECYCLE-002_CANDIDATE_WORKSPACE_ARCHITECTURE.md`
- `PBOS-ENGINE-LIFECYCLE-003_ENGINEERING_CERTIFICATION_COORDINATION_ARCHITECTURE.md`
- `PBOS-ENGINE-LIFECYCLE-004_CANDIDATE_CHANGE_SET_ARCHITECTURE.md`
- `PBOS-ENGINE-LIFECYCLE-005_REPOSITORY_EVOLUTION_ARCHITECTURE.md`
- `PBOS-ENGINE-LIFECYCLE-006_MISSION_QUEUE_AND_SCHEDULING_ARCHITECTURE.md`
- `PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md`
- `PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md`

This document is the sole constitutional authority for cross-domain engineering transaction semantics, concurrency guarantees, and recovery coordination. Domain authorities remain the sole owners of their state and recovery actions.

## Scope

This specification governs:

- engineering transaction identity, envelope, journal, lifecycle, and registry projection;
- local and cross-domain transaction boundaries;
- atomicity, consistency, isolation, and durability guarantees;
- concurrency domains, ordering, leases, locks, and fencing;
- deterministic replay and idempotency;
- conflict detection, classification, and resolution;
- rollback, compensation, forward recovery, and restart semantics;
- recovery orchestration across Queue, Runtime, Workspace, Change Set, Validation, Certification, Context, Baseline, and Repository Evolution;
- failure classification, escalation, continuity, disaster recovery, evidence, security, observability, and audit.

It does not transfer authority to mutate:

- Mission Queue state;
- Runtime execution state;
- Candidate Workspace state;
- Candidate Change Sets;
- validation findings;
- certification decisions;
- trusted repository context;
- baselines;
- repository history.

## Executive Architecture Decision

PBOS SHALL NOT implement a global distributed transaction spanning independent constitutional authorities. Such a coordinator would either duplicate ownership or falsely imply atomic control over external systems that cannot participate in one transaction.

PBOS SHALL use an **Engineering Transaction Envelope** as the immutable correlation and progression contract. Each participating authority performs its own local atomic transaction and appends a signed outcome reference. Cross-domain progression is a deterministic saga governed by the Engineering Lifecycle Coordinator. The Coordinator may authorize the next step, stop progression, or request recovery; it may not execute another authority's action.

The transaction envelope is not a mutable workflow document. Its identity and intent are immutable. Progress is an append-only journal. The Transaction Registry is a rebuildable projection, not a second source of truth.

## Phase-Zero Architectural Reconstruction

### Existing Transaction Boundaries

The lifecycle authorities already define legitimate local boundaries:

- lifecycle transition compare-and-append;
- Mission Queue registration, attempt, lease, and dispatch transitions;
- Candidate Workspace provisioning, mutation lease, snapshot, seal, quarantine, and cleanup;
- Candidate Change Set immutable sealing;
- validation result issuance;
- aggregate engineering certification issuance;
- Repository Evolution prepare, apply, verify, publish, context synchronization, baseline advancement, and finalization;
- trusted context and baseline issuance by their existing owners.

### Existing Ownership Boundaries

The architecture already separates execution, workspace mutation, immutable candidate creation, validation confidence, certification trust, and repository history. This separation is constitutionally sound and SHALL remain intact.

### Existing Persistence Boundaries

PBOS uses repository history, runtime artifacts, evidence, workspace storage, candidate storage, certification records, context artifacts, and baseline records. These stores do not share one atomic commit mechanism. Filesystem and Git implementations are adapters, not constitutional transaction owners.

### Existing Recovery Behavior

Existing specifications correctly require:

- immutable evidence preservation;
- optimistic concurrency for lifecycle transitions;
- fenced leases for workspace and repository mutation;
- deterministic validation and certification aggregation;
- forward recovery after externally visible Repository Evolution;
- projection reconstruction from durable history;
- fail-closed handling of ambiguous state.

### Architectural Gaps Resolved Here

The lifecycle previously lacked one explicit definition of:

- the cross-domain transaction identity and envelope;
- local atomicity versus constitutional atomicity;
- linearization and point-of-no-return semantics;
- cross-owner recovery coordination;
- conflict classes and resolution authority;
- replay boundaries and nondeterministic input capture;
- durability tiers and recovery-point expectations;
- evidence recovery without evidence fabrication;
- transaction completion under partial external visibility.

### Rejected Architectures

PBOS rejects:

- a universal transaction service with credentials to every domain;
- two-phase commit across Git, external providers, object stores, and independent authorities;
- a mutable transaction registry as the authoritative history;
- rollback that rewrites published repository history;
- retries that reuse transaction or attempt identity ambiguously;
- lease expiration treated as proof that an actor stopped;
- wall-clock arrival order treated as constitutional ordering;
- recovery code that silently reconstructs missing successful outcomes.

## Engineering Philosophy

### Correctness Is Recognition, Not Illusion

PBOS cannot make every external side effect physically atomic. It can control what becomes constitutional engineering truth. Partial external effects SHALL remain unrecognized and recovery-bound until all required evidence is verified and the owning authority finalizes its transaction.

### Every Mutation Has One Owner

Coordination never implies shared mutation. Each state transition has exactly one authority, one transaction boundary, and one recovery owner.

### History Is Repaired Forward

Before an effect is externally visible, rollback may remove uncommitted local state. After an effect is externally visible, recovery SHALL preserve it in history and complete, compensate, revoke, supersede, or remediate it through a new governed transaction.

### Ambiguity Is State

Unknown outcome is neither success nor failure. PBOS SHALL record `RECOVERY_REQUIRED`, fence new conflicting work, and reconcile from authoritative systems.

### Architectural Elegance

The protocol SHALL remain storage-neutral, minimize authorities, and use the same identity, journal, fencing, idempotency, and recovery concepts across domains. New coordinators, registries, locks, or lifecycle states require proof that an existing owner cannot provide the guarantee.

## Constitutional Principles

1. One subsystem owns each mutable truth.
2. Every local mutation is atomic at its declared boundary.
3. Cross-domain outcomes become constitutional truth only after all required local outcomes are durably verified.
4. The Engineering Lifecycle Coordinator coordinates progression and recovery; it does not perform domain mutations.
5. Transaction intent and identity are immutable.
6. Transaction progress is append-only and integrity-verifiable.
7. Projections and caches are reconstructable and non-authoritative.
8. Concurrency uses expected versions for ordinary state and fenced leases for exclusive mutation.
9. Exactly-once physical execution is not assumed; idempotency and fencing preserve exactly-once logical effects.
10. Unknown, stale, conflicting, corrupt, or unverifiable state fails closed.
11. Rollback is permitted only before the relevant linearization point.
12. Forward recovery is mandatory after externally visible effects.
13. Compensation never erases historical truth.
14. Evidence is immutable, content-bound, and owned by its issuing authority.
15. Trust is issued only by certification authorities and is never inferred from completion.
16. Repository Evolution alone mutates durable repository history.
17. Recovery cannot expand the authority of the original transaction.
18. Determinism is defined against frozen inputs, policy versions, and ordered events.
19. Clock time is evidence, not the sole ordering authority.
20. Implementation evolution SHALL preserve these guarantees independent of technology.

## Engineering Correctness Model

An engineering outcome is correct only when all of the following hold:

- **Identity correctness:** every subject and action resolves uniquely.
- **Authority correctness:** every action was within valid scope at action time.
- **State correctness:** every transition followed its owner's state machine.
- **Content correctness:** immutable artifacts match their declared digests.
- **Dependency correctness:** required predecessors and evidence were valid.
- **Concurrency correctness:** no stale or conflicting owner produced accepted effects.
- **Evidence correctness:** required evidence is complete, durable, and attributable.
- **Trust correctness:** certification is explicit, current, and bound to exact inputs.
- **Repository correctness:** durable history derives from one certified Candidate Change Set through one finalized evolution transaction.
- **Recovery correctness:** interruptions and compensations preserve lineage and never fabricate success.

Failure of any condition prevents constitutional completion.

## Transaction Model

### Transaction Layers

PBOS defines three nested layers:

| Layer | Owner | Guarantee |
|---|---|---|
| Domain transaction | The authority mutating its own state | Local atomic transition or artifact operation |
| Engineering transaction | Engineering Lifecycle Coordinator | Ordered, evidence-bound progression across domain outcomes |
| Repository evolution transaction | Repository Evolution | Certified candidate becomes durable repository history |

These are not competing transactions. The Engineering Transaction references domain transactions and culminates, when required, in Repository Evolution.

### Engineering Transaction

An Engineering Transaction is the complete constitutional correlation of one admitted engineering intent through terminal recognition. It is not a database session and does not hold global locks for its lifetime.

It binds:

- canonical objective and mission;
- mission attempt;
- repository context and baseline;
- Candidate Workspace;
- Candidate Change Set;
- validation outcomes;
- domain certifications and aggregate certification;
- Repository Evolution transaction;
- successor context and baseline;
- terminal outcome and recovery history.

### Transaction Identity

`EngineeringTransactionIdentity` SHALL be globally unique, immutable, opaque, never reused, and bound to:

- schema version;
- mission and attempt identities;
- organization and repository scope;
- initial baseline and context identities;
- transaction class;
- initiating authority;
- immutable intent digest;
- idempotency identity.

Retries of a local operation retain the Engineering Transaction identity but receive new operation-attempt identities. A replacement engineering effort receives a new Engineering Transaction identity linked by `supersedes`.

### Engineering Transaction Envelope

The immutable envelope SHALL declare:

- transaction identity and class;
- mission, attempt, organization, repositories, and baseline scope;
- required domain stages and their order constraints;
- required authorities and policy versions;
- evidence and durability requirements;
- permitted compensation and recovery strategies;
- linearization points and external visibility boundaries;
- timeout, retention, and disaster-recovery class;
- creation authority and digest.

Mutable progress SHALL NOT be stored by editing the envelope.

### Transaction Journal

Progress SHALL be an append-only sequence of events containing:

- transaction and operation identities;
- expected prior sequence and state digest;
- owner and actor identities;
- authority and fencing references;
- input and output digests;
- local transaction receipt;
- timestamp and logical sequence;
- outcome and reason code;
- evidence references;
- recovery or compensation relationship.

Appending SHALL use compare-and-append semantics. Conflicting expected sequence or digest fails with a concurrency finding.

### Transaction Registry

The Transaction Registry SHALL be a rebuildable projection over envelopes and journals. It provides lookup, active transaction discovery, conflict indexes, recovery queues, audit queries, and operational metrics. It SHALL reject direct mutation.

## Transaction Lifecycle

### States

- `PROPOSED`: immutable intent exists but admission is incomplete.
- `ADMITTED`: identity, scope, authority, policy, and recovery capability validate.
- `ACTIVE`: at least one domain stage is in progress.
- `WAITING`: progression awaits an authoritative dependency or approval.
- `RECOVERY_REQUIRED`: outcome or ownership is ambiguous or a post-linearization failure exists.
- `COMPENSATING`: an authorized compensating transaction is in progress.
- `COMPLETED`: every required outcome is durably verified and terminal recognition committed.
- `ABORTED`: no externally visible point of no return was crossed and local rollback completed.
- `FAILED`: terminal failure is known and no active recovery remains.
- `SUPERSEDED`: a successor transaction owns continued intent.

### State Machine

```text
PROPOSED -> ADMITTED -> ACTIVE <----> WAITING
                         |  \
                         |   +------> COMPLETED
                         |   +------> ABORTED
                         |   +------> FAILED
                         v
                 RECOVERY_REQUIRED
                    |       |
                    |       +------> ACTIVE
                    v
               COMPENSATING -------> COMPLETED / FAILED / SUPERSEDED
```

`COMPLETED` means constitutional completion, not merely that a process exited successfully.

## Transaction Boundaries

Every domain contract SHALL declare:

- mutation owner;
- atomic unit;
- consistency preconditions;
- isolation mechanism;
- durability acknowledgement;
- linearization point;
- idempotency scope;
- retry policy;
- rollback boundary;
- forward-recovery behavior;
- evidence receipt;
- recovery owner.

An implementation lacking any declaration SHALL not participate in autonomous engineering.

## Atomicity

### Local Atomicity

A domain transition SHALL either durably commit its new state and journal receipt together or expose neither as valid. Atomic rename, database transaction, compare-and-swap, content-addressed creation, or an equivalently proven mechanism may implement the guarantee.

### Constitutional Atomicity

PBOS recognizes no partial engineering truth. A Candidate Change Set is either sealed or not; aggregate certification is either issued for the complete required graph or not; Repository Evolution is either finalized with verified successor context and baseline or remains incomplete and recovery-bound.

### Distributed Atomicity Limitation

Independent external systems do not share one ACID boundary. PBOS SHALL not claim global rollback or invisible partial publication. It SHALL use staged local commits, durable receipts, explicit linearization points, fencing, and forward recovery. Constitutional consumers accept only finalized authority records.

## Consistency

Strong consistency is required for:

- lifecycle state transitions;
- identity uniqueness;
- active ownership and fencing;
- immutable artifact sealing;
- certification issuance;
- Repository Evolution target-head admission and finalization;
- context and baseline successor issuance.

Eventual consistency is permitted for read projections, search, analytics, metrics, and replicated status views. A stale projection SHALL never authorize mutation.

## Isolation

Isolation SHALL match the mutation domain:

- mission state is isolated by mission and expected sequence;
- workspace mutation is isolated by workspace and fenced lease;
- Candidate Change Sets are immutable after seal;
- validation reads immutable candidates and writes independent findings;
- certification is isolated by candidate and policy graph;
- Repository Evolution is serialized per target branch or stricter target scope;
- tenant data and authority remain organization-isolated;
- cross-repository transactions use explicit coordination scopes without claiming global locking.

## Durability

A successful domain outcome SHALL be acknowledged only after its state, receipt, and required evidence reach the declared durability tier. Each adapter SHALL publish recovery point objective, recovery time objective, replication, corruption detection, and backup verification characteristics.

Runtime memory, terminal output, unsealed workspace contents, caches, and unverified remote responses are not durable engineering truth.

## Engineering Continuity

Engineering continuity is the ability to resume governed progress without losing identity, authority, evidence, or ordering. It requires:

- durable transaction envelopes and journals;
- reconstructable projections;
- content-addressed immutable artifacts;
- fenced ownership transfer;
- checkpointed mutable workspaces;
- verified backup and restore;
- versioned contracts and policy retention;
- explicit recovery queues and ownership;
- alternative certified adapters and execution targets;
- operator-visible degraded states.

Continuity does not require unsafe availability. PBOS SHALL stop mutation when correctness cannot be proven.

## Concurrency Model

### Concurrency Domains

PBOS SHALL define the narrowest independent concurrency key:

| Domain | Concurrency Key | Control |
|---|---|---|
| Lifecycle | lifecycle subject identity | optimistic expected version |
| Mission Queue | mission or partition identity | compare-and-append plus partition fencing |
| Mission attempt | mission identity | one current fenced lease |
| Candidate Workspace | workspace identity and declared write partition | fenced mutation lease |
| Candidate Change Set | candidate identity | immutable create-if-absent |
| Validation | candidate plus rule identity | independent idempotent result |
| Certification | candidate plus policy graph digest | optimistic transaction and immutable decision |
| Repository Evolution | repository and target reference | exclusive fenced evolution lease |
| Context | repository identity and observed commit | authority compare-and-issue |
| Baseline | repository lineage | single successor compare-and-issue |

Global locks are prohibited unless no narrower correctness domain exists and the necessity is constitutionally demonstrated.

### Optimistic Concurrency

Optimistic concurrency SHALL govern immutable artifact creation and ordinary state transitions. Each command includes expected state, expected sequence, and expected digest. Mismatch returns a conflict; implicit retries may reread but SHALL not silently change requested intent.

### Pessimistic Concurrency

Fenced leases SHALL govern long-running exclusive mutation such as workspace writes and repository evolution. Locks SHALL be bounded, renewable, observable, and backed by monotonic fencing. A process losing its lease SHALL stop mutation. Downstream stores SHALL reject stale fencing tokens even if the stale process continues.

### Ownership Guarantees

- one mutable subject has one constitutional owner;
- one active exclusive operation has one valid fenced owner;
- ownership transfer increments fencing identity;
- lease expiry removes authority but does not prove process death;
- recovery reconciles effects before reassignment;
- authority cannot be delegated beyond original scope or expiration.

## Domain Concurrency

### Workspace Concurrency

Multiple workspaces may progress concurrently. One workspace has one mutation lease unless the Workspace Authority proves disjoint write partitions and atomic composition. Shared mutable working trees are prohibited.

### Mission Concurrency

Different missions may run concurrently when dependency, repository, workspace, organization, and resource policies permit. One mission attempt has at most one valid lease. Missions targeting the same repository may construct concurrently in isolated workspaces but Repository Evolution remains serialized at the conflicting target.

### Scheduler Concurrency

Schedulers may operate concurrently across fenced partitions. One partition epoch has one active decision owner. Scheduling decisions are deterministic for a frozen snapshot; arrival time is not an ordering guarantee.

### Validation Concurrency

Independent validation rules may run concurrently against an immutable Candidate Change Set. Each result is idempotent by candidate, rule, policy, and validator version. Aggregation uses stable graph order, not completion order.

### Certification Concurrency

Domain certifiers may operate concurrently where the certification graph permits. The Engineering Certification Coordinator issues one atomic aggregate decision for an exact candidate and graph digest. Competing aggregate requests use expected state and cannot both become current.

### Repository Evolution Concurrency

One current fenced evolution lease exists per target branch or stricter repository policy scope. Target head, ancestry, certification, context, and baseline are revalidated after lease acquisition and immediately before mutation. Drift yields a conflict; no implicit merge occurs.

## Ordering Guarantees

PBOS SHALL use:

- per-subject monotonic event sequence for lifecycle truth;
- dependency graph order for cross-subject prerequisites;
- fencing epochs for exclusive ownership;
- stable rule identity order for validation and certification;
- explicit evolution order for repository targets;
- transaction journal order for recovery reconstruction.

Wall clocks support expiration and audit but SHALL not establish causality alone. Clock drift beyond policy tolerance blocks time-sensitive authority. Hybrid logical clocks, sequence services, or future mechanisms may implement causal ordering without changing this guarantee.

## Conflict Detection and Classification

### Conflict Classes

- `IDENTITY_CONFLICT`: duplicate or ambiguous identity.
- `VERSION_CONFLICT`: expected state, sequence, or digest changed.
- `OWNERSHIP_CONFLICT`: competing lease, lock, or fencing claim.
- `CONTENT_CONFLICT`: immutable digest or candidate content disagreement.
- `DEPENDENCY_CONFLICT`: predecessor changed or is unsatisfied.
- `AUTHORITY_CONFLICT`: scope, approval, delegation, or expiration mismatch.
- `TARGET_CONFLICT`: repository head, baseline, branch, or remote drift.
- `EVIDENCE_CONFLICT`: missing, forged, inconsistent, or superseded evidence.
- `POLICY_CONFLICT`: applicable policies disagree or changed.
- `RECOVERY_CONFLICT`: observed external reality disagrees with journal state.

### Conflict Resolution

Conflicts SHALL be resolved by the owner of the affected truth. The Engineering Lifecycle Coordinator may route and block but cannot decide another domain's truth. Automatic resolution is allowed only when a deterministic, versioned policy names one result without discarding evidence. Semantic source conflicts require a new Candidate Change Set and revalidation; they SHALL never be silently merged during Repository Evolution.

## Deterministic Replay

Replay SHALL reproduce decisions, not uncontrolled external effects. Every replayable decision SHALL bind:

- exact input identities and digests;
- ordered prior events;
- policy and rule versions;
- authority state at decision time;
- declared environmental observations;
- tool, Runtime, validator, and model versions where material;
- random seed or nondeterministic input capture;
- decision output and evidence digest.

An AI response cannot be assumed reproducible. PBOS preserves the prompt, model identity, parameters, inputs, outputs, and evidence so the governed decision can be audited. A fresh AI run is a new attempt, not replay proof.

Replay SHALL run read-only or in an isolated simulation unless separately authorized.

## Idempotency and Retry Semantics

Every state-changing request SHALL carry an idempotency identity scoped to authority, subject, operation, and immutable input digest.

- identical redelivery returns the prior receipt;
- reuse with different content is a conflict;
- retry after known non-commit may reuse the operation identity;
- retry after unknown outcome must reconcile first;
- a new semantic attempt receives a new attempt identity;
- no retry may expand scope, authority, or evidence claims;
- non-idempotent external effects require provider-supported lookup or compensation before retry.

Retry policy SHALL distinguish transient, permanent, governance, integrity, capacity, and unknown-outcome failures. Integrity and unknown-outcome failures never retry blindly.

## Compensation, Rollback, and Forward Recovery

### Rollback

Rollback restores uncommitted local state before the applicable linearization point. It may release reservations, delete unexposed temporary files, abandon an unsealed workspace operation, or abort a prepared transaction. Rollback SHALL record evidence and SHALL not delete historical decisions.

### Compensation

Compensation is a new authorized action that counteracts an already committed effect while preserving both effects in history. Compensation requires its own identity, authority, validation, evidence, and outcome.

### Forward Recovery

Forward recovery completes or safely supersedes a transaction after an externally visible effect. It is mandatory when rollback would rewrite history, invalidate external references, or create a false account of what occurred.

### Point of No Return

Each transaction declares its linearization point. For Repository Evolution, the default point of no return is the first externally durable authorized mutation visible to external observers. After that point:

- commit or publication is never silently removed;
- verification, context, baseline, and finalization failures enter `RECOVERY_REQUIRED`;
- repair proceeds through idempotent completion or a new compensating Candidate Change Set;
- constitutional consumers continue to reject the incomplete evolution until finalized or explicitly revoked by its authority.

## Recovery Orchestration

The Engineering Lifecycle Coordinator owns the recovery plan and cross-domain ordering. Domain authorities own diagnosis and recovery of their state.

Recovery proceeds as follows:

1. detect failure or ambiguity;
2. stop affected progression and fence stale owners;
3. preserve envelope, journal, artifacts, evidence, and external receipts;
4. obtain authoritative observations from each affected owner;
5. classify linearization and external visibility;
6. select rollback, retry, compensation, forward recovery, rejection, or escalation according to frozen policy;
7. obtain required human or authority approval;
8. request domain recovery actions in dependency order;
9. validate every recovery receipt;
10. append the recovery outcome and reconstruct projections;
11. resume only after authority, dependency, trust, and consistency revalidation.

Recovery orchestration SHALL never fabricate a missing receipt, edit domain state directly, or mark a transaction complete because infrastructure appears healthy.

## Recovery Authority

| Failure Domain | Recovery Owner | Coordinator Role | Prohibited Shortcut |
|---|---|---|---|
| Mission/lease | Mission Queue | Block progression and request reconciliation | Reassign without fencing and outcome check |
| Runtime execution | Runtime | Correlate attempt and await evidence | Infer completion from process exit |
| Candidate Workspace | Candidate Workspace Authority | Pause dependent stages | Mutate or delete workspace directly |
| Candidate Change Set | Candidate Change Set Authority | Request integrity verification or replacement | Edit sealed candidate |
| Validation | Validation authority | Request idempotent revalidation | Convert missing result to pass |
| Certification | Certifier and Coordinator within their scopes | Rebuild graph and coordinate recertification | Rewrite prior certificate |
| Repository Evolution | Repository Evolution | Block final completion and coordinate dependencies | Reset or force-push history |
| Repository Context | Context Authority | Await certified successor or reconciliation | Manually edit context truth |
| Baseline | Baseline Authority | Await successor or recovery decision | Invent baseline identity |
| Evidence | Evidence owner | Quarantine dependent decision | Recreate evidence from memory |
| Storage | Storage owner | Fail over or restore verified copy | Accept unverified restore |

## Restart and Crash Recovery

After restart, no process memory SHALL be trusted. Each subsystem SHALL:

1. load and validate its authoritative history or immutable records;
2. rebuild or validate projections;
3. acquire a new ownership epoch where required;
4. fence previous actors;
5. reconcile operations without terminal receipts;
6. resume only idempotent or explicitly recovered work.

### Workspace Recovery

Workspace Authority restores from the immutable baseline plus the latest verified snapshot and journal. It validates content, mutation scope, lease, secrets state, and process absence before issuing a new lease. Corrupt workspaces are quarantined; sealed candidates remain independent.

### Mission and Scheduler Recovery

Mission Queue reconstructs state from append-only history and reconciles attempts with Runtime. Scheduler reacquires partition epochs and recomputes decisions from fresh snapshots. Old decisions and leases are fenced.

### Runtime Recovery

Runtime reconciles execution identity, process/provider status, workspace lease, heartbeat, output, and evidence. Unknown provider outcome remains recovery-required. A replacement attempt begins only after fencing and non-idempotent effect analysis.

### Validation Recovery

Validation results are immutable and independently repeatable against the same candidate and rule version. Missing or corrupt results are regenerated as new attempts; old results remain in history. Aggregate evaluation does not proceed with an incomplete graph.

### Certification Recovery

The Coordinator reconstructs frozen inputs, graph, domain decisions, and journal. If atomic aggregate issuance did not commit, no certificate exists. If it committed, it remains historical and may only be suspended, revoked, expired, or superseded through governed authority.

### Repository Evolution Recovery

Repository Evolution inspects its journal, local object identity, target head, remote receipts, tags, context, baseline, and publication visibility. Before linearization it may roll back local preparation. After linearization it SHALL complete idempotently or initiate a compensating certified evolution.

### Repository Context and Baseline Recovery

Context and Baseline Authorities independently verify repository reality and evolution receipts. Failure to issue a successor blocks finalization. Neither Repository Evolution nor the Coordinator may synthesize their truth.

### Evidence Recovery

Evidence recovery restores verified replicas by content digest and provenance. If no authentic copy exists, the evidence remains missing and every dependent decision is suspended, revoked, or re-executed according to authority. Evidence is never reconstructed from narrative assertions.

### Storage Recovery

Storage recovery SHALL verify schema, checksums, sequence continuity, ownership, encryption, retention holds, and replica provenance before use. Restored projections may be rebuilt; restored authoritative histories require independent integrity proof.

### Disaster Recovery

Disaster recovery SHALL establish:

- constitutional authority for declaring disaster mode;
- bounded failover scope;
- recovery point and time objectives by storage class;
- replicated transaction journals and evidence inventories;
- fenced primary ownership before secondary activation;
- tenant and repository isolation during failover;
- reconciliation before return to normal operation;
- periodic restore and regional-loss exercises.

Disaster mode may reduce availability but SHALL not reduce evidence, authority, certification, or repository integrity requirements.

## Failure Domains and Classification

Failures SHALL be classified as:

- `TRANSIENT`: bounded retry is safe and idempotent;
- `CAPACITY`: backpressure or rescheduling is required;
- `CONFLICT`: authoritative state changed;
- `AUTHORITY`: permission, approval, identity, or lease is invalid;
- `INTEGRITY`: content, history, evidence, or digest is corrupt;
- `DEPENDENCY`: required upstream truth is unavailable or invalid;
- `AMBIGUOUS_OUTCOME`: external effect may have occurred;
- `POLICY`: applicable governance cannot produce a unique decision;
- `CATASTROPHIC`: repository, region, storage, or trust foundation is materially compromised.

Integrity, authority, ambiguous-outcome, policy, and catastrophic failures SHALL fail closed and require their defined recovery or escalation owner.

## Failure Escalation

Escalation records SHALL identify severity, affected transactions, organizations, repositories, trust, externally visible effects, recovery owner, human authority, time limits, and containment. A stalled recovery SHALL not become an implicit approval. Emergency action remains scoped, expiring, evidenced, and reviewable.

## Engineering Trust Preservation

Partial failure SHALL not transform confidence into trust or trust into repository truth. Existing certifications remain bound to exact candidate, evidence, context, policy, and authority state. Material loss or invalidation SHALL trigger suspension, revocation, or recertification through the owning authority. Historical certificates and evidence remain preserved.

## Repository Integrity Under Catastrophic Failure

Repository integrity SHALL be preserved through:

- content-addressed objects and signed or integrity-bound evolution receipts;
- append-only remote history policies;
- independent replicas and verified backups;
- protected target references and fenced mutation credentials;
- exact candidate-to-tree verification;
- context and baseline successor certification;
- immutable evolution journal and provenance;
- recovery drills that restore and compare canonical digests;
- compensating evolution instead of destructive history rewriting.

If repository truth cannot be proven, Repository Evolution SHALL stop and affected baselines SHALL be suspended by their authority.

## Security and Authorization

Every transaction operation SHALL authenticate actor and service identity and validate authority, tenant, repository, subject, operation, scope, expiration, and delegation.

Security SHALL enforce:

- least-privilege credentials per domain;
- no universal recovery credential;
- separation of execution, validation, certification, and repository mutation identities;
- tamper-evident envelope and journal entries;
- replay protection and idempotency conflict detection;
- encrypted evidence and storage according to classification;
- secret exclusion from transaction metadata;
- immediate fencing after revocation or compromise;
- immutable audit correlation;
- dual authority for catastrophic or history-affecting recovery where policy requires.

Recovery authority SHALL never exceed original domain authority. Emergency credentials SHALL be time-bound, narrowly scoped, independently approved, and fully audited.

## Evidence Immutability

Evidence SHALL be content-addressed or equivalently integrity-bound, versioned, attributable, time-correlated, retained, and referenced by immutable identity. Corrections create a superseding evidence object; they do not overwrite the original. Transaction journals reference evidence identities and digests rather than embedding mutable copies.

## Observability, Metrics, and Telemetry

Operators SHALL be able to reconstruct:

- current transaction stage and owner;
- last durable receipt and next required action;
- active leases, epochs, and fencing state;
- blocked dependencies and authority failures;
- rollback and forward-recovery eligibility;
- externally visible effects;
- recovery plan, owner, elapsed time, and evidence;
- end-to-end mission-to-repository provenance.

Required metrics include:

- active transactions by state and domain;
- local commit and journal latency;
- optimistic conflict and stale-fence rejection rates;
- retry and duplicate suppression rates;
- ambiguous-outcome count and age;
- rollback, compensation, and forward-recovery duration;
- projection lag and journal integrity failures;
- backup age, restore verification, RPO, and RTO compliance;
- repository evolution conflict and recovery rates;
- evidence loss, corruption, and replication health;
- time spent waiting on human or domain authority.

Telemetry SHALL use transaction, mission, attempt, candidate, certification, repository evolution, context, and baseline correlation identities. Metrics inform operations; they do not authorize transitions.

## Auditing

An independent auditor SHALL be able to determine:

- why the transaction existed;
- who authorized every stage;
- what exact inputs and policies applied;
- which owner performed each mutation;
- which concurrent conflicts occurred;
- where linearization occurred;
- what was externally visible;
- why rollback, compensation, or forward recovery was selected;
- how evidence and trust remained valid;
- which repository and baseline outcome resulted.

Audit history SHALL remain readable across schema and implementation evolution.

## Contracts

The constitutional contract surface SHALL include:

- `EngineeringTransactionEnvelope`
- `EngineeringTransactionEvent`
- `DomainTransactionRequest`
- `DomainTransactionReceipt`
- `ExpectedStateReference`
- `IdempotencyIdentity`
- `OwnershipLease`
- `FencingToken`
- `ConflictFinding`
- `LinearizationRecord`
- `ExternalEffectReceipt`
- `RecoveryAssessment`
- `RecoveryPlan`
- `CompensationRequest`
- `RecoveryReceipt`
- `TransactionCompletionRecord`
- `TransactionAuditReport`

All contracts SHALL be typed, versioned, digest-bound, and explicit about unknown states.

## Validators

Required validators SHALL cover:

- transaction identity, envelope, and idempotency;
- authority, scope, delegation, and expiration;
- expected state, sequence, and digest;
- ownership lease and fencing;
- domain transition legality;
- immutable artifact integrity;
- dependency and ordering constraints;
- local atomic receipt completeness;
- durability tier acknowledgement;
- linearization and external visibility;
- retry and compensation eligibility;
- recovery plan authority and completeness;
- evidence provenance and availability;
- certification binding and currency;
- repository, context, and baseline consistency;
- transaction completion.

Unknown validator outcomes SHALL block progression.

## Events

Canonical event classes SHALL include:

- `EngineeringTransactionProposed`
- `EngineeringTransactionAdmitted`
- `DomainOperationRequested`
- `DomainOperationCommitted`
- `DomainOperationRejected`
- `ConcurrencyConflictDetected`
- `OwnershipLeaseAcquired`
- `OwnershipLeaseFenced`
- `LinearizationPointCrossed`
- `ExternalEffectObserved`
- `EngineeringTransactionWaiting`
- `EngineeringRecoveryRequired`
- `RecoveryPlanAuthorized`
- `RollbackCompleted`
- `CompensationStarted`
- `CompensationCompleted`
- `ForwardRecoveryStarted`
- `ForwardRecoveryCompleted`
- `EngineeringTransactionCompleted`
- `EngineeringTransactionAborted`
- `EngineeringTransactionFailed`
- `EngineeringTransactionSuperseded`

Event names describe recorded facts and SHALL not imply authority the producer lacks.

## Reports

PBOS SHALL produce machine-readable and human-readable:

- transaction status and ownership report;
- concurrency and conflict report;
- durability and storage health report;
- recovery assessment and plan;
- rollback or forward-recovery report;
- evidence integrity report;
- disaster recovery readiness report;
- end-to-end engineering provenance report;
- constitutional correctness certification input.

Reports SHALL bind source journal position, projection digest, policy versions, and generation identity.

## Authority Matrix

| Subsystem | Owns | Reads | Writes | Cannot Modify | Depends On | Provides | Consumes | Coordinates With | Never Coordinates Around |
|---|---|---|---|---|---|---|---|---|---|
| Engineering Lifecycle Coordinator | Cross-domain progression, transaction envelope admission, recovery plan and orchestration journal | Domain receipts, authority, policies, evidence | Engineering transaction journal and coordination decisions | Domain state, candidates, trust, repository, context, baseline | Every required domain authority | Next-stage and recovery requests | Immutable domain outcomes | All lifecycle authorities through contracts | Any domain owner or human gate |
| Mission Queue and Scheduler | Mission orchestration, attempts, leases, scheduling decisions | Planner, capacity, authority, Runtime outcomes | Mission history and dispatch records | Workspace, candidate, certification, repository | Planner, Runtime, authority | Fenced dispatch and mission receipts | Lifecycle coordination requests | Runtime and Coordinator | Execution authorization or repository authority |
| Runtime | Execution lifecycle and evidence | Dispatch, package, authority, lease, workspace handle | Execution state, telemetry, evidence | Queue, certification, repository | Queue, Workspace, provider admission | Execution receipts | Valid dispatch | Queue, Workspace, Coordinator | Certification and Repository Evolution |
| Candidate Workspace Authority | Workspace identity, isolation, lease, snapshots, recovery, cleanup | Baseline, mission, authority | Workspace state and evidence | Candidate after sealing, repository history | Runtime and repository baseline | Mutable isolated construction and seal request | Authorized workspace commands | Runtime, Candidate Change Set | Repository mutation |
| Candidate Change Set Authority | Immutable candidate identity and lifecycle | Sealed workspace snapshot and provenance | Candidate object and evidence | Mutable workspace, validation, repository | Workspace Authority | Immutable candidate | Seal request | Validation, Certification, Evolution | Runtime mutation after seal |
| Validation Authorities | Findings and engineering confidence | Candidate, requirements, policies | Immutable validation results | Candidate, trust, repository | Candidate Change Set | Validation receipts | Validation requests | Certification Coordinator | Repository mutation |
| Domain Certifiers | Domain trust decisions | Exact subject and evidence | Immutable certification decisions | Subject, other certifier decisions, repository | Validation and domain policy | Domain trust receipts | Certification requests | Certification Coordinator | Repository Evolution mutation |
| Engineering Certification Coordinator | Aggregate engineering trust transaction | Required domain decisions and frozen graph | Aggregate certification and journal | Domain trust, candidate, repository | Domain certifiers | Atomic engineering certification | Candidate and trust receipts | Lifecycle Coordinator, Repository Evolution | Domain certifier bypass |
| Repository Evolution | Evolution transaction and durable repository mutation | Certified candidate, target, context, baseline | Repository history and evolution journal | Candidate, validation, certification | Certification and repository authority | Evolution receipts and finalized history | Certified candidate handoff | Context, Baseline, Lifecycle Coordinator | Runtime or Scheduler delegation |
| Repository Context Authority | Trusted repository context | Repository evidence and evolution receipt | Context decisions | Repository history, baseline | Repository evidence | Certified context | Context request | Evolution and Baseline | Manual runtime mutation |
| Baseline Authority | Repository lineage and successor baseline | Context, evolution, policy | Baseline decisions | Repository history or context | Context and Evolution | Certified baseline | Successor request | Evolution and Coordinator | Inferred repository truth |
| Evidence Authority | Evidence identity, integrity, retention, access | Producer receipts and policy | Evidence records and history | Producing domain truth | Storage and identity | Verifiable evidence references | Evidence submissions | All authorized domains | Certification decisions |

### Authority Powers Matrix

| Subsystem | Mutation Authority | Transaction Authority | Recovery Authority | Trust Authority | Repository Authority | Engineering Authority |
|---|---|---|---|---|---|---|
| Lifecycle Coordinator | Coordination journal only | Cross-domain progression only | Recovery orchestration only | None | None | Lifecycle progression only |
| Mission Queue/Scheduler | Mission state only | Mission local transactions | Mission reconciliation | None | None | Dispatch opportunity only |
| Runtime | Execution state only | Execution local transactions | Execution recovery | None | None | Authorized execution |
| Workspace Authority | Workspace only | Workspace local transactions | Workspace recovery | None | None | Mutable candidate construction |
| Change Set Authority | Immutable candidate lifecycle | Candidate seal transaction | Integrity verification/replacement | None | None | Candidate representation |
| Validation | Findings only | Validation issuance | Revalidation | Confidence only | None | Evaluation only |
| Domain Certifier | Domain decision only | Domain certification issuance | Revocation/recertification | Domain trust | None | None |
| Certification Coordinator | Aggregate decision only | Aggregate certification transaction | Aggregate recovery | Engineering trust aggregate | None | None |
| Repository Evolution | Evolution state and repository | Evolution transaction | Repository rollback/forward recovery | Durable repository truth after trust | Sole repository mutation authority | None |
| Context Authority | Context state only | Context issuance | Context reconciliation | Context trust | None | None |
| Baseline Authority | Baseline state only | Baseline issuance | Baseline recovery | Baseline trust | None | None |
| Evidence Authority | Evidence store only | Evidence persistence | Evidence restore/quarantine | Evidence integrity, not subject trust | None | None |

## Primary Sequence Diagram

```text
Lifecycle       Domain Owner       Evidence        Next Domain
Coordinator
    |                |                |                |
    |--request------>|                |                |
    |                |--local atomic operation-------->|
    |                |--persist receipt>|             |
    |<--receipt------|                |                |
    |--append journal event           |                |
    |--verify prerequisites--------------------------->|
    |--authorize next stage--------------------------->|
```

The arrow to Evidence represents persistence, not transfer of domain ownership.

## Repository Evolution Recovery Diagram

```text
PREPARED
   |
APPLYING --failure before publication--> ROLLBACK --> ABORTED
   |
   +--externally visible mutation--> LINEARIZED
                                      |
                         verify/context/baseline failure
                                      |
                              RECOVERY_REQUIRED
                                |           |
                         idempotent finish  compensating certified evolution
                                |           |
                             FINALIZED   SUPERSEDED / REMEDIATED
```

## Failure Interaction Diagram

```text
Failure Detector
      |
Lifecycle Coordinator records RECOVERY_REQUIRED
      |
Fence affected owners and stop dependent progression
      |
Domain Authorities report authoritative observations
      |
Recovery Assessment classifies linearization and trust impact
      |
Human/Authority approves required recovery
      |
Domain owner executes rollback, retry, compensation, or forward recovery
      |
Validators verify receipts -> Coordinator resumes or terminates
```

## Dependency Diagram

```text
Constitution
    |
Engineering Lifecycle Coordinator
    |
    +--> Mission Queue / Scheduler
    +--> Runtime
    +--> Candidate Workspace
    +--> Candidate Change Set
    +--> Validation Authorities
    +--> Engineering Certification Coordinator
    +--> Repository Evolution
    +--> Context and Baseline Authorities

Transaction, Concurrency & Recovery Architecture
    = common protocol and invariant layer across every boundary
    != a new mutation service
```

## Operational Resilience and Scale

For one million transactions, thousands of repositories, hundreds of organizations, multiple Runtimes, and multiple Certification Coordinators:

- journals and projections SHALL partition by stable authority scope;
- one transaction SHALL not require a global lock or global scan;
- cross-partition dependencies SHALL use immutable identity references;
- repository mutation SHALL serialize only conflicting target scopes;
- validation and certification SHALL parallelize only where graphs permit;
- storage and evidence SHALL support integrity-verified replication;
- recovery queues SHALL be partitioned but globally observable;
- backpressure SHALL stop admission before durability or evidence systems become unsafe;
- organization isolation and quotas SHALL remain enforceable during failover;
- multiple Coordinator instances SHALL use fenced partition ownership and one writer per transaction sequence.

Scale never permits relaxed authority, partial certification, mutable evidence, or unjournaled mutation.

## Testing Strategy

### Transaction Properties

- no local state transition is visible without its durable receipt;
- no transaction reaches `COMPLETED` with an incomplete required graph;
- identical idempotency input produces one logical effect;
- changed input cannot reuse an idempotency identity;
- stale expected state or fencing token is always rejected;
- projections reconstruct identically from authoritative history;
- no post-linearization failure uses destructive rollback.

### Concurrency Tests

- simultaneous lifecycle transitions;
- multiple mission attempts for one mission;
- competing workspace mutation leases;
- parallel validation and certification results arriving in every order;
- concurrent Repository Evolution on the same and different targets;
- leader loss and stale owner writes;
- clock drift and expiration boundaries;
- AI agents producing conflicting candidates.

### Crash Tests

Inject failure before and after every local commit, journal append, lease acquisition, artifact seal, certificate issuance, repository write, remote publication, context issuance, baseline issuance, and finalization.

### Disaster Tests

- total process restart;
- storage corruption and verified restore;
- region loss and fenced failover;
- network partition and split-brain attempts;
- evidence replica loss;
- repository remote interruption;
- long-duration outage and expired authority;
- recovery under contract and implementation version upgrade.

### Determinism Tests

Replay frozen decision inputs across supported implementations and prove equal canonical outcomes. Nondeterministic providers SHALL prove provenance and stable governance decisions, not identical generated bytes unless their contract promises it.

## Migration Strategy

1. Inventory every current mutation, journal, lock, lease, retry, and recovery path.
2. Assign each mutable record to exactly one existing domain owner.
3. Define domain transaction receipts and idempotency identities without changing authority.
4. Introduce Engineering Transaction Envelopes for new missions in observe-only mode.
5. Correlate existing histories as explicitly labeled migration observations; never fabricate missing transitions.
6. Replace direct mutable registries with append-only history plus projections where required.
7. Standardize atomic persistence, expected versions, and fencing adapters.
8. Exercise crash recovery at every boundary before enabling autonomous progression.
9. Activate cross-domain recovery orchestration for one repository and organization scope.
10. Expand concurrency only after conflict, fencing, restore, and forward-recovery evidence passes.

Migration rollback may restore the previous reader or adapter before new linearization. It SHALL not rewrite newly published repository history or delete transaction evidence.

## Backward Compatibility

Contracts SHALL use explicit versions and semantic compatibility rules. Readers SHALL reject unknown mandatory fields or meanings. Compatibility adapters may translate storage and transport but cannot alter identity, authority, lifecycle semantics, linearization, evidence, or recovery ownership.

Historical envelopes, policies, validator versions, and receipts SHALL remain interpretable. Breaking identity or transaction semantics require a new major contract and an evidenced migration.

## Future Evolution

Future databases, source-control systems, distributed ledgers, compute models, AI systems, and consistency protocols may replace current adapters. They SHALL preserve:

- singular domain ownership;
- immutable transaction identity and intent;
- append-only progression evidence;
- declared local atomicity;
- constitutional completion only after verified domain outcomes;
- fenced exclusive mutation;
- deterministic decision replay from frozen inputs;
- explicit linearization and external visibility;
- forward recovery after publication;
- immutable evidence and certification separation;
- Repository Evolution as sole durable history mutation authority.

No future technology may gain constitutional authority merely because it offers stronger implementation primitives.

## Mandatory Architectural Answers

### How is engineering atomicity guaranteed?

Each owner commits one local atomic operation with its receipt. The Engineering Lifecycle Coordinator recognizes completion only after every required receipt is verified against one immutable envelope. Independent systems are coordinated as a saga; PBOS does not make a false global ACID claim.

### How does engineering truth survive interruption?

Truth resides in immutable artifacts, append-only journals, certified decisions, and repository history, not process memory. Restart reconstructs projections, fences stale owners, reconciles ambiguous operations, and resumes from the last verified receipt.

### How does engineering trust survive partial failure?

Trust remains bound to exact subjects and evidence. Partial failure cannot create or broaden certification. Missing or invalid evidence blocks progression and may suspend or revoke affected trust through the owning authority.

### How does rollback differ from forward recovery?

Rollback removes or abandons uncommitted local state before external visibility. Forward recovery preserves visible history and completes, supersedes, revokes, or compensates it through new governed actions after the linearization point.

### How does concurrent autonomous engineering remain deterministic?

Isolated workspaces, immutable candidates, expected-version transitions, fenced leases, stable graph ordering, frozen policies, explicit repository serialization, and recorded nondeterministic inputs ensure one replayable constitutional outcome despite concurrent work.

### How does engineering evidence remain immutable?

Evidence receives immutable identity, provenance, content digest, retention, and append-only supersession. Corrections create new evidence. No transaction journal or recovery process may edit prior evidence.

### How does repository integrity survive catastrophic failure?

Protected append-only history, content-addressed candidate verification, fenced Repository Evolution, replicated receipts, certified context and baseline successors, verified backups, disaster exercises, and forward recovery prevent an outage from silently redefining repository truth.

### How is engineering continuity preserved?

Durable identities, journals, evidence, snapshots, contract versions, fenced failover, alternative certified adapters, and explicit recovery ownership allow progress to resume without sacrificing correctness. When proof is unavailable, safe continuity means remaining blocked.

### How do constitutional guarantees survive implementation evolution?

Guarantees are expressed through technology-neutral contracts, ownership, invariants, receipts, and compatibility rules. New implementations must demonstrate conformance through deterministic, concurrency, crash, recovery, and migration evidence before replacing an existing adapter.

### Why does this authority deserve constitutional ownership?

Transaction and recovery ambiguity can convert partial work into false truth, permit duplicate mutation, destroy evidence, or corrupt repository history. A single constitutional protocol is required to make every owner interoperable without granting a universal service excessive power.

## Architectural Invariants

1. Every mutable engineering truth has exactly one constitutional owner.
2. Every domain mutation is locally atomic and durably receipted.
3. Engineering transactions have immutable identity, intent, and scope.
4. Engineering transaction progress is append-only and integrity-verifiable.
5. The Transaction Registry is a reconstructable projection, never a mutation authority.
6. The Engineering Lifecycle Coordinator coordinates progression and recovery but cannot perform domain mutations.
7. PBOS never claims global ACID behavior across independent systems without independently proven support.
8. Constitutional completion requires every mandatory domain outcome and evidence reference.
9. Candidate Change Sets are immutable and never partially certified.
10. Engineering trust is explicit, subject-bound, evidence-bound, and never inferred.
11. Repository Evolution is the sole authority permitted to mutate durable repository history.
12. Every accepted repository truth originates from exactly one certified Candidate Change Set and one finalized evolution transaction.
13. Repository history remains append-only under normal and recovery operation.
14. Optimistic concurrency protects ordinary transitions; fenced leases protect exclusive long-running mutation.
15. At most one current fencing token may authorize an exclusive mutation scope.
16. Lease expiry does not prove that a prior actor stopped; stale effects must be fenced and reconciled.
17. Exactly-once physical execution is not assumed; exactly-once logical effects are enforced through identity, idempotency, fencing, and reconciliation.
18. Retry never changes semantic intent silently and never proceeds after an ambiguous outcome without reconciliation.
19. Rollback is allowed only before the applicable linearization point.
20. Forward recovery is mandatory after externally visible mutation when destructive rollback would rewrite truth.
21. Compensation is a new governed transaction and never erases historical engineering truth.
22. Recovery preserves all prior evidence and never invents a transition, receipt, success, or certification.
23. Unknown, stale, conflicting, corrupt, or unverifiable state fails closed.
24. Wall-clock time alone never determines causal ordering or ownership.
25. Deterministic replay binds exact inputs, event order, policies, versions, authority, and nondeterministic observations.
26. Projections, caches, metrics, and telemetry never authorize mutation.
27. Disaster recovery may reduce availability but never constitutional guarantees.
28. Cross-organization and cross-repository work requires explicit scope, isolation, ordering, and recovery contracts.
29. No recovery authority exceeds the original authority or bypasses a human gate.
30. Future implementations preserve these invariants regardless of storage, source-control, compute, or AI technology.
31. Architectural simplification is required whenever it preserves or strengthens constitutional guarantees.

## Final Constitutional Review

This architecture rejects the most likely review-board objections:

- It does not introduce a universal coordinator with excessive credentials.
- It does not claim impossible distributed atomicity or exactly-once execution.
- It establishes narrow concurrency domains instead of global locks.
- It uses fencing rather than trusting lease expiration.
- It treats external visibility as an explicit point of no return.
- It preserves Git and repository integrity through forward recovery rather than history rewriting.
- It keeps validation confidence, certification trust, and repository truth distinct.
- It preserves evidence and makes unknown outcomes explicit.
- It scales through partitioned journals and domain ownership without weakening governance.
- It remains implementation-neutral and compatible with future systems.

The architecture is therefore constitutionally sufficient to complete the PBOS engineering lifecycle correctness model, subject to implementation conformance and adversarial certification.

## Related Documents

- [Autonomous Engineering Lifecycle](./PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md)
- [Candidate Workspace Architecture](./PBOS-ENGINE-LIFECYCLE-002_CANDIDATE_WORKSPACE_ARCHITECTURE.md)
- [Engineering Certification Coordination Architecture](./PBOS-ENGINE-LIFECYCLE-003_ENGINEERING_CERTIFICATION_COORDINATION_ARCHITECTURE.md)
- [Candidate Change Set Architecture](./PBOS-ENGINE-LIFECYCLE-004_CANDIDATE_CHANGE_SET_ARCHITECTURE.md)
- [Repository Evolution Architecture](./PBOS-ENGINE-LIFECYCLE-005_REPOSITORY_EVOLUTION_ARCHITECTURE.md)
- [Mission Queue and Scheduling Architecture](./PBOS-ENGINE-LIFECYCLE-006_MISSION_QUEUE_AND_SCHEDULING_ARCHITECTURE.md)
- [Engineering Lifecycle Implementation Directive](./PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md)
- [Engineering Lifecycle Implementation Assessment](../REVIEWS/PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md)
