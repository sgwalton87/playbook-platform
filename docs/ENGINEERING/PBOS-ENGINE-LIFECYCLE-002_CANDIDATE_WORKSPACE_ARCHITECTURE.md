---
id: PBOS-ENGINE-LIFECYCLE-002
title: Candidate Workspace Architecture
version: 1.0.0
status: Canonical
classification: Constitutional Engineering Specification
owners:
  - PBOS Engineering Governance
  - Candidate Workspace Authority
layer: Engineering
parent: PBOS-ENGINE-LIFECYCLE-001
depends_on:
  - PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md
  - PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md
  - PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md
related:
  - PBOS Runtime
  - PBOS Execution Fabric
  - PBOS Validation
  - PBOS Engineering Certification Coordinator
  - PBOS Repository Context Authority
  - PBOS Repository Evolution Authority
last_updated: 2026-08-01
---

# Executive Architecture Decision

PBOS shall construct software only inside governed Candidate Workspaces derived from certified repository baselines. A Candidate Workspace is the constitutional isolation boundary between autonomous engineering execution and accepted repository history.

Candidate Workspace Authority is the singular owner of workspace identity, provisioning, admission, isolation, lease, mutation scope, sealing, snapshots, synchronization, retention, quarantine, recovery, and cleanup. Runtime may execute within an admitted workspace but cannot create its trust boundary, expand its scope, certify it, or promote it. Repository Evolution may consume a certified Candidate Change Set but cannot use mutable workspace state as repository truth.

This document is the sole governing authority for Candidate Workspace Architecture. Implementations may use Git worktrees, copy-on-write filesystems, containers, virtual filesystems, or future mechanisms only through conforming ports.

# 1. Purpose

Candidate Workspace exists to let PBOS produce real engineering changes without mutating the certified checkout, repository history, certified evidence, or active repository context during ordinary execution.

It provides:

- isolated construction;
- deterministic base identity;
- bounded mutation authority;
- concurrent mission safety;
- immutable change-set production;
- evidence and provenance preservation;
- recoverable failure handling;
- governed handoff to Validation and Repository Evolution.

# 2. Authority and Scope

Candidate Workspace Authority governs every workspace from request through disposal. Its authority applies to source trees, generated outputs, workspace snapshots, leases, mutable candidate state, and sealing operations.

It does not own:

- mission selection or planning;
- execution authorization;
- provider admission;
- mission execution;
- validation decisions;
- certification decisions;
- repository context trust;
- commits, tags, pushes, releases, or baselines;
- durable repository history.

Those responsibilities remain with their existing constitutional owners.

# 3. Constitutional Principles

1. **Certified repository state is read-only to construction.**
2. **Every mutation belongs to one workspace identity.**
3. **Every workspace derives from one certified parent baseline.**
4. **Workspace authority and execution authority are separate.**
5. **Mutation scope cannot expand after admission.**
6. **Mutable workspace contents are never certification evidence by themselves.**
7. **Sealing creates an immutable Candidate Change Set.**
8. **Validation and certification bind to the sealed identity.**
9. **Concurrent workspaces never share writable state.**
10. **Failure preserves evidence and repository trust.**
11. **Cleanup is governed and auditable.**
12. **Infrastructure implementations are replaceable.**

# 4. Engineering Philosophy

Autonomous engineering requires mutation. Constitutional engineering requires that mutation to be isolated, attributable, reviewable, and reversible before acceptance.

Runtime cannot own source mutation boundaries because Runtime is the actor performing work. Allowing the actor to define or expand its own filesystem authority would collapse execution and governance.

Repository History cannot own engineering construction because repository history represents accepted, certified evolution. Recording incomplete attempts, transient files, or rejected work as canonical history would destroy the distinction between activity and trust.

Candidate Workspace is therefore constitutionally required. It is neither a temporary directory nor a cache. It is a governed stateful subsystem whose output is a candidate for trust, not trust itself.

# 5. Lifecycle Position

```text
Mission Queue
  -> Engineering Lifecycle Admission
  -> Candidate Workspace Request
  -> Workspace Provision and Admission
  -> Runtime Execution
  -> Workspace Seal
  -> Candidate Change Set
  -> Validation
  -> Domain Certifications
  -> Engineering Certification
  -> Repository Evolution
  -> Baseline Succession
```

Mission Control observes and presents this lifecycle. It does not create, mutate, seal, certify, or dispose of a workspace directly.

