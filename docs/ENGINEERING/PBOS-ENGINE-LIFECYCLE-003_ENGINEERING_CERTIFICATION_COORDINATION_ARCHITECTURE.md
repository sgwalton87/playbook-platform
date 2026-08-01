---
id: PBOS-ENGINE-LIFECYCLE-003
title: Engineering Certification Coordination Architecture
version: 1.0.0
status: Canonical
classification: Constitutional Engineering Specification
owners:
  - PBOS Engineering Governance
  - Engineering Certification Coordination Authority
layer: Engineering
parent: PBOS-ENGINE-LIFECYCLE-001
depends_on:
  - PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md
  - PBOS-ENGINE-LIFECYCLE-002_CANDIDATE_WORKSPACE_ARCHITECTURE.md
  - PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md
  - PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md
related:
  - Repository Context Authority
  - Candidate Workspace Authority
  - Validation Authorities
  - Domain Certification Authorities
  - Repository Evolution Authority
  - Baseline Authority
  - Release Evidence Authority
last_updated: 2026-08-01
---

# Executive Architecture Decision

PBOS shall coordinate engineering certification through a deterministic Engineering Certification Coordinator that aggregates independent domain trust decisions for one immutable Candidate Change Set.

The Coordinator is not a universal certifier. It cannot issue domain trust, execute validation, mutate candidates, generate repository context, certify release evidence, advance baselines, or evolve repository history. It owns only the aggregate engineering certification transaction and its decision.

Existing certification authorities remain constitutionally independent. The Coordinator resolves which decisions are required, verifies their authority and bindings, evaluates the certification graph, and issues one atomic engineering decision that Repository Evolution may consume.

This document is the sole governing authority for Engineering Certification Coordination.

# 1. Purpose

PBOS contains multiple certification authorities because different trust claims require different expertise, evidence, policy, and accountability. Engineering Certification Coordination provides one governed way to compose those claims without centralizing their ownership.

The Coordinator answers:

- What exact engineering candidate is being certified?
- Which domain certifications are required?
- Are all decisions current, authoritative, complete, and mutually consistent?
- Does the evidence establish sufficient engineering trust?
- Is the candidate eligible for Repository Evolution?
- Can the decision be reconstructed, suspended, revoked, or recovered?

# 2. Authority

Engineering Certification Coordination Authority is the singular owner of:

- certification request admission;
- certification dependency resolution;
- certification graph construction and evaluation;
- aggregate decision ordering;
- aggregate engineering certification identity;
- certification transaction history;
- certification status projection;
- propagation of domain expiration, suspension, revocation, and supersession into aggregate status.

It has no authority to alter a domain decision or substitute itself for a missing certifier.

# 3. Scope

This architecture governs engineering certification for Candidate Change Sets intended for Repository Evolution. It includes coordination of repository context, workspace conformance, validation confidence, security, governance, execution evidence, provider trust, interface and accessibility conformance, capability certification, release evidence, and other domain decisions required by policy.

It does not govern the internal decision logic of those certifiers. It does not certify production deployment unless production policy declares deployment certification as a required domain decision.

# 4. Constitutional Principles

1. **Trust remains federated.** Domain authorities retain their constitutional scopes.
2. **Aggregation is not substitution.** Missing trust is never inferred.
3. **One candidate, one aggregate subject.** Every decision binds the exact Candidate Change Set digest.
4. **Confidence is not trust.** Validation results cannot replace certification.
5. **Partial certification is prohibited.** The externally consumable decision is atomic.
6. **Ordering is deterministic.** Graph topology and stable identifiers determine evaluation order.
7. **Decisions are immutable.** Changed evidence produces a new attempt and identity.
8. **Current trust is required.** Expired, suspended, revoked, or superseded inputs cannot authorize evolution.
9. **Repository mutation remains separate.** Certification creates trust, not history.
10. **Failure preserves evidence.** Rejection and recovery never erase prior decisions.
11. **Authority precedes policy evaluation.** An unauthorized PASS has no trust value.
12. **Every conclusion is explainable.** Inputs, rules, dependencies, findings, and authorities are reconstructable.

# 5. Certification Philosophy

Engineering certification is a constitutional composition of trust claims, not a weighted opinion and not a test summary.

A domain certifier answers a scoped question such as:

- Is this repository context trusted?
- Did this execution occur under valid authority?
- Does this interface satisfy its constitutional requirements?
- Is this provider certified for the declared capability?
- Is this evidence complete and authentic?

The Coordinator answers only:

> Do all required, authoritative, current, mutually consistent trust decisions permit this exact candidate to enter Repository Evolution under the active engineering policy?

