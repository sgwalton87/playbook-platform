---
id: PBOS-ENGINE-LIFECYCLE-004
title: Candidate Change Set Architecture
version: 1.0.0
status: Canonical
classification: Constitutional Engineering Specification
owners:
  - PBOS Engineering Governance
  - Candidate Change Set Authority
layer: Engineering
parent: PBOS-ENGINE-LIFECYCLE-001
depends_on:
  - PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md
  - PBOS-ENGINE-LIFECYCLE-002_CANDIDATE_WORKSPACE_ARCHITECTURE.md
  - PBOS-ENGINE-LIFECYCLE-003_ENGINEERING_CERTIFICATION_COORDINATION_ARCHITECTURE.md
  - PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md
  - PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md
related:
  - Candidate Workspace Authority
  - Validation Authorities
  - Engineering Certification Coordination Authority
  - Repository Context Authority
  - Repository Evolution Authority
  - Evidence Authority
last_updated: 2026-08-01
---

# Executive Architecture Decision

PBOS shall represent every proposed repository evolution as an immutable, content-addressed Candidate Change Set sealed by Candidate Workspace Authority.

The Candidate Change Set is the only engineering construction artifact eligible for Validation, Engineering Certification, and Repository Evolution. Mutable workspace state, execution output streams, branches, textual patches, build packages, evidence bundles, and runtime artifacts may contribute to or describe a candidate, but none may substitute for its constitutional identity.

Candidate identity is defined by a versioned canonical manifest containing certified parent lineage, repository units, normalized resulting trees, mutation inventory, mission contribution ledger, and required provenance references. A textual diff is a transport representation. The resulting tree and declared ancestry are constitutional truth.

This document is the sole governing authority for Candidate Change Set Architecture.

# 1. Architectural Discovery

## 1.1 Existing Concepts

PBOS already contains adjacent but distinct artifacts:

| Existing concept | Existing responsibility | Relationship to Candidate Change Set |
|---|---|---|
| Build Manifest milestone | Declares governed work, dependencies, outputs, and completion | Provides objective and expected-output references |
| Execution Package | Instructs an admitted provider | Contributes mission and intended scope; not candidate content |
| Change Boundary Inventory | Classifies current repository changes | May support legacy migration and scope evidence; not candidate identity |
| Execution Evidence Bundle | Records provider execution and completion evidence | Referenced as provenance and evidence |
| Workspace Snapshot | Captures mutable workspace checkpoint | Final valid snapshot is an input to sealing |
| Workspace Conformance Attestation | Proves workspace governance | Required evidence for candidate admission to certification |
| Milestone Advancement | Records evidence-gated milestone completion | Consumes evolved or otherwise policy-complete evidence; not candidate truth |
| Repository Context | Certifies repository reality | Binds the certified parent and later evolved repository |
| Git patch or branch | Implementation-specific representation | Transport or adapter projection only |

## 1.2 Overlap and Hidden Coupling

Current concepts bind files, package digests, repository context, execution identity, and evidence, but no single immutable object represents the complete proposed resulting repository state. File-backed runtime artifacts and current-working-tree inventories couple candidate interpretation to a mutable checkout. Textual patches can be ambiguous across rename detection, line endings, file modes, binary content, submodules, and diff algorithms.

## 1.3 Missing Abstractions

The architecture requires:

- one immutable candidate subject;
- repository-unit manifests for single- and multi-repository change;
- canonical resulting-tree identity;
- explicit parent lineage and ancestry proof;
- deterministic mutation semantics independent of diff tools;
- ordered mission contribution lineage;
- identity separate from mutable lifecycle status;
- content-addressed storage and verification;
- exact bindings for validation, certification, and evolution;
- replacement, expiration, rejection, retention, and recovery rules.

## 1.4 Simplification Decision

PBOS shall not create separate constitutional objects for patch, diff, file inventory, resulting tree, and promotion package. One Candidate Change Set manifest composes those representations. Its core identity is the declared parent plus normalized resulting content. Auxiliary representations remain verifiable projections.

# 2. Purpose

Candidate Change Set converts completed engineering construction into one immutable object that every downstream authority can evaluate without trusting mutable workspace state.

It provides:

- deterministic content and lineage identity;
- a stable unit of validation and trust;
- complete mission and execution provenance;
- repository-independent transport;
- multi-repository atomic intent;
- immutable evidence correlation;
- safe rejection, replacement, recovery, and retention;
- exact Repository Evolution input.

# 3. Authority

Candidate Change Set Authority owns:

- Change Set schema and canonicalization rules;
- sealing admission;
- identity derivation;
- immutable manifest and content storage;
- integrity verification;
- lifecycle projection and registry;
- replacement, supersession, expiration, rejection, retention, and recovery records;
- Change Set APIs, contracts, validators, and events.

Candidate Workspace Authority is the authorized producer. Candidate Change Set Authority verifies and records the seal; it does not own workspace mutation. No Runtime, provider, validator, certifier, Mission Control process, or Repository Evolution adapter may manufacture or alter a Change Set identity independently.

