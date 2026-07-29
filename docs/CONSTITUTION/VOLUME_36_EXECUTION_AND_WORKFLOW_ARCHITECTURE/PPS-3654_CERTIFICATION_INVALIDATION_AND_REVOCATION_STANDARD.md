---
id: PPS-3654
title: Certification Invalidation and Revocation Standard
version: 1.0.0
status: Canonical
classification: Constitutional
owners:
  - PBOS
layer: Execution Architecture
parent: PPS-3612
depends_on:
  - PPS-3614
  - PPS-3653
related:
  - PPS-3649
  - PPS-3650
  - PPS-3652
  - PPS-3656
last_updated: 2026-07-29
---

# Purpose

Govern certification as temporal, scoped, continuously consumable trust.

A prior certification remains historical truth about a decision at a time.

It does not remain valid after its subject, evidence, authority, policy, context, or trust conditions cease to satisfy its contract.

---

# Certification Lifecycle

```text
Issued -> Active -> Under Review -> Suspended
Active | Under Review | Suspended -> Revoked | Superseded
Issued | Active -> Superseded
```

`Issued` records the decision but does not permit use before its effective conditions.

`Active` is consumable only within exact scope and validity.

`Under Review` signals a material question; policy defines whether bounded use continues.

`Suspended` is non-consumable pending determination.

`Revoked` permanently withdraws the exact trust assertion.

`Superseded` identifies a replacement decision; it does not erase the predecessor.

---

# Temporal Trust Contract

Every certification shall bind:

- Certification identity and type
- Subject identity, version, and digest
- Claim and exact scope
- Certifier and certification authority
- Validator and trusted evidence sources
- Evidence inventory and digests
- Context, policy, organization, tenant, and jurisdiction
- Risk class and independence or quorum requirement
- Issue, effective, review, expiry, and revocation conditions
- Consumers and dependency lineage
- Monitoring, suspension, and propagation requirements

Consumers shall validate current lifecycle and exact applicability at use time.

Cached trust shall have a declared maximum age and revocation exposure.

---

# Invalidation Triggers

Review or suspension is required for:

- Invalid, corrupted, missing, disputed, or materially changed evidence
- Compromised, expired, revoked, or out-of-scope identity
- Certifier, validator, issuer, or trust-root compromise
- Policy or constitutional change affecting the claim
- Authority, ownership, organization, or tenant change
- Detected fraud, concealment, or material misrepresentation
- Subject, implementation, configuration, model, prompt, tool, data, dependency, or context drift
- Security incident or control failure
- Expired trust or missed review
- Conflicting certification or authoritative state

Unknown material impact suspends consumption.

---

# Review, Suspension, and Revocation Authority

Every certification type shall name:

- Monitoring authority
- Review initiator
- Suspension authority
- Revocation authority
- Independent decision maker or quorum
- Appeal and recertification authority

Emergency suspension may occur under bounded security or governance authority.

Revocation requires attributable evidence and the assigned revocation authority.

The executor, certification subject, or affected consumer cannot suppress review, suspension, or revocation.

---

# Propagation Model

Invalidation shall traverse the governed dependency graph to identify:

- Dependent executions and queued work
- Downstream decisions and outcomes
- Certifications that relied on the assertion
- Evidence records and reports referencing it
- Organizations, tenants, partners, integrations, and auditors
- Active recovery, compensation, or remediation

Propagation shall:

1. Record the trigger and affected scope.
2. Stop new use within a policy-defined bounded latency.
3. Interrupt active effects when continued use is unsafe or unauthorized.
4. Mark dependent trust `Under Review` or `Suspended` as required.
5. Preserve historical references and original decision state.
6. Notify accountable owners and organizations.
7. Require reevaluation, remediation, recovery, or recertification.

Failure to prove current propagation state blocks affected consumption.

---

# Downstream Disposition

| Dependent Object | Required Action |
|---|---|
| Not-yet-admitted execution | Deny admission until valid replacement trust exists |
| Queued execution | Hold and revalidate before release |
| Active execution | Interrupt before new effects when trust is material |
| Completed execution | Preserve history; reevaluate outcome recognition and downstream effects |
| Dependent certification | Move to `Under Review` or `Suspended`; revoke if claim no longer holds |
| Evidence record | Preserve original reference and append invalidation relationship |
| Connected organization | Notify within contract; apply tenant-local containment and review |
| Public or operational report | Correct through new version and preserve original publication history |

Revocation never deletes evidence or claims that the original decision did not occur.

---

# Supersession and Recertification

Supersession and recertification create new identities.

They require current subject, evidence, authority, context, policy, independence, and validation.

A replacement cannot inherit unverified claims from the predecessor.

The prior decision remains queryable with its exact historical state.

---

# Evidence Requirements

Lifecycle evidence shall include:

- Trigger and detection identity
- Affected certification and claim
- Review, suspension, revocation, or supersession authority
- Evidence and rationale
- Effective time and propagation objective
- Dependency impact inventory
- Consumer acknowledgements and unresolved consumers
- Execution interruption or recovery
- Organization notification
- Appeal, remediation, and recertification

---

# Failure Behavior

If certification applicability, lifecycle, evidence, authority, expiry, suspension, revocation, or propagation cannot be proven, the certification is not consumable.

Availability and prior acceptance do not override current trust state.

---

# Governance

PPS-3612 owns certification types and primary decision semantics.

This standard owns post-issuance invalidation, suspension, revocation, supersession, and downstream propagation.

Certification authorities issue trust. They do not perform execution, validation, remediation, or historical mutation.
