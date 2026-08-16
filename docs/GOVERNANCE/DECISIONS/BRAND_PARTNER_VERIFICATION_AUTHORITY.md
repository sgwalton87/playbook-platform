# Brand Partner Verification Authority

## Status
Implementation decision for the independent Brand Partner pathway.

## Role invariant
Brand Partner remains a first-class `/brand-partner-os` experience. The existing Brand Partner workspace is preserved, but it is inaccessible until authority is proven.

## Authority model
Workspace activation requires all three:
1. approved organization identity;
2. approved campaign scope; and
3. approved compliance scope.

Organization verification alone does not permit campaign creation. Campaign scope alone does not permit NIL/athlete activity without compliance approval.

## Evidence and scope
Onboarding evidence includes organization, title/category, partnership goals, target audience, budget context, NIL/compliance acknowledgement, campaign types, and approval contact. These are requested scopes, not permissions.

## Verifier authority
The canonical organization/campaign/compliance approvers are not yet defined. This package creates no authenticated approval endpoint or approval policy and does not allow self-approval.

## Protected capabilities
Until all three gates are satisfied, the preserved Brand Partner workspace does not render. Campaign creation, opportunity publication, Scholar interaction, athlete-facing NIL activity, application review, and partner messaging remain unavailable from Brand Partner OS.

## Definition of done for this package
- Brand evidence persists in an owner-scoped request.
- Campaign and compliance approvals are stored separately from identity status.
- Only the authenticated Brand Partner can submit/read/update pending evidence and cannot set approval fields.
- Existing Brand Partner UI is preserved behind the specialized gate.
- All three authority gates are required before workspace rendering.