# 6. Ownership and Responsibility Model

| Capability | Authority owner | Validator | Evidence |
|---|---|---|---|
| Workspace request | Engineering Lifecycle Coordinator | Workspace request validator | Mission and authority references |
| Workspace identity | Candidate Workspace Authority | Identity validator | Canonical metadata digest |
| Provisioning | Candidate Workspace Authority | Adapter and base validator | Provisioning record |
| Admission | Candidate Workspace Authority | Scope, lease, security, context validators | Admission decision |
| Source mutation | Authorized Runtime/provider | Workspace mutation guard | Mutation events and resulting content |
| Lease management | Workspace Lease Authority | Fence-token validator | Lease history |
| Snapshot | Candidate Workspace Authority | Snapshot integrity validator | Snapshot manifest |
| Seal | Candidate Workspace Authority | Completeness and content validator | Candidate Change Set |
| Validation | Validation authorities | Validation policy | Validation aggregate |
| Workspace certification input | Engineering Certification Coordinator | Certification policy | Certification decision |
| Promotion | Repository Evolution Authority | Evolution admission validator | Certified Evolution Bundle |
| Rejection | Engineering Lifecycle Coordinator or certifier in scope | State and authority validator | Rejection record |
| Recovery | Candidate Workspace Authority | Recovery-plan validator | Recovery record |
| Cleanup | Candidate Workspace Authority | Retention and lease validator | Cleanup certificate |

No component may act as both workspace owner and engineering certifier for the same transition.

# 7. Candidate Workspace Identity

Workspace identity is immutable and includes:

- `workspace_id`;
- schema and workspace contract versions;
- mission, objective, organization, and tenant identities;
- repository, remote, branch policy, and parent baseline identities;
- parent commit, tree, and Repository Context identities;
- requester, execution authority, provider, and adapter identities;
- allowed paths, prohibited paths, capabilities, and resource policy;
- creation policy, retention class, security class, and isolation profile;
- canonical metadata digest.

Workspace identity excludes mutable status, lease renewal time, telemetry, and current file contents. Those values belong to versioned workspace state.

Two requests with the same mission and idempotency key resolve to the same logical workspace request. They must not provision competing workspaces unless policy explicitly authorizes separate attempts.

# 8. Workspace Registry

Candidate Workspace Registry is the canonical index of workspace identities and current projections. It stores references, not mutable source content.

The registry records:

- workspace identity and state revision;
- current lifecycle state;
- parent baseline and repository identities;
- mission and attempt identities;
- active lease and fence-token reference;
- storage adapter and location reference;
- current snapshot or sealed change-set reference;
- retention, quarantine, and recovery status;
- predecessor, successor, supersession, and disposal references;
- last validated event sequence and projection digest.

Registry history is append-only. The current-state projection is rebuildable from events. Missing, duplicate, conflicting, or out-of-order identities fail closed.

# 9. Workspace Metadata Contract

Every workspace metadata envelope contains:

| Category | Required metadata |
|---|---|
| Identity | workspace, mission, attempt, organization, repository, baseline |
| Authority | requester, workspace authority, execution authority, provider |
| Scope | allowed paths, prohibited paths, capabilities, resource limits |
| Base | commit, tree, context, ancestry proof, dependency snapshots |
| Lifecycle | state, revision, prior state, transition reference |
| Storage | storage class, adapter, opaque location, encryption class |
| Lease | lease identity, owner, expiry, fence token |
| Integrity | manifest digest, snapshot digest, event sequence |
| Retention | retention class, earliest disposal, legal hold |
| Provenance | creator, policy versions, timestamps, correlation chain |

Metadata schemas are versioned. Unknown major versions fail closed. Minor versions may add optional fields only when canonical identity rules remain stable.

# 10. Workspace Isolation

## 10.1 Certified Base Isolation

The certified checkout or baseline object is read-only. A workspace receives a derived copy-on-write view. Runtime and providers cannot mutate the base, its Git references, its remotes, or its certified evidence.

## 10.2 Workspace Isolation

- Each workspace has an independent writable layer.
- Writable layers are never shared between workspace identities.
- Cross-workspace reads require an explicit immutable dependency reference.
- Process, filesystem, network, environment, credential, and resource boundaries are declared in the isolation profile.
- Absolute paths, path traversal, symlink escape, device files, submodule redirection, and mount escape are denied unless explicitly governed.
- Runtime state, caches, telemetry, secrets, and credentials remain outside candidate source content.

