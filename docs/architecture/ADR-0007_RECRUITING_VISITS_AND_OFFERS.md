# ADR-0007 — Recruiting Visits and Offers Evidence Architecture

Status: Accepted for implementation

## Context

Recruiting targets own school/program pipeline context and recruiting target events own durable timeline history. Neither is a sufficient canonical owner for scheduled visits or offer evidence. A visit has its own date, type, status, location/mode, notes, and lifecycle. An offer is a consequential recruiting claim that requires source/provenance and a visible distinction between Scholar-reported and independently verified evidence.

## Decision

### Recruiting Visits

`recruiting_visits` is the canonical owner for Scholar-specific recruiting visits tied to `recruiting_targets`.

A visit records:
- Scholar and recruiting target
- visit kind
- scheduled start/end
- location/mode
- lifecycle status
- Scholar notes
- provenance
- created/updated timestamps

Visit lifecycle changes may emit `recruiting_target_events` timeline entries, but the timeline is derived history and does not replace the visit record.

### Recruiting Offers

`recruiting_offers` is the canonical owner for recruiting offer claims tied to `recruiting_targets`.

An offer records:
- Scholar and recruiting target
- offer kind and status
- offered/observed date
- optional summary of disclosed terms
- source label and source URL
- optional linked `athlete_evidence` record
- verification state
- supersession/correction history
- provenance

Direct Scholar entry is always `self_reported`. A Scholar cannot mark an offer verified, mutate verification authority fields, or delete history. Corrections are append-only through supersession.

### Verification

This package does not grant Coaches, Recruiters, or administrators new verification authority. Independent offer verification must reuse Playbook's governed verification-review architecture in a separate explicit authority extension. Until then, offer records remain visibly self-reported unless linked evidence is already independently verified; linked evidence strengthens provenance but does not itself convert the recruiting offer claim into an officially verified offer.

## Trust Boundaries

- A recruiting pipeline stage is not proof of a visit or offer.
- A Scholar-entered offer is not represented as verified fact.
- Playbook does not infer coach/recruiter interest, scholarship value, roster guarantees, admissions outcomes, or eligibility from an offer record.
- No offer record grants a Coach/Recruiter Scholar Record permissions.
- No financial-aid, legal, admissions, or governing-body clearance is inferred.

## Canonical Ownership

- School/program recruiting context: `recruiting_targets`
- Visit record: `recruiting_visits`
- Offer claim/evidence: `recruiting_offers`
- Athletic evidence: `athlete_evidence`
- Historical recruiting activity: `recruiting_target_events`

## Release Requirements

- Owner-scoped RLS
- Append-only Scholar offer evidence
- Same-Scholar target/evidence/supersession validation
- Deterministic timeline projection for visit lifecycle and offer recording
- Honest empty states
- CI, full database certification, and Vercel on the exact immutable head
