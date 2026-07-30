# PBOS Provider Operations Control Center Architecture

**Purpose:** Provide authorized, immutable operational visibility across provider trust workflows without acquiring lifecycle, evidence, certification, or Kernel authority.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026  
**Related:** [Candidate Onboarding](./PBOS_FIRST_PROVIDER_CANDIDATE_ONBOARDING_ARCHITECTURE.md), [Certification Execution](./PBOS_PROVIDER_CERTIFICATION_EXECUTION_ARCHITECTURE.md)

## Control Boundary

`ProviderOperationsControlCenter` creates digest-validated snapshots for provider status, evidence, certification queues, risks, reviewer assignments, expirations, and audit history.

It is a read model. It cannot register candidates, mutate evidence, assign certification outcomes, override lifecycle transitions, issue production proof, or activate engines.

## Operational Views

Every view includes stable identity, status, authority, timestamp, and digest. Domain-specific bindings include provider, evidence, certification, risk, reviewer, and expiration references.

The aggregate snapshot binds every view, generating administrator, audit history, timestamp, and digest. Consumers must treat a changed view as a new snapshot, never an in-place mutation.

## Security

Snapshot generation requires an allowlisted administrator. Certification queue authority and reviewer-assignment authority are validated independently. Digest mismatch exposes evidence mutation and override attempts.

Unauthorized administration, unauthorized review, missing audit history, changed evidence, and invalid digests fail closed.

## Ownership

Source subsystems remain canonical owners. The control center observes their artifacts and cannot become a competing truth store.

