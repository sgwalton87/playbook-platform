# Feed Timeline Visibility Specification

## Purpose

Define the canonical Phase 6 Timeline Visibility behavior for public and owner-private Feed stories.

## Canonical ownership

- `feed_posts.visibility` remains the canonical audience field.
- Supported values are `public` and `private`.
- No second private-feed table is permitted.

## Read behavior

- Public News Feed shall read only `visibility='public'` posts.
- Authenticated Feed shall show public posts plus the signed-in user's private posts.
- A user shall never read another user's private post.
- Private post visibility is enforced by database RLS, not only by client filtering.

## Composer behavior

The authenticated composer shall offer:

- `Public` — visible in authenticated and public Feed experiences.
- `Only me` — visible only to the post owner in authenticated Feed.

The chosen visibility shall be persisted to canonical `feed_posts.visibility`.

## Media privacy boundary

The current `photos` and `feed-videos` buckets are intentionally public publication services.

Therefore:

- `Only me` posts shall be text-only in this phase.
- If a user switches to `Only me` while public media is selected, the selected media shall be cleared and the interface shall explain why.
- The media picker shall be disabled for `Only me` posts.
- The platform shall not pretend public-bucket media is private.

Future private-media support may extend Timeline Visibility through a separately governed private storage service without changing canonical Feed ownership.

## Presentation

Owner-private stories shall display an `Only me` indicator in authenticated Feed.

Public stories preserve existing presentation.

## Security

- Anonymous users may read only public posts.
- Authenticated owners may read their own public/private posts.
- Other authenticated users may read only public posts.
- Private posts must not appear in Public News Feed.

## Definition of Done

Timeline Visibility is complete when:

1. Composer exposes Public / Only me.
2. Visibility persists to `feed_posts.visibility`.
3. Owner sees own private posts in authenticated Feed.
4. Other users and anonymous callers cannot read those private posts.
5. Public News Feed remains public-only.
6. Private posts cannot attach media from public buckets.
7. UI communicates the private-media limitation honestly.
8. CI, full Database Certification, and exact-head Vercel pass.