# 6. Trust Model

## 6.1 Trust Subjects

Primary subject:

- immutable Candidate Change Set.

Bound supporting subjects:

- mission and execution package;
- Candidate Workspace and conformance attestation;
- certified parent baseline;
- repository and context identity;
- execution authority, provider, assignment, and evidence;
- Validation Aggregate;
- domain artifacts and certifications;
- target repository and evolution policy.

## 6.2 Trust Claims

Every certification claim declares:

- claim identity and type;
- subject identity and digest;
- issuer and authority scope;
- policy and validator versions;
- evidence and dependency identities;
- decision and conditions;
- issue, effective, expiration, suspension, revocation, and supersession data;
- canonical digest and optional signature.

## 6.3 Trust States

```text
CANDIDATE | PENDING | CERTIFIED | BLOCKED | REJECTED
SUSPENDED | EXPIRED | REVOKED | SUPERSEDED
```

`CERTIFIED` is affirmative trust. `BLOCKED` means a required determination cannot currently be made. `REJECTED` is a completed negative decision. The remaining states invalidate prior affirmative eligibility.

# 7. Engineering Confidence

Engineering Confidence is the deterministic output of Validation. It summarizes correctness evidence for the exact Candidate Change Set and environment.

It may include:

- lint, format, type, unit, integration, and build results;
- security, dependency, privacy, accessibility, performance, and governance findings;
- coverage and quality metrics;
- toolchain, environment, policy, and input identities;
- completeness and freshness assessment.

Confidence may be represented as pass/fail requirements plus governed measurements. A numeric score is advisory unless a constitutional policy defines an explicit threshold. Confidence does not authorize certification, resolve authority, or permit Repository Evolution.

# 8. Engineering Trust

Engineering Trust is the aggregate constitutional conclusion that the exact candidate is eligible for Repository Evolution under the active policy.

Trust requires:

- valid identity and provenance;
- trusted parent baseline and repository context;
- conforming Candidate Workspace and immutable change set;
- complete Engineering Confidence;
- all required domain certifications;
- valid authority and separation of duties;
- no unresolved revocation, conflict, or blocking condition;
- an atomic Coordinator decision.

Engineering Trust is non-transferable. Rebase, merge, amendment, policy material change, or evidence replacement produces a new candidate or certification attempt.

# 9. Coordinator Responsibilities

The Coordinator shall:

- admit certification requests;
- resolve active certification policy;
- construct and validate the certification graph;
- request or discover required domain decisions through ports;
- verify issuer identity and constitutional authority;
- validate evidence identity, freshness, integrity, and subject binding;
- evaluate graph dependencies in deterministic order;
- detect conflicting or duplicate authority;
- issue one aggregate decision;
- persist immutable certification evidence and append-only history;
- publish events and operational metrics;
- reassess aggregate status when an input expires, is suspended, revoked, or superseded;
- provide deterministic recovery and audit reconstruction.

# 10. Coordinator Authority

The Coordinator may:

- reject malformed or unauthorized requests;
- block while required decisions are absent;
- request current decisions from registered domain certifiers;
- verify decisions and evidence;
- order graph evaluation;
- issue, suspend, expire, revoke, or supersede aggregate engineering certification when policy conditions are met;
- authorize a certification handoff to Repository Evolution.

It may not compel a certifier to produce PASS, rewrite a decision, weaken policy, or ignore a required dependency.

# 11. Coordinator Limits

The Coordinator shall not:

- execute missions or validators;
- own Candidate Workspaces or change sets;
- create repository or context truth;
- generate domain certification;
- interpret missing evidence as PASS;
- average conflicting decisions;
- self-approve policy exceptions;
- commit, tag, push, deploy, release, or advance a baseline;
- certify mutable content;
- expose Repository Evolution credentials;
- mutate prior certification attempts;
- silently recertify after material change.

# 12. Coordinator Inputs

Required input envelope:

| Input | Required binding |
|---|---|
| Certification request | Candidate, requester, organization, policy, idempotency key |
| Candidate Change Set | Parent baseline, resulting tree, patch, evidence digest |
| Workspace conformance | Workspace and candidate seal identity |
| Validation Aggregate | Candidate, tools, environment, policy, completion |
| Domain certifications | Exact subjects, issuers, policy, status, validity |
| Repository Context decision | Parent repository reality and trusted context |
| Execution provenance | Package, authority, assignment, provider, evidence |
| Target policy | Repository, branch, organization, risk, release class |
| Human authority | Requester, reviewer, approval, separation of duties |
| Trusted clock | Freshness, expiration, and ordering |

Unknown, mutable, incomplete, or mismatched inputs fail admission.

