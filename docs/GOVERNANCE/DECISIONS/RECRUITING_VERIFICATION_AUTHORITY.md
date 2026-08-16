# College Coach / Recruiter Verification Authority

## Status
Implementation decision for the independent Recruiting pathway.

## Role invariant
College Coach / Recruiter is a first-class role with its own onboarding and `/recruiting-os` destination.

Recruiting authority is not granted by role selection, onboarding completion, institution name, division claim, or an official-looking email.

## Authority model
Activation requires:
1. approved institutional/recruiting identity evidence; and
2. separately approved recruiting scope.

A verified institutional identity does not imply permission to discover or contact every Scholar-Athlete.

## Verification evidence
The authenticated onboarding record supplies institution, conference/division, official institutional email, recruiting sport, positions/events, geography, graduation classes, contact preference, and authorization context.

## Scope governance
Recruiting radius, sport, positions, graduation classes, and contact preferences are requested scope—not permission. Scholar-Athlete visibility must remain governed by separate sharing/relationship rules and any applicable compliance requirements.

## Verifier authority
The repository does not yet define the canonical institutional/compliance approver for recruiting identity and scope. This package creates no authenticated approval endpoint or approval policy.

## Protected capabilities
Until identity and scope are approved, Recruiting OS shall not grant athlete discovery, verified-record access, direct outreach, recruiting lists, contact data, eligibility data, or recruiting decisions.

## Definition of done for this package
- Recruiting evidence persists in an owner-scoped request.
- Only the authenticated recruiter can submit/read/update pending evidence.
- Recruiter cannot self-approve.
- `/recruiting-os` renders its independent verification lifecycle.
- Identity approval alone does not activate recruiting authority.
- Requested recruiting scope alone does not activate recruiting authority.
