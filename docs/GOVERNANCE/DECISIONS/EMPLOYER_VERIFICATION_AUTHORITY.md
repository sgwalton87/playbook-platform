# Employer / Workforce Partner Verification Authority

## Status
Implementation decision for the independent Employer pathway.

## Role invariant
Employer is a first-class role with its own onboarding and `/employer-os` destination. Hiring authority is not granted by role selection, onboarding completion, organization name, website, or official-looking email.

## Authority model
Activation requires approved organization identity plus separately approved opportunity-publishing scope. Candidate-specific review additionally requires a separate application/sharing relationship; organization verification never creates a global candidate pool.

## Evidence and scope
Onboarding evidence includes organization name, official email, website, opportunity types, and candidate audience. These values are requested scope, not permission.

## Verifier authority
The canonical organization verifier is not yet defined. This package creates no authenticated approval endpoint or approval policy and does not allow self-approval.

## Protected capabilities
Until identity and opportunity scope are approved, Employer OS shall not grant opportunity publication, candidate records, application review, contact information, hiring workflows, or candidate decisions.

## Definition of done for this package
- Employer evidence persists in an owner-scoped request.
- Only the authenticated Employer can submit/read/update pending evidence.
- `/employer-os` renders its independent verification lifecycle.
- Identity approval alone does not activate Employer authority.
- Candidate access remains separately relationship/application-scoped.