# 13. Coordinator Outputs

The Coordinator produces:

- immutable Engineering Certification Decision;
- Certification Graph manifest and evaluation result;
- verified input inventory;
- passed, failed, blocked, and advisory finding sets;
- conditions and validity period;
- revocation and supersession dependencies;
- Repository Evolution eligibility statement;
- human-readable Certification Report;
- machine-readable events, metrics, and audit record.

Output status is one of `CERTIFIED`, `BLOCKED`, `REJECTED`, `SUSPENDED`, `EXPIRED`, `REVOKED`, or `SUPERSEDED`.

# 14. Certification Pipeline

```text
Runtime Completion
  -> Candidate Workspace Seal
  -> Validation Aggregate
  -> Certification Request
  -> Policy Resolution
  -> Certification Graph Construction
  -> Authority and Identity Validation
  -> Domain Decision Collection
  -> Dependency Evaluation
  -> Atomic Engineering Decision
  -> Evolution Eligibility Handoff
  -> Continuous Trust Monitoring
```

Runtime initiates certification indirectly by completing governed execution and producing evidence. Engineering Lifecycle Coordinator submits the certification request only after the candidate is sealed and validated. Runtime cannot invoke a certifier with a request that bypasses lifecycle admission.

# 15. Certification Ordering

Ordering rules:

1. identity and request authority;
2. Candidate Change Set immutability;
3. parent baseline and Repository Context;
4. Workspace Conformance Attestation;
5. Execution provenance and evidence;
6. Validation Aggregate completion;
7. independent domain certifications according to graph topology;
8. policy conditions and human approval;
9. aggregate engineering decision;
10. Repository Evolution handoff.

Independent domain decisions may be collected concurrently. Evaluation order is a stable topological sort using rule identity as the tie-breaker. Arrival time never changes the outcome.

# 16. Certification Dependencies

Dependencies are declared by versioned Certification Policy. Each dependency specifies:

- certification type and authority;
- subject relationship;
- required status;
- freshness and expiration;
- evidence requirements;
- predecessor dependencies;
- conditional applicability;
- revocation propagation;
- blocking severity.

Dependencies cannot be invented at runtime. Unknown types, unresolved conditions, duplicate authorities, cycles, or missing required nodes block certification.

# 17. Certification Graph

```text
Repository Context Certification ----\
Parent Baseline Certification --------+---> Candidate Identity
Workspace Conformance ----------------/

Execution Authority ------------------\
Provider Certification ----------------+---> Execution Provenance
Execution Evidence Certification ------/

Validation Aggregate -----------------\
Security Certification ----------------+
Interface / Accessibility Certification +---> Domain Trust Aggregate
Capability / Architecture Certification /

Candidate Identity
Execution Provenance
Domain Trust Aggregate
Human Approval
Policy
        -> Engineering Certification Decision
        -> Repository Evolution Eligibility
```

The graph is a directed acyclic graph. Every edge declares why the parent claim is required. Graph identity includes the canonical node and edge inventory, policy version, and subject digest.

# 18. Certification Registry

Engineering Certification Registry records:

- request and attempt identities;
- candidate and graph identities;
- active policy;
- required domain authorities;
- current aggregate status and revision;
- certification, expiration, suspension, revocation, and supersession references;
- Repository Evolution handoff status;
- event sequence and projection digest.

The registry is an index, not the evidence store. Its current projection is reconstructable from append-only events. It cannot mutate domain registries or override their decisions.

# 19. Certification Contracts

Required contracts:

- Engineering Certification Request;
- Certification Policy;
- Certification Graph;
- Domain Certification Reference;
- Domain Trust Claim;
- Validation Aggregate Reference;
- Repository Context Certification Reference;
- Workspace Conformance Reference;
- Certification Evaluation;
- Engineering Certification Decision;
- Certification Suspension;
- Certification Revocation;
- Certification Supersession;
- Repository Evolution Eligibility Handoff;
- Certification Recovery Plan and Result;
- Certification Audit Event.

Contracts use explicit schema versions, canonical serialization, immutable identifiers, typed states, authority references, and content digests.

# 20. Certification Validators

