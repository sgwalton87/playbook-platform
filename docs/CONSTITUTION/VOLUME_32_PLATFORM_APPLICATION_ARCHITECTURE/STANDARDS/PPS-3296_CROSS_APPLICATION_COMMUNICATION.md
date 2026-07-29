---
id: PPS-3296
title: Cross-Application Communication
version: 1.0.0
status: Canonical
classification: Constitutional
owners:
  - Playbook Platform
layer: Platform Application Standard
parent: PPS-3200
depends_on:
  - PPS-010
  - PPS-011
  - PPS-012
  - PPS-3008
  - PPS-3010
  - PPS-3200
required_by:
  - PPS-3201
  - PPS-3202
  - PPS-3203
  - PPS-3204
  - PPS-3210
  - PPS-3211
  - PPS-3212
  - PPS-3213
  - PPS-3220
  - PPS-3221
  - PPS-3222
  - PPS-3223
  - PPS-3224
  - PPS-3230
  - PPS-3231
  - PPS-3232
  - PPS-3233
  - PPS-3234
  - PPS-3240
  - PPS-3241
  - PPS-3242
  - PPS-3243
  - PPS-3250
  - PPS-3251
  - PPS-3252
  - PPS-3253
  - PPS-3260
  - PPS-3261
  - PPS-3262
  - PPS-3263
  - PPS-3270
  - PPS-3271
  - PPS-3272
  - PPS-3273
  - PPS-3274
  - PPS-3280
  - PPS-3281
  - PPS-3282
  - PPS-3283
  - PPS-3284
  - PPS-3290
  - PPS-3291
  - PPS-3292
  - PPS-3293
  - PPS-3294
consumes:
  - PPS-010
  - PPS-011
  - PPS-012
  - PPS-3008
  - PPS-3010
  - PPS-3200
provides:
  - PPS-3296
integrates_with:
  - PPS-3295
  - PPS-3297
  - PPS-3298
  - PPS-3299
supports:
  - PPS-3201
  - PPS-3202
  - PPS-3203
  - PPS-3204
  - PPS-3210
  - PPS-3211
  - PPS-3212
  - PPS-3213
  - PPS-3220
  - PPS-3221
  - PPS-3222
  - PPS-3223
  - PPS-3224
  - PPS-3230
  - PPS-3231
  - PPS-3232
  - PPS-3233
  - PPS-3234
  - PPS-3240
  - PPS-3241
  - PPS-3242
  - PPS-3243
  - PPS-3250
  - PPS-3251
  - PPS-3252
  - PPS-3253
  - PPS-3260
  - PPS-3261
  - PPS-3262
  - PPS-3263
  - PPS-3270
  - PPS-3271
  - PPS-3272
  - PPS-3273
  - PPS-3274
  - PPS-3280
  - PPS-3281
  - PPS-3282
  - PPS-3283
  - PPS-3284
  - PPS-3290
  - PPS-3291
  - PPS-3292
  - PPS-3293
  - PPS-3294
supported_by:
  - PPS-3200
references:
  - PPS-010
  - PPS-011
  - PPS-012
  - PPS-3008
  - PPS-3010
  - PPS-3200
  - PPS-3295
  - PPS-3297
  - PPS-3298
  - PPS-3299
used_by:
  - PPS-3201
  - PPS-3202
  - PPS-3203
  - PPS-3204
  - PPS-3210
  - PPS-3211
  - PPS-3212
  - PPS-3213
  - PPS-3220
  - PPS-3221
  - PPS-3222
  - PPS-3223
  - PPS-3224
  - PPS-3230
  - PPS-3231
  - PPS-3232
  - PPS-3233
  - PPS-3234
  - PPS-3240
  - PPS-3241
  - PPS-3242
  - PPS-3243
  - PPS-3250
  - PPS-3251
  - PPS-3252
  - PPS-3253
  - PPS-3260
  - PPS-3261
  - PPS-3262
  - PPS-3263
  - PPS-3270
  - PPS-3271
  - PPS-3272
  - PPS-3273
  - PPS-3274
  - PPS-3280
  - PPS-3281
  - PPS-3282
  - PPS-3283
  - PPS-3284
  - PPS-3290
  - PPS-3291
  - PPS-3292
  - PPS-3293
  - PPS-3294
related:
  - PPS-3295
  - PPS-3297
  - PPS-3298
  - PPS-3299
children: []
peer_documents:
  - PPS-3295
  - PPS-3297
  - PPS-3298
  - PPS-3299
constitutional_authority:
  - PPS-3200
last_updated: '2026-07-28'
machine_version: 2
release_blocking: true
validation_required: true
---

# Purpose

PPS-3296 establishes the interoperability and communication contract between Platform Applications.

# Authority

This standard inherits PPS-3200, data governance, security, API registration, and event registration. No application may establish a private communication path that bypasses those authorities.

# Application Interoperability

Applications interoperate through registered, versioned contracts with explicit producers, consumers, owners, permissions, and failure behavior. Interoperability shall preserve each application's identity and shall not merge ownership boundaries.

# Shared Events

Shared events shall have canonical identifiers, schemas, provenance, authorization context, ordering rules, idempotency guarantees, retention, privacy classification, observability, and compatibility policy. An event describes committed state; it does not authorize an otherwise forbidden action.

# Messaging Contracts

Commands, requests, responses, messages, and notifications shall declare purpose, sender, recipient resolution, authentication, authorization, validation, delivery guarantees, timeout behavior, retries, deduplication, and audit evidence.

# Navigation Between Applications

Cross-application navigation shall use canonical destinations and preserve authorized context without transferring hidden authority. Destination applications shall independently revalidate identity, permissions, resource access, and input integrity.

# Data Exchange Rules

Applications exchange minimum-necessary, purpose-limited data through registered APIs, events, or governed projections. Direct access to another application's private state is prohibited. Canonical data ownership, consent, retention, deletion, and provenance shall survive every exchange.

# Failure Rules

Communication fails closed when contract identity, version compatibility, producer identity, consumer authority, data classification, authorization, or integrity cannot be proven. Failures shall be observable and auditable and shall not be converted into successful domain state.

# Recovery

Recovery shall use idempotent replay, reconciliation, compensation, or human review as declared by the contract. Silent data repair, guessed routing, invented defaults, and unregistered fallback channels are prohibited.

# PBOS Validation

PBOS shall validate contract registration, identity, dependency direction, schema compatibility, permissions, data ownership, failure behavior, recovery evidence, and absence of circular or duplicate communication authority.

# Definition of Done

This standard is complete when every cross-application interaction is registered, authorized, versioned, observable, recoverable, and fail-closed.

# Scope

This standard governs API, command, event, message, navigation-handoff, and data-exchange communication for every PPS-3200 child, every composing Operating System, every authorized Universe, and every implementation or generated artifact that claims Volume 32 conformance.

# Constitutional Principles

- Identity, ownership, dependencies, state, and evidence shall be explicit.
- Contracts shall be registered, versioned, deterministic, and machine-readable.
- Unknown, stale, conflicting, or unauthorized state shall fail closed.
- Configuration shall not weaken inherited governance.
- Human authority shall remain explicit for consequential decisions.
- Historical evidence shall survive compatible evolution, deprecation, and recovery.

# Ownership and Boundaries

The Platform Application architecture owner governs this standard. Application owners implement its child contracts; platform capability and service owners preserve their lower-level boundaries; Operating System owners supply authorized composition context. No consumer may redefine API, command, event, message, navigation-handoff, and data-exchange communication privately.

# Machine-Readable Contract

Conforming documents shall expose canonical identifiers, parent, dependency and relationship fields, lifecycle and version, owners, consumers, required evidence, validation rules, failure conditions, and recovery guidance in parseable YAML and stable headings.

Unknown metadata keys may be retained for forward compatibility only when they do not alter authority. Unknown identifiers, lifecycle values, relationship targets, or state transitions are invalid.

# Required Evidence

Certification requires registered contract identities, schemas, producer and consumer ownership, authorization tests, idempotency and ordering tests, failure injection, reconciliation, and audit traces. Evidence shall bind repository context, specification and implementation versions, responsible owner, validation tool or reviewer, timestamp, result, limitations, and immutable content identity.

# Enforcement

PBOS, release governance, and application owners shall enforce this standard at planning, contract, work-package, authorization, validation, promotion, completion, and planning-refresh boundaries. A downstream artifact cannot waive an upstream failure.

# Failure and Recovery

Material risks include contract ambiguity, circular ownership, unauthorized exchange, duplicate delivery, schema drift, and false success. Failure shall block the affected transition, preserve the last valid state, identify impacted consumers, and produce auditable diagnostic evidence.

Recovery shall correct the authoritative contract or artifact, regenerate all dependent evidence through governed commands, revalidate compatibility and authorization, and resume idempotently. Fabricated defaults, silent downgrade, and direct runtime-state edits are prohibited.

# PBOS Build Inputs

PBOS requires canonical PPS-3296, PPS-3200, all referenced constitutional authorities, application metadata, the constitutional dependency graph, immutable repository context, registered product artifacts, and current lifecycle and release evidence.

# PBOS Preconditions

All identifiers and relationships resolve; ownership is singular; dependency direction is acyclic; required registries exist; application and standard versions are compatible; repository and artifact identities are valid; no blocking condition remains.

# PBOS Validation Rules

PBOS shall validate YAML, identifiers, parentage, dependency closure, required relationships, subject-specific contracts, evidence completeness, compatibility, authorization, failure behavior, recovery, documentation, and preservation of completed history.

# PBOS Generated Artifacts

PBOS may generate validation reports, dependency and compatibility matrices, implementation obligations, test plans, evidence manifests, promotion recommendations, completion evidence, and planning refreshes. Generated artifacts shall reference this standard and never supersede it.

# PBOS Success Criteria

Success requires complete deterministic contracts, passing validation, valid authorization and release state, immutable evidence, no ownership conflict, no unresolved consumer impact, and a reproducible result across repeated runs.

# PBOS Failure Conditions

PBOS shall fail closed on missing metadata, unknown identity, stale or mutable evidence, unresolved dependency, invalid transition, conflicting ownership, unregistered contract, failed test, unauthorized exception, or incomplete recovery.

# PBOS Recovery Guidance

Return to the last validated artifact set, correct the source inconsistency, rebuild dependent artifacts, rerun all affected validation, and continue only when authorization, release, and completion identities match the restored context.

# PBOS Completion Evidence

Completion evidence includes the changed document and artifact inventory, dependency resolution, subject-specific validation, security/privacy/accessibility impact where applicable, test results, compatibility and recovery evidence, documentation registry updates, and release certification.

# Governance and Evolution

Changes require PPS-015 review when they alter constitutional authority, accepted lifecycle states, ownership, required evidence, or fail-closed behavior. Compatible clarification uses semantic versioning; breaking changes require migration, consumer impact review, and preserved prior evidence.

# Architectural Risks

Contract ambiguity, circular ownership, unauthorized exchange, duplicate delivery, schema drift, and false success shall be treated as architectural risks, not implementation details. Every application shall document prevention, detection, accountable response, recovery, and residual risk before release.
