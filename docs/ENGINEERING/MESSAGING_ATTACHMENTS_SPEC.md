# Messaging Attachments Specification

## Purpose

Certify and harden the existing shared Playbook Messaging attachment capability across support, Network, and group conversations.

## Canonical ownership

- `pbos_message_attachments` is the canonical attachment metadata record.
- `pbos_messages` remains the canonical sent-message record.
- `pbos-message-attachments` is the single private Storage bucket for Messaging attachments.
- Support, Network, and group experiences reuse the same attachment API and storage boundary.

## Functional requirements

1. Current authorized conversation participants may stage attachments.
2. Attachments may be PDF, JPEG, PNG, WebP, plain text, or DOCX only.
3. Attachment size shall be between 1 byte and 10 MiB.
4. A message may stage at most five attachments in the inbox experience.
5. Storage paths shall be scoped to `<conversation_id>/<uploader_id>/...`.
6. Only the uploader may bind a staged attachment to a message, and the target message must belong to the same conversation and sender.
7. Sent attachments remain immutable message history; only staged attachments may be deleted by the uploader.
8. Authorized participants receive signed download URLs; the bucket itself remains private.
9. Revoked relationship, Network connection, or group membership immediately removes attachment read/upload/delete authority through the shared active-conversation helper.

## Least privilege

- Anonymous users receive no metadata-table or Storage attachment authority.
- Authenticated users receive metadata SELECT, INSERT, and DELETE subject to RLS.
- Authenticated UPDATE authority is limited to `message_id` for staged-to-sent binding.
- No client may update attachment lineage, uploader identity, storage path, MIME type, byte size, or creation time.

## Privacy and security

Attachment contents are private. Signed URLs are short-lived. Authorization is evaluated from current canonical Messaging context rather than cached participant rows alone.

## Observability

Upload, removal, and authorization failures use the existing Messaging status/error experience. Attachment contents are not logged or copied into analytics.

## Definition of Done

- Bucket remains private and enforces MIME/size constraints.
- Metadata and Storage RLS remain participant-scoped.
- Anonymous grants are zero.
- Authenticated metadata UPDATE is `message_id` only.
- Existing support, Network, group, unread, report, and search behaviors remain green.
- CI, Database Certification, production build, and exact-head Vercel preview pass before merge.