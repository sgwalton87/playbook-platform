---
id: PPS-3649
title: Security Trust and Identity Contract Standard
version: 1.0.0
status: Canonical
classification: Constitutional
owners:
  - PBOS
layer: Execution Architecture
parent: PPS-3611
depends_on:
  - PPS-3614
  - PPS-3647
related:
  - PPS-3628
  - PPS-3629
  - PPS-3650
  - PPS-3651
last_updated: 2026-07-29
---

# Purpose

Establish the constitutional trust and identity contract for every entity that requests, authorizes, performs, observes, validates, certifies, or administers PBOS execution.

Identity shall be verified before authority is evaluated.

Technical possession of a credential is evidence to evaluate.

It is not constitutional authority by itself.

---

# Scope

Applies to:

- Human identities
- Organization identities
- Service identities
- Workload identities
- AI identities
- Autonomous agent identities
- Identity and credential issuers
- Trust roots and cryptographic keys
- Delegation, authentication, recovery, and revocation
- Every local, distributed, and cross-organization execution boundary

---

# Constitutional Authority

PPS-3611 owns execution security.

PPS-3614 owns execution admission and authority validation.

This standard owns execution identity authenticity, credential trust, issuer trust, and cryptographic trust requirements.

Identity establishes who or what an entity is.

Authority establishes what that verified entity may do.

Authentication shall never create ownership, permission, approval, delegation, or certification authority.

Unknown identity or trust state shall fail closed.

---

# Trust Contract

Every trusted identity relationship shall bind:

- Identity and identity-class identifiers
- Legal, organizational, or technical subject
- Accountable owner
- Issuer identity and authority
- Verification method and assurance level
- Credential type and credential identity
- Authentication method
- Organization and tenant scope
- Purpose and permitted trust use
- Effective, expiry, suspension, and revocation state
- Delegation and impersonation constraints
- Recovery authority
- Evidence requirements
- Trust-root and verification-policy versions

Trust shall be explicit, scoped, independently verifiable, time-bounded where required, revocable, and historically preserved.

Ambient, anonymous, wildcard, self-issued, or unverifiable trust shall not authorize execution.

---

# Identity Classes

| Identity Class | Creation and Issuer Authority | Verification and Authentication | Credential Lifecycle | Trust Scope | Revocation and Recovery |
|---|---|---|---|---|---|
| Human Identity | Created from governed proofing by an authorized identity issuer; linked to one accountable person | Assurance appropriate to risk, including phishing-resistant authentication where policy requires | Issuance, activation, rotation or replacement, expiry, suspension, revocation, archive | Exact person, organization membership, role, purpose, session, and delegation | Compromise suspends affected credentials; recovery requires re-proofing or approved recovery authority and produces a new credential lineage |
| Organization Identity | Created by platform organization governance from verified legal or institutional evidence | Authorized representatives, organization status, domain or federation proof, and current governance relationship | Representative and machine credentials remain separate from organization identity lifecycle | Exact organization, tenant, jurisdiction, agreements, and trust relationships | Suspension or decommissioning propagates to delegated authority and credentials; recovery requires organization governance approval |
| Service Identity | Created by the accountable service owner through approved service registration | Workload-bound authentication, approved runtime and environment, protected credential | Short-lived credentials preferred; rotation and revocation must not require identity replacement | Declared service, environment, organization, API, resource, and operation | Compromise fences the service identity or credential; reactivation requires validated remediation and new credential evidence |
| Workload Identity | Created for one governed workload, deployment, job, or execution environment | Attestation or equivalent proof binding workload, code or artifact digest, runtime, environment, and issuer | Ephemeral or bounded credentials; no credential sharing across workloads | Exact workload, version, runtime, organization, resource, and execution purpose | Termination, drift, or failed attestation revokes use; recovery creates a newly verified workload identity or version |
| AI Identity | Created for a registered AI capability under accountable human and organization ownership | Binds model provider, model/version, deployment, tools, policy, data boundary, and runtime identity | Credentials are separate from model identity and scoped to approved tools and data | Exact AI capability, risk tier, use case, organization, tool, model, and approved action | Model, provider, policy, or safety drift suspends trust; recovery requires AI governance validation and recertification where required |
| Autonomous Agent Identity | Created for one registered agent definition and governed instance | Binds agent definition/version, objective, owner, runtime, tools, delegated authority, and parent execution | Instance credentials are bounded, short-lived, non-transferable, and constrained by delegation | Exact task, execution, organization, resource, duration, and autonomy ceiling | Kill or revocation authority stops new effects; recovery requires human-governed reauthorization and a new attempt or instance identity |

