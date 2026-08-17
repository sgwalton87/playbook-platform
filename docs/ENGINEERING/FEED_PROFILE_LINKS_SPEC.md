# Feed Profile Links — Implementation Specification

Status: Implementation-scoped
Owner: Playbook Platform / Feed shared service
Phase: 6 — Feed

## Purpose

Certify that author links in Feed use the canonical public-profile publication boundary and never turn an internally resolvable or legacy author identity into an unauthorized public-profile link.

## Canonical source

Feed does not own profile routing or publication state.

- `public.profiles` remains the canonical profile record.
- `get_public_member_identities(uuid[])` remains the privacy-safe Feed identity projection.
- `/u/[username]` remains the canonical public-profile route.

## Linkability rule

For a viewer other than the profile owner, Feed may render `/u/{username}` only when the author identity was returned by the consent-aware public identity projection.

That projection requires:

1. `profiles.profile_visibility = 'public'`
2. active `public_profile_publication_consents`
3. `consent_version = 'public-profile-v1'`
4. `revoked_at is null`

An authenticated profile owner may resolve and link to their own profile even when private because the canonical profile route permits owner access.

## Fail-closed behavior

When an author identity is not authorized for projection:

- Feed displays the neutral `Playbook member` fallback;
- `username` remains null;
- no clickable `/u/` profile link is rendered;
- the post itself remains governed by its independent Feed visibility setting.

Profile publication consent and post publication remain separate permissions.

## Experience behavior

Authorized author links use the existing username affordance beneath the author name.

Links shall be recognizable, keyboard reachable, and use the canonical profile route. No duplicate modal/profile surface is introduced.

## Security and privacy

- Feed shall not query private profile fields to decide linkability.
- Linkability shall derive from the same privacy-safe identity projection that supplies author presentation data.
- Revocation of public-profile consent removes future public identity projection and therefore removes the Feed profile link without deleting historical posts.

## Definition of Done

Profile Links are complete when:

- Feed only renders `/u/{username}` when `post.username` came from the consent-aware identity projection;
- unresolved/unconsented authors do not receive links;
- owner self-link remains compatible;
- database preflight proves public consent, revocation, and owner-self semantics for the identity projection;
- unit regression locks conditional link rendering;
- CI, Database Certification, exact-head Vercel, merge, and production deployment are green.
