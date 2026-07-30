# PBOS Action Plane Architecture

**Purpose:** Define durable, isolated, observable execution of approved work.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026

## Flow

`intent -> decision -> package -> human authorization -> Kernel admission -> isolated runner -> validation -> result -> observability -> outcome`.

## Authority

The runner cannot authorize, expand scope, create capabilities, change governance, certify, or bypass the Kernel. It accepts an injected adapter only after package integrity, approval lineage, environment isolation, requested actor, and Kernel admission evidence validate.

## Isolation

Environments declare network access, writable roots, prohibited paths, and timeout. Results must match request and environment identities and cannot report artifacts in prohibited paths.

## Evidence And Recovery

History preserves intent, authority, evidence, approval, execution states, artifacts, validation, failures, rollback, and outcome. Duplicate execution identity and history rewriting fail closed.
