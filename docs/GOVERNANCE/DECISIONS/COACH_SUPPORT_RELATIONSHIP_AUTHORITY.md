# Coach Support Relationship Authority

## Decision

A Coach support relationship is distinct from Coach identity verification and distinct from Coach data-access permissions.

The active relationship may exist only when:

1. a self-owned Scholar Record account originates the Coach invitation;
2. the invited email matches the authenticated Coach account;
3. Coach onboarding is complete;
4. the Coach identity verification request is already approved; and
5. the Coach accepts the invitation.

## Zero-data activation

The initial active Coach relationship carries an empty permission set.

It does not grant:

- Scholar Record access;
- progress visibility;
- verified-record visibility;
- evidence verification;
- recruiting access;
- recommendation authority;
- roster access;
- messaging authority beyond shared platform rules.

This relationship is identity/consent evidence only.

## Mentor validation

Mentor validation already recognizes an active `coach` relationship as a privileged single validator. This package supplies the missing governed path that can create that relationship without fabricating Coach authority.

A Coach relationship counts for Mentor validation only after the above activation requirements have been satisfied.

## Full Coach permissions

Full Coach permissions remain a separate future authority contract. No future permission may be inferred merely from the existence of an active Coach relationship.

## Verifier boundary

This package does not define who approves Coach identity evidence. The Coach verification lifecycle remains fail-closed until the canonical verifier contract is specified and certified.

## PBOS release gate

Production certification requires:

- the Coach verification migration and Coach relationship activation migration applied in a governed environment;
- exact-head acceptance proving unverified Coaches cannot activate invitations;
- exact-head acceptance proving approved Coaches can activate only zero-permission relationships;
- Mentor validation acceptance proving only an active verified Coach relationship receives privileged-validator treatment.
