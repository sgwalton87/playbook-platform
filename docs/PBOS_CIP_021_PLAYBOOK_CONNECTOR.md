# PBOS CIP-021 Playbook Connector

## Status

CERTIFIED

CIP-045 production activation is in progress and is not yet certified.

## Purpose

Document Playbook Platform activation as the independently owned application `PLAYBOOK-SYSTEM-001` operating on `PLAYBOOK-OS-001` and PBOS v1.

## Ownership

Playbook OS Engineering owns the Playbook manifest, Supabase identity mapping, application workflows, UI, and product data. PBOS Core owns the connector protocol, authority decisions, runtime services, and certification boundary.

## Last Updated

August 3, 2026

## Architecture

```text
PBOS Genesis
    ↓
PBOS v1 API
    ↓
PLAYBOOK-OS-001
    ↓
PLAYBOOK-CONNECTOR-001
    ↓
PLAYBOOK-SYSTEM-001
```

The first certified communication is runtime health. CIP-045 adds capability discovery, a governed Scholar onboarding lifecycle event, and an approved private dashboard projection. PBOS remains the authority and certification boundary; Playbook cannot self-authorize these operations.

## Registered Domains

- Scholar
- Scholar Athlete
- Family
- Mentor
- Coach
- Education

## Validation Evidence

- Playbook Platform validation gate: PASS
- Human operator certification approval completed August 3, 2026
- PBOS Core compatibility gate: PASS — 51 test files, 173 tests

## CIP-045 Pending Evidence

- Publish and install the exact `@pbos/connector-sdk` version.
- Validate capability discovery and the onboarding-to-dashboard transaction against a deployed PBOS v1 service.
- Prove denial, revocation, restart recovery, degraded mode, and provenance in the application repository.
- Collect current lint, test, build, runtime, approval, and CI evidence.
- Obtain human connector certification before merge or deployment.

## Related Links

- [Architecture handbook](./ARCHITECTURE.md)
- [Master checklist](./MASTER_CHECKLIST.md)
- [PBOS integration architecture](../pbos/README.md)