| Rule | Purpose |
|---|---|
| EC-001 Request Identity | Validate request, candidate, organization, and idempotency identity |
| EC-002 Candidate Integrity | Prove immutable change set and parent ancestry |
| EC-003 Graph Integrity | Prove unique nodes, resolved edges, acyclicity, deterministic order |
| EC-004 Authority | Verify each issuer and scope |
| EC-005 Subject Binding | Bind every claim to its exact subject |
| EC-006 Evidence Integrity | Verify evidence identity, digest, provenance, and availability |
| EC-007 Freshness | Verify effective, expiration, suspension, and revocation state |
| EC-008 Validation Confidence | Verify complete required Validation Aggregate |
| EC-009 Context Trust | Verify Repository Context Authority decision |
| EC-010 Workspace Conformance | Verify Candidate Workspace seal and attestation |
| EC-011 Execution Provenance | Verify authority, provider, assignment, and evidence lineage |
| EC-012 Domain Completeness | Verify all applicable domain decisions exist |
| EC-013 Decision Consistency | Reject conflicting decisions and duplicate authority |
| EC-014 Separation of Duties | Verify requester, executor, validator, certifier, and approver boundaries |
| EC-015 Policy | Apply exact versioned policy without undeclared inference |
| EC-016 Transaction Atomicity | Prevent partial externally visible certification |
| EC-017 Evolution Handoff | Bind current certification to exact target eligibility |
| EC-018 Recovery | Verify recovery authority, checkpoint, and evidence |

Validators produce deterministic findings and cannot repair, waive, or rewrite inputs.

# 21. Certification Events

Required events:

```text
CERTIFICATION_REQUESTED
CERTIFICATION_ADMITTED
POLICY_RESOLVED
GRAPH_CONSTRUCTED
DOMAIN_DECISION_REQUESTED
DOMAIN_DECISION_RECEIVED
DOMAIN_DECISION_REJECTED
GRAPH_EVALUATED
CERTIFICATION_BLOCKED
CERTIFICATION_REJECTED
CERTIFICATION_ISSUED
CERTIFICATION_SUSPENDED
CERTIFICATION_EXPIRED
CERTIFICATION_REVOKED
CERTIFICATION_SUPERSEDED
EVOLUTION_HANDOFF_ISSUED
RECERTIFICATION_REQUIRED
CERTIFICATION_RECOVERY_STARTED
CERTIFICATION_RECOVERY_COMPLETED
```

Events include attempt, candidate, graph, organization, sequence, prior and next status, actor, authority, evidence, policy, trusted timestamp, and digest. Delivery may be at least once; application is idempotent.

# 22. Certification Reports

Every completed attempt produces a human-readable and machine-readable report containing:

- candidate and parent identities;
- scope and target;
- policy and graph;
- domain decision inventory;
- engineering confidence summary;
- passed, blocked, failed, and advisory findings;
- authorities and separation-of-duties assessment;
- provenance and evidence references;
- aggregate decision and conditions;
- validity, revocation, and supersession rules;
- Repository Evolution recommendation;
- recovery or remediation guidance;
- report digest.

Reports explain trust; they do not become a second decision source.

# 23. Certification Decisions

## 23.1 CERTIFIED

All required graph nodes pass, authority is valid, evidence is complete, and no blocking condition exists. Repository Evolution eligibility may be issued.

## 23.2 BLOCKED

A required decision or authoritative fact is unavailable, pending, stale, or ambiguous. No eligibility is issued.

## 23.3 REJECTED

A completed negative determination exists. Remediation requires a new candidate, new domain decision, or new certification attempt according to policy.

## 23.4 SUSPENDED, EXPIRED, REVOKED, SUPERSEDED

These states remove evolution eligibility. They preserve the original decision and append the subsequent trust event.

# 24. Certification State Machine

```text
REQUESTED
  -> ADMITTED
  -> COLLECTING
  -> EVALUATING
  -> CERTIFIED | BLOCKED | REJECTED

CERTIFIED -> SUSPENDED | EXPIRED | REVOKED | SUPERSEDED
BLOCKED -> COLLECTING | REJECTED | SUPERSEDED
SUSPENDED -> COLLECTING | REVOKED | EXPIRED | SUPERSEDED
```

`REJECTED`, `REVOKED`, `EXPIRED`, and `SUPERSEDED` are terminal for an attempt. New evaluation creates a new attempt identity. A prior `CERTIFIED` record remains historical even after its eligibility ends.

# 25. Certification Transactions

Certification is an atomic constitutional transaction:

```text
PREPARE -> FREEZE_INPUTS -> VERIFY_GRAPH -> EVALUATE
        -> RECORD_DECISION -> PUBLISH_EVENT -> FINALIZE
```

## 25.1 Prepare

Admit request, resolve idempotency, policy, subject, and authority without issuing external status.

## 25.2 Freeze Inputs

Record immutable candidate, graph, domain decision, validation, context, and approval identities. Mutable references are rejected.

## 25.3 Verify Graph and Evaluate

Validate topology and inputs, then evaluate deterministically. Findings accumulate without partial PASS publication.

## 25.4 Record Decision

