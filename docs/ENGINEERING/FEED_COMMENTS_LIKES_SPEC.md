# Feed Comments and Likes — Implementation Specification

Status: Implementation-scoped
Owner: Playbook Platform / Feed shared service
Phase: 6 — Feed

## Purpose

Restore and govern the canonical social-interaction layer used by the existing Feed Comments and Likes experiences. The UI and API routes already exist; production drift removed the required backing tables.

## Canonical data

- `public.feed_posts` remains the canonical Feed post record.
- `public.feed_post_comments` owns Feed comments.
- `public.feed_post_reactions` owns Feed reactions.
- `public.profiles` remains the canonical user identity source.

Comments and reactions reference canonical records; they do not duplicate profile or post ownership.

## Comments

A comment shall contain:

- stable UUID identifier
- canonical `post_id`
- canonical `user_id`
- non-empty body up to 4,000 characters
- creation timestamp
- update timestamp

Authenticated users may read comments only for Feed posts they are authorized to read.

Authenticated users may create, update, or delete only comments owned by their own `auth.uid()`.

## Likes

Phase 6 currently supports the `like` reaction only.

A like shall contain:

- stable UUID identifier
- canonical `post_id`
- canonical `user_id`
- reaction value `like`
- creation timestamp

A user may have at most one like for a post.

Authenticated users may read reactions only for Feed posts they are authorized to read.

Authenticated users may insert or delete only their own reactions. UPDATE authority is unnecessary and shall remain absent.

## Referential integrity

- comment/reaction `post_id` references `feed_posts(id)` with cascade delete;
- comment/reaction `user_id` references `profiles(id)` with cascade delete.

Deleting a canonical post or profile shall not leave orphaned social records.

## Visibility boundary

Social interactions inherit Feed visibility.

A caller may read comments/reactions only when the parent post is public or owned by the caller. This prevents direct table access from revealing interaction metadata attached to inaccessible private posts.

## API compatibility

The existing routes remain canonical experience adapters:

- `/api/social/comments`
- `/api/social/reactions`

The database remains the final authorization boundary through RLS.

## Production reconciliation

Migration shall be safe in both cases:

- fresh/local environments where historical migrations already created these tables;
- production where both tables are currently absent.

Existing rows, if any, shall be preserved and normalized rather than deleted.

## Security

- anonymous access is denied;
- comments: authenticated SELECT/INSERT/UPDATE/DELETE only under RLS;
- reactions: authenticated SELECT/INSERT/DELETE only under RLS;
- cross-user ownership assignment is denied;
- private-post interaction metadata is not exposed.

## Definition of Done

Comments and Likes are complete when:

- both canonical tables are reproducible and present in production;
- canonical profile/post FKs are enforced;
- comment body and reaction integrity constraints are enforced;
- RLS and grants match least privilege;
- existing API/UI paths remain compatible;
- behavioral preflight proves owner success and cross-user/private-post denial;
- CI, Database Certification, exact-head Vercel, production migration, and live verification are green.
