# Counselor Verification Authority

## Status

Implementation decision for the independent High School Counselor pathway.

## Role invariant

High School Counselor is a first-class Playbook role with its own onboarding and `/counselor-os` destination.

Counselor authority is not granted by selecting the role, completing onboarding, naming a school, entering a district, or providing an official-looking email.

## Authority model

Counselor activation requires all applicable authority evidence:

1. approved Counselor identity/school evidence;
2. approved school or district scope; and
3. a separately governed active Counselor-to-Scholar relationship for Scholar-specific access.

Identity approval alone grants no Scholar access.
A Scholar relationship alone grants no Counselor authority without approved identity and scope.

## Verification evidence

The authenticated Counselor onboarding record supplies:

- school
- district
- official school email
- counseling scope

The scope may include academic planning, college applications, financial aid, career planning, student wellbeing, and transition support.

## Verifier authority

The repository does not yet define the canonical person or institution allowed to approve/reject Counselor identity and scope evidence.

This package therefore creates no authenticated approval endpoint and no authenticated approval policy. Counselors cannot self-approve, self-reject, or write review notes.

## Relationship authority

This package creates no Counselor-to-Scholar relationship and no roster/cohort membership.

A separate governed relationship lifecycle must prove which Scholars the Counselor may access. School or district affiliation alone is not sufficient.

## Protected capabilities

Until identity, scope, and relationship authority are proven, Counselor OS shall not grant:

- Scholar Record access
- transcript access
- college/application data
- financial-aid data
- recommendation authority
- evidence verification
- interventions or support actions on a Scholar record
- cohort or institution-wide student visibility

## Definition of done for this package

- Counselor evidence persists in a dedicated owner-scoped request.
- Only the authenticated Counselor can submit/read/update pending evidence.
- Counselor cannot self-approve.
- `/counselor-os` renders its own verification lifecycle.
- Approved identity alone does not activate Counselor authority.
- Relationship presence alone does not activate Counselor authority.
