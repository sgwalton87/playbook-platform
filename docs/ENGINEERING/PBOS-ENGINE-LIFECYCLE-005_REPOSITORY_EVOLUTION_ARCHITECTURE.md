---
id: PBOS-ENGINE-LIFECYCLE-005
title: Repository Evolution Architecture
version: 1.0.0
status: Canonical
classification: Constitutional Engineering Specification
owners:
  - PBOS Engineering Governance
  - Repository Evolution Authority
layer: Engineering
parent: PBOS-ENGINE-LIFECYCLE-001
depends_on:
  - PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md
  - PBOS-ENGINE-LIFECYCLE-002_CANDIDATE_WORKSPACE_ARCHITECTURE.md
  - PBOS-ENGINE-LIFECYCLE-003_ENGINEERING_CERTIFICATION_COORDINATION_ARCHITECTURE.md
  - PBOS-ENGINE-LIFECYCLE-004_CANDIDATE_CHANGE_SET_ARCHITECTURE.md
  - PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md
  - PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md
related:
  - Repository Context Authority
  - Baseline Authority
  - Release Evidence Authority
  - Engineering Certification Coordination Authority
  - History Authority
last_updated: 2026-08-01
---

# Executive Architecture Decision

Repository Evolution Authority is the sole constitutional authority permitted to transform a certified Candidate Change Set into durable repository history.

Git, source-control hosts, filesystems, object stores, package registries, deployment systems, and future repository technologies are adapters. They may perform side effects only under a Repository Evolution Transaction. They do not decide whether engineering is trusted, which candidate is eligible, or when history may evolve.

Repository Evolution uses a journaled, fenced, idempotent transaction with pre-publication rollback and post-publication forward recovery. Because repository publication, tags, baselines, context certification, and release evidence may span independent systems, PBOS shall not claim impossible distributed ACID atomicity. Constitutional atomicity means one certified intent, one ordered transaction, no finalized evolution until every required effect is verified, and no destructive rewriting after publication.

This document is the sole governing authority for Repository Evolution Architecture.

# 1. Architectural Discovery

## 1.1 Existing Mutation Paths

Current repository mutation behavior is distributed across several concerns:

- runtime artifact writers update repository-relative JSON;
- Product Factory and report generators write tracked outputs;
- gate and volume lifecycle transitions rewrite tracked constitutional artifacts;
- release and promotion subsystems write promotion and evidence records;
- Repository Context refresh and activation update context artifacts;
- a shipping script directly invokes `git add` and `git commit`;
- Git inspection occurs in repository and context modules;
- baseline-like identity exists in context and release governance without one complete successor transaction.

These paths serve legitimate current owners, but they do not constitute one repository evolution authority. Direct tracked-file writes during execution conflate candidate construction with accepted history. Direct Git commands bypass a constitutional evolution transaction.

## 1.2 Ownership Conflicts

| Current concern | Legitimate owner | Repository Evolution boundary |
|---|---|---|
| Candidate source generation | Candidate Workspace Authority | Must occur before evolution, outside certified checkout |
| Runtime JSON and telemetry | Runtime artifact owners | Must not become repository history merely because tracked |
| Validation and certification reports | Domain authorities | Become durable evidence only through governed evidence policy |
| Gate and volume lifecycle state | Their lifecycle authorities | May be included in a certified Candidate Change Set; cannot be rewritten by Evolution independently |
| Context refresh | Repository Context Authority | Runs after evolved repository reality exists |
| Release promotion | Release governance | Supplies or consumes evidence; cannot mutate repository directly |
| Git operations | No constitutional authority by themselves | Must move behind Repository Evolution adapters |

## 1.3 Hidden Coupling

Repository-relative paths currently allow runtime, reporting, context, and evidence operations to dirty the same checkout that represents trusted repository reality. Context then detects its own governed outputs as repository drift. Git state is used as both implementation state and trust signal.

Repository Evolution removes this coupling by accepting only immutable certified candidates and applying them through ports to a target repository transaction.

## 1.4 Simplification Decision

PBOS shall implement one evolution transaction model, not separate commit, push, tag, baseline, and context promotion workflows. Domain authorities remain separate, but their effects are ordered and correlated by one transaction journal.

# 2. Purpose

Repository Evolution converts accepted engineering intent into durable, independently verifiable repository truth while preserving lineage, authority, recovery, and auditability.

It ensures:

- only certified candidates mutate history;
- target reality is verified immediately before mutation;
- all side effects belong to one transaction identity;
- partial publication never masquerades as finalized evolution;
- recovery preserves published history;
- successor context, baseline, release evidence, and provenance bind the exact evolution;
- every durable mutation is attributable and reconstructable.

# 3. Authority

Repository Evolution Authority owns:

- evolution request admission;
- target and repository mutation authorization;
- evolution transaction identity, ordering, and journal;
- repository mutation leases and fence tokens;
- adapter invocation for apply, commit, tag, publish, and verification;
- evolution receipts;
- post-publication recovery coordination;
- final evolution status and audit history.