# 4. Scope

This architecture governs proposed source, configuration, documentation, schema, migration, infrastructure, generated, binary, dependency, and multi-repository changes intended for certified repository history.

It governs content identity and lineage, not the internal execution used to produce content. It does not authorize deployment, release, database execution, certification, or repository mutation.

# 5. Engineering Philosophy

Engineering activity is mutable; engineering trust requires an immutable subject.

A candidate must answer exactly:

- What certified state did this begin from?
- What complete state will exist if it is accepted?
- Which semantic mutations connect those states?
- Which missions and authorities produced them?
- What evidence supports them?
- Can independent systems reconstruct and verify the same result?

PBOS therefore trusts neither a running workspace nor an agent's description of work. It trusts a sealed, normalized, content-addressed result whose lineage and evidence can be independently verified.

# 6. Constitutional Principles

1. **A candidate is immutable after sealing.**
2. **Resulting content is primary; patches are projections.**
3. **Every candidate has an explicit certified parent.**
4. **Identity excludes mutable status and observation time.**
5. **Every content byte and repository semantic is accounted for.**
6. **Validation and certification are non-transferable across identities.**
7. **Multiple mission contributions are ordered and attributable.**
8. **Multi-repository intent is atomic at the candidate level.**
9. **Mutable state never reaches Repository Evolution.**
10. **Rejected and superseded work remains historically attributable.**
11. **Algorithm agility cannot weaken prior identity.**
12. **Ambiguous content, lineage, or provenance fails closed.**

# 7. Lifecycle Position

```text
Candidate Workspace ACTIVE
  -> Runtime mission contributions
  -> Workspace FROZEN
  -> Final Workspace Snapshot
  -> Candidate Seal Request
  -> Candidate Change Set SEALED
  -> VALIDATING
  -> VALIDATED
  -> CERTIFICATION_PENDING
  -> CERTIFIED
  -> EVOLUTION_PENDING
  -> EVOLVED
```

Exceptional states are `BLOCKED`, `REJECTED`, `EXPIRED`, `REVOKED`, `SUPERSEDED`, `RECOVERY_REQUIRED`, and `ARCHIVED`.

The immutable Change Set object does not change state. A separate append-only lifecycle record and reconstructable projection record status.

# 8. Ownership and Responsibilities

| Capability | Authority owner | Prohibited ownership |
|---|---|---|
| Workspace mutation | Candidate Workspace Authority and authorized Runtime | Change Set Authority |
| Seal request | Candidate Workspace Authority | Runtime acting alone |
| Canonical identity | Candidate Change Set Authority | Git or provider adapter |
| Immutable content | Candidate Change Set Authority through storage port | Registry projection |
| Execution provenance | Execution Evidence Authority | Change Set Authority |
| Validation | Validation Authorities | Change Set Authority |
| Engineering trust | Engineering Certification Coordinator | Change Set Authority |
| Repository context | Repository Context Authority | Change Set Authority |
| Repository mutation | Repository Evolution Authority | Change Set Authority |
| Baseline succession | Baseline Authority | Change Set Authority |
| Lifecycle projection | Candidate Change Set Authority | Observability system |

Change Set Authority verifies references but does not reissue the referenced authority's evidence.

# 9. Identity

## 9.1 Identity Layers

PBOS distinguishes:

- **Content Identity:** canonical parent and resulting repository content.
- **Candidate Identity:** content identity plus constitutional scope, mission contribution, and policy-relevant manifest fields.
- **Envelope Digest:** complete stored envelope, including evidence references and creation metadata.
- **Lifecycle Record Identity:** immutable status transition event.

These identities must not be conflated. Lifecycle status, validation findings, certification decisions, and repository evolution outcomes are not included in Candidate Identity because they occur after sealing.

## 9.2 Required Candidate Identity Fields

- specification, schema, canonicalization, and hash-suite versions;
- Candidate Change Set type and repository-set identity;
- organization, mission-set, workspace, and seal authority identities;
- ordered repository-unit identities;
- certified parent baseline, context, commit, and tree identities per repository;
- normalized resulting-tree identity per repository;
- semantic mutation inventory digest;
- mission contribution ledger digest;
- declared scope and expected-output digest;
- required provenance inventory digest.

## 9.3 Identifier Form

The human-readable identifier contains a stable type prefix and truncated canonical hash for usability. The full canonical hash remains authoritative. Friendly names, branch names, ticket numbers, and timestamps are aliases only.

# 10. Immutable Construction

Sealing constructs a candidate in one atomic operation:

```text
Freeze Writers
  -> Verify Workspace and Lease
  -> Read Final Snapshot
  -> Normalize Repository Units
  -> Build Mutation Inventory
  -> Build Mission Contribution Ledger
  -> Verify Provenance References
  -> Compute Resulting Trees
  -> Compute Candidate Identity
  -> Persist Content and Manifest
  -> Verify Read-After-Write
  -> Append SEALED Event
```

No partially persisted candidate is visible. If any step fails, the workspace remains frozen or enters recovery. A candidate cannot be reopened. Further work creates a new workspace revision and candidate.

