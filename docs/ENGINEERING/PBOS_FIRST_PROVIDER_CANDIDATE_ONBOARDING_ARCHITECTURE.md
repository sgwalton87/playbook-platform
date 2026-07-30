# PBOS First Provider Candidate Onboarding Architecture

**Purpose:** Define the controlled gateway through which an external provider may become a PBOS certification candidate.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026  
**Related:** [Provider Intake](./PBOS_FIRST_PROVIDER_INTAKE_OPERATIONS_ARCHITECTURE.md), [Certification Execution](./PBOS_PROVIDER_CERTIFICATION_EXECUTION_ARCHITECTURE.md)

## Authority Boundary

Candidate onboarding establishes eligibility for review. It cannot certify providers, generate Kernel production proof, grant capability admission, or activate engines.

`ProviderCandidateOnboardingAuthority` owns candidate registration, lifecycle transitions, evidence readiness, reviewer assignment, and certification-package preparation. Certification and Kernel authority remain separate.

## Candidate Contract

`ProviderCertificationCandidate` binds provider name and type, organization and legal identities, ownership, business, technical, security and operational contacts, requested capabilities, service scope, jurisdiction, lifecycle state, timestamps, and digest.

Candidates begin `IDENTIFIED`. Registration rejects missing ownership, legal identity, accountable contacts, scope, jurisdiction, authority, or digest integrity. A candidate cannot register directly as certified.

## Lifecycle

```text
IDENTIFIED
  -> INVITED
  -> REGISTERED
  -> EVIDENCE_REQUESTED
  -> EVIDENCE_SUBMITTED
  -> UNDER_REVIEW
  -> CERTIFICATION_READY
  -> CERTIFIED
```

`REJECTED` and `WITHDRAWN` are terminal alternatives. Every ordinary transition requires actor, authority, timestamp, reason, evidence reference, and digest. The onboarding authority cannot perform the `CERTIFIED` transition.

## Evidence And Readiness

The evidence package covers identity, ownership, security, credential management, data protection, storage, recovery, observability, performance, operations, and compliance.

Every requirement binds candidate, required artifact, submitted artifact reference and digest, independent validator, submitter, expiration, status, and digest. Missing, expired, tampered, self-validated, or incomplete evidence cannot return `READY`.

## Human Review

Review assignment requires an authorized reviewer, explicit scope, deadline, passing conflict check, and digest. The reviewer cannot be the owner, operator, or evidence submitter.

## Certification And Kernel Preparation

Only a `READY` assessment, complete evidence package, completed review assignment, validation results, risk assessment, and reviewer findings can form `ProviderCertificationSubmissionPackage`.

Proof readiness reports `READY`, `CONDITIONAL`, or `BLOCKED`. It creates no proof. Certification authority and Kernel evaluation remain mandatory.