Persist decision, graph evaluation, evidence inventory, and history atomically. If persistence fails, no certification is visible.

## 25.5 Publish and Finalize

Publish idempotent event and update registry projection. Evolution handoff is a separate signed output after finalization.

No individual domain PASS changes aggregate state before the atomic decision commits.

# 26. Certification Evidence

Certification evidence is immutable, content-addressed, and stored outside mutable runtime projections. It includes:

- Candidate Change Set and Workspace Conformance Attestation;
- Validation Aggregate and underlying required results;
- domain certification decisions and authority proof;
- Repository Context and baseline trust decisions;
- execution authority, assignment, provider, evidence, and completion proof;
- policy, graph, evaluation findings, approval, and aggregate decision;
- suspension, revocation, supersession, and recovery evidence.

Missing or inaccessible required evidence invalidates current eligibility. Retention supports audit, legal hold, and revocation analysis.

# 27. Certification Provenance

```text
Strategic Intent
  -> Mission
  -> Candidate Workspace
  -> Candidate Change Set
  -> Validation Aggregate
  -> Domain Trust Claims
  -> Certification Graph
  -> Engineering Certification Decision
  -> Evolution Handoff
  -> Repository Evolution
  -> Baseline and Release Evidence
```

Every link uses stable identifiers, authority references, and digests. A third party must reconstruct who requested, executed, validated, certified, approved, and consumed the decision years later.

# 28. Certification Metrics

Required measurements:

- requested, active, blocked, rejected, certified, suspended, expired, and revoked counts;
- request-to-decision and domain-decision latency;
- certification backlog and graph size;
- missing, stale, conflicting, and revoked dependency rates;
- recertification and recovery duration;
- evolution handoff acceptance and rejection;
- decision distribution by organization, policy, risk, and certification type;
- evidence-store growth and verification failures.

Metrics are operational projections, not certification truth. Cardinality, retention, tenant visibility, and privacy are governed.

# 29. Certification Observability

One trace correlates mission, candidate, validation, domain requests, graph evaluation, engineering decision, evolution handoff, and subsequent baseline. Structured events expose state, latency, authority, rule findings, and dependency status without leaking secrets or restricted evidence.

Operators must distinguish:

- waiting for a certifier;
- blocked by missing authority;
- rejected by a domain decision;
- failed transaction persistence;
- suspended or revoked trust;
- accepted by Repository Evolution.

No certification execution may be silent.

# 30. Certification Auditing

Audit history includes:

- request and admission;
- policy selection and changes;
- graph construction and topology;
- every domain request and response;
- issuer identity and authority validation;
- evidence access and verification;
- human review and approval;
- decision, conditions, and eligibility handoff;
- suspension, expiration, revocation, supersession, recovery, and recertification;
- administrative access and exceptional actions.

Audit events are append-only, sequenced, integrity-protected, and tenant-scoped. Administrative correction creates a new event; it never edits history.

# 31. Certification Security

- Human and service certifier identities are verified and organization-scoped.
- Domain certifier credentials cannot be used by the Coordinator.
- Coordinator credentials cannot issue domain decisions or mutate repositories.
- Repository Evolution credentials are unavailable to certification processes.
- Evidence access follows least privilege and purpose limitation.
- Claims and decisions support signing, key rotation, revocation, and issuer compromise response.
- Replay, substitution, downgrade, confused-deputy, and cross-tenant attacks are rejected through subject, policy, audience, nonce/idempotency, and organization binding.
- Sensitive evidence is referenced rather than copied into broad reports.

# 32. Certification Authorization

Authorization binds:

- requester and independent reviewer identities;
- organization and delegation scope;
- candidate, policy, graph, and target identities;
- permitted certification action;
- conditions, risk acceptance, expiration, and revocation;
- separation-of-duties requirements.

The Coordinator validates authorization but does not create human authority. Provider, validator, certifier, and evolution roles remain separated according to policy. Emergency authority may suspend trust but cannot issue certification without required evidence.

# 33. Certification Recovery

Recovery uses immutable request, frozen input inventory, transaction journal, domain registries, evidence store, and aggregate history.

| Failure | Recovery behavior |
|---|---|
| Process crash before input freeze | Restart admission idempotently |
| Crash after freeze | Resume exact attempt from frozen identities |
| Domain response missing | Remain BLOCKED; retry request under policy |
| Duplicate response | Deduplicate by decision identity and digest |
| Conflicting responses | Suspend evaluation and require authority resolution |
| Evidence store unavailable | Block; never use cached unverified PASS |
| Decision persistence ambiguous | Reconcile journal and registry before publication |
| Event publication failed | Republish idempotently after decision verification |
| Issuer compromised | Suspend affected aggregates and perform impact analysis |
| Policy changed | Complete under frozen policy or supersede per declared rule; never silently switch |