It does not own Candidate Change Set content, Validation, Certification, Repository Context decisions, baseline identity, release evidence certification, or deployment.

# 4. Scope

This architecture governs durable evolution of one or more certified repositories, including source, configuration, documentation, schema definitions, migration definitions, infrastructure definitions, generated outputs, and governed lifecycle artifacts represented by a Candidate Change Set.

It governs repository history and associated certified provenance. It does not execute database migrations, deploy runtime environments, publish marketplace assets, or activate production services unless separate constitutional authorities treat those as their own governed transactions.

# 5. Engineering Philosophy

Repository history is accepted engineering truth, not a transcript of engineering activity. Evolution is therefore intentional, scarce, and evidence-bound.

Runtime cannot mutate repository history because it performs work and cannot accept its own result. Validation cannot mutate history because correctness evidence is not authority. Certification cannot mutate history because trust issuance and irreversible side effects require separation of duties. Repository Evolution alone owns durable mutation because it combines exact certified intent, target reality, mutation authority, serialization, verification, and recovery.

Repository Evolution does not decide product intent or engineering quality. It proves that the already-certified intent was applied exactly and recorded durably.

# 6. Constitutional Principles

1. **Certification precedes mutation.**
2. **One transaction owns every durable side effect.**
3. **Target reality is verified at the point of mutation.**
4. **Candidate content is applied exactly; no implicit merge or repair occurs.**
5. **Git is an adapter, not authority.**
6. **Publication is a constitutional linearization point.**
7. **Rollback ends at publication; forward recovery begins there.**
8. **Finalization requires verified repository, baseline, context, evidence, and audit outcomes declared by policy.**
9. **History is append-only after external visibility.**
10. **Every retry is idempotent and fenced.**
11. **Multi-repository evolution preserves atomic intent without claiming impossible remote invisibility.**
12. **Ambiguous local or remote reality suspends all mutation.**

# 7. Repository Mutation Authority

Only Repository Evolution Authority may authorize an adapter to:

- create or update a durable repository reference;
- create a commit or equivalent history object;
- create a tag or release reference;
- push or publish history;
- alter a certified target branch;
- record an evolution receipt;
- request successor baseline creation;
- request post-evolution Repository Context certification.

No CLI, script, Runtime process, validator, certifier, report generator, lifecycle subsystem, or human operator may invoke these effects outside an admitted evolution transaction.

Direct source-control mutation mechanisms shall be removed, disabled, or converted into adapters during migration. Human use remains possible only through the same authority and transaction contracts.

# 8. Repository Identity

Repository identity is independent of local path and includes:

- repository identifier and organization/tenant scope;
- canonical remote or repository authority identity;
- repository type and adapter contract version;
- target namespace, branch or equivalent reference policy;
- current certified baseline and context identities;
- history-root and trust-policy references;
- repository evolution policy and authority;
- identity digest.

Local checkout, clone path, worktree, cache, mirror, and credential are operational locations, not repository identity.

# 9. Repository Truth

Repository Truth is the independently observed durable state of repository history at a declared authority and reference. It includes:

- current history object or commit identity;
- resulting tree or content identity;
- parent ancestry;
- tag and release references required by policy;
- remote verification evidence;
- Repository Context certification status;
- successor baseline and evolution references.

Repository Truth is certified by Repository Context Authority after evolution. Repository Evolution observes and verifies operational reality but cannot certify context itself.

# 10. Engineering Truth

Engineering Truth is the durable assertion that:

- a specific certified Candidate Change Set;
- under a specific Engineering Certification and authority;
- was applied through a specific evolution transaction;
- produced exact verified repository trees and history references;
- resulted in required successor context, baseline, evidence, and audit records.

Engineering Truth is represented by the finalized Evolution Record and its linked authorities. It is not equivalent to a Git commit alone.

# 11. Evolution Transactions

Every evolution uses one immutable transaction identity and append-only journal.

```text
REQUESTED
  -> ADMITTED
  -> PREPARING
  -> VALIDATING
  -> FROZEN
  -> APPLYING
  -> COMMITTING
  -> VERIFYING_LOCAL
  -> PUBLISHING
  -> VERIFYING_REMOTE
  -> SYNCHRONIZING_CONTEXT
  -> ADVANCING_BASELINE
  -> RECORDING_EVIDENCE
  -> FINALIZING
  -> EVOLVED
```

The exact steps are policy-dependent, but admission, target verification, candidate application, publication decision, verification, context, baseline, provenance, and finalization are mandatory concepts.

## 11.1 Transaction Identity

Identity binds:

- transaction and idempotency identities;
- Candidate Change Set and Engineering Certification;
- repository set and ordered repository units;
- expected target heads and certified parent baselines;
- mutation, publication, baseline, context, and evidence policies;
- evolution authority and approvals;
- adapter identities and contract versions.

