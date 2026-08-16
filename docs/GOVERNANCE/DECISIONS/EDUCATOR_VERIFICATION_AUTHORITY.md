# Educator Verification Authority

## Status

Implementation decision for the independent Educator pathway.

## Role invariant

Educator is a first-class role with its own onboarding and `/educator-os` destination.

Educator authority is not granted by selecting the role, completing onboarding, entering student names, or providing an official-looking school email.

## Authority model

Educator activation requires both:

1. approved Educator identity / school evidence; and
2. a separately governed active Educator-to-Scholar or institution/cohort relationship.

Both conditions are required.

Identity approval alone grants no student access.
A relationship alone grants no Educator authority without approved identity evidence.

## Verification evidence

The request is derived from authenticated Educator onboarding data:

- school
- district
- official school email
- subjects taught
- whether the Educator already supports students
- letter-of-recommendation availability
- support focus

Student names entered during onboarding are context only. They do not create relationships, access, roster membership, or Scholar visibility.

## Verifier authority

The repository does not yet define the canonical human/institutional verifier allowed to approve or reject Educator evidence.

Therefore this package creates no authenticated approval endpoint and no authenticated approval policy. Educators cannot self-approve or self-reject.

## Relationship authority

This package creates no Educator-to-Scholar or Educator-to-cohort relationship.

A separate governed relationship lifecycle must prove the applicable school, cohort, or Scholar relationship before any Educator capability can activate.

## Protected capabilities

Until both identity and relationship authority are proven, Educator OS must not grant:

- Scholar record access
- evidence verification
- recommendations
- cohort access
- transcript visibility
- application data
- institutional analytics

## Definition of done for this package

- Educator evidence persists in a dedicated owner-scoped request.
- Only the authenticated Educator can submit/read/update pending evidence.
- Educator cannot self-approve.
- `/educator-os` renders its own verification lifecycle.
- Identity approval alone does not activate Educator authority.
- Relationship presence alone does not activate Educator authority.