Identity classes shall not be substituted.

A service credential shall not represent a human decision.

An organization identity shall not perform an action without an authorized representative or workload.

An AI or autonomous agent identity shall not represent its owner, approver, validator, or certifier.

---

# Identity Creation and Verification

Identity creation requires:

- Authorized issuer
- Unique stable identity
- Verified subject evidence
- Identity class
- Accountable owner
- Organization and tenant binding
- Assurance level
- Lifecycle and recovery policy
- Immutable issuance evidence

Verification shall evaluate:

- Issuer trust and current authority
- Credential integrity and intended audience
- Subject and credential binding
- Authentication method and assurance
- Effective and expiry time
- Suspension and revocation
- Organization, environment, device, workload, or runtime constraints
- Replay and impersonation resistance
- Current trust-root and verification policy

Verification is required at admission and again before sensitive effects when policy, duration, risk, or revocation latency requires continuous verification.

Cached verification is permitted only within a declared maximum age and revocation exposure accepted by policy.

---

# Authentication Assurance

Every execution class shall declare a minimum authentication assurance profile.

The profile shall define:

- Permitted identity classes
- Required proofing strength
- Authentication factors
- Phishing and replay resistance
- Device, runtime, or workload attestation
- Session and credential lifetime
- Reauthentication triggers
- Offline verification limits
- Revocation propagation objective
- Evidence produced

Higher-risk execution may require multiple independent identities, separation of duties, quorum, or human confirmation.

No implementation may downgrade assurance because a stronger method is unavailable.

---

# Credential Lifecycle

Credentials progress through:

```text
REQUESTED -> ISSUED -> ACTIVE
          -> ROTATING | SUSPENDED | EXPIRED | REVOKED
          -> ARCHIVED
```

Every credential shall bind:

- Credential identity and type
- Subject identity
- Issuer
- Audience and purpose
- Organization, tenant, environment, and resource scope
- Effective and expiry time
- Authentication and assurance profile
- Delegation and onward-use restrictions
- Key or secret reference
- Rotation lineage
- Suspension and revocation conditions

Rotation creates a new credential identity and preserves predecessor history.

Expired, suspended, revoked, malformed, wrong-audience, wrong-tenant, or unverifiable credentials shall not authenticate execution.

Credential recovery shall never reactivate a compromised credential.

---

# Revocation and Compromise

Revocation shall define:

- Revocation authority
- Subject, credential, key, issuer, or trust-root scope
- Reason and effective time
- Propagation objective
- Active executions and downstream trust affected
- Required interruption, containment, review, and recertification
- Evidence and notification

Authority revocation prevents new effects and invokes PPS-3646 interruption governance.

If revocation state cannot be checked within the permitted freshness window, sensitive execution shall fail closed.

Historical actions valid before revocation remain visible. Revocation does not erase history or retroactively fabricate invalidity.

Compromise response shall contain affected identities and credentials, preserve evidence, rotate or replace trust material, evaluate downstream executions and certifications, and require governed recovery.

---

# Cryptographic Trust Requirements

Cryptographic trust shall define:

- Trust-root identity and accountable owner
- Key owner, custodian, permitted use, algorithm profile, and environment
- Generation or import authority
- Protection and access boundary
- Public-key or verification-material distribution
- Rotation, overlap, expiry, escrow where permitted, destruction, and succession
- Signature purpose, subject, audience, context, and freshness
- Compromise, revocation, and downstream impact
- Independent verification and audit evidence

Signatures shall be verified against the exact signed content identity, trusted issuer, approved algorithm and key state, intended purpose, audience, context, and time.

