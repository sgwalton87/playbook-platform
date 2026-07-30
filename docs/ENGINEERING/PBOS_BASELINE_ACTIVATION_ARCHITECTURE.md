# PBOS Baseline Activation Architecture

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Baseline Activation Boundary Discovery](./PBOS_BASELINE_ACTIVATION_BOUNDARY_DISCOVERY.md)

## Purpose

This architecture defines governed activation of PBOS against a clean repository without weakening file-level change governance.

## Boundary Model

`ChangeBoundaryDeclaration.boundary_type` supports:

```text
CHANGE
BASELINE_ACTIVATION
```

Both types are created, validated, persisted, approved, and consumed through the same canonical authorities.

## Change Contract

A `CHANGE` boundary requires every changed path to appear exactly once in either the included or excluded set. Overlap, omission, unknown ownership, repository drift, missing human evidence, or expiration blocks creation.

## Baseline Contract

A `BASELINE_ACTIVATION` boundary requires:

- a clean Git worktree;
- non-empty repository, branch, and commit identities;
- empty approved, included, and excluded file arrays;
- context, manifest, architecture, artifact, and governance digests;
- requester identity;
- business and technical purposes;
- risk acknowledgment;
- a valid future expiration.

The declaration binds all values into its immutable digest. Launch Approval subsequently binds an independent decision to that exact digest.

## Validation

The Change Boundary builder validates baseline evidence at creation. Context Activation independently recomputes the current baseline identity and validates it again during discovery.

PBOS rejects:

- baseline activation when any changed file exists;
- non-empty file classifications on a baseline;
- missing repository or PBOS identity bindings;
- malformed or expired authorization;
- repository, branch, commit, inventory, or context digest drift;
- missing or invalid human evidence.

## CLI Experience

When a TTY invocation detects no changed files, `pbos:change-boundary` presents:

```text
PBOS BASELINE ACTIVATION DETECTED

Choose boundary type:
1. CHANGE
2. BASELINE_ACTIVATION
```

Baseline selection collects requester, business purpose, technical purpose, risk acceptance, expiration, and confirmation. File-list prompts are omitted because baseline lists must be empty.

Non-interactive operation requires:

```text
--boundary-type BASELINE_ACTIVATION
```

An unspecified type on a clean repository fails closed.

## Mission Control

Mission Control reports the persisted and currently validated boundary type. A valid baseline presents:

```text
Boundary Type: BASELINE_ACTIVATION
Repository Baseline: VALID
Human Evidence: VALID
Trusted context: READY
```

`READY` means the validated baseline and approval are eligible for Context Activation. Only a successfully activated context displays `ACTIVE`. Presentation never performs activation.

## Failure and Recovery

Any repository change after declaration invalidates baseline evidence. Recovery requires a new inventory and either a new `CHANGE` declaration or restoration to a clean baseline followed by a new `BASELINE_ACTIVATION` declaration. Prior history remains preserved by the canonical store.