## 10.1 Why Immutability Is Required

Validation, certification, authorization, and evolution are claims about exact content. If candidate content could change, every downstream decision could become true of one version and be consumed for another. Immutability prevents time-of-check/time-of-use substitution, preserves reproducibility, enables distributed caching, and makes audit evidence durable.

# 11. Canonical Hash

## 11.1 Canonicalization

Canonicalization defines:

- Unicode normalization for paths;
- path separator and relative-root rules;
- byte-preserving file content treatment;
- file type and executable mode;
- symlink target representation;
- deletion, addition, modification, rename, copy, submodule, and repository-link semantics;
- deterministic directory entry ordering;
- duplicate and case-collision detection;
- explicit line-ending policy only where policy declares normalization;
- canonical JSON or binary manifest encoding;
- exclusion rules for ephemeral metadata.

Content is hashed as bytes. Text encoding is not guessed. Rename is recorded as provenance but identity remains derivable from parent and resulting trees even if a diff algorithm classifies it differently.

## 11.2 Merkle Structure

Each file or special entry has a typed leaf hash. Directory hashes cover ordered child names, types, modes, and hashes. Repository-unit hash covers parent identity, resulting root, mutation manifest, and repository metadata. Candidate hash covers ordered repository units and constitutional identity fields.

## 11.3 Domain Separation

Hashes use domain-separated prefixes for file, symlink, directory, repository unit, mutation inventory, mission ledger, candidate manifest, envelope, and event. A digest valid in one domain cannot be substituted in another.

## 11.4 Algorithm Agility

The hash suite is versioned and names the algorithm. Migration adds a new parallel identity attestation rather than rewriting old identities. Unknown, deprecated-for-new-use, or collision-compromised algorithms block new certification while historical verification follows incident policy.

Timestamps, storage locations, validation status, and certification status are excluded from canonical Candidate Identity.

# 12. Baseline Lineage

Every repository unit declares:

- repository and remote identities;
- parent certified baseline;
- parent commit and resulting-tree identities;
- Repository Context decision;
- ancestry proof and branch policy;
- expected Repository Evolution target.

The candidate is a proposed successor to its parent, not proof that the target is still current. Repository Evolution revalidates target ancestry immediately before mutation.

Root candidates require a separately governed genesis baseline. Missing, uncertified, forked without policy, or ambiguous parent lineage blocks sealing.

# 13. Workspace Relationship

Candidate Workspace Authority is the only producer of a seal request. The Change Set references:

- workspace identity and final state revision;
- final snapshot identity;
- Workspace Conformance Attestation requirement;
- active lease and fence token at seal;
- mutation scope and isolation profile;
- ordered mission attempts;
- seal authority and event sequence.

The candidate does not depend on the continued existence of mutable workspace storage. After sealing, it is independently reconstructable from content-addressed objects and manifest.

# 14. Mission Relationship

## 14.1 Single Mission

A single mission contributes one execution lineage entry linking objective, execution package, authority, provider, evidence, intended outputs, and actual mutations.

## 14.2 Multiple Missions

Multiple missions may contribute to one Candidate Change Set only through the one-workspace composition policy defined by Candidate Workspace Architecture.

The Mission Contribution Ledger records a deterministic topological order. Each contribution includes:

- mission and attempt identity;
- predecessor snapshot;
- successor snapshot;
- execution authority and evidence;
- declared and actual path ownership;
- dependencies and ordering reason;
- contribution digest.

Intermediate snapshots make each contribution independently attributable. Parallel contributions require proven disjoint mutation partitions and deterministic composition. Overlap without an explicit resolver blocks sealing.

The final candidate identity binds the full ordered ledger, so removing, reordering, or replacing a mission changes identity.

# 15. Repository Context Relationship

Repository Context Authority certifies the parent repository reality. Candidate content does not replace or refresh that context before evolution.

The Change Set references the parent context decision and records candidate repository identities separately. Validation may construct a read-only **Candidate Context Projection** for analysis, but that projection is not certified repository context.

After Repository Evolution, Repository Context Authority independently observes and certifies the evolved repository. The Change Set cannot certify its own application.

# 16. Validation Relationship

Validation consumes the immutable candidate manifest and content. Every validation result binds:

- Candidate Identity and content identity;
- repository unit or candidate-wide scope;
- validator, toolchain, environment, and policy identities;
- inputs, outputs, findings, and evidence;
- completion and freshness.

Validation may reconstruct a read-only tree from content-addressed storage. It never validates a mutable workspace as a substitute. Any candidate replacement, synchronization, or amendment requires new validation.

# 17. Certification Relationship

Engineering Certification Coordinator treats Candidate Identity as its primary subject. It verifies Change Set Authority, Workspace Conformance, Validation Aggregate, domain certifications, provenance, and policy.

Certification status remains outside the immutable candidate manifest. Certification references the candidate; the candidate does not embed a mutable certification result. Revocation invalidates eligibility but never changes Candidate Identity.

# 18. Repository Evolution Relationship

Repository Evolution accepts only a finalized Engineering Certification eligibility handoff for the exact Candidate Identity.

It shall:

- retrieve content through Candidate Change Set Port;
- verify manifest, hashes, lineage, certification, and target;
- reconstruct the exact resulting trees;
- refuse mutable workspace paths and unverified patches;
- apply all repository units according to the atomicity policy;
- verify resulting repository trees equal the candidate;
- record commit and evolution references externally to the candidate.

## 18.1 Why Mutable State Never Reaches Evolution

Mutable state can change after inspection, contain untracked content, depend on local filesystem semantics, and lose provenance. Repository Evolution therefore receives immutable objects by identity, never a workspace directory, branch working tree, process output, or agent assertion.

# 19. Engineering Provenance

The provenance chain is:

```text
Strategic Intent
  -> Milestone / Objective
  -> Mission Set
  -> Execution Packages
  -> Human and Execution Authorities
  -> Providers and Attempts
  -> Workspace and Snapshots
  -> Execution Evidence
  -> Candidate Change Set
  -> Validation Aggregate
  -> Domain and Engineering Certification
  -> Repository Evolution
  -> Commit, Baseline, and Release Evidence
```

All references are immutable identifiers with digests and authority. Provenance distinguishes creator, requester, executor, validator, certifier, evolution authority, and auditor.

# 20. Engineering Evidence

Candidate evidence inventory references, but does not duplicate or re-own:

- strategic and architecture evidence;
- execution package and authorization;
- provider admission, telemetry, and execution evidence;
- workspace events, snapshots, and conformance;
- mutation inventory and output mapping;
- validation requirements;
- risk, exception, and recovery records.

Evidence required at seal must exist and be integrity-valid. Validation and certification evidence created after sealing references the candidate externally. Evidence availability and retention are policy-bound.

# 21. Storage Model

Candidate content uses content-addressed immutable storage behind Candidate Change Set Port. Logical components:

- canonical manifest store;
- content object store;
- repository-unit and tree index;
- mutation inventory store;
- mission contribution ledger;
- provenance and evidence reference inventory;
- append-only lifecycle history;
- reconstructable registry projection.

Storage location is opaque and excluded from identity. Deduplication across candidates is permitted only when tenant, encryption, access, and legal policies allow it.

# 22. Persistence

Seal persistence is atomic from the constitutional consumer's perspective. Implementations use staging, immutable object writes, manifest commit, read-after-write verification, and append-only event publication.

Acknowledged candidates survive process, node, and declared storage failures. Durability class, replication, backup, restore objective, integrity scan, and retention are explicit. Registry loss cannot destroy candidate content or history; projections are rebuildable.

# 23. Versioning

The specification, schema, canonicalization, hash suite, mutation model, repository-unit model, and policy versions are explicit.

- Minor schema versions may add non-identity optional metadata.
- Any change to identity interpretation requires a major version.
- Readers fail closed on unknown major versions.
- Historical candidates remain verifiable under their recorded versions.
- Migration creates attestations or successor candidates; it never rewrites identity.

# 24. Replacement and Supersession

A Candidate Change Set is never edited. Corrections, rebases, merges, conflict resolutions, evidence-material changes, or policy-required changes produce a replacement candidate.

Replacement records:

- predecessor and successor identities;
- reason and authority;
- changed lineage, content, mission, or policy inputs;
- retained evidence;
- whether predecessor is rejected, expired, revoked, or superseded.

Validation and certification do not transfer. Repository Evolution accepts only the current explicitly eligible candidate.

# 25. Promotion

Promotion is an eligibility transition, not content movement. A candidate becomes evolution-eligible only when:

- integrity and provenance validate;
- parent lineage is trusted;
- Workspace Conformance passes;
- Validation Aggregate passes;
- required domain certifications pass;
- Engineering Certification is current;
- human authorization and target policy pass;
- no rejection, expiration, revocation, supersession, or conflict exists.

The immutable candidate remains in the same content store. Repository Evolution consumes its identity through a separate handoff.

# 26. Rejection

Rejection is an immutable decision linked to the candidate. It includes authority, policy, findings, evidence, remediation classification, and timestamp.

Rejected candidates cannot be promoted. Rejection does not delete content or execution evidence. Remediation produces a new candidate. Administrative disagreement cannot convert rejection to certification without a new governed decision attempt.

# 27. Expiration and Revocation

Candidate content does not expire; eligibility does. Policy may expire a candidate due to parent drift, evidence freshness, dependency age, security events, policy changes, or elapsed review window.

Expiration or revocation appends lifecycle evidence and blocks new evolution. Recertification may restore eligibility only through a new certification attempt if the exact candidate remains valid. Material content or lineage changes require replacement.

# 28. Recovery

Recovery sources are immutable content objects, canonical manifest, seal journal, workspace final snapshot, registry events, and evidence references.

