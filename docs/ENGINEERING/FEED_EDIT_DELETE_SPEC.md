# Feed Edit and Delete Lifecycle Specification

Status: Phase 6 implementation specification

## Purpose

Close the canonical Feed `Edit Post` and `Delete Post` capabilities without restoring broad client-side UPDATE or DELETE authority on `feed_posts`.

## Canonical ownership

- `public.feed_posts` remains the single canonical story record.
- Existing comments, reactions, shares, media references, identity projection, and visibility continue to reference that record.
- No parallel editable-post or deleted-post table is introduced.

## Edit Post

Authenticated authors may edit only posts they own.

The Phase 6 edit surface is intentionally narrow:

- editable: `body`
- editable: `post_type` / category
- preserved: `visibility`
- preserved: `image_url`
- preserved: `media_url`
- preserved: `media_type`
- preserved: author identity

Media replacement and privacy changes are not implicit side effects of Edit Post. Timeline Visibility remains the canonical audience workflow, and public media is not silently converted to private media.

The resulting row must still satisfy the existing Feed content and category constraints.

## Delete Post

Authenticated authors may permanently delete only posts they own.

Deletion removes the canonical `feed_posts` row. Existing canonical foreign keys continue to perform lifecycle cleanup for dependent comments, reactions, and share-completion records.

The delete operation returns the deleted post's media references so the authenticated API can immediately remove owner-scoped Feed media from Storage.

## Storage cleanup

Feed media cleanup is limited to owner namespaced objects:

- `photos/<auth.uid()>/feed/...`
- `feed-videos/<auth.uid()>/feed/...`

The already-certified public media Storage policy surface must remain unchanged: authenticated clients do not receive Storage UPDATE or DELETE policies.

After the owner-only canonical delete succeeds, the authenticated API may invoke a narrow server-only privileged cleanup utility. That utility:

- obtains the service-role credential only on the server
- accepts only the `photos` or `feed-videos` bucket
- refuses any path outside `<authenticated-owner>/feed/...`
- removes only the returned media reference for the deleted canonical post

The service-role credential must not appear in the user-facing API route itself.

Gallery media is not deleted by Feed post deletion unless the canonical post itself references a Feed-namespaced object.

Database deletion remains authoritative even if Storage cleanup reports a secondary failure. The API must surface that cleanup failure explicitly rather than claiming complete media cleanup.

## Authority model

Direct authenticated table permissions remain:

- SELECT
- INSERT

Direct authenticated `UPDATE` and `DELETE` on `feed_posts` remain revoked.

Mutation occurs only through authenticated owner-checked functions exposed through the API.

The RPC layer must:

- require `auth.uid()`
- deny cross-user post mutation
- use a fixed search path
- preserve all non-editable fields during edit
- return deleted media metadata for cleanup

## Experience requirements

Only the post owner sees Edit and Delete actions.

Edit must provide:

- progressive disclosure rather than an always-open form
- Save and Cancel controls
- loading, success, and error feedback
- existing content pre-filled

Delete must provide:

- explicit confirmation
- loading, success, and error feedback
- immediate removal from the timeline after success

## Observability

The API response must distinguish canonical deletion success from media-cleanup status. Failures must be user-visible and suitable for runtime logging.

## Definition of Done

Edit Post is complete when an authenticated owner can update body/category through the governed lifecycle while another user cannot and direct table UPDATE remains unavailable.

Delete Post is complete when an authenticated owner can delete the canonical post through the governed lifecycle, dependent rows cascade correctly, owner-scoped Feed media cleanup is attempted through the narrow server boundary without widening client Storage permissions, another user cannot delete the post, and direct table DELETE remains unavailable.
