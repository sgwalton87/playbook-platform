# PBOS Context Compiler Specification

## Purpose

This specification defines the design boundary for a future PBOS Context Compiler. The compiler will transform verified constitutional knowledge, approved governance decisions, and canonical metadata into deterministic PBOS Runtime Context.

This is an architecture specification only. It does not implement a compiler, resolve a governance conflict, amend a PPS document, or authorize application changes.

## Ownership

PBOS / Constitutional Governance

## Last Updated

July 26, 2026

## Related Documents

- [Canonical Document Registry](../../PPS/CANONICAL_DOCUMENT_REGISTRY.md)
- [PPS Index](../../PPS/pps.index.json)
- [PPS Authority Decision Matrix](./PPS_AUTHORITY_DECISION_MATRIX.md)
- [PPS Canonical Resolution Manifest](./PPS_CANONICAL_RESOLUTION_MANIFEST.md)
- [PPS Governance Approval Queue](./PPS_GOVERNANCE_APPROVAL_QUEUE.json)
- [PPS Governance Handoff](./PPS_GOVERNANCE_HANDOFF.md)
- [PBOS-CONST-001 Constitutional Reconciliation Report](../AUDITS/PBOS-CONST-001_CONSTITUTIONAL_RECONCILIATION_REPORT.md)

## Constitutional Authority

The compiler is a derived-context system, not a constitutional authority. Canonical PPS documents and approved human governance records remain authoritative. Runtime Context may represent their requirements but shall never replace, edit, supersede, or silently reinterpret them.

The transformation is:

```text
Verified PPS Constitution
        +
Approved Governance Decisions
        +
Canonical, Validated Metadata
        ↓
PBOS Context Compiler
        ↓
PBOS Runtime Context
```

## Compiler Responsibilities

The Context Compiler shall eventually:

1. Discover only Git-tracked artifacts within approved canonical scopes.
2. verify each input against its declared schema and validation evidence.
3. exclude pending, rejected, ambiguous, missing, or unresolved authority.
4. normalize approved metadata dialects without altering their sources.
5. construct a deterministic document and dependency graph.
6. derive traceable constitutional rules and PBOS constraints.
7. emit reproducible, versioned Runtime Context.
8. preserve source locations, evidence, decisions, and compiler provenance for every output.
9. fail closed when authority, approval, dependency, or integrity cannot be proven.

The compiler shall not decide what the Constitution means when authoritative evidence is incomplete.

## Compilation Eligibility

An input is eligible only when all of the following are true:

- Its source is Git-tracked and lies within an approved canonical scope.
- Its identifier resolves uniquely.
- Its status permits active constitutional use.
- Its location agrees with approved canonical metadata.
- Its version and ownership fields validate.
- Every required dependency resolves to an eligible document.
- No open governance issue affects its authority or required dependency chain.
- Any correction, exception, migration, supersession, or amendment it relies upon has an approved human decision record.
- The constitutional verifier records a passing result for the input and its transitive dependencies.

Eligibility is transitive: a document with an unresolved required dependency is not compilable even when the document itself exists.

## Input Contracts

### Constitutional Input Contract

Each constitutional document input shall provide:

| Field | Type | Requirement |
| --- | --- | --- |
| `id` | PPS identifier | Required; unique and registry-valid |
| `title` | String | Required; preserved from canonical source |
| `location` | Repository-relative path | Required; approved and tracked |
| `version` | Semantic version | Required |
| `status` | Controlled status | Required; must permit compilation |
| `classification` | Controlled classification | Required |
| `owners` | Non-empty owner list | Required; normalized from an approved metadata dialect |
| `dependencies` | PPS identifier list | Required; may be empty |
| `related` | PPS identifier list | Optional; non-authoritative relationships remain distinguishable |
| `release_blocking` | Boolean | Required when defined by the governing schema |
| `validation_required` | Boolean | Required when defined by the governing schema |
| `content_digest` | Cryptographic digest | Required to bind output to exact source content |
| `validation_evidence` | Evidence reference | Required |

Normalization may map approved aliases such as `owner` to `owners` or `depends_on` to `dependencies`. It must retain the original field name and value in provenance so normalization cannot conceal a source conflict.

### Governance Input Contract

Only final human decisions may affect compiled authority. A governance input shall provide:

| Field | Type | Requirement |
| --- | --- | --- |
| `decision_id` | Stable identifier | Required and unique |
| `issue_id` | Governance issue identifier | Required |
| `decision_type` | Correction, exception, migration, supersession, amendment, or rejection | Required |
| `affected_documents` | PPS identifier list | Required |
| `decision` | Structured outcome | Required |
| `rationale` | String | Required; no placeholder language |
| `approver` | Authorized human authority | Required |
| `approval_authority` | Platform Governance or Constitutional Governance | Required |
| `approved_at` | Timestamp | Required |
| `effective_version` | Version or release boundary | Required |
| `evidence` | Evidence references | Required and non-empty |
| `status` | Approved, rejected, superseded, or revoked | Required |
| `record_digest` | Cryptographic digest | Required |