## 10.3 Organization Isolation

Workspace storage, logs, metrics, snapshots, evidence, and operational access are tenant-scoped. Cross-organization administration requires delegated authority and complete audit evidence.

# 11. Workspace Creation

Creation sequence:

```text
Validated Request
  -> Idempotency Check
  -> Parent Baseline Verification
  -> Repository Context Verification
  -> Capacity and Policy Admission
  -> Storage Provisioning
  -> Read-only Base Attachment
  -> Writable Layer Creation
  -> Integrity Scan
  -> Registry Append
  -> PROVISIONED
```

Creation fails before admission if any identity, authority, dependency, capacity, isolation, storage, or context requirement is missing. Partial resources are quarantined and reconciled before reuse or cleanup.

# 12. Workspace Authorization

Workspace authorization is capability-based and least privilege. An authorization binds:

- workspace and mission identities;
- verified actor or service principal;
- allowed operations and paths;
- prohibited operations;
- command, network, secret, and resource scope;
- provider and execution authority identities;
- start, expiration, revocation, and delegation conditions;
- evidence and audit requirements.

Workspace authorization cannot authorize certification, repository evolution, baseline advancement, remote mutation, or scope expansion. Expiration, revocation, identity mismatch, lost lease, or stale fence token immediately blocks mutation.

# 13. Multi-Mission and Multi-Workspace Model

## 13.1 Multiple Missions Within One Workspace

Multiple missions may use one workspace only when they form one explicitly declared, ordered candidate composition and share:

- organization and repository identity;
- parent baseline;
- compatible authority and security scope;
- one workspace lease authority;
- non-conflicting output ownership;
- a deterministic mission dependency order.

Each mission produces an intermediate snapshot and evidence record. The final seal identifies the ordered mission set. Parallel mutation inside one workspace is prohibited unless a declared partition proves disjoint writable paths and the Workspace Authority provides atomic composition.

## 13.2 Multiple Workspaces

Multiple workspaces may coexist concurrently when storage and execution capacity permit. They are independent candidates even when based on the same baseline. They cannot share validation or certification merely because their bases match.

Conflicting workspaces are not merged implicitly. Rebase, merge, or regeneration creates a new workspace attempt or Candidate Change Set identity with explicit predecessor lineage.

# 14. Workspace Branch Strategy

Branch names are adapter projections, not constitutional identities. When Git worktrees are used:

- the certified target branch remains read-only;
- each candidate uses an isolated internal reference;
- branch naming is deterministic and collision-resistant;
- candidate references are not pushed by Runtime;
- target-head drift is detected during synchronization and again by Repository Evolution;
- rebasing or merging requires a governed synchronization transition and creates new content identity.

Implementations without Git branches must provide equivalent ancestry and isolation guarantees.

# 15. Workspace Synchronization

Synchronization reconciles a workspace with an updated certified baseline. It is never automatic after mutation.

```text
Synchronization Request
  -> Freeze Workspace
  -> Validate New Baseline
  -> Detect Conflicts
  -> Authorized Rebase/Merge/Regeneration
  -> New Snapshot and Content Identity
  -> Revalidate Scope
  -> Resume or Reject
```

Prior validation and certification do not transfer. The pre-synchronization snapshot is retained according to policy. Unresolvable conflicts produce `BLOCKED` or `SUPERSEDED`, never silent content selection.

# 16. Workspace Snapshots

A snapshot is an immutable recovery checkpoint of workspace content and metadata at a declared event sequence. It contains:

- snapshot identity and workspace revision;
- parent snapshot and baseline identities;
- canonical file inventory, modes, and digests;
- mission progress and execution evidence references;
- mutation-scope validation;
- creation authority and policy;
- integrity digest.

Snapshots do not establish validation or certification. Snapshot frequency is policy-driven at mission boundaries, before synchronization, before risky operations, and before sealing. Content-addressed deduplication is permitted.

# 17. Workspace Sealing and Candidate Change Set

Sealing is the irreversible transition from mutable construction to immutable candidate.

Seal requirements:

- active valid lease and authority;
- all admitted mission executions terminal;
- no active writers or unflushed operations;
- complete file inventory and resulting-tree digest;
- scope, secret, dependency, and integrity scans complete;
- execution and mission evidence referenced;
- parent baseline and ancestry still valid for sealing policy;
- final snapshot persisted.