Recovery requires authority, checkpoint, actions, validation, outcome, and audit evidence.

# 34. Certification Rollback

Before final decision persistence, rollback abandons the attempt and records `BLOCKED` or `REJECTED` according to evidence. Frozen inputs remain auditable.

After certification issuance but before Repository Evolution, rollback means suspension, revocation, expiration, or supersession. The original certificate is not deleted.

After Repository Evolution, certification rollback cannot rewrite repository history. It triggers incident response and a compensating engineering mission if remediation is required.

# 35. Certification Forward Recovery

Forward recovery is required when an externally observed certification or evolution handoff exists. PBOS shall:

1. establish authoritative decision and publication state;
2. complete missing registry, event, report, or audit projections idempotently;
3. suspend eligibility when trust cannot be established;
4. propagate current status to Repository Evolution and Baseline authorities;
5. create remediation or recertification work rather than rewrite history.

# 36. Certification Failure Modes

PBOS fails closed for:

- mutable or mismatched candidate identity;
- missing Workspace Conformance;
- incomplete or stale Validation Aggregate;
- unknown, missing, duplicate, or unauthorized certifier;
- certification graph cycle or unresolved dependency;
- evidence digest, provenance, freshness, or availability failure;
- conflicting domain decisions;
- invalid separation of duties;
- policy ambiguity or downgrade;
- partial transaction state;
- expired, suspended, revoked, or superseded input;
- Repository Context or baseline mismatch;
- ambiguous recovery reality.

Failure never fabricates PASS, averages conflicts, edits domain history, or exposes partial engineering certification.

# 37. Certification Concurrency

Multiple certification requests may execute concurrently for different Candidate Change Sets. Domain certification collection may be parallel when graph dependencies permit.

Concurrency rules:

- one active aggregate transaction per candidate revision and policy identity;
- optimistic concurrency on registry projections;
- immutable attempts prevent write conflicts;
- leases use monotonic fence tokens for recovery-sensitive orchestration;
- domain results are applied idempotently;
- Repository Evolution handoff is serialized by candidate and target;
- tenant and resource quotas provide fairness and backpressure.

Two candidates based on the same baseline are certified independently. Certification does not resolve merge conflicts or reserve a repository target.

# 38. Certification Ordering Guarantees

- Stable topological order is independent of response timing.
- Same frozen inputs and policy produce the same aggregate decision and findings.
- A decision event is published only after durable atomic persistence.
- Status revisions are monotonically ordered.
- Supersession never changes predecessor content.
- Revocation propagation is deterministic by graph dependency and policy.
- Repository Evolution receives only the latest current eligibility for the exact candidate.

# 39. Repository Context Certification

Repository Context Authority alone certifies repository reality. The Coordinator requests or reads a context decision binding repository root, remote, branch, commit, tree or content identity, and policy.

The Coordinator verifies that:

- the candidate parent matches the certified context or baseline relationship;
- the context decision is current for certification policy;
- no conflicting repository identity exists;
- the Coordinator has not generated or altered context evidence.

Candidate Workspace context and certified repository context remain distinct. Candidate content is certified through the change-set path, not by pretending it is current repository history.

# 40. Release Evidence Certification

Release Evidence Authority owns release evidence completeness and trust. The Coordinator may require a release-evidence certification node when policy or target class requires it.

Release evidence binds candidate, validation, domain certifications, environment, target, version, and approval. The Coordinator verifies its issuer, identity, and graph relationship but cannot create or amend it.

For pre-release engineering certification, release evidence may be explicitly non-applicable only when policy declares that condition. Absence without declared non-applicability blocks certification.

# 41. Baseline Certification

Baseline Authority certifies checkpoint identity and succession after Repository Evolution is verified. A future baseline cannot be a prerequisite for certifying its own candidate.

The Coordinator instead consumes the **parent baseline certification**. After evolution, Baseline Authority creates and certifies the successor using evolution and engineering certification evidence.

If successor baseline certification fails after publication, Repository Evolution enters forward recovery. The prior engineering certification remains historical but the evolution is not finalized.

# 42. Repository Evolution Consumption

Repository Evolution consumes a finalized Evolution Eligibility Handoff containing:

- engineering certification and candidate identities;
- target repository and policy;
- validity and current-status proof;
- parent baseline and context references;
- required approval and conditions;
- graph and evidence digests;
- handoff authority and expiration.

Repository Evolution independently revalidates current status, target head, certification binding, and authority before mutation. Certification never guarantees that the target has not changed.

