# PBOS-APPROVAL-001 Human Approval Authority Decoupling

## Purpose

Human approval authorizes repository transitions.

Human approval does not authorize immutable runtime artifact state.

## Human Approval Scope

Approved:

- repository identity
- branch identity
- commit identity
- declared file changes
- excluded files
- purpose
- risk
- expiration

## System Managed Artifacts

PBOS generated artifacts do not invalidate approval:

- pbos/runtime/**
- docs/release-evidence/**

## Principle

Generated evidence may evolve after approval.

Approval remains bound to the approved transition boundary.
