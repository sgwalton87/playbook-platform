# Coach Verification Authority

## Status

Implementation decision for the independent High School Coach pathway.

## Role invariant

A High School Coach is a first-class Playbook role with its own onboarding and `/coach-os` destination.

Coach authority must never be inferred from choosing the Coach role, completing onboarding, using an official-looking email address, or entering a school/team name.

## Authority model

Coach activation requires two independent proofs:

1. **Coach identity / institutional evidence is approved.**
2. **A governed active `coach` relationship to a Scholar / Scholar-Athlete exists.**

Both conditions are required.

An approved identity request without a Scholar relationship does not grant Scholar data access.

A Scholar relationship without approved Coach identity evidence does not grant Coach authority.

## Verification request

Coach onboarding supplies the evidence used to create a verification request:

- high school
- school city and state
- official school email
- primary sport coached
- coaching role
- years of coaching experience
- approximate roster size
- film-upload intent
- player-recommendation intent
- athlete support priorities

The authenticated Coach may submit and correct their own evidence while the request is pending.

The Coach may not self-approve, self-reject, set review notes, or mark review complete.

## Approval authority

The repository does not yet define the canonical human or institutional verifier authorized to approve/reject Coach identity evidence.

Therefore this package intentionally creates **no authenticated approval endpoint** and grants no authenticated user permission to move a request into `approved` or `rejected`.

That approving-authority contract must be specified separately before Coach identity certification can be considered production-complete.

## Scholar relationship authority

This package does not create an active `coach` support relationship.

A separate governed relationship lifecycle must prove the Coach-to-Scholar/Scholar-Athlete relationship before Coach access activates.

Until that lifecycle exists, Coach OS remains fail-closed even if identity evidence is approved.

## Mentor validation impact

Mentor validation may treat a Coach as a privileged one-person validator only when an active `support_relationships.relationship = 'coach'` row already exists through the separate governed Coach relationship lifecycle.

A Coach verification request alone never counts as Mentor validation authority.

## Permissions

No new Scholar permissions are granted by this package.

## Definition of done for this package

- Coach evidence persists in a dedicated owner-scoped verification request.
- Only the authenticated Coach can submit/read/update pending evidence.
- Coach cannot self-approve.
- `/coach-os` shows independent verification states.
- Identity approval alone does not unlock Coach authority.
- Active Coach relationship alone does not unlock Coach authority.
- No Mentor-validation authority exists without a separately active Coach relationship.
