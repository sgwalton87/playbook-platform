# Verified Zero-Data Relationship Activation

## Decision

A verified external/support role may activate an exact Scholar relationship after accepting a Scholar-originated invitation only when the role's independent verification evidence is already approved.

The relationship created by this process carries an empty permission set.

## Supported exact relationships

- Educator
- High School Counselor
- District Administrator
- College Coach / Recruiter
- College Admissions
- Community Partner
- Employer Partner

Coach uses its separately governed verified Coach activation path. Parent / Guardian and Mentor retain their existing consent/validation contracts.

## Verification requirements

Activation checks the canonical verification row owned by the authenticated invitee:

- Educator → approved Educator verification
- Counselor → approved Counselor verification
- District Administrator → approved District verification
- College Recruiter → approved Recruiting verification
- College Admissions → approved Admissions verification
- Employer Partner → approved Employer verification
- Community Partner → approved Community Partner verification and approved service scope

The authenticated durable role and completed role onboarding must match the exact relationship identity.

## Zero-data invariant

The activated relationship is identity and consent evidence only.

It grants no Scholar Record, progress, cohort, evidence, recruiting, admissions, applicant, opportunity, referral, or support-action permission.

Any future data capability requires a separate explicit permission activation contract with a defined scope and revocation path.

## Atomicity

Invitation acceptance, relationship creation, and invitation consumption occur in the same database claim transaction. A verification failure leaves the invitation pending and creates no relationship.

## Legacy identities

Generic `university_partner` is not eligible for new verified activation. University relationships must use exact `college_recruiter` or `college_admissions` identity.

## PBOS release gate

Production certification requires governed migration application and exact-head acceptance proving:

- unverified invitees cannot activate;
- wrong-role invitees cannot activate;
- approved invitees activate only the exact invited relationship;
- activated relationships have an empty permission set;
- failed activation leaves the invitation pending;
- no relationship can broaden access beyond its independent OS authority contract.
