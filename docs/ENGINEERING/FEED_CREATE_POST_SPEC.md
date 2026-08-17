# Feed Create Post — Implementation Specification

Status: Implementation-scoped
Owner: Playbook Platform / Feed shared service
Phase: 6 — Feed

## Purpose

Certify the existing Feed post-creation workflow against one canonical ownership and permission boundary while reconciling the deployed `feed_posts` table into reproducible repository-owned migration history. Media, editing, deletion, and expanded timeline visibility remain separate tasks.

## Canonical data

`public.feed_posts` remains the canonical Feed post record. This task does not introduce a replacement table.

Historical repository migrations documented `feed_posts` as a deployed/runtime entity whose original DDL predated the committed migration chain. Phase 6 closes that historical gap: a fresh database replay shall now create the production-compatible canonical Feed table, while production deployments preserve the already-existing table and rows.

The reconciled baseline includes the production-compatible columns, profile ownership foreign key, optional album lineage foreign key, RLS, anonymous/authenticated read authority, and explicit table grants.

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

## Read authority

Anonymous and authenticated viewers may read public posts.

Authenticated owners may also read their own posts. These two read policies are canonicalized during baseline reconciliation because the earlier privacy migration could only harden them when a legacy `feed_posts` table already existed.

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

- a from-zero migration replay creates the canonical `feed_posts` baseline;
- production data remains preserved and satisfies the integrity constraints;
- RLS, public/owner SELECT policies, and canonical FK lineage are reproducible;
- exactly one authenticated owner INSERT policy exists;
- anonymous mutation privileges are absent;
- authenticated UPDATE/DELETE privileges are absent until their dedicated tasks;
- existing Feed composer remains compatible;
- database preflight, CI, Database Certification, and production build are green.