Mutable progress, timestamps, retries, and resulting commit identities belong to the transaction journal, not transaction intent identity.

# 12. Atomic Evolution

## 12.1 Constitutional Atomicity

Constitutional atomicity guarantees:

- one immutable certified intent;
- one admitted transaction identity;
- one ordered journal of side effects;
- no partially applied state is reported as `EVOLVED`;
- every step is idempotently verifiable;
- pre-publication effects can be rolled back;
- post-publication effects must be forward-recovered;
- all repository units finalize together at the constitutional level.

## 12.2 Distributed Limitation

Independent Git remotes, context stores, baseline stores, and evidence systems do not provide one shared ACID transaction. PBOS shall not claim that external observers cannot see partial publication during recovery.

For multi-repository evolution, PBOS publishes an Evolution Manifest only after all repository units are verified. Constitutional consumers accept the evolution only through that finalized manifest. Raw external repositories may temporarily expose partial effects; the transaction remains `RECOVERY_REQUIRED`, and forward recovery is mandatory.

## 12.3 Linearization Point

The default publication linearization point is the first externally durable target mutation that authorized external observers can see. Before this point, rollback is permitted. At or after this point, history-preserving forward recovery is required.

Policy may define a transactional repository adapter with a later atomic linearization point if independently proven.

# 13. Ordering Guarantees

- Evolution requests for one target are serialized by a fenced lease.
- Stable priority and request identity order admission when multiple certified candidates compete.
- Target head and certification are revalidated after lease acquisition.
- Repository units follow the order declared in the Candidate Change Set and evolution policy.
- Tags follow verified local history creation.
- Publication follows local verification.
- Remote verification follows publication.
- Context synchronization follows verified repository reality.
- Baseline advancement follows verified context and transaction policy.
- Evolution finalization follows every required authority result.

Arrival time or adapter response order cannot alter the declared transaction order.

# 14. Certification Handoff

Engineering Certification Coordinator issues an immutable Evolution Eligibility Handoff containing:

- exact Candidate Change Set and certification identities;
- repository targets and parent baselines;
- current trust status and expiration;
- domain decision and graph digests;
- authorization and conditions;
- required context, baseline, release evidence, and verification policies;
- handoff identity and digest.

Repository Evolution independently verifies the handoff before admission and immediately before target mutation. Certification does not reserve a target or prove current target head.

# 15. Candidate Acceptance

Repository Evolution accepts a candidate only when:

- Candidate Identity and content integrity validate;
- Engineering Certification is current and permits the exact target;
- every repository unit has certified parent lineage;
- target repository identity and expected head match;
- authority and separation of duties pass;
- required adapters and recovery capabilities are available;
- no conflicting active transaction or hold exists;
- storage and evidence are durable enough for recovery;
- policy permits the declared multi-repository behavior.

Acceptance creates an admitted transaction, not a repository mutation.

# 16. Candidate Rejection

Repository Evolution may reject an eligibility handoff because target reality, authority, adapter capability, transaction policy, or recovery readiness fails.

Evolution rejection does not rewrite or necessarily revoke Candidate Certification. It records:

- transaction request and candidate;
- target observations;
- failed admission rules;
- authority and evidence;
- whether recertification, rebase, replacement, or operational remediation is required.

Target drift normally requires a replacement or synchronized candidate. Adapter unavailability may permit retry of the same handoff if policy and expiration remain valid.

# 17. Repository Context Synchronization

Repository Context Authority remains the sole certifier of repository reality.

After repository mutation and remote verification, Repository Evolution submits a context certification request containing transaction, repository, commit, tree, remote, branch, candidate, and evidence identities.

The context lifecycle:

```text
Evolution Repository Result
  -> Context Observation
  -> Context Validation
  -> Governed Context Approval when required
  -> Context Certification
  -> Context Reference returned to Evolution
```

Repository Evolution cannot synthesize, bypass, or directly modify context truth. Context failure after publication forces forward recovery and blocks finalization.

# 18. Baseline Advancement

Baseline Authority owns baseline identity and succession. Repository Evolution requests a successor baseline only after required repository and context verification.

The request binds:

- predecessor baseline;
- Candidate Change Set and Engineering Certification;
- evolution transaction and repository receipts;
- verified commit and tree identities;
- certified Repository Context;
- component and policy versions;
- mission set, provenance, and evidence.

Baseline Authority independently validates and issues the successor. Failure after publication enters forward recovery. Repository Evolution does not invent or edit baseline identity.

# 19. Repository Provenance

Permanent provenance chain:

```text
Strategic Intent
  -> Mission Set
  -> Candidate Workspace
  -> Candidate Change Set
  -> Validation Aggregate
  -> Domain and Engineering Certification
  -> Evolution Eligibility Handoff
  -> Repository Evolution Transaction
  -> Repository Unit Receipts
  -> Context Certification
  -> Successor Baseline
  -> Release Evidence
  -> Final Evolution Record
```

