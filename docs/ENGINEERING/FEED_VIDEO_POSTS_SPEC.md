# Feed Video Posts Specification

## Purpose

Define the canonical Phase 6 Video Posts capability for the shared Playbook Community Feed.

## Scope

Video Posts extend the existing `feed_posts` record. They do not introduce a second post table, a role-specific video feed, or a duplicate media service.

## Canonical ownership

- `feed_posts` remains the canonical Feed record.
- `feed_posts.media_url` stores the published video URL.
- `feed_posts.media_type = 'video'` identifies video media.
- `feed_posts.image_url` remains image-specific and shall be null for canonical video posts.
- Supabase Storage bucket `feed-videos` is the shared public-video media service consumed by Feed experiences.

## Supported media

The public Video Posts service shall accept only:

- `video/mp4`
- `video/webm`
- `video/quicktime`

Maximum object size: 50 MiB.

The browser may provide matching `accept` guidance, but Storage is the authoritative enforcement boundary.

## Storage authority

Authenticated uploads shall be namespaced to:

`<auth.uid()>/feed/<object>`

Clients shall not upload into another user's namespace.

Published video objects are intentionally public because this capability only publishes `visibility = 'public'` Feed stories. Private-media support belongs to the Timeline Visibility capability and shall not reuse this public bucket.

## Composer behavior

The authenticated Feed composer shall:

- accept text-only, image, or video stories;
- allow at most one media attachment per story;
- show image previews with the existing image presentation;
- show video previews with native `<video controls>` playback;
- persist image stories through `image_url`;
- persist video stories through `media_url` plus `media_type = 'video'`;
- provide loading, success, and error feedback;
- never upload a video to the `photos` bucket.

## Rendering behavior

Both authenticated Feed and Public News Feed shall distinguish image and video media before rendering.

- Image media renders through the existing image presentation.
- Video media renders through native `<video controls preload="metadata">`.
- A `media_url` marked as video shall never be rendered through Next `<Image>`.

## Accessibility

Video playback shall use native controls and an accessible label. Playback shall not autoplay.

## Security and privacy

- Anonymous upload is denied.
- Authenticated upload is owner-namespaced.
- Public object read is explicit and limited to the `feed-videos` bucket.
- Video Posts do not expand Feed row visibility beyond existing `public` Feed publication.
- Private Feed media is out of scope and must fail closed until Timeline Visibility introduces a private-media authority.

## Observability

Certification shall verify bucket configuration, MIME/size enforcement metadata, policy shape, canonical Feed media linkage, and both authenticated/public rendering contracts.

## Definition of Done

Video Posts are complete when:

1. The shared `feed-videos` bucket is reproducible from migration history.
2. MIME and size limits are server-enforced.
3. Owner-namespaced authenticated upload is enforced.
4. Feed persists video linkage through `media_url/media_type` on canonical `feed_posts`.
5. Authenticated Feed renders video correctly.
6. Public News Feed renders video correctly.
7. Existing image behavior remains intact.
8. CI, full Database Certification, and exact-head Vercel pass.
9. Production migration and exact merge deployment are verified.