| Failure | Required behavior |
|---|---|
| Seal interrupted before manifest commit | Hide staged objects; resume idempotently or abandon |
| Manifest committed but event missing | Verify manifest and append event idempotently |
| Content object missing | Mark `RECOVERY_REQUIRED`; restore verified replica or reject integrity |
| Registry projection lost | Rebuild from manifest and event history |
| Hash mismatch | Quarantine candidate and suspend all consumers |
| Workspace lost before seal | Recover workspace from snapshot; no candidate is inferred |
| Runtime failed mid-mission | Preserve last snapshot and execution evidence; seal only if mission policy proves terminal completeness |
| Repository Evolution partially consumed | Evolution Authority uses its transaction journal and exact candidate identity |
| Algorithm compromise | Suspend affected eligibility and add verified alternate-hash attestation where authorized |

## 28.1 Runtime Failure and Candidate Integrity

Runtime cannot mutate a sealed candidate. Before sealing, Runtime failure affects only the workspace. Candidate Authority seals only after writers are fenced and completion requirements are proven. Therefore failure cannot produce a half-mutated candidate or silently change a previously identified one.

# 29. Retention

Retention depends on status, certification, evolution, release, legal hold, security investigation, organization policy, and audit requirements.

- evolved candidates and their manifests are permanent repository provenance;
- certified but unevolved candidates persist through expiry and audit closure;
- rejected and superseded candidates persist for governed evidence periods;
- content objects are garbage-collected only when no retained manifest references them;
- legal and security holds override routine cleanup;
- deletion creates an auditable retention disposition without deleting historical identity records.

# 30. Audit History

Audit history records seal request, canonicalization, hash computation, storage verification, validation access, certification attempts, promotion, rejection, expiration, revocation, supersession, recovery, retention, and Repository Evolution consumption.

Every event includes candidate, prior state, next state, revision, actor, authority, policy, evidence, timestamp, sequence, and digest. History is append-only and independently verifiable.

# 31. Observability

One trace correlates candidate with workspace, mission attempts, content store operations, validation, certification, and evolution. Operators can determine:

- whether sealing is active or blocked;
- which content or evidence is missing;
- which downstream authority currently holds the lifecycle;
- whether candidate eligibility is current;
- whether Repository Evolution consumed the candidate;
- whether recovery or retention action is required.

Telemetry does not define candidate identity or state truth.

# 32. Metrics

Required metrics:

- seal requests, success, failure, and duration;
- candidate and repository-unit counts;
- object, manifest, patch, and resulting-tree sizes;
- deduplication ratio;
- validation, certification, rejection, expiration, and supersession rates;
- time from seal to validation, certification, and evolution;
- integrity failures and missing objects;
- multi-mission and multi-repository candidate frequency;
- conflict and replacement rates;
- retention volume and garbage-collection backlog;
- recovery time and outcome.

Metrics are governed by tenant visibility, privacy, cardinality, and retention policy.

# 33. Authorization

Authorization is required for seal request, exceptional inclusion, replacement, rejection, retention override, recovery, and evolution handoff.

Authorization binds:

- candidate or seal-request identity;
- mission, workspace, organization, and repository scope;
- actor, delegation, and separation of duties;
- allowed operation;
- policy, risk, conditions, expiration, and revocation;
- evidence requirements.

Authorization cannot permit post-seal mutation, invalid lineage, omitted content, fabricated evidence, hash bypass, or direct repository evolution.

# 34. Security

- Candidate content is scanned for secrets, malware, prohibited binaries, dependency substitution, license risk, and policy violations.
- Storage is tenant-scoped, encrypted according to classification, access-controlled, and integrity-monitored.
- Hash computation occurs in a trusted sealing boundary after Runtime writers are fenced.
- Canonicalization rejects path traversal, case collisions, Unicode ambiguity, symlink escape, device nodes, unsupported special files, and undeclared submodules.
- Evidence access follows least privilege and purpose limitation.
- Repository Evolution credentials are unavailable to candidate producers and stores.
- Signatures and attestations support key rotation, revocation, and compromise response.
- A compromised producer cannot self-certify or alter sealed content.

# 35. Contracts

Required contracts:

- Candidate Seal Request;
- Candidate Change Set Manifest;
- Repository Unit;
- Parent Lineage Proof;
- Canonical Tree Manifest;
- Semantic Mutation Inventory;
- Mission Contribution Ledger;
- Provenance Inventory;
- Evidence Reference Inventory;
- Candidate Integrity Attestation;
- Candidate Lifecycle Event;
- Candidate Replacement and Supersession;
- Candidate Expiration and Revocation;
- Candidate Recovery Plan and Result;
- Candidate Retention Disposition;
- Candidate Registry Projection;
- Candidate Evolution Receipt.

Contracts are versioned, canonical, immutable where applicable, typed, authority-bound, and fail closed on missing identity or evidence.

# 36. Validators