Every link has stable identity, digest, authority, and append-only history. Provenance remains verifiable even when operational systems or adapters are replaced.

# 20. Repository History

Repository History includes commits or equivalent objects, references, tags, release records, evolution manifests, successor baselines, and permanent provenance required by policy.

History records accepted evolution only. Runtime sessions, transient validation, failed attempts, workspace branches, caches, and telemetry remain outside canonical history, though their governed evidence may be retained in evidence systems.

Published history is never force-rewritten automatically. Corrections use compensating Candidate Change Sets and new evolution transactions.

# 21. Repository Evidence

Repository Evolution evidence includes:

- admitted request, handoff, authority, and transaction intent;
- target observations before and after lease;
- adapter operations and outputs;
- exact candidate object retrieval and integrity checks;
- local apply, commit, tag, and verification results;
- publication and independent remote verification;
- context certification and baseline advancement;
- release evidence references;
- recovery, compensation, and finalization records;
- complete journal and final Evolution Record.

Evidence is immutable, content-addressed, retained according to history and audit policy, and separated from mutable transaction projections.

# 22. Repository Recovery

Recovery Authority is Repository Evolution Authority operating under an approved Recovery Plan. It reconstructs reality from the transaction journal, Candidate Change Set, local repository adapter, remote observations, context, baseline, and evidence authorities.

Recovery principles:

- fence stale workers before any mutation;
- observe before acting;
- never infer that an attempted side effect succeeded;
- compare exact identities rather than messages or exit codes;
- resume from the last verified boundary;
- preserve published history;
- suspend target evolution while reality is ambiguous;
- append every recovery action and outcome.

# 23. Rollback

Rollback is permitted only before the transaction's publication linearization point.

Permitted pre-publication rollback may:

- restore the local target to its verified pre-transaction state;
- remove unpublished local references and tags;
- release leases after verification;
- retain candidate, journal, and failure evidence;
- mark transaction `ROLLED_BACK`.

Rollback may not delete Candidate Change Sets, certifications, audit history, or externally published effects. Destructive commands are adapters beneath policy and must prove they affect only unpublished transaction-owned state.

# 24. Forward Recovery

At or after publication, forward recovery is mandatory.

Possible actions:

- verify whether the published commit or reference exists;
- retry missing publication idempotently;
- complete missing tags or release references;
- publish remaining repository units in declared order;
- obtain context certification;
- complete successor baseline and release evidence;
- finalize missing audit projections;
- suspend evolution and create a compensating certified candidate if exact completion is impossible.

Forward recovery never force-pushes, deletes published truth, or claims finalization while any required result is absent.

# 25. Compensation

Compensation is a new governed engineering action that semantically remedies published evolution. It requires:

- incident and affected evolution identities;
- new strategic or recovery mission;
- new Candidate Change Set;
- Validation and Engineering Certification;
- new Evolution Transaction;
- explicit linkage to the compensated history.

Compensation cannot erase the original event. Automated compensation is permitted only when pre-authorized policy defines exact scope and still requires a certified candidate.

# 26. Conflict Detection

Conflicts include:

- target head differs from certified parent;
- concurrent transaction owns the target;
- candidate repository units disagree on dependency versions;
- branch protection or remote policy changed;
- context, baseline, certification, or authority expired;
- tag or release identity already exists with different content;
- local and remote histories diverge;
- case, path, mode, submodule, or repository semantics cannot be represented by the adapter;
- multi-repository partial publication exists.

Conflict detection occurs at admission, after lease acquisition, before commit, before publication, and during verification.

# 27. Conflict Resolution

Repository Evolution does not merge or edit candidates.

Resolution paths:

- reject and request a synchronized replacement candidate;
- retry after operational conflict clears;
- invoke governed recovery for an existing partial transaction;
- select a different target through new authorization and certification;
- create a compensating candidate after publication.

Human selection of conflicting content occurs upstream in a new Candidate Workspace. Validation and certification never transfer automatically.

# 28. Repository Locking

Repository mutation uses fenced leases, not process-local locks alone.

- Lease scope is repository target or declared repository set.
- Acquisition is atomic and returns a monotonic fence token.
- Every mutating adapter operation includes the current token.
- Renewal is bounded and recorded.
- Loss or expiration immediately stops mutation.
- Stale workers cannot publish after a newer lease exists.
- Lock acquisition follows deterministic repository-unit order to prevent deadlock.
- Manual lock override requires incident authority and cannot bypass reality reconciliation.

# 29. Concurrency Model

Multiple transactions may prepare concurrently for disjoint targets. Only one may mutate a target at a time.

- optimistic concurrency governs request and journal projections;
- pessimistic fenced leases govern mutation;
- immutable candidates and transaction intents avoid write conflicts;
- tenant quotas, priority, and fairness govern admission;
- Repository Evolution serializes target history even when certification is concurrent;
- multi-repository transactions acquire all required leases in canonical order before applying any unit;
- inability to acquire the complete lease set causes release and retry, not partial apply.

