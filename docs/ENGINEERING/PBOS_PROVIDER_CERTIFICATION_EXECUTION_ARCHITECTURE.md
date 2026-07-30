# PBOS Provider Certification Execution Architecture

**Purpose:** Define the executable decision process that converts governed provider intake into an independent certification outcome and, only when certified, a Kernel production proof request.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026  
**Related:** [Provider Intake](./PBOS_FIRST_PROVIDER_INTAKE_OPERATIONS_ARCHITECTURE.md), [Provider Certification](./PBOS_CAPABILITY_PRODUCTION_PROVIDER_CERTIFICATION.md)

## Authority Chain

```text
Provider intake
  -> certification execution
  -> evidence checklist
  -> independent review
  -> certification authority decision
  -> Kernel production proof request
  -> Kernel evaluation
```

The certification execution authority validates this chain. It does not create evidence, validate its own evidence, issue Kernel execution permission, or activate an engine.

## Execution Contracts

`ProviderCertificationExecution` binds provider and intake identities, requested capabilities, scope, review state, assigned certification authority, timestamps, and digest.

`CertificationEvidenceChecklist` requires identity, ownership, security, credential management, data protection, storage, recovery, observability, performance, operations, and compliance. Every requirement binds the claim, source references, content digests, submitter, independent validator, verification result, expiration, and digest.

`ProviderCertificationReview` binds the independent reviewer, evidence reviewed, security, operational and risk findings, recommendation, timestamp, and digest.

`ProviderCertificationDecision` binds the authority, evidence basis, review, risk, expiration, outcome, and digest. Outcomes are `CERTIFIED`, `CONDITIONAL`, `BLOCKED`, and `REVOKED`.

## Separation Of Duties

The reviewer cannot be the provider submitter, owner, or operator. The assigned and deciding authorities must be allowlisted. A provider cannot certify itself, and a review recommendation cannot grant execution authority.

## Production Proof Handoff

`KernelProductionProofRequest` is available only for a digest-valid `CERTIFIED` decision. It binds provider, certification, validated evidence, independent review, decision digest, and timestamp.

The request is not Kernel proof. The Kernel remains responsible for evaluating production proof and engine activation.

## Failure Behavior

Missing intake, incomplete evidence, invalid or expired evidence, digest mismatch, conflicted review, missing certification authority, and any non-certified outcome fail closed. Historical blocked attempts remain evidence and cannot be promoted by mutation.

