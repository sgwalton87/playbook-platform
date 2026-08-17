# Feed Real Author Identity — Implementation Specification

Status: Implementation-scoped
Owner: Playbook Platform / Feed shared service
Phase: 6 — Feed

## Purpose

Make Feed author identity truthful, complete within the current Feed query bounds, privacy-preserving, and derived from the canonical profile record without exposing unpublished profile data.

## Canonical source

Feed does not own identity. `public.profiles` remains the canonical profile source. Feed may consume only the established presentation-grade identity projection.

## Publication boundary

For any viewer other than the profile owner, Feed may resolve an author's public identity only when both conditions are true:

1. `profiles.profile_visibility = 'public'`
2. an active `public_profile_publication_consents` record exists with `consent_version = 'public-profile-v1'` and `revoked_at is null`

A public Feed post does not implicitly publish the author's profile and shall not bypass the explicit profile-publication consent boundary.

## Legacy posts

Existing public posts whose authors do not satisfy the publication boundary remain visible according to their existing post visibility, but their author identity shall fail closed to a neutral Playbook-member label. This repair shall not retroactively expose an author or silently change historical post visibility.

## Projection authority

`get_public_member_identities(uuid[])` shall preserve the canonical public-wrapper/private-helper split:

- public function: `SECURITY INVOKER`
- private helper: `SECURITY DEFINER`
- bounded input: 1–100 identifiers per call
- output limited to presentation-grade identity fields
- callable by anonymous and authenticated viewers because the public News Feed consumes the same privacy-safe projection

## Completeness

The authenticated Feed currently loads at most 50 posts and the public News Feed at most 30 posts. Therefore the unique post-author set is bounded below the 100-ID projection limit and can be resolved without truncation loss. Comment-author scaling beyond 100 identities is explicitly deferred to the Phase 6 Comments task, where comment pagination and identity batching are audited together.

## Experience truth

When an identity is authorized, Feed displays the canonical public name/username/role/avatar projection.

When an identity is not authorized, Feed shall display a neutral fallback and shall not create a clickable public-profile link for that identity.

## Security and privacy

- No Feed query may read private profile fields directly for other users.
- Profile publication consent is independent from post visibility.
- Revoking public-profile consent immediately removes public identity projection without deleting historical posts.
- The profile owner may still see their own canonical identity in the authenticated Feed experience.

## Definition of Done

Real Author Identity is complete when:

- the identity RPC requires the current explicit publication-consent boundary for non-owner public projection;
- public/private SECURITY INVOKER/DEFINER separation remains intact;
- current Feed and Public News Feed post-author sets remain within the bounded projection contract;
- legacy unconsented public posts fail closed to neutral author labels;
- regression and database preflight tests prove no unpublished identity leakage;
- CI, Database Certification, and production build are green.