Repository Evolution ordering does not prevent upstream candidate conflicts; it detects and rejects them.

# 30. Metrics

Required metrics:

- requested, admitted, rejected, active, evolved, rolled-back, and recovery-required transactions;
- queue and lease wait time;
- prepare, validation, apply, commit, publish, verify, context, baseline, and finalize latency;
- target drift and conflict rates;
- rollback and forward-recovery rates and duration;
- adapter errors and ambiguous outcomes;
- multi-repository transaction size and partial-publication exposure;
- certification expiry during transaction;
- context and baseline synchronization failures;
- provenance and evidence verification failures;
- transaction throughput by repository, organization, risk, and policy.

Metrics are operational projections and cannot determine transaction truth.

# 31. Observability

One trace correlates Candidate, Certification, transaction, repository units, leases, adapter operations, commits, tags, publication, context, baseline, evidence, and recovery.

Operators must always know:

- current transaction phase;
- exact target and expected head;
- whether any externally visible effect exists;
- current lease owner and fence token status;
- last verified side effect;
- blocking conflict or authority condition;
- whether rollback or forward recovery applies;
- next governed action.

No repository mutation or recovery may be silent.

# 32. Security

- Repository mutation credentials are held only by Repository Evolution adapters.
- Runtime, Workspace, Validation, Certification, and Mission Control processes cannot access those credentials.
- Credentials are repository-, target-, operation-, organization-, and time-scoped.
- Signed commits, tags, manifests, and attestations are required when policy declares them.
- Branch protections and remote policy are verified, never disabled by the transaction.
- Candidate content is retrieved from trusted immutable storage and reverified before apply.
- Command injection, path escape, malicious hooks, submodule remotes, Git configuration, filters, and local credential helpers are controlled.
- Evolution uses clean, isolated transaction environments with hooks disabled unless explicitly certified.
- Audit and evidence redact secrets while preserving attribution.
- Compromised key or adapter events suspend affected targets and trigger impact analysis.

# 33. Authorization

Evolution authorization binds:

- requester, independent reviewer, and evolution principal;
- organization, repository set, target references, and operation scope;
- Candidate Change Set, Engineering Certification, and handoff;
- allowed commit, tag, publish, baseline, and evidence actions;
- prohibited operations;
- risk acceptance, policy, conditions, expiration, and revocation;
- recovery and compensation boundaries.

Authorization cannot permit uncertified content, implicit merge, branch-protection bypass, force-push, history deletion, credential delegation to Runtime, or finalization without verification.

# 34. Contracts

Required contracts:

- Evolution Request;
- Evolution Eligibility Handoff;
- Repository Identity and Target;
- Expected Repository State;
- Evolution Transaction Intent;
- Repository Unit Plan;
- Fenced Lease;
- Adapter Capability Attestation;
- Apply, Commit, Tag, Publish, and Verification Results;
- Repository Unit Receipt;
- Context Synchronization Request and Result;
- Baseline Advancement Request and Result;
- Release Evidence Reference;
- Evolution Journal Event;
- Recovery Plan and Result;
- Compensation Reference;
- Final Evolution Record;
- Evolution Manifest for multi-repository transactions.

Contracts are versioned, canonical, typed, immutable where applicable, authority-bound, and content-addressed.

# 35. Validators

| Rule | Purpose |
|---|---|
| RE-001 Request | Validate transaction, candidate, handoff, organization, and idempotency |
| RE-002 Authority | Validate requester, reviewer, evolution principal, scope, and separation of duties |
| RE-003 Candidate | Validate immutable content, provenance, and repository units |
| RE-004 Certification | Validate current Engineering Certification and conditions |
| RE-005 Repository Identity | Validate remote, repository, target, and adapter identity |
| RE-006 Parent and Head | Validate baseline, context, ancestry, and expected target head |
| RE-007 Lease | Validate complete lease set and current fence tokens |
| RE-008 Adapter Capability | Validate apply, verification, recovery, and security capabilities |
| RE-009 Local Result | Verify exact resulting trees before publication |
| RE-010 Tag and Reference | Verify uniqueness, signature, content, and policy |
| RE-011 Publication | Verify external durable reality independently |
| RE-012 Context | Verify Repository Context Authority result |
| RE-013 Baseline | Verify successor Baseline Authority result |
| RE-014 Evidence | Verify immutable journal, receipts, provenance, and report |
| RE-015 Multi-Repository | Verify ordered units, atomic intent, and final manifest |
| RE-016 Recovery | Validate checkpoint, publication boundary, authority, and action |
| RE-017 Finalization | Verify all policy-required effects before `EVOLVED` |

Validators never repair target content, merge candidates, waive policy, or infer success.

# 36. Events