| Rule | Purpose |
|---|---|
| CCS-001 Seal Authority | Verify Workspace Authority and active seal authorization |
| CCS-002 Workspace State | Verify frozen workspace, writers fenced, final snapshot valid |
| CCS-003 Identity | Verify schema, canonical fields, and domain-separated hashes |
| CCS-004 Parent Lineage | Verify certified baseline, context, commit, tree, and ancestry |
| CCS-005 Repository Units | Verify unique repositories, roots, remotes, and targets |
| CCS-006 Tree Integrity | Verify every entry, mode, type, path, and content object |
| CCS-007 Mutation Inventory | Verify parent-to-result completeness and scope |
| CCS-008 Mission Ledger | Verify ordered contributions and snapshot transitions |
| CCS-009 Provenance | Verify authority and evidence chain |
| CCS-010 Security | Verify secrets, paths, dependencies, binaries, and policy |
| CCS-011 Storage | Verify immutable persistence and read-after-write |
| CCS-012 Multi-Repository Atomicity | Verify all repository units and dependency edges |
| CCS-013 Lifecycle | Verify status event ordering and immutable candidate |
| CCS-014 Eligibility | Verify no rejection, expiry, revocation, or supersession |
| CCS-015 Evolution Receipt | Verify exact resulting trees after consumption |

Validators report deterministic findings. They never normalize silently, repair content, infer files, or rewrite the manifest.

# 37. Events

```text
CANDIDATE_SEAL_REQUESTED
WORKSPACE_WRITERS_FENCED
FINAL_SNAPSHOT_VERIFIED
REPOSITORY_UNIT_NORMALIZED
MUTATION_INVENTORY_CREATED
MISSION_LEDGER_VERIFIED
CANDIDATE_IDENTITY_COMPUTED
CANDIDATE_PERSISTED
CANDIDATE_SEALED
CANDIDATE_VALIDATION_STARTED
CANDIDATE_VALIDATED
CERTIFICATION_REQUESTED
CANDIDATE_CERTIFIED
CANDIDATE_BLOCKED
CANDIDATE_REJECTED
CANDIDATE_EXPIRED
CANDIDATE_REVOKED
CANDIDATE_SUPERSEDED
EVOLUTION_HANDOFF_ISSUED
CANDIDATE_EVOLVED
CANDIDATE_RECOVERY_STARTED
CANDIDATE_RECOVERY_COMPLETED
CANDIDATE_ARCHIVED
```

Events contain candidate, repository set, workspace, mission set, sequence, prior and next state, actor, authority, evidence, policy, trusted time, and digest. Application is idempotent.

# 38. Reports

Human- and machine-readable Candidate Reports include:

- identity and version suite;
- repository units and parent lineage;
- resulting trees and mutation summary;
- mission contribution ledger;
- expected versus actual outputs;
- provenance and evidence inventory;
- integrity and security findings;
- validation and certification references;
- lifecycle, replacement, expiration, and recovery state;
- Repository Evolution receipt when available.

Reports are projections. They cannot replace the canonical manifest or lifecycle history.

# 39. State Machine

```text
SEALING
  -> SEALED
  -> VALIDATING
  -> VALIDATED
  -> CERTIFICATION_PENDING
  -> CERTIFIED
  -> EVOLUTION_PENDING
  -> EVOLVED
  -> ARCHIVED
```

Exceptional transitions:

```text
SEALING -> BLOCKED | RECOVERY_REQUIRED
SEALED | VALIDATING | VALIDATED -> REJECTED | EXPIRED | SUPERSEDED
CERTIFICATION_PENDING | CERTIFIED -> REJECTED | EXPIRED | REVOKED | SUPERSEDED
EVOLUTION_PENDING -> BLOCKED | EXPIRED | REVOKED | SUPERSEDED
ANY NON-ARCHIVED -> RECOVERY_REQUIRED
```

States live in lifecycle records, not the candidate manifest. `EVOLVED` means Repository Evolution verified all declared resulting trees; it does not mutate candidate content.

# 40. Sequence Diagrams

## 40.1 Seal

```text
Workspace Authority -> Change Set Authority: seal request
Change Set Authority -> Lease Port: verify fence token
Change Set Authority -> Snapshot Port: read final snapshot
Change Set Authority -> Context/Baseline Ports: verify parent
Change Set Authority -> Canonicalizer: build repository units and trees
Change Set Authority -> Evidence Port: verify provenance references
Change Set Authority -> Content Store: persist immutable objects
Change Set Authority -> Manifest Store: commit canonical manifest
Change Set Authority -> History: append CANDIDATE_SEALED
```

## 40.2 Validate and Certify

```text
Validation Authority -> Change Set Port: retrieve exact candidate
Validation Authority -> Evidence Port: persist aggregate
Lifecycle Coordinator -> Certification Coordinator: request(candidate)
Certification Coordinator -> Change Set Port: verify identity and eligibility
Certification Coordinator -> Domain Certifiers: resolve trust graph
Certification Coordinator -> History: append decision
```

## 40.3 Evolve

```text
Certification Coordinator -> Repository Evolution: eligibility handoff
Repository Evolution -> Change Set Port: retrieve immutable content
Repository Evolution -> Repository Port: validate target and apply
Repository Evolution -> Repository Port: verify resulting trees
Repository Evolution -> Change Set Authority: evolution receipt
Repository Evolution -> Baseline Authority: successor evidence
```