The seal produces the Candidate Change Set governed by PBOS-ENGINE-LIFECYCLE-001. Any post-seal change requires a new workspace revision and new Candidate Change Set. Sealed source is read-only.

# 18. Workspace Validation

Workspace validation is structural and operational. It proves that the workspace boundary is trustworthy; it does not prove that the product implementation is correct.

Required validation domains:

- identity and registry consistency;
- parent baseline, repository, and context binding;
- ancestry and dependency integrity;
- lease and fence-token validity;
- path and mutation scope;
- isolation profile conformance;
- file inventory and content integrity;
- secret and prohibited-content absence;
- snapshot and event-sequence integrity;
- storage, encryption, and retention policy;
- sealed-state immutability.

Product and engineering validation executes separately against the Candidate Change Set.

# 19. Workspace Certification

Candidate Workspace Authority does not certify engineering correctness. It issues a **Workspace Conformance Attestation** stating that the workspace and seal complied with this architecture.

Engineering Certification Coordinator consumes that attestation with the Candidate Change Set, Validation Aggregate, domain certifications, and Repository Context decision. Missing, stale, revoked, or mismatched workspace conformance blocks engineering certification.

Workspace conformance cannot authorize Repository Evolution independently.

# 20. Workspace Promotion

Workspace source is never promoted directly. Promotion operates on the sealed Candidate Change Set.

Promotion prerequisites:

- workspace conformance attestation;
- immutable Candidate Change Set;
- passing Validation Aggregate;
- required domain certifications;
- current Engineering Certification;
- valid repository target and evolution approval.

Repository Evolution reconstructs or applies the exact Candidate Change Set through its own transaction. Mutable workspace location, branch, or current contents are not trusted inputs.

# 21. Workspace Rejection and Supersession

Rejection preserves workspace identity, final snapshot, change set if sealed, evidence, findings, and authority decision. Rejected content cannot be promoted.

Disposal may occur only after retention eligibility and audit verification. Rejection is not deletion.

Supersession links the old workspace or candidate to a new identity. It does not rewrite history or transfer validation and certification.

# 22. Workspace Recovery

Recovery is owned by Candidate Workspace Authority and uses registry history, leases, snapshots, immutable base, and storage reality.

Recovery cases:

| Failure | Required response |
|---|---|
| Provisioning interrupted | Reconcile partial resources; complete idempotently or quarantine |
| Worker lost | Fence stale worker; restore from latest valid snapshot |
| Lease expired | Block writes; determine owner liveness; never infer completion |
| Mutable content corrupted | Quarantine; reconstruct from base and snapshot or reject |
| Registry projection lost | Rebuild from append-only events |
| Snapshot missing or invalid | Fall back to prior valid snapshot or fail closed |
| Base unavailable | Suspend workspace; restore certified baseline through repository authority |
| Security incident | Revoke authorization, quarantine, preserve forensic evidence |
| Storage outage | Suspend mutations and resume only after integrity verification |
| Seal interrupted | Verify whether immutable change set exists; finalize idempotently or return ACTIVE |

Recovery records incident, authority, affected identities, checkpoint, actions, validation, outcome, and evidence. It cannot expand scope, change the parent baseline, or fabricate candidate completion.

# 23. Workspace Persistence and Workspace Retention

Persistence classes:

- active mutable workspace;
- immutable snapshot;
- sealed Candidate Change Set;
- conformance and audit evidence;
- operational telemetry.

Active mutable storage is durable enough to meet recovery objectives but is not repository history. Snapshots and sealed candidates are content-addressed. Registry and audit history are append-only and replicated according to policy.

Retention considers lifecycle state, engineering certification, repository evolution, legal hold, security investigation, organization policy, cost, and recoverability. A certified candidate is retained through verified evolution and audit closure. A rejected candidate is retained for the required evidence period.

# 24. Workspace Destruction and Workspace Cleanup

Destruction means removal of mutable workspace resources, not erasure of constitutional history.

Cleanup requires:

- terminal or explicitly disposable state;
- no active lease or process;
- retention period satisfied;
- no legal, security, certification, or recovery hold;
- required snapshots and evidence verified;
- cleanup authorization;
- secure deletion appropriate to storage and secret class.

Cleanup produces a certificate containing workspace identity, resources removed, evidence retained, authority, adapter result, timestamp, and digest. Failed cleanup enters `RECOVERY_REQUIRED` and is retried idempotently.