```text
EVOLUTION_REQUESTED
EVOLUTION_ADMITTED
TRANSACTION_PREPARED
TARGET_VALIDATED
LEASES_ACQUIRED
CANDIDATE_APPLY_STARTED
REPOSITORY_UNIT_APPLIED
LOCAL_HISTORY_CREATED
LOCAL_RESULT_VERIFIED
TAG_CREATED
PUBLICATION_STARTED
REPOSITORY_UNIT_PUBLISHED
REMOTE_RESULT_VERIFIED
CONTEXT_SYNCHRONIZATION_REQUESTED
CONTEXT_CERTIFIED
BASELINE_ADVANCEMENT_REQUESTED
BASELINE_ADVANCED
RELEASE_EVIDENCE_RECORDED
EVOLUTION_FINALIZED
EVOLUTION_REJECTED
CONFLICT_DETECTED
ROLLBACK_STARTED
ROLLBACK_COMPLETED
FORWARD_RECOVERY_STARTED
FORWARD_RECOVERY_COMPLETED
COMPENSATION_REQUIRED
```

Events contain transaction, candidate, certification, repository unit, target, sequence, prior and next state, actor, authority, fence token reference, evidence, policy, trusted timestamp, and digest. Application is idempotent.

# 37. Reports

Every transaction produces a human- and machine-readable Evolution Report containing:

- transaction, Candidate, Certification, authority, and policy;
- repository targets and expected parent state;
- lease, adapter, and environment identities;
- ordered operations and journal status;
- local and remote verification;
- commit, tree, tag, release, and publication receipts;
- context certification and baseline succession;
- provenance and evidence inventory;
- conflicts, rollback, recovery, and compensation;
- final decision and remaining conditions;
- report digest.

Reports are projections and cannot replace the transaction journal or Final Evolution Record.

# 38. State Machine

```text
REQUESTED
  -> ADMITTED
  -> PREPARING
  -> VALIDATING
  -> FROZEN
  -> APPLYING
  -> VERIFYING_LOCAL
  -> PUBLISHING
  -> VERIFYING_REMOTE
  -> SYNCHRONIZING_CONTEXT
  -> ADVANCING_BASELINE
  -> FINALIZING
  -> EVOLVED
```

Exceptional states:

```text
REQUESTED | PREPARING | VALIDATING -> REJECTED | BLOCKED
FROZEN | APPLYING | VERIFYING_LOCAL -> ROLLBACK_REQUIRED
PUBLISHING | VERIFYING_REMOTE | SYNCHRONIZING_CONTEXT |
ADVANCING_BASELINE | FINALIZING -> FORWARD_RECOVERY_REQUIRED
ANY ACTIVE STATE -> SUSPENDED | RECOVERY_REQUIRED
```

`EVOLVED`, `REJECTED`, and `ROLLED_BACK` are terminal for a transaction. Forward recovery completes the same transaction or records `COMPENSATION_REQUIRED`; it does not create a false terminal success.

# 39. Sequence Diagrams

## 39.1 Admission and Prepare

```text
Lifecycle Coordinator -> Repository Evolution: request(handoff, target)
Repository Evolution -> Certification Coordinator: verify current eligibility
Repository Evolution -> Change Set Port: verify candidate
Repository Evolution -> Context/Baseline Ports: verify parent
Repository Evolution -> Repository Port: observe target
Repository Evolution -> Lease Port: acquire fenced target leases
Repository Evolution -> Journal: append TRANSACTION_PREPARED
```

## 39.2 Apply and Publish

```text
Repository Evolution -> Change Set Port: retrieve immutable objects
Repository Evolution -> Repository Adapter: apply exact repository unit
Repository Adapter -> Evolution: local tree and history receipt
Evolution -> Validator: compare exact candidate tree
Evolution -> Repository Adapter: create required tag/reference
Evolution -> Repository Adapter: publish with fence token
Evolution -> Independent Reader: verify remote commit/tree/reference
```

## 39.3 Context, Baseline, and Finalization

```text
Evolution -> Context Authority: certify evolved repository reality
Context Authority -> Evolution: context decision
Evolution -> Baseline Authority: request successor baseline
Baseline Authority -> Evolution: baseline certification
Evolution -> Evidence Authority: persist final provenance
Evolution -> History: append Final Evolution Record
Evolution -> Lease Port: release after verification
```

## 39.4 Recovery

```text
Recovery Controller -> Lease Port: fence stale worker
Recovery Controller -> Journal: read last verified boundary
Recovery Controller -> Repository/Remote: observe actual state
Recovery Controller -> Policy: choose rollback or forward recovery
Recovery Controller -> Adapters: execute idempotent recovery
Recovery Controller -> Validators: verify result
Recovery Controller -> History: append recovery outcome
```

# 40. Interaction Diagrams