## 40.4 Runtime Failure

```text
Runtime -> Workspace Authority: failure evidence
Workspace Authority -> Lease Port: fence writer
Workspace Authority -> Snapshot Port: verify last checkpoint
Workspace Authority -> Lifecycle: recover, reject, or resume
Change Set Authority: no action unless a new valid seal request occurs
```

# 41. Interaction Diagrams

```text
Mission Queue -> Lifecycle Coordinator
Lifecycle Coordinator -> Candidate Workspace Authority
Candidate Workspace Authority -> Candidate Change Set Authority
Candidate Change Set Authority -> Content / Manifest / History Ports
Validation Authorities -> Candidate Change Set Port (read-only)
Certification Coordinator -> Candidate Change Set Port (read-only)
Repository Evolution -> Candidate Change Set Port (read-only)
Mission Control -> Registry / Report Ports (read-only)
```

No consumer mutates the Change Set.

# 42. Dependency Diagrams

```text
Certified Baseline + Repository Context
              -> Candidate Workspace
Mission Set -> Workspace Snapshots
Workspace Seal + Provenance + Content
              -> Candidate Change Set
Candidate Change Set -> Validation Aggregate
Candidate + Validation + Domain Trust
              -> Engineering Certification
Certified Candidate -> Repository Evolution
Verified Evolution -> Successor Baseline
```

Prohibited dependencies:

```text
Candidate Change Set -X-> Mutable workspace after seal
Candidate identity -X-> Validation or certification status
Repository Evolution -X-> Runtime output or workspace path
Validation -X-> Candidate mutation
Git diff algorithm -X-> Constitutional identity
Mission Control -X-> Seal or promotion authority
```

# 43. APIs

Constitutional operations:

- submit seal request;
- inspect seal status;
- retrieve candidate manifest by identity;
- stream or retrieve repository-unit content by verified object identity;
- verify candidate integrity;
- retrieve lineage, mutation, mission, provenance, and evidence inventories;
- append authorized lifecycle event;
- reject, expire, revoke, or supersede eligibility;
- request and complete recovery;
- issue evolution handoff reference;
- record and verify evolution receipt;
- apply retention disposition;
- retrieve report and audit history.

APIs specify typed inputs, outputs, authority, idempotency, consistency, timeout, evidence, and failures. They never expose arbitrary mutation of sealed objects.

# 44. Interfaces

Required ports:

- Candidate Seal Request Port;
- Workspace Snapshot and Conformance Ports;
- Parent Baseline and Repository Context Ports;
- Canonicalization Port;
- Candidate Manifest Port;
- Content-Addressed Object Port;
- Mutation Inventory Port;
- Mission Contribution Ledger Port;
- Provenance and Evidence Ports;
- Candidate Registry and History Ports;
- Lifecycle Transition Port;
- Validation Read Port;
- Certification Read Port;
- Repository Evolution Handoff and Receipt Ports;
- Authorization, Trusted Clock, Event, Metrics, and Audit Ports.

Ports are technology-neutral and expose constitutional semantics rather than paths, branches, databases, or vendor APIs.

# 45. Testing Strategy

## 45.1 Canonicalization Tests

Use golden vectors across operating systems, path encodings, file modes, line endings, symlinks, binaries, empty directories where modeled, submodules, renames, deletions, and large files. Independent implementations must compute identical identities.

## 45.2 Immutability and Storage Tests

Prove atomic visibility, write-once behavior, read-after-write verification, corruption detection, replica restore, projection rebuild, deduplication isolation, and garbage-collection safety.

## 45.3 Lineage and Mission Tests

Test certified and invalid parents, forks, multi-mission order, disjoint parallel contributions, overlapping outputs, missing snapshots, and provenance tampering.

## 45.4 Lifecycle Tests

Cover every allowed and forbidden transition, replacement, rejection, expiration, revocation, supersession, evolution receipt, and retention outcome.

## 45.5 Failure and Recovery Tests

Inject failure at every sealing and persistence boundary. Crash Runtime during construction and prove no candidate mutation or fabricated seal. Recover registry, content, manifest, and event failures deterministically.

## 45.6 Integration Tests

Use disposable repositories to integrate Workspace, Validation, Certification Coordinator, and Repository Evolution. Prove exact resulting-tree equivalence and no mutable-path consumption.

## 45.7 Security Tests

Exercise hash substitution, path ambiguity, symlink escape, secret inclusion, malicious archive content, cross-tenant object access, evidence forgery, stale authorization, and compromised signing keys.

## 45.8 Scale Tests

Test large monorepositories, large binaries, thousands of files, hundreds of mission contributions, multi-repository candidates, concurrent sealing, object-store pressure, and long retention histories.

# 46. Migration Strategy

