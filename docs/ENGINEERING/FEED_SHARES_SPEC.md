# Feed Shares Specification

## Purpose

Define the canonical Phase 6 Shares capability for public Playbook Feed stories.

## Scope

Shares allow an authenticated user to share a public Feed story through a stable public permalink while preserving an auditable completion event.

Shares do not duplicate Feed posts and do not expose private stories.

## Canonical ownership

- `feed_posts` remains the canonical story record.
- Public permalink: `/story/[id]`.
- `feed_post_shares` records completed share actions.
- A share record references the canonical post and the authenticated user who completed the action.

## Share channels

Supported completion channels:

- `native` — browser/OS Web Share completed successfully.
- `copy_link` — canonical story permalink copied to clipboard successfully.

A cancelled or failed share shall not be recorded as completed.

## Public story permalink

`/story/[id]` shall:

- render only `visibility='public'` Feed stories;
- use the same consent-aware public identity projection as other public Feed experiences;
- render image/video media according to canonical `media_type`;
- fail closed for private, missing, or unauthorized posts;
- provide a path back to the public News Feed and Playbook signup.

## Share authority

Authenticated callers may record a share only when:

- the referenced Feed post exists;
- `visibility='public'`;
- the channel is one of the supported completion channels;
- `user_id` is derived from the authenticated session rather than client input.

Anonymous share-event mutation is denied.

Private posts shall never expose a Share action in the authenticated Feed.

## Data minimization

A share record stores only:

- identifier;
- post identifier;
- authenticated sharer identifier;
- completion channel;
- created timestamp.

It does not store recipient identity, external destination, contact lists, or browser history.

## Experience

Public Feed cards shall expose a Share action.

- If Web Share is available, use it with the canonical permalink.
- Otherwise copy the canonical permalink.
- Record completion only after native share or copy succeeds.
- Provide clear success/error feedback.
- Owner-private cards do not expose Share.

## Observability

Share completion events are persisted so aggregate adoption can be measured without collecting recipient data.

## Definition of Done

Shares are complete when:

1. Stable `/story/[id]` public permalink exists.
2. Private stories fail closed at the public permalink.
3. Authenticated Feed exposes Share only on public stories.
4. Native/copy completion is persisted only after success.
5. Share records reference canonical `feed_posts` and authenticated `profiles`.
6. Anonymous and cross-user share-event mutation are denied.
7. Public story identity/media rendering respects existing Feed privacy/media contracts.
8. CI, full Database Certification, and exact-head Vercel pass.
9. Production migration and exact merge deployment are verified.