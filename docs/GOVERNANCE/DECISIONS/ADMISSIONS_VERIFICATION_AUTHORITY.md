# College Admissions Verification Authority

## Status
Implementation decision for the independent Admissions pathway.

## Role invariant
College Admissions is a first-class role with its own onboarding and `/admissions-os` destination. Admissions authority is not granted by role selection, onboarding completion, department, territory, search criteria, or an official-looking email.

## Authority model
Activation requires approved institutional admissions identity plus separately approved admissions/search/contact scope.

## Evidence and scope
Onboarding evidence includes institution, department, territory, official email, GPA criteria, target majors, student populations, contact preference, and engagement opportunities. These values are requested scope, not permission.

## Verifier authority
The canonical institutional approver is not yet defined. This package creates no authenticated approval endpoint or approval policy and does not allow self-approval.

## Protected capabilities
Until identity and scope are approved, Admissions OS shall not grant Scholar search, application data, transcript data, contact information, candidate lists, direct outreach, admissions review, or any selection/decision capability.

## Definition of done for this package
- Admissions evidence persists in an owner-scoped request.
- Only the authenticated Admissions user can submit/read/update pending evidence.
- `/admissions-os` renders its independent verification lifecycle.
- Identity approval alone does not activate Admissions authority.
- Requested scope alone does not activate Admissions authority.
