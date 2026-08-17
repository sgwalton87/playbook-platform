# Network Messaging Integration — Implementation Specification

Status: Implementation-scoped
Owner: Playbook Platform / Messaging shared service
Phase: 5 — Network integration; Messaging capability remains shared platform infrastructure

## Purpose

Extend the existing canonical PBOS messaging tables so two accepted Playbook Network connections can hold a direct conversation without creating a second messaging system or weakening the existing support-relationship authorization model.

## Verified current constraint

The current messaging implementation is support-only:

- `pbos_conversations.relationship_id` is non-null and references `support_relationships(id)`.
- `pbos_conversations.scholar_id` is non-null and represents the supported Scholar.
- `private.pbos_user_has_active_conversation_access` joins every conversation to `support_relationships`.
- Existing `/api/support-network/messages` authorizes only active support relationships.

A Network Message button must not be exposed until those constraints are extended canonically.

## Shared-service rule

Peer messaging must reuse:

- `pbos_conversations`
- `pbos_conversation_participants`
- `pbos_messages`
- existing message attachment authority
- existing read/access RLS patterns

A parallel `network_messages` table or second inbox is prohibited.

## Conversation contexts

`pbos_conversations` shall support exactly two explicit contexts:

### Support context

- `conversation_kind = 'support'`
- `relationship_id` required
- `scholar_id` required
- Network peer fields null
- Existing behavior and backward compatibility preserved

### Network context

- `conversation_kind = 'network'`
- `relationship_id` null
- `scholar_id` null
- `network_peer_a_id` required
- `network_peer_b_id` required
- peers must differ
- peer ordering must be canonical so the same pair cannot create duplicate conversations

A database constraint must require exactly one valid context shape.

## Network conversation creation

Clients shall not directly insert Network conversations.

A governed RPC shall:

1. Require an authenticated actor.
2. Require a different requested peer.
3. Verify an active canonical Network connection currently exists between actor and peer.
4. Canonicalize the pair ordering.
5. Return the existing Network conversation for the pair or create it atomically.
6. Ensure both peers exist in `pbos_conversation_participants`.
7. Return only the conversation identifier needed by the messaging experience.

## Authorization

`private.pbos_user_has_active_conversation_access(conversation_id,user_id)` shall become context-aware.

For support conversations it shall preserve the existing active-support-relationship rules.

For Network conversations it shall grant access only when:

- `user_id` is one of the two canonical peers, and
- the corresponding Network connection is still active in `user_connections`.

Disconnecting a Network relationship therefore revokes future message/conversation access without deleting historical records.

## Sending messages

Message creation must continue through the canonical `pbos_messages` table and existing access helper/RLS boundary. Support messages retain `scholar_id`; Network peer messages use `scholar_id = null`. The API must never trust a recipient supplied by the client without resolving authorization from the conversation context.

## Experience integration

Once authority is certified:

- Connected Network cards may expose `Message`.
- The action opens `/messages?peer=<member-id>`.
- The Messages experience resolves or creates the canonical Network conversation through the governed RPC.
- A user who is no longer connected must receive an explicit access error rather than a broken or misleading composer.

## Privacy and safety

- Private profile publication status does not block messaging between already-connected peers; relationship authorization is separate from public-profile publication.
- Disconnect must revoke access.
- Network peers must not gain access to support-only conversations or private Scholar support context.
- Support participants must not gain access to Network conversations unless they are one of the Network peers.
- Message attachment authority must inherit the same conversation-access decision.

## Backward compatibility

Existing support conversations, participants, messages, APIs, and RLS behavior must remain valid after migration.

The migration must include a full replay preflight covering both support and Network contexts before release.

## Definition of Done

Network Messaging Integration is complete only when:

- the shared conversation schema supports explicit support and Network contexts;
- direct Network conversation creation is RPC-governed and idempotent;
- RLS/access helpers authorize both contexts correctly;
- disconnect revokes Network access;
- existing support messaging remains green;
- Network exposes a functional Message action only after authority exists;
- desktop/mobile production build and end-to-end workflow are green.
