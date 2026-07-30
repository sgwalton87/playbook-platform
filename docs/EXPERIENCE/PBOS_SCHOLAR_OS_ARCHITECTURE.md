# PBOS Scholar OS Architecture

**Purpose:** Define the governed human-facing operating environment that translates PBOS capability decisions into Scholar-controlled experiences.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026  
**Related:** [Scholar Record Engine](../ENGINEERING/PBOS_SCHOLAR_RECORD_ENGINE_ARCHITECTURE.md), [Engine Operating Model](../ENGINEERING/PBOS_ENGINE_OPERATING_MODEL.md)

## Architecture Decision

Scholar OS is an experience layer, not an authority layer or dashboard. It reflects canonical Scholar Record facts and Kernel capability decisions. It cannot create permission, entitlement, capability admission, engine availability, or production authority.

```text
Human identity
  -> Scholar Record
  -> capability eligibility
  -> Kernel authorization
  -> engine availability
  -> Scholar OS experience
  -> human action
```

## Experience Domains

- **Identity:** Who am I?
- **Story:** What have I done?
- **Goals:** Where am I going?
- **Journey:** What progress am I making?
- **Opportunities:** What can I pursue?
- **Connections:** Who can help me?
- **Growth:** How am I developing?

`ScholarOSExperienceArchitecture` binds these domains to the Scholar owner, capability dependencies, permission and consent boundaries, human-confirmation rules, lifecycle, and digest.

## Home Environment

`ScholarHomeExperience` answers:

- Who am I through identity, interests, and goals?
- What have I done through evidence-backed achievements and milestones?
- Where am I going through goals and pathways?
- What should I do next through governed recommendations, opportunities, and reminders?

Home content references governed records. It does not promote display content into canonical truth.

## Profile And Ownership

Scholar facts support identity, education, athletics, interests, skills, activities, achievements, goals, and development milestones. Every fact binds:

- Scholar and owner identity;
- source and source reference;
- evidence;
- human confirmation;
- timestamp;
- revision and previous digest;
- sensitivity and artifact digest.

Missing provenance, cross-Scholar ownership, unsupported facts, and unauthorized sensitive access fail closed.

## Capability-Aware Experience

`ExperienceCapabilityFramework` returns only:

- `AVAILABLE`
- `LOCKED`
- `PENDING`
- `REQUIRES_PERMISSION`
- `UNAVAILABLE`

The experience can make a Kernel state more restrictive when role, permission, consent, decision reference, or integrity is invalid. It cannot upgrade Kernel state.

Scholar Record availability is Kernel-controlled. Career intelligence remains capability-controlled, institutional analytics organization-controlled, and commercial capability access entitlement-controlled.

## Human Agency

Scholar OS may suggest, organize, highlight, and recommend when output is explained, evidence-linked, and human-confirmed.

It may not decide, rank human worth, replace advisors, create facts, or take irreversible action.

## Multi-Role Foundation

Scholar, parent, mentor, coach, counselor, and institution roles share capability contracts but have separate permission, visibility, and consent rules. Navigation and capability visibility are resolved from role plus Kernel-governed permission, never from client presentation state.

Scholar OS is the reference architecture for future role operating systems; it does not grant those roles access to Scholar data.

## Production Boundary

The experience foundation is implemented behind existing activation controls. It creates no React UI, production provider, engine activation, Scholar fact, entitlement, or runtime state.