1. Inventory current package, boundary, execution evidence, artifact inventory, and advancement identities.
2. Define canonical golden vectors before implementation.
3. Implement read-only Candidate Manifest and identity contracts.
4. Produce shadow candidates from disposable workspace snapshots.
5. Compare shadow resulting trees with current outputs and Git trees.
6. Add content-addressed storage and atomic seal in non-authoritative mode.
7. Bind existing Validation to shadow Candidate Identity.
8. Bind Engineering Certification Coordinator in advisory mode.
9. Add Repository Evolution dry-run verification.
10. Activate one low-risk candidate path with governed authority.
11. Deprecate direct workspace, patch, and execution-output consumption.

Migration is dual-read/single-write. Existing evidence remains under its original owner. No legacy artifact is rewritten to fabricate Candidate Change Set provenance.

# 47. Backward Compatibility

Existing Execution Packages, Change Boundaries, Execution Evidence Bundles, Product Factory outputs, and milestone records remain valid in their current scopes. Compatibility adapters reference them as provenance inputs.

Legacy completed work that was not sealed as a Candidate Change Set remains historical but cannot automatically claim Change Set conformance. Future Repository Evolution under this architecture requires a conforming candidate.

Existing consumers may read candidate report projections during migration. Once activated, Validation, Certification, and Repository Evolution must use Candidate Identity as their subject and may not fall back silently.

# 48. Future Evolution

The architecture supports distributed object stores, transparency logs, cryptographic signatures, reproducible build attestations, confidential computation, multi-cloud storage, non-Git repositories, generated binary provenance, database and infrastructure changes, and future content-addressing technologies.

Multi-repository candidates may evolve toward governed distributed evolution protocols. Until such a protocol proves atomic trust, a failed repository unit blocks finalization of the complete candidate and requires forward recovery.

AI may propose content, explain mutations, and assist provenance analysis. It cannot define its own scope, seal mutable state, alter canonicalization, self-certify, or authorize evolution.

# 49. Architectural Invariants

1. Exactly one immutable Candidate Identity exists for one canonical manifest.
2. Every candidate derives from certified parent lineage.
3. Every resulting repository byte and semantic entry is identity-covered.
4. Candidate identity is independent of storage location, branch name, diff algorithm, and lifecycle status.
5. A sealed candidate is never mutated.
6. Every validation and certification references the exact Candidate Identity.
7. Multiple mission contributions are ordered, evidence-backed, and identity-covered.
8. Runtime failure cannot create, modify, or complete a candidate without a valid seal.
9. Mutable workspace state never reaches Repository Evolution.
10. Repository Evolution verifies resulting trees equal the candidate.
11. Replacement never transfers trust automatically.
12. Rejection, expiration, revocation, and supersession preserve history.
13. Unknown identity, lineage, content, authority, or recovery reality fails closed.
14. No adapter, report, registry projection, or cache becomes constitutional truth.
15. Candidate Change Set is the only engineering construction artifact eligible for certified repository history.

# 50. Why Candidate Change Set Deserves Constitutional Authority

Candidate Change Set is the stable boundary at which engineering activity becomes governable engineering intent. Without it, downstream systems must trust mutable directories, provider assertions, transient diffs, or environment-dependent repository state. Those inputs cannot support deterministic validation, distributed certification, durable audit, or safe repository evolution.

Constitutional authority is justified because every trust claim and irreversible history mutation depends on a single exact subject. Candidate Change Set provides that subject while preserving separation among construction, confidence, trust, and history.

# 51. Completion and Definition of Done

Candidate Change Set Architecture is implemented only when evidence proves:

- Candidate Workspace seals one immutable, independently retrievable candidate;
- canonical golden vectors produce identical identities across implementations;
- parent lineage and resulting trees are complete and verifiable;
- multiple mission contributions remain deterministic and attributable;
- Runtime failure cannot corrupt candidate identity;
- Validation and Certification bind exact candidates;
- Repository Evolution consumes no mutable construction state;
- replacement, rejection, expiration, recovery, retention, and audit are governed;
- multi-repository candidates preserve declared atomic intent;
- security and tenant boundaries prevent substitution or disclosure;
- compatibility migration preserves existing authority and history.

# 52. Final Constitutional Directive

The Candidate Change Set is PBOS's immutable engineering object. Candidate Workspace produces it. Validation measures it. Domain certifiers and Engineering Certification Coordinator establish trust in it. Repository Evolution applies it. Baseline and Repository Context authorities record the resulting certified reality.

No mutable workspace, branch, patch, provider output, report, cache, runtime artifact, or human assertion may replace it. Any implementation that permits post-seal mutation, identity ambiguity, incomplete lineage, transferred trust, or mutable-state evolution is constitutionally non-conforming and shall fail closed.

## Related Documents

- [Autonomous Engineering Lifecycle V2](./PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md)
- [Candidate Workspace Architecture](./PBOS-ENGINE-LIFECYCLE-002_CANDIDATE_WORKSPACE_ARCHITECTURE.md)
- [Engineering Certification Coordination Architecture](./PBOS-ENGINE-LIFECYCLE-003_ENGINEERING_CERTIFICATION_COORDINATION_ARCHITECTURE.md)
- [Implementation Directive](./PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md)
- [Implementation Assessment](../REVIEWS/PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md)