A valid signature from an unauthorized, expired, revoked, compromised, wrong-purpose, or wrong-tenant key shall not establish trust.

Private keys and shared secrets shall not appear in execution evidence.

Evidence shall reference protected key identities and verification results.

Trust-root succession shall preserve old verification capability for retained evidence while preventing old roots from authorizing new work after retirement.

---

# Impersonation and Delegation

Impersonation is prohibited unless an explicit constitutional policy defines:

- Original actor
- Acting identity
- Granting authority
- Purpose and scope
- Effective period
- User or organization notice
- Prohibited actions
- Evidence and review

Delegation shall bind delegator, delegate, subject, organization, action, resource, purpose, effective period, subdelegation rule, revocation, and evidence.

Delegation cannot exceed or outlive the delegator's authority.

Identity delegation and authority delegation are distinct and shall both validate.

---

# Break-Glass Trust

Emergency access is a governed exception, not a superuser bypass.

Break-glass execution requires:

- Predefined emergency policy
- Verified emergency actor
- Bounded action, resource, organization, and duration
- Independent approval or quorum where feasible
- Explicit reason and incident identity
- Enhanced monitoring and evidence
- Automatic expiry and credential revocation
- Mandatory post-event review
- Downstream validation and certification impact evaluation

Break-glass authority cannot modify constitutional history, self-certify, disable evidence, or silently expand tenant scope.

---

# Identity Failure Scenarios

| Failure | Preventative Control | Detection | Evidence | Recovery |
|---|---|---|---|---|
| Stolen human identity | Strong proofing, phishing-resistant authentication, bounded sessions | Anomalous use, failed posture, reported compromise, concurrent session conflict | Identity, credential, session, affected actions, detection and containment | Suspend credentials, interrupt effects, re-proof identity, issue new credentials, review downstream trust |
| Invalid credential | Issuer, format, signature, audience, scope, and policy validation | Verification failure | Credential identity or safe digest, issuer, reason, request | Deny; obtain valid credential through governed issuance |
| Expired credential | Bounded lifetime and consumption-time checking | Expiry comparison using governed time | Credential and expiry, attempted use | Deny; reauthenticate and issue or activate a new credential |
| Revoked identity or credential | Revocation registry and bounded propagation | Current revocation check or invalidation event | Revocation identity, authority, time, scope, consumers | Stop new effects, interrupt active work, remediate, create new trust lineage |
| Forged request | Signed or integrity-bound requests, nonce or replay controls, channel and audience binding | Signature, digest, nonce, sequence, or provenance mismatch | Request identity, failed check, claimed actor, receiving boundary | Reject, preserve security evidence, contain affected issuer or key |
| Compromised service key | Protected key custody, least privilege, rotation | Key-use anomaly, integrity finding, disclosure report | Key identity, uses, affected credentials and executions | Revoke key, fence service, rotate trust, review and recertify affected results |
| False issuer | Explicit issuer registry and trust-root validation | Unknown or out-of-scope issuer | Issuer claim, trust evaluation, request | Reject and investigate; no trust inheritance |

---

# Evidence Requirements

Identity trust evidence shall include:

- Identity, class, owner, issuer, and assurance level
- Verification method and result
- Credential identity, scope, audience, lifecycle, and freshness
- Organization and tenant binding
- Delegation or impersonation chain
- Trust-root, key, and verification-policy identities
- Revocation and compromise checks
- Authentication event and execution correlation
- Break-glass or recovery decisions
- Failure and containment

Sensitive credential material and private keys shall never be stored as evidence.

---

# Failure Behavior

PBOS shall deny or interrupt execution when identity, issuer, credential, organization binding, trust root, signature, delegation, freshness, or revocation state is missing, conflicting, stale beyond policy, compromised, or unverifiable.

Identity recovery creates new governed trust.

It does not rewrite the identity or execution history that failed.

---

# Governance

The canonical identity authority owns identity truth.

The credential issuer owns issuance within delegated scope.

The security authority owns trust policy and compromise containment.

The execution admission authority consumes verified identity and separately validates authority.

The certifier independently evaluates identity and trust evidence required by its certification type.

No owner may self-issue broader trust through implementation control.