# 43. Certification Sequence Diagrams

## 43.1 Request and Aggregation

```text
Runtime -> Execution Evidence Authority: completion evidence
Workspace Authority -> Change Set Store: sealed candidate
Validation Authority -> Evidence Store: Validation Aggregate
Lifecycle Coordinator -> Certification Coordinator: request(candidate)
Certification Coordinator -> Context Authority: request/read context decision
Certification Coordinator -> Domain Certifier Ports: request required decisions
Domain Certifiers -> Certification Coordinator: immutable trust claims
Certification Coordinator -> Registry/History: atomic aggregate decision
```

## 43.2 Evolution Handoff

```text
Certification Coordinator -> Authorization Validator: verify approval
Certification Coordinator -> Evidence Store: persist certification
Certification Coordinator -> Repository Evolution: eligibility handoff
Repository Evolution -> Certification Registry: verify current status
Repository Evolution -> Repository: evolve exact candidate
Repository Evolution -> Baseline Authority: verified evolution evidence
```

## 43.3 Revocation

```text
Domain Certifier -> Coordinator: revocation event
Coordinator -> Certification Graph: resolve affected aggregates
Coordinator -> Registry: append SUSPENDED/REVOKED
Coordinator -> Repository Evolution: invalidate unused handoff
Coordinator -> Incident Governance: assess evolved subjects
```

# 44. Certification Dependency Diagrams

```text
Candidate Workspace Authority ----> Workspace Conformance
Validation Authorities -----------> Engineering Confidence
Repository Context Authority -----> Repository Trust
Execution Authorities ------------> Execution Trust
Provider Certification -----------> Provider Trust
Domain Certifiers ----------------> Scoped Trust

All required trust nodes
  -> Engineering Certification Coordinator
  -> Evolution Eligibility Handoff
  -> Repository Evolution Authority
```

Prohibited dependencies:

```text
Coordinator -X-> Domain decision mutation
Coordinator -X-> Runtime execution
Coordinator -X-> Repository Context generation
Coordinator -X-> Git or baseline mutation
Validation -X-> Engineering certification issuance
Runtime -X-> Certification bypass
Repository Evolution -X-> Partial domain decisions
```

# 45. Certification Interaction Diagrams

```text
Mission Control: observes and reports status
Engineering Lifecycle Coordinator: requests certification and transitions lifecycle
Certification Coordinator: aggregates trust
Domain Certifiers: issue scoped decisions
History Authority: preserves immutable events
Observability: projects telemetry
Repository Evolution: consumes finalized eligibility
```

No observer or adapter becomes a decision owner through integration.

# 46. Certification APIs

Constitutional API operations:

- submit certification request;
- resolve policy and graph;
- register or discover domain certification references;
- ingest immutable domain decision;
- inspect attempt and dependency status;
- evaluate frozen graph;
- issue aggregate decision;
- suspend, expire, revoke, or supersede aggregate status;
- issue and verify evolution handoff;
- request recertification;
- start and complete recovery;
- retrieve report, evidence inventory, and audit history.

APIs declare typed inputs, outputs, failures, authority, idempotency, consistency, timeout, evidence, and observability. API transport is an implementation detail.

# 47. Certification Interfaces

Required architectural ports:

- Certification Request Port;
- Certification Policy Port;
- Domain Certifier Discovery Port;
- Domain Certification Reader/Request Port;
- Validation Aggregate Port;
- Candidate Change Set Port;
- Workspace Conformance Port;
- Repository Context Port;
- Baseline Certification Port;
- Release Evidence Certification Port;
- Evidence Port;
- Certification Registry Port;
- History Port;
- Authorization Port;
- Trusted Clock Port;
- Event and Metrics Ports;
- Repository Evolution Handoff Port.

Ports expose constitutional behavior, not storage paths or implementation-specific clients.

# 48. Certification Testing Strategy

## 48.1 Contract Tests

Validate identities, schemas, states, graph nodes, policies, decisions, handoffs, and backward-compatible readers.

## 48.2 Authority Tests

Reject missing, impersonated, delegated beyond scope, expired, revoked, cross-tenant, duplicate, and conflicting authorities.

## 48.3 Graph Tests

Test missing nodes, cycles, duplicate identities, conditional dependencies, deterministic topology, revocation propagation, and policy versions.

## 48.4 Transaction Tests

Inject failure before and after freeze, evaluation, decision persistence, event publication, registry projection, and handoff. Prove no partial certification becomes visible.

## 48.5 Concurrency Tests

Test duplicate requests, simultaneous attempts, late domain responses, stale revisions, revocation races, competing policies, and backpressure.