# 25. Workspace Provenance and Workspace Integrity

The provenance chain is:

```text
Strategic Intent
  -> Mission
  -> Execution Authority
  -> Certified Parent Baseline
  -> Repository Context
  -> Workspace Identity
  -> Workspace Events and Snapshots
  -> Execution Evidence
  -> Candidate Change Set
  -> Workspace Conformance Attestation
  -> Validation and Certification
  -> Repository Evolution
```

Every link uses stable identifiers and content digests. Append-only event sequencing and periodic digest checkpoints make silent rewriting detectable. Missing lineage blocks sealing, certification, and promotion.

# 26. Workspace Versioning

Workspace contract, metadata schema, isolation policy, adapter, and lifecycle policy versions are explicit. A workspace retains the versions under which it was admitted.

Policy upgrades do not silently alter active authority. Migration requires compatibility validation and a recorded transition. Breaking schema or identity changes create a new major version and migration plan. Old workspaces remain readable for audit and recovery.

# 27. Workspace Security

- Verified human or service identity is mandatory.
- Separation of duties applies to request, execution, validation, certification, and evolution.
- Provider credentials are workspace- and mission-scoped.
- Repository Evolution and certification credentials are unavailable inside workspaces.
- Secret injection is ephemeral, redacted, non-exportable where possible, and excluded from snapshots.
- Network access is denied by default and allowlisted by destination and purpose.
- Resource quotas prevent denial of service.
- Dependencies and toolchains are identity-bound and integrity-verified.
- Tenant boundaries apply to storage, compute, registry, evidence, telemetry, and administration.
- Security events trigger lease revocation, quarantine, forensic preservation, and impact analysis.

# 28. Workspace Storage and Workspace Performance

The architecture is storage-neutral. Candidate Workspace Port implementations declare consistency, durability, snapshot, encryption, quota, latency, and recovery characteristics.

Performance principles:

- prefer copy-on-write or content-addressed storage over full copies;
- deduplicate immutable base and snapshot content;
- bound workspace, cache, telemetry, and snapshot growth;
- apply backpressure before storage exhaustion;
- measure provisioning, snapshot, seal, validation-read, recovery, and cleanup latency;
- never trade identity, isolation, durability, or verification for speed.

Performance caches cannot become authority and must be safely recomputable.

# 29. Workspace Metrics and Workspace Observability

Required metrics:

- requested, admitted, active, sealed, quarantined, orphaned, and retained counts;
- provisioning and admission latency;
- active age and lease-renewal health;
- storage consumption and growth;
- snapshot and seal duration;
- scope and security violations;
- conflict and synchronization rate;
- recovery and cleanup duration;
- failed adapter operations;
- workspace utilization by organization and provider.

Every workspace event carries mission, workspace, attempt, repository, organization, trace, event sequence, authority, state revision, and outcome identities. Telemetry is observable projection, not lifecycle truth.

# 30. Workspace Auditing

Audit records are append-only and include:

- request, admission, authorization, lease, mutation-scope, snapshot, synchronization, seal, validation, conformance, rejection, recovery, and cleanup decisions;
- actors, service principals, delegates, and organization scope;
- prior and next state digests;
- evidence and policy references;
- adapter side effects and verification;
- security and administrative access.

An independent auditor must reconstruct why the workspace existed, what it could modify, who acted, what changed, what evidence survived, and how it ended.

# 31. Workspace Failure Modes

PBOS fails closed for:

- missing or duplicate workspace identity;
- invalid or uncertified parent baseline;
- stale Repository Context;
- missing execution or workspace authority;
- scope ambiguity or escape;
- conflicting registry state;
- stale lease or fence token;
- shared writable storage;
- unknown adapter or schema version;
- integrity, provenance, snapshot, or event-sequence mismatch;
- secret or prohibited-content detection;
- mutation after sealing;
- missing conformance evidence;
- ambiguous cleanup or recovery state.

Failure never promotes, certifies, deletes, or rewrites history.

# 32. Workspace APIs and Workspace Ports

Constitutional APIs are behavior contracts, not transport or language prescriptions.

## 32.1 Candidate Workspace Port

Operations:

- request;
- provision;
- admit;
- acquire, renew, and release lease;
- open scoped execution handle;
- inspect state;
- snapshot;
- synchronize;
- freeze and resume;
- seal;
- quarantine;
- recover;
- retain;
- dispose.

## 32.2 Registry Port

