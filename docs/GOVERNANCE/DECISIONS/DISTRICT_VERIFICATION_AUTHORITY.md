# District / School Administrator Verification Authority

## Status
Implementation decision for the independent District / School Administrator pathway.

## Role invariant
District / School Administrator is a first-class Playbook role with its own onboarding and `/district-os` destination.

Administrative authority is not granted by role selection, onboarding completion, district name, job title, or an official-looking email.

## Authority model
Activation requires:
1. approved administrator identity / institutional evidence; and
2. separately approved administrative scope.

A verified identity does not imply district-wide or school-wide student access.

## Verification evidence
The authenticated onboarding record supplies:
- district
- school or department
- official institutional email
- administrator title
- requested administrative scope

## Scope governance
Requested scope is evidence, not permission. Cohort, equity, readiness, intervention, and Scholar visibility must remain limited to separately approved scope.

## Verifier authority
The repository does not yet define the canonical approver for administrator identity or administrative scope. This package therefore creates no authenticated approval endpoint and no approval policy. Administrators cannot self-approve, self-reject, or approve their own scope.

## Protected capabilities
Until identity and scope are approved, District OS shall not grant:
- Scholar-level record access
- cohort membership or roster visibility
- readiness/intervention data
- equity metrics
- school- or district-wide analytics
- administrative actions

## Definition of done for this package
- Administrator evidence persists in an owner-scoped request.
- Only the authenticated administrator can submit/read/update pending evidence.
- Administrator cannot self-approve.
- `/district-os` renders its independent verification lifecycle.
- Identity approval alone does not activate administrative authority.
- Requested scope alone does not activate administrative authority.