## 48.6 Recovery Tests

Restart from every transaction checkpoint, reconcile ambiguous persistence, republish events idempotently, and suspend unverifiable trust.

## 48.7 Integration Tests

Use existing Context, Workspace, Validation, provider, capability, interface, volume, execution evidence, Repository Evolution, and Baseline adapters in isolated fixtures. Prove ownership remains separate.

## 48.8 Security and Scale Tests

Exercise key compromise, evidence substitution, policy downgrade, replay, tenant crossover, large graphs, thousands of concurrent attempts, history reconstruction, and evidence retention.

# 49. Certification Migration Strategy

1. Inventory every existing certifier, scope, schema, artifact, and consumer.
2. Define adapter contracts without changing domain implementations.
3. Build read-only certification graph projections in shadow mode.
4. Compare shadow aggregate decisions with existing workflows.
5. Introduce advisory Engineering Certification reports.
6. Add immutable transaction and registry storage.
7. Require Coordinator certification for a low-risk dry-run evolution path.
8. Expand policy coverage incrementally.
9. Activate revocation propagation and recovery.
10. Deprecate direct certification-to-evolution paths after parity evidence.

Migration uses dual-read/single-write behavior. The Coordinator never writes existing domain artifacts. There is no period with two engineering aggregate authorities.

# 50. Backward Compatibility

Existing certification systems remain authoritative in their scopes. Adapters translate existing outputs into Domain Trust Claims without rewriting history or falsely adding missing identity.

Legacy decisions lacking required subject, authority, evidence, or validity bindings may remain historically readable but cannot automatically satisfy new engineering certification. They require recertification or an explicitly governed compatibility policy.

Existing commands continue to operate during shadow and advisory phases. No compatibility mode may bypass final Coordinator admission once Repository Evolution adopts this architecture.

# 51. Future Evolution

The architecture supports distributed certifiers, external institutional authorities, hardware-backed attestations, confidential validation, policy-as-code, cryptographic transparency logs, multi-repository candidates, regional regulation, and future AI-assisted review.

AI may summarize evidence, identify missing dependencies, and recommend findings. It may not issue authority, self-certify, suppress conflicting evidence, or produce an unexplained aggregate decision.

Future changes must preserve federated authority, immutable subject binding, deterministic graph evaluation, atomic aggregate decisions, and fail-closed evolution admission.

# 52. Completion and Definition of Done

Engineering Certification Coordination is implemented only when evidence proves:

- all existing domain certifiers retain ownership;
- Runtime requests certification only through lifecycle admission;
- Validation contributes confidence without issuing trust;
- every required domain claim binds the exact candidate or declared subject;
- the Coordinator deterministically aggregates one acyclic graph;
- partial certification is never externally visible;
- Repository Context, Release Evidence, and Baseline authorities remain singular;
- Repository Evolution consumes only current finalized eligibility;
- revocation, expiration, conflict, and missing evidence block evolution;
- certification transactions recover from every failure boundary;
- complete provenance and audit reconstruction are possible;
- concurrent and multi-tenant certification remains isolated and deterministic;
- migration preserves historical evidence and existing governance.

# 53. Final Constitutional Directive

Engineering Certification Coordinator aggregates trust; it does not own all trust.

Runtime produces governed execution evidence. Validation establishes engineering confidence. Candidate Workspace Authority establishes workspace conformance. Repository Context Authority certifies repository reality. Domain certifiers issue scoped trust. Engineering Certification Coordinator evaluates their declared dependency graph and issues one atomic engineering decision. Repository Evolution independently consumes that finalized decision. Baseline and Release Evidence authorities certify their own subjects at their proper lifecycle positions.

Any implementation that centralizes domain certification, infers missing PASS results, exposes partial certification, transfers trust across changed content, bypasses current context, or lets certification mutate repository history is constitutionally non-conforming and shall fail closed.

## Related Documents

- [Autonomous Engineering Lifecycle V2](./PBOS-ENGINE-LIFECYCLE-001_AUTONOMOUS_ENGINEERING_LIFECYCLE.md)
- [Candidate Workspace Architecture](./PBOS-ENGINE-LIFECYCLE-002_CANDIDATE_WORKSPACE_ARCHITECTURE.md)
- [Implementation Directive](./PBOS-ENGINE-LIFECYCLE-001_IMPLEMENTATION_DIRECTIVE.md)
- [Lifecycle README](./README_PBOS_ENGINE_LIFECYCLE.md)
- [Implementation Assessment](../REVIEWS/PBOS_ENGINE_LIFECYCLE_IMPLEMENTATION_ASSESSMENT_001.md)