Operations append events, read identity, compare-and-transition state, list by governed filters, and rebuild projections. Arbitrary mutation is prohibited.

## 32.3 Storage Port

Operations create isolated writable layer, attach immutable base, read/write within authorized scope, snapshot, seal content-addressed output, verify integrity, and securely dispose.

## 32.4 Lease Port

Operations atomically acquire, renew, release, and inspect a lease with monotonic fence token.

## 32.5 Evidence and History Ports

Evidence Port stores immutable content-addressed artifacts. History Port appends ordered events. Neither permits in-place rewriting.

Every operation declares input/output contracts, idempotency, authorization, consistency, timeout, typed failure, evidence, and observability requirements.

# 33. Workspace Contracts

Required contracts:

- Workspace Request;
- Workspace Identity;
- Workspace Metadata;
- Workspace Authorization;
- Workspace Lease;
- Workspace Transition;
- Isolation Profile;
- Mutation Scope;
- Workspace Snapshot;
- Synchronization Request and Result;
- Workspace Seal;
- Candidate Change Set reference;
- Workspace Conformance Attestation;
- Recovery Plan and Result;
- Retention Decision;
- Cleanup Certificate;
- Workspace Audit Event.

Contracts use canonical serialization, explicit schema versions, immutable identifiers, and typed status unions. Empty authority, evidence, scope, or identity fields fail validation.

# 34. Workspace Validators

| Rule | Validator responsibility |
|---|---|
| CW-001 Identity | Unique, canonical, complete identity |
| CW-002 Authority | Verified principal, scope, delegation, expiry |
| CW-003 Base | Certified baseline, commit, tree, context, ancestry |
| CW-004 Isolation | Independent writable layer and boundary profile |
| CW-005 Mutation Scope | Every changed path allowed exactly once and no prohibited path changed |
| CW-006 Lease | Current owner, expiry, and fence token |
| CW-007 Registry | Revision, event sequence, and projection consistency |
| CW-008 Snapshot | Complete inventory and digest chain |
| CW-009 Synchronization | Explicit target, conflict result, new identity |
| CW-010 Seal | Quiescent writers, complete evidence, immutable output |
| CW-011 Provenance | End-to-end identity and evidence chain |
| CW-012 Security | Secrets, malware, dependency, network, and tenant policy |
| CW-013 Retention | Policy, hold, and disposal eligibility |
| CW-014 Recovery | Authorized plan, checkpoint, evidence, validation |
| CW-015 Conformance | All required workspace rules passed for exact seal |

No validator may repair its subject silently. Findings are deterministic, attributable, and evidence-producing.

# 35. Workspace Events

Required event types:

```text
WORKSPACE_REQUESTED
WORKSPACE_PROVISIONED
WORKSPACE_ADMITTED
LEASE_ACQUIRED
LEASE_RENEWED
WORKSPACE_ACTIVATED
MISSION_STARTED
MISSION_CHECKPOINTED
MISSION_COMPLETED
WORKSPACE_FROZEN
WORKSPACE_SYNCHRONIZED
SNAPSHOT_CREATED
WORKSPACE_SEALED
WORKSPACE_VALIDATED
WORKSPACE_CONFORMANCE_ISSUED
WORKSPACE_REJECTED
WORKSPACE_QUARANTINED
RECOVERY_STARTED
RECOVERY_COMPLETED
RETENTION_APPROVED
WORKSPACE_DISPOSED
```

Events include identity, sequence, prior and next states, revision, actor, authority, evidence, policy, timestamp from the trusted clock, and digest. Delivery may be at least once; application is idempotent.

# 36. Workspace State Machine

```text
REQUESTED
  -> PROVISIONING
  -> PROVISIONED
  -> ADMITTED
  -> ACTIVE
  -> FROZEN
  -> SEALED
  -> VALIDATING
  -> RETAINED
  -> DISPOSED
```

Exceptional transitions:

```text
REQUESTED | PROVISIONING -> BLOCKED
ACTIVE | FROZEN -> RECOVERY_REQUIRED
ANY NON-DISPOSED -> QUARANTINED
ACTIVE | FROZEN | SEALED -> REJECTED
SEALED | RETAINED -> SUPERSEDED
PROVISIONED | ADMITTED | ACTIVE -> EXPIRED
```

`DISPOSED` is terminal. `SEALED` forbids source mutation. Recovery returns only to a state proven by authoritative evidence; it does not automatically return to `ACTIVE`.

