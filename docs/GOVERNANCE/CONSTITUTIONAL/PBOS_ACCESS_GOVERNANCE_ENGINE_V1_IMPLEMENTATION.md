# PBOS Access Governance Engine V1

## Purpose
Document PBOS-ENGINE-ACCESS-GOVERNANCE-001 and its deterministic trust, age, identity, consent, role, relationship, training, compliance, jurisdiction, risk, permission, and approval boundary.

## Ownership
Playbook OS Engineering owns this implementation record. People retain identity and consent authority; qualified humans and institutions retain role, compliance, legal, admissions, recruiting, employment, and eligibility authority.

## Last Updated
July 26, 2026

## Related Documents
- [Engineering constitution](../../../CODEX.md)
- [Identity Engine](./PBOS_IDENTITY_ENGINE_V1_IMPLEMENTATION.md)
- [Role Engine](./PBOS_ROLE_ENGINE_V1_IMPLEMENTATION.md)
- [Institution Engine](./PBOS_INSTITUTION_ENGINE_V1_IMPLEMENTATION.md)
- [Communication Engine](./PBOS_COMMUNICATION_ENGINE_V1_IMPLEMENTATION.md)

## Architecture Implemented
The `pbos/access` domain defines configurable age governance, all 14 onboarding policies, role-specific age exceptions, consent, training, permissions, approvals, deterministic access decisions, recruiting firewall outcomes, immutable audit records, and governed lifecycle transitions. Age is never an independent proxy for capability or authority.

## Youth, Mentor, and Athlete Protection
Children require guardian relationship, consent, restricted visibility, and no unrestricted messaging or networking. Youth require age verification, consent, protected communication, and no unauthorized adult or recruiting contact. International scholar-athletes are supported from age 14 with athlete compliance education. Peer mentors are supported from age 16 only with training, verified program relationship, supervision, and limited permissions; adult mentors use the full verification model.

## Compliance and Governance
Training supports athlete, coach, recruiting communication, eligibility protection, NIL awareness, platform rules, and mentor training. Coach/athlete recruiting interaction requires verified identity, role, institution where applicable, relationship, consent, permissions, current acknowledged training, and human approval. The engine does not replace NCAA or other compliance offices and cannot make admissions, recruiting, employment, eligibility, or legal decisions or guarantee outcomes.

## Lifecycle
The lifecycle is `CREATED`, `VERIFYING`, `VERIFIED`, `ACTIVE`, `RESTRICTED`, `SUSPENDED`, `REVOKED`, and `ARCHIVED`; invalid or unevidenced transitions fail closed.