`pending` is never a compilable governance status. Accepted exceptions must be explicit, scoped, expiring when appropriate, and incapable of silently changing constitutional meaning.

### Canonical Registry Input Contract

Registry inputs shall identify canonical domains, owners, locations, status, and any approved successor or supersession relationships. A registry is usable only when its own authority, version, schema, and validation result are known.

### Repository Input Contract

Repository evidence shall provide:

- Commit identifier and branch observation.
- Sorted tracked-file inventory.
- Canonical directory inventory.
- Parsed metadata with source line or field provenance.
- Identifier and dependency reconciliation results.
- Content digests.
- Validation tool version and configuration digest.
- Governance queue state.
- Deterministic validation result and timestamp supplied by the execution record, not embedded nondeterministically in compiled content.

Untracked files, working-tree-only files, backups, and historical sources outside an approved canonical scope are not constitutional inputs.

## Input Authority States

The compiler shall distinguish these states using affirmative evidence:

| State | Compiler treatment |
| --- | --- |
| Verified active | Eligible, subject to transitive validation |
| Missing | Excluded; compilation blocked when required |
| Deprecated | Excluded from new authority; retained as provenance when explicitly declared |
| Historical | Excluded from active rules; retained only as an approved historical reference |
| Renamed | Eligible only through an explicit approved rename or successor record |
| Intentional migration | Eligible only within the approved migration state and effective version |
| Superseded | Excluded from active rules; successor must resolve explicitly |
| Pending governance | Excluded; affected compilation scope blocked |
| Constitutional conflict | Excluded; affected compilation scope blocked |

Absence alone proves only that an artifact was not found. It does not prove deletion, deprecation, renaming, migration, or supersession.

## Output Contracts

### Runtime Context Envelope

The compiler shall produce a versioned envelope containing:

| Field | Purpose |
| --- | --- |
| `context_version` | Version of the output contract |
| `compiler_version` | Exact compiler implementation version |
| `source_commit` | Repository state used for compilation |
| `registry_digest` | Digest of canonical registry inputs |
| `governance_digest` | Digest of approved decision inputs |
| `document_digests` | Sorted map of included PPS documents to exact digests |
| `rules` | Traceable constitutional rules |
| `constraints` | PBOS execution and approval constraints |
| `knowledge_graph` | Nodes and typed relationships |
| `exclusions` | Noncompiled artifacts and reason codes |
| `validation` | Schema, graph, authority, and reproducibility results |
| `context_digest` | Digest of the canonical serialized output |

Output serialization shall use stable field ordering, stable array ordering, normalized encodings, and no ambient timestamps or machine-specific paths in digest-bearing content.

### Constitutional Rule Contract

Each compiled rule shall include:

- Stable rule identifier.
- Rule type.
- Normative effect: required, forbidden, permitted, or approval-required.
- Subject and scope.
- Structured condition.
- Structured consequence.
- Severity and release-blocking effect.
- Exact PPS source identifier, version, location, and digest.
- Approved governance decision references, if any.
- Human-readable explanation.

Rule categories may include required dependencies, forbidden patterns, ownership boundaries, data restrictions, validation gates, certification gates, and release gates. The compiler may structure explicit requirements; it may not invent a rule from implication or proximity.

### PBOS Constraint Contract

Constraints shall state:

- What PBOS may automate.
- What PBOS may recommend but not execute.
- What requires Platform Governance approval.
- What requires Constitutional Governance approval or amendment.
- What blocks planning, execution, certification, or release.
- What evidence is required to clear a block.
- Whether a constraint is inherited through dependencies.

Every blocking constraint shall be explainable and traceable to authoritative input.

### Architecture Knowledge Graph Contract

The knowledge graph shall contain typed, uniquely identified nodes for:

- Constitutional documents.
- Volumes and registries.
- Approved governance decisions.
- Owners and governance authorities.
- Platform systems, operating systems, runtimes, engines, data domains, and intelligence domains explicitly declared by eligible sources.
- Rules, constraints, validation records, and release gates.

Supported relationship types shall include:

- `CONTAINS`
- `DEPENDS_ON`
- `RELATED_TO`
- `OWNED_BY`
- `GOVERNED_BY`
- `AMENDS`
- `SUPERSEDES`
- `VALIDATED_BY`
- `BLOCKS`
- `APPLIES_TO`

Every node and edge shall cite its source evidence. Missing targets shall produce exclusions and blocking findings, never synthetic nodes presented as constitutional facts.

## Validation Rules

Compilation shall fail when:

1. An identifier is absent, malformed, or duplicated.
2. A required dependency is missing, excluded, cyclic where prohibited, or unresolved.
3. A canonical path conflicts with approved registry metadata.
4. Ownership is absent or ambiguous.
5. A source digest changes after validation.
6. A governance decision is pending, unauthorized, malformed, revoked, or outside its approved scope.
7. A normalization would discard or conceal conflicting source values.
8. A compiled rule lacks exact source provenance.
9. The output graph contains an unresolved required edge.
10. Repeated compilation from identical inputs does not produce the same digest.

Validation findings shall distinguish global blockers from scope-specific exclusions. PBOS must not represent a partially compiled context as complete.

## Safety Constraints

The Context Compiler shall never:

- Invent a missing document, identifier, dependency, owner, rule, node, or relationship.
- Infer authority from directory proximity, numbering, naming similarity, or model confidence.
- Treat a candidate path as an approved canonical path.
- Treat absence as proof of deletion or deprecation.
- Overwrite or mutate canonical sources.
- Promote generated summaries, recommendations, or AI outputs into constitutional facts.
- Resolve conflicting metadata by silently choosing one value.
- Apply a pending governance decision.
- Bypass human approval, amendment, validation, certification, or release gates.
- Compile historical or deprecated material into active rules without explicit current authority.
- Emit a trusted context when required evidence is incomplete.

Generated explanations must remain distinguishable from source text and cannot carry independent authority.

## Human Approval Boundaries

PBOS may autonomously discover, parse, normalize under an already approved schema, validate, hash, compare, classify, report, and compile eligible inputs.

Human approval is required to:

- Approve a metadata correction or accepted exception.
- Declare or change a canonical location.
- Establish rename, migration, deprecation, or supersession authority.
- Resolve missing constitutional content.
- Redirect, remove, or redefine dependency authority.
- Change hierarchy, ownership, foundational authority, or constitutional meaning.
- Approve an amendment and its effective version.
- Certify Runtime Context for operational use.

The compiler consumes approved decisions; it does not approve them.

## Failure and Exclusion Model

Every excluded input shall receive a stable reason code, affected scope, source evidence, and required next authority. At minimum, reason codes shall distinguish:

- `MISSING_SOURCE`
- `DUPLICATE_IDENTIFIER`
- `UNRESOLVED_DEPENDENCY`
- `PATH_AUTHORITY_CONFLICT`
- `PENDING_GOVERNANCE`
- `UNAPPROVED_MIGRATION`
- `DEPRECATED_SOURCE`
- `HISTORICAL_SOURCE`
- `SUPERSEDED_SOURCE`
- `INVALID_METADATA`
- `DIGEST_MISMATCH`
- `NONDETERMINISTIC_OUTPUT`

No exclusion may be silently dropped from the Runtime Context envelope.

## Future Implementation Phases

### Phase 1 — Contract Schemas

- Approve JSON Schemas for constitutional inputs, governance decisions, repository evidence, rules, constraints, graph records, exclusions, and the Runtime Context envelope.
- Define controlled vocabularies and metadata-dialect mappings.
- Add schema conformance fixtures without compiling production context.

### Phase 2 — Verified Source Loader

- Load only tracked, approved canonical scopes.
- Bind source content to digests and repository state.
- Produce explicit missing, historical, deprecated, renamed, and migration evidence states.

### Phase 3 — Governance Decision Loader

- Validate approver authority, decision status, scope, effective version, and evidence.
- Reject pending, revoked, ambiguous, or unsigned decisions.
- Join decisions to issue-registry records without changing source artifacts.

### Phase 4 — Dependency and Authority Graph

- Build the typed graph from eligible sources.
- Validate uniqueness, transitive dependencies, ownership, cycles, and unresolved edges.
- Block affected graph components rather than synthesizing missing nodes.

### Phase 5 — Rule and Constraint Compiler

- Compile only explicit, schema-supported normative requirements.
- Attach source and governance provenance to every rule.
- Produce exclusions for requirements that cannot be represented without interpretation.

### Phase 6 — Deterministic Runtime Context

- Canonically serialize outputs.
- Verify repeatable context digests across clean executions.
- Produce human-readable compilation and exclusion reports alongside machine context.

### Phase 7 — Certification and Runtime Integration

- Conduct independent constitutional validation and security review.
- Obtain human certification for an exact context digest.
- Integrate only certified Runtime Context with PBOS execution systems.
- Require recompilation and recertification when an authoritative input changes.

## Implementation Gate

Implementation must not begin until:

- The input and output schemas receive governance approval.
- The approval-record schema and authorized approver model are established.
- The canonical registry and resolution manifest are machine-valid.
- Compiler behavior for partial scopes is approved.
- Test fixtures cover every failure and exclusion state.
- No unresolved conflict is treated as an active rule.

PBOS-CONST-003 completes design preparation only. The recommended next gate is `PBOS-ENGINE-CONTEXT-001`.
