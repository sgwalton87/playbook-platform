# Feed Create Post — Implementation Specification

Status: Implementation-scoped
Owner: Playbook Platform / Feed shared service
Phase: 6 — Feed

## Purpose

Certify the existing Feed post-creation workflow against one canonical ownership and permission boundary without redesigning media, editing, deletion, or timeline visibility.

## Canonical data

`public.feed_posts` remains the canonical Feed post record. This task does not introduce a replacement table.

## Creation authority

Authenticated users may create only posts owned by their own `auth.uid()` identity.

The table shall expose exactly one INSERT policy for authenticated users. Historical duplicate INSERT policies shall be removed.

Anonymous users shall have no INSERT, UPDATE, or DELETE privilege on `feed_posts`.

Authenticated users shall retain only the mutation privilege required by this task: INSERT. UPDATE and DELETE authority are deferred to the dedicated Edit Post and Delete Post tasks.

## Integrity

New and historical posts shall satisfy:

- `user_id` is required.
- `post_type` is non-empty.
- `visibility` is either `public` or `private`.
- a post contains at least one of body, image URL, or media URL.

This task shall preserve historical post-type values. Taxonomy normalization is not performed here.

## Experience behavior

The existing Feed composer may continue inserting directly through Supabase because row-level security is the canonical authorization boundary for this simple owner-scoped mutation.

Successful creation shall remain followed by Feed reload/status feedback in the existing experience.

## Separation of concerns

- Image/video upload authority belongs to Image Posts / Video Posts.
- Public-profile identity consent remains independent from post visibility.
- Timeline audience expansion belongs to Timeline Visibility.
- Post update/delete authority belongs to Edit Post / Delete Post.

## Definition of Done

Create Post is complete when:

- production data satisfies the integrity constraints;
- exactly one authenticated owner INSERT policy exists;
- anonymous mutation privileges are absent;
- authenticated UPDATE/DELETE privileges are absent until their dedicated tasks;
- existing Feed composer remains compatible;
- database preflight, CI, Database Certification, and production build are green.
