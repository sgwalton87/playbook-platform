# Direct Messages Authority Specification

## Purpose

Close Phase 7 Direct Messages by certifying the existing shared Playbook Messaging service and removing generic message-row mutation authority.

## Canonical ownership

- `pbos_conversations` is the canonical conversation record.
- `pbos_conversation_participants` is the canonical participant-state record.
- `pbos_messages` is the canonical message record.
- `pbos_message_attachments` is the canonical attachment lineage record.
- Network and support experiences consume the same shared Messaging service rather than creating role-specific message tables.

## Direct-message eligibility

A Network direct message may exist only between users whose canonical Network relationship is currently accepted and active.

`ensure_network_conversation` remains the authority for opening an idempotent Network conversation. Revoked or removed connections must fail closed through `private.pbos_user_has_active_conversation_access`.

## Message creation

Authenticated participants may insert a new message only when:

- the sender is the authenticated user;
- the conversation is currently authorized;
- the user is a current participant and is not blocked;
- support messages preserve scholar lineage;
- Network messages use `scholar_id = null`;
- the request idempotency key is unique for the sender request.

Message body, sender, conversation lineage, idempotency key, and creation time become immutable to normal clients after insert.

## Delivery finalization

Clients shall not directly UPDATE `pbos_messages`.

Delivery finalization must occur through `finalize_governed_message_delivery`.

The function shall:

1. Require authentication.
2. Require current conversation authority.
3. Require the authenticated user to be the original sender.
4. Require the message to remain `PENDING` or already `DELIVERED` for idempotent retry.
5. Update only `delivery_state` and `provenance`.
6. Preserve message body, sender, conversation, scholar lineage, idempotency key, moderation state, reporting state, and creation time.

## Message reporting

A current participant may report a message only through `report_governed_message`.

The function shall:

1. Require authentication and current conversation authority.
2. Require the target message to belong to the requested conversation.
3. Update only `reported_at` and `moderation_state`.
4. Never modify body, sender, delivery state, provenance, lineage, or creation time.
5. Be idempotent for repeated reporting.

## Grants and RLS

- Anonymous roles receive no table privileges on governed Messaging tables.
- Authenticated clients receive `SELECT` and `INSERT` on `pbos_messages` only.
- Generic authenticated `UPDATE` and `DELETE` on `pbos_messages` are prohibited.
- Existing SELECT and INSERT RLS continue to enforce active-conversation authority.
- The legacy broad `Governed participants update messages` policy must be removed.
- Governed mutation RPCs are SECURITY DEFINER with fixed search paths and internal authorization checks.

## Attachments

Attachment authority remains unchanged and private. Existing 10 MB MIME-limited Storage and metadata policies remain release blocking.

## Experience

The current `/messages` experience remains the shared inbox for support and Network peer conversations. It shall continue to provide loading, success, error, empty, unread, mute, block, report, attachment, and send feedback consistent with the Playbook design language.

## Observability

PBOS lifecycle publication and message provenance remain intact. Delivery finalization shall preserve returned provenance from PBOS rather than allowing client-authored arbitrary row mutation after delivery.

## Definition of Done

Direct Messages is complete when:

- connected-peer conversation opening is certified;
- message send and idempotency are certified;
- cross-user message rewriting is impossible;
- governed delivery finalization and reporting are certified;
- anonymous Messaging grants are removed;
- existing attachment/revocation checks remain green;
- CI, Database Certification, exact-head Vercel, production migration, and live production verification are green.