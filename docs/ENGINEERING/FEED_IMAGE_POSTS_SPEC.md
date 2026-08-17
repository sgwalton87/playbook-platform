# Feed Image Posts — Implementation Specification

Status: Implementation-scoped
Owner: Playbook Platform / Feed shared service
Phase: 6 — Feed

## Purpose

Make Feed image publishing a reproducible, least-privilege shared media capability. The browser experience may provide early validation, but Storage remains the authoritative security boundary.

## Canonical media service

Image Posts use the shared Supabase Storage bucket `photos`. Feed does not create a role-specific media store.

The repository shall own the bucket configuration so a fresh environment does not depend on undocumented production state.

## Supported image formats

The public image bucket shall accept only:

- `image/jpeg`
- `image/png`
- `image/webp`

Other MIME types shall be rejected by Storage even if a client attempts to bypass browser controls.

## File-size limit

The `photos` bucket shall enforce a maximum object size of 10 MiB (`10485760` bytes).

The Feed client should reject unsupported types or files above 10 MiB before upload and provide clear user feedback. Server enforcement remains mandatory regardless of client behavior.

## Ownership namespace

Authenticated uploads shall be limited to paths whose first segment equals `auth.uid()` and whose second segment is one of:

- `feed`
- `gallery`

Anonymous/public uploads are prohibited.

## Read authority

The `photos` bucket is intentionally public-read because Image Posts and explicitly published gallery images are public media.

Exactly one canonical SELECT policy shall govern public reads for this bucket. Historical duplicate read policies shall be removed.

## Bucket configuration

The repository-owned bucket contract shall define:

- id/name: `photos`
- public: `true`
- file size limit: 10 MiB
- allowed MIME types: JPEG, PNG, WebP

Existing objects shall be preserved.

## Feed record linkage

Image Posts continue to reference the published Storage URL through the canonical `feed_posts.image_url` field. Image metadata does not become a duplicate identity or Scholar Record store.

## Security and privacy

- Browser `accept=` is usability guidance, not authorization.
- Storage policy and bucket configuration are authoritative.
- Upload paths are user-namespaced.
- Public reads apply only to intentionally published `photos` media.
- Existing public media objects remain preserved.

## Experience requirements

The Feed composer shall continue to show image preview, loading/error feedback, and successful publication feedback. Validation messages shall clearly explain unsupported formats and oversized files.

## Definition of Done

Image Posts are complete when:

- the repository creates/reconciles the `photos` bucket deterministically;
- Storage enforces the 10 MiB maximum and JPEG/PNG/WebP MIME allowlist;
- exactly one public-read policy exists for `photos`;
- exactly one authenticated owner-namespaced upload policy exists;
- anonymous mutation remains denied;
- existing production objects are preserved;
- Feed image upload remains compatible;
- CI, Database Certification, exact-head Vercel, production migration, and live verification are green.
