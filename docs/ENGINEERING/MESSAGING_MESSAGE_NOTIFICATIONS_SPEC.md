# Messaging Message Notifications Specification

## Purpose

Wire governed Messaging sends into the canonical PBOS Notifications shared service without creating a parallel Messaging notification record.

## Canonical ownership

- `pbos_messages` remains the canonical message record.
- `pbos_conversations` remains canonical conversation lineage.
- `pbos_notifications` remains the canonical delivered in-app notification record.
- `pbos_notification_outbox` remains the canonical reliable delivery queue.
- `pbos_notification_preferences` remains the user's notification preference record.
- Legacy `notifications` is not a Message Notifications target.

## Producer requirements

A trusted database producer shall react to a newly persisted governed message and enqueue one idempotent `message` event per currently authorized recipient other than the sender.

Recipients are derived from canonical conversation authority:

- support: current scholar and current linked supporter identity;
- network: the other peer while the connection still exists;
- group: current `group_members` members other than the sender.

The producer shall not copy message body content into the notification. Notification copy communicates that a new message exists and links to `/messages`.

## Privacy and security

- Sender never receives a notification for their own message.
- Revoked relationships/connections/memberships are not recipients.
- Client roles do not receive direct INSERT authority on notification or outbox tables.
- Event keys are deterministic per recipient and message to prevent duplicate notifications.
- Notification production remains database-owned and fail-closed.

## Experience

The canonical notifications experience surfaces the message notification and links the user to `/messages`.

## Definition of Done

- Message sends enqueue canonical PBOS notification outbox events for current recipients only.
- No legacy notification write is introduced.
- Idempotency is proven.
- Support, Network, and group recipient derivation is behaviorally certified.
- Existing notification authority and Messaging authority remain green.
- Exact-head CI, Database Certification, and Vercel pass before production release.