# 37. Sequence Diagrams

## 37.1 Creation and Execution

```text
Lifecycle Coordinator -> Workspace Authority: request(mission, base, scope)
Workspace Authority -> Context Authority: verify(base context)
Workspace Authority -> Storage Port: provision isolated layer
Workspace Authority -> Registry: append PROVISIONED
Workspace Authority -> Lease Port: acquire fence token
Workspace Authority -> Execution Fabric: scoped workspace handle
Execution Fabric -> Runtime Provider: execute within scope
Runtime Provider -> Workspace: candidate mutations
Runtime Provider -> Evidence Port: execution evidence
```

## 37.2 Seal and Validation

```text
Lifecycle Coordinator -> Workspace Authority: seal request
Workspace Authority -> Runtime: quiesce writers
Workspace Authority -> Validators: scope, integrity, security
Workspace Authority -> Snapshot Port: final snapshot
Workspace Authority -> Change Set Port: immutable seal
Workspace Authority -> Registry: append WORKSPACE_SEALED
Validation Authority -> Change Set Port: read exact candidate
Validation Authority -> Evidence Port: validation aggregate
```

## 37.3 Certification and Promotion

```text
Workspace Authority -> Certification Coordinator: conformance attestation
Domain Certifiers -> Certification Coordinator: scoped trust decisions
Certification Coordinator -> History: engineering certification
Lifecycle Coordinator -> Repository Evolution: certified bundle
Repository Evolution -> Change Set Port: read exact content
Repository Evolution -> Repository: apply and verify transaction
Repository Evolution -> Baseline Authority: verified evolution
```

## 37.4 Failure and Recovery

```text
Observer -> Workspace Authority: failure evidence
Workspace Authority -> Lease Port: fence active writer
Workspace Authority -> Registry: RECOVERY_REQUIRED
Workspace Authority -> Snapshot Port: verify checkpoint
Workspace Authority -> Storage Port: reconstruct or quarantine
Workspace Validators -> Workspace Authority: recovery validation
Workspace Authority -> History: recovery outcome
```

# 38. Dependency and Interaction Diagrams

```text
Mission Queue
  -> Engineering Lifecycle Coordinator
  -> Candidate Workspace Authority
       -> Repository Context Port (read trust decision)
       -> Baseline Port (read certified base)
       -> Storage / Registry / Lease / Snapshot / History Ports
       -> Execution Fabric (scoped handle)
       -> Validation (sealed read-only candidate)
       -> Certification Coordinator (conformance only)
       -> Repository Evolution (certified change set only)
```

Prohibited dependencies:

```text
Runtime -X-> Workspace Registry mutation
Runtime -X-> Certified checkout
Runtime -X-> Git commit/tag/push
Workspace Authority -X-> Engineering certification
Validation -X-> Workspace mutation
Repository Evolution -X-> Mutable workspace as truth
Mission Control -X-> Workspace lifecycle mutation
```

# 39. Testing Strategy

## 39.1 Contract Tests

Validate schemas, canonical identities, state transitions, idempotency, authority, leases, storage classes, and typed failures.

## 39.2 Isolation Tests

Prove certified-base immutability, cross-workspace isolation, tenant isolation, symlink and path escape rejection, secret separation, network policy, and credential unavailability.

## 39.3 Lifecycle Tests

Cover every allowed and prohibited transition, duplicate delivery, stale revision, lease loss, expiration, quarantine, rejection, supersession, retention, and disposal.

## 39.4 Concurrency Tests

Test multiple workspaces on one baseline, competing leases, stale fence tokens, shared-output conflicts, deterministic multi-mission ordering, storage exhaustion, and fairness.

## 39.5 Recovery Tests

Inject failure before and after provisioning, registry append, lease acquisition, mutation, snapshot, synchronization, sealing, conformance, and cleanup. Restart from persistent state and prove no fabricated progress.

## 39.6 Integration Tests

Use disposable repositories and isolated storage to integrate Context Authority, Execution Fabric, providers, Validation, Certification Coordinator, and Repository Evolution without mutating the developer checkout.

## 39.7 Scale and Soak Tests

Measure thousands of workspace records, concurrent provisioning, long-running leases, snapshot growth, event replay, cleanup backlog, and recovery objectives.

## 39.8 Security Tests

Exercise compromised credentials, revoked authority, malicious paths, dependency substitution, secret exfiltration, tenant crossover, registry tampering, and forensic preservation.

# 40. Migration Strategy

Migration is incremental:

1. Inventory all current construction writes and classify them.
2. Introduce Candidate Workspace contracts and ports without changing execution.
3. Add a filesystem adapter in shadow mode and verify identity behavior.
4. Route one low-risk mission to an isolated workspace.
5. Produce Candidate Change Set and conformance evidence without promotion.
6. Integrate existing Validation against sealed candidates.
7. Integrate Engineering Certification Coordinator.
8. Integrate Repository Evolution in dry-run, local-only, then governed remote modes.
9. Expand mission coverage and concurrency only after recovery evidence.
10. Deprecate direct construction writes to the certified checkout.

Migration uses dual-read/single-write compatibility. There may never be two workspace authorities or two canonical writers for the same state.

# 41. Backward Compatibility

Existing Kernel, planner, Mission Control, Runtime, Execution Fabric, Repository Context, validation, and certification commands remain operational during migration. Compatibility adapters translate existing execution packages and output scopes into workspace requests.

Legacy direct-write missions cannot claim Candidate Workspace conformance. Their support is temporary, explicitly identified, and removed through governed deprecation after equivalent workspace execution is proven.

Historical runtime and evidence artifacts remain readable and are not rewritten to simulate workspace provenance.

# 42. Rollback Strategy

Before Candidate Workspace becomes mandatory, rollback disables the new adapter and restores the prior execution route without altering history. Shadow registry and conformance records remain evidence.

After a mission begins in a workspace, rollback means cancel, snapshot, quarantine, or reject that workspace. Candidate content is never copied into the certified checkout as a rollback shortcut.

After repository evolution, rollback is outside Workspace Authority. It requires a new compensating Candidate Change Set governed by Repository Evolution.

# 43. Implementation Guidance

Implementation should begin with contracts, pure validators, state reduction, and ports. It should then add one local isolated adapter suitable for disposable test repositories.

Recommended implementation boundaries:

- workspace constitutional domain and state reducer;
- workspace authority service;
- registry, storage, lease, snapshot, evidence, and history ports;
- local filesystem or Git-worktree adapters beneath those ports;
- Execution Fabric integration using opaque workspace handles;
- compatibility adapter for current execution packages.

Do not create a second Runtime, planner, certification system, context system, or repository owner. Do not expose raw filesystem paths as authority. Do not allow adapters to initiate lifecycle transitions.

# 44. Future Evolution

The architecture supports future container, virtual filesystem, remote development, cloud workspace, confidential-compute, mobile build, hardware build, AI-agent, and multi-repository implementations through ports.

Future evolution may add hierarchical workspaces, federated regions, policy-attested build environments, reproducible environment images, and organization-managed workspace providers. Such additions must preserve single authority, immutable bases, isolated mutation, sealed candidates, and evidence-bound promotion.

# 45. Completion and Definition of Done

Candidate Workspace Architecture is implemented only when evidence proves:

- ordinary engineering execution leaves the certified checkout unchanged;
- every source mutation occurs in one admitted workspace;
- workspaces are identity-, tenant-, and lease-isolated;
- multiple missions and workspaces behave deterministically;
- sealing produces an immutable Candidate Change Set;
- validation and certification bind the exact sealed digest;
- rejected work cannot be promoted and is governably retained or disposed;
- recovery succeeds without fabricated completion or lost evidence;
- Runtime cannot commit, tag, push, certify, or expand workspace scope;
- Repository Evolution consumes only certified change sets;
- audit reconstruction is complete;
- compatibility migration preserves existing PBOS governance.

# 46. Final Constitutional Directive

Candidate Workspace is the mandatory constitutional construction boundary for autonomous PBOS engineering. Runtime executes within it. Workspace Authority governs it. Validation reads its sealed output. Certification evaluates that immutable output. Repository Evolution alone records accepted change.

No implementation may substitute a mutable checkout, temporary directory, cache, branch name, Runtime session, or repository commit for Candidate Workspace authority. Any ambiguity in workspace identity, scope, isolation, provenance, lease, integrity, recovery, or promotion fails closed.

## Related Documents

- [Autonomous Engineering Lifecycle V2](./PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md)
- [Implementation Directive](./PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md)
- [Lifecycle README](./README_PBOS_ENGINE_LIFECYCLE.md)
- [Implementation Assessment](../REVIEWS/PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md)