```text
Engineering Lifecycle Coordinator -> Repository Evolution Authority
Engineering Certification Coordinator -> Eligibility Handoff
Candidate Change Set Authority -> Immutable Candidate Read Port
Repository Evolution Authority -> Repository Adapters
Repository Evolution Authority -> Repository Context Authority
Repository Evolution Authority -> Baseline Authority
Repository Evolution Authority -> Release Evidence Authority
Repository Evolution Authority -> History / Evidence / Observability Ports
```

Mission Control observes state and next action. It does not invoke mutation adapters directly.

# 41. Dependency Diagrams

```text
Candidate Change Set
Validation + Domain Trust
        -> Engineering Certification
        -> Evolution Eligibility Handoff
Target Repository Reality
Evolution Authorization
Adapter Capability
        -> Repository Evolution Transaction
        -> Verified Repository Truth
        -> Certified Context
        -> Successor Baseline
        -> Final Engineering Truth
```

Prohibited dependencies:

```text
Runtime -X-> Repository mutation adapter
Validation -X-> Repository mutation adapter
Certification -X-> Repository mutation adapter
Mission Control -X-> Git or remote adapter
Repository Evolution -X-> Mutable Candidate Workspace
Git adapter -X-> Evolution lifecycle decision
Baseline Authority -X-> Candidate content mutation
```

# 42. APIs

Constitutional operations:

- submit and inspect evolution request;
- admit or reject candidate handoff;
- prepare transaction;
- acquire, renew, inspect, and release leases;
- observe target repository state;
- apply repository unit;
- create local history and references;
- verify local result;
- publish and verify remote result;
- request context synchronization;
- request baseline advancement;
- record release evidence;
- finalize evolution;
- detect and report conflict;
- start and complete rollback or forward recovery;
- record compensation requirement;
- retrieve journal, receipts, report, and audit history.

APIs define typed inputs, outputs, authority, idempotency, fence-token behavior, consistency, timeout, evidence, observability, and failure semantics.

# 43. Interfaces

Required ports:

- Evolution Request and Eligibility Handoff Ports;
- Candidate Change Set Read Port;
- Engineering Certification Status Port;
- Repository Identity and Observation Port;
- Repository Mutation Port;
- Reference, Tag, Publication, and Independent Verification Ports;
- Lease and Trusted Clock Ports;
- Transaction Journal and History Ports;
- Evidence and Report Ports;
- Repository Context Synchronization Port;
- Baseline Advancement Port;
- Release Evidence Port;
- Authorization, Event, Metrics, and Audit Ports;
- Recovery and Compensation Ports.

Git, GitHub, GitLab, filesystem, object database, future VCS, and hosted-repository clients implement these ports. Constitutional code does not invoke their commands directly.

# 44. Testing Strategy

## 44.1 Contract and State Tests

Validate schemas, identity, idempotency, every allowed and forbidden transition, authority, certification handoff, fence tokens, and finalization invariants.

## 44.2 Disposable Repository Tests

Use isolated local repositories and disposable remotes to verify exact tree application, commit and tag behavior, branch protection, target drift, identity, and no mutation outside transaction scope.

## 44.3 Failure Injection

Inject crashes and ambiguous results before and after every journal and side-effect boundary: lease, apply, commit, tag, publish, remote verify, context, baseline, evidence, and finalize.

## 44.4 Recovery Tests

Prove pre-publication rollback, post-publication forward recovery, duplicate retry, stale worker fencing, remote ambiguity suspension, and compensating-candidate handoff.

## 44.5 Concurrency Tests

Test competing candidates, lease races, target drift, multi-repository lock ordering, deadlock prevention, fairness, starvation, and high transaction volume.

## 44.6 Security Tests

Prove credential isolation, malicious Git configuration rejection, hook control, command injection resistance, signature verification, remote substitution prevention, tenant isolation, and key compromise response.

## 44.7 Provenance and Audit Tests

Reconstruct intent-to-baseline lineage from append-only evidence after adapter replacement and datastore restore.

## 44.8 Scale and Soak Tests

Exercise millions of historical transactions, large monorepositories, large multi-repository candidates, long publication delays, evidence growth, recovery backlog, and remote provider rate limits.

# 45. Migration Strategy

1. Inventory and classify every tracked-file and source-control mutation path.
2. Prohibit new direct Git mutation paths through architecture tests and policy.
3. Define Repository Evolution contracts, journal, and adapter interfaces.
4. Wrap existing Git inspection in read-only Repository Observation Port.
5. Convert direct shipping Git operations into a disabled compatibility adapter.
6. Implement dry-run evolution against disposable repositories.
7. Integrate Candidate Change Set and Engineering Certification handoff.
8. Add local-only transaction mode with rollback evidence.
9. Add disposable-remote publication and forward-recovery tests.
10. Integrate Repository Context and Baseline authorities.
11. Activate one low-risk repository target under explicit authority.
12. Migrate release, promotion, and lifecycle consumers to Evolution Records.
13. Remove direct mutation compatibility paths after parity and recovery proof.

