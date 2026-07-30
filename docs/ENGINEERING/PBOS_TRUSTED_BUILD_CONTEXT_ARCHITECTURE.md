# PBOS Trusted Build Context Architecture

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Context Reconciliation Architecture](./PBOS_CONTEXT_IDENTITY_RECONCILIATION_ARCHITECTURE.md)

## Purpose

Trusted Build Context is the immutable, time-bounded admission identity connecting observed repository reality to governed planning and execution.

## Authority Flow

Repository observation -> reality assessment -> identity reconciliation -> human decision -> activation validation -> trusted context history -> readiness assessment -> planning -> separately authorized execution.

Repository context remains owned by the repository-context lifecycle. Context activation may consume it but cannot refresh, repair, or override it.

## Identity Contract

A trusted context binds repository, commit, branch, manifest, runtime artifacts, constitutional architecture, governance sources, reviewer identity, decision identity, creation time, and expiration time. Every content class is digest-bound. A subsequent content, commit, manifest, artifact, or architecture change invalidates readiness.

## Activation Rules

Activation requires a clean working tree, valid artifacts, readable architecture, valid governance sources, a valid manifest, matching snapshot identity, reconciliation evidence, an affirmative human decision, a reason, evidence references, explicit risk acknowledgment, and future expiration.

`UNKNOWN` and `MISMATCH` block admission. Human approval cannot override a failed technical predicate. Rejected or blocked attempts produce evidence in command output but cannot become runtime truth.

## Runtime Ownership

`pbos/runtime/trusted-build-context.json` is owned exclusively by `context-activation-authority`. It is durable and preserves superseded trusted contexts in history. Only a successful activation can append it.

## Failure And Recovery

Missing, malformed, corrupted, expired, or stale context blocks planning and execution admission. Recovery requires canonical artifact regeneration where applicable, repository-context reconciliation, explicit human review, and a new activation. Historical contexts are never rewritten.