Migration uses shadow observation and single-write authority. At no time may direct Git workflows and Repository Evolution both be authorized writers for the same target.

# 46. Backward Compatibility

Existing release contracts, promotions, gate completions, volume promotions, context artifacts, evidence reports, and Git history remain historically valid in their original scopes.

Compatibility adapters may read these artifacts and expose them as legacy evidence. They cannot fabricate Candidate Change Set, Engineering Certification, Evolution Transaction, or successor-baseline lineage.

Existing commands may continue in read-only, planning, validation, and evidence roles. Commands that mutate durable history must migrate behind Repository Evolution or be governably retired. Historical commits are never rewritten to simulate Version 1 evolution provenance.

# 47. Future Evolution

The architecture supports Git and non-Git repositories, content-addressed databases, monorepositories, federated repositories, signed transparency logs, hardware-backed keys, geographically distributed evolution services, and future version-control technologies.

A future adapter may provide true atomic multi-repository publication. PBOS may use that capability only after it proves stronger guarantees through the Repository Mutation Port. The constitutional transaction and evidence model remain unchanged.

AI may prepare transactions, analyze conflicts, and recommend recovery. It cannot authorize evolution, hold unrestricted credentials, choose undeclared merge content, self-certify, or rewrite published history.

# 48. Architectural Invariants

1. Repository Evolution Authority is the only durable repository mutation authority.
2. Every mutation belongs to one admitted transaction identity.
3. Every transaction consumes one exact certified Candidate Change Set.
4. Runtime, Validation, Certification, and Mission Control cannot access mutation credentials.
5. Target identity and head are verified after fenced lease acquisition.
6. Candidate content is applied without implicit modification.
7. Local and remote resulting trees are independently verified.
8. No partial transaction is reported as `EVOLVED`.
9. Pre-publication failure permits rollback; post-publication failure requires forward recovery.
10. Published history is never destructively rewritten automatically.
11. Context and Baseline authorities retain independent ownership.
12. Multi-repository evolution finalizes only after all units verify.
13. Every retry is idempotent and stale workers are fenced.
14. Complete provenance survives adapter and infrastructure replacement.
15. Ambiguous repository reality blocks all further mutation.
16. Git and every future repository technology remain adapters, never authority.

# 49. Why Repository Evolution Deserves Constitutional Authority

Repository mutation is the point where provisional engineering becomes durable institutional truth. It crosses the boundary from reversible candidate work into history consumed by teams, automation, releases, customers, auditors, and future PBOS decisions.

That boundary requires a singular authority capable of verifying certification, serializing targets, protecting credentials, applying exact content, observing external reality, recovering partial effects, and preserving provenance. No executor, validator, certifier, Git command, or human convention individually supplies those guarantees.

Repository Evolution deserves constitutional authority because it owns the irreversible trust transition while remaining constrained by every upstream authority and independently verified downstream result.

# 50. Completion and Definition of Done

Repository Evolution Architecture is implemented only when evidence proves:

- all durable mutation paths pass through one authority;
- direct Runtime, Validation, Certification, Mission Control, and script mutation is impossible;
- exact certified candidates produce exact verified repository trees;
- target locks, fence tokens, and idempotency prevent duplicate or stale mutation;
- every transaction recovers from every injected failure boundary;
- rollback never crosses publication and forward recovery never rewrites history;
- context, baseline, evidence, and provenance complete before finalization;
- multi-repository partial publication cannot masquerade as complete evolution;
- credentials, tenants, targets, and authorities remain isolated;
- audit reconstruction survives infrastructure replacement;
- migration preserves existing history and governance.

# 51. Final Constitutional Directive

Runtime constructs candidates. Validation establishes confidence. Domain certifiers and Engineering Certification Coordinator establish trust. Repository Evolution alone converts that trust into durable repository history. Repository Context Authority certifies resulting reality. Baseline Authority records certified succession.

Git is an adapter. A commit is evidence of a repository effect, not constitutional authorization. Any implementation that permits direct history mutation, implicit content changes, partial finalization, unfenced concurrency, destructive post-publication rollback, or ambiguous recovery is constitutionally non-conforming and shall fail closed.

## Related Documents

- [Autonomous Engineering Lifecycle V2](./PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md)
- [Candidate Workspace Architecture](./PBOS-ENGINE-LIFECYCLE-002_CANDIDATE_WORKSPACE_ARCHITECTURE.md)
- [Engineering Certification Coordination Architecture](./PBOS-ENGINE-LIFECYCLE-003_ENGINEERING_CERTIFICATION_COORDINATION_ARCHITECTURE.md)
- [Candidate Change Set Architecture](./PBOS-ENGINE-LIFECYCLE-004_CANDIDATE_CHANGE_SET_ARCHITECTURE.md)
- [Implementation Directive](./PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md)
- [Implementation Assessment](../REVIEWS/PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md)
