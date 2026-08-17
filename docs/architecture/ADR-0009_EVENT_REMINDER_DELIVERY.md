# ADR-0009 — Event Reminder Delivery Architecture

Status: Accepted for implementation

## Context

Playbook Phase 11 requires Event Reminders. The shared PBOS Notification service already owns notification records, preferences, outbox evidence, acknowledgement, and recovery, but it does not yet contain a background due-item worker. Vercel Cron would require new protected deployment secrets that are not currently provisioned through the connected project-management surface. Playbook Supabase exposes `pg_cron` as an available extension, allowing the delivery worker to remain inside the governed database boundary.

## Decision

Event Reminders extend the shared Event and Notification services rather than create a browser timer or a second reminder engine.

### Canonical Reminder Subscription

`community_event_reminders` owns only the user’s event-specific reminder subscription:

- event
- user
- reminder offset
- active/cancelled state
- last delivered event start time
- last delivered timestamp
- lifecycle timestamps

The event start time remains owned by `community_events`.

### Reminder Eligibility

A user may activate a reminder only when:

- the Event is published
- the Event has a future start time
- the user has an active `going` or `interested` RSVP
- the requested offset is one of the governed supported values

Removing an RSVP does not fabricate delivery authority. The due worker re-checks participation before delivery.

### Delivery Worker

A private SECURITY DEFINER worker executes every five minutes through `pg_cron`.

The worker:

1. Finds active due reminder subscriptions.
2. Re-checks the canonical Event and current RSVP.
3. Locks due subscriptions with `FOR UPDATE SKIP LOCKED`.
4. Creates a deterministic event key using event, user, event start, and reminder offset.
5. Writes a trusted `pbos_notification_outbox` delivery record.
6. Creates the in-app `pbos_notifications` record using the same event key.
7. Records delivery provenance and marks the subscription delivered for that exact canonical Event start time.

Repeated cron executions are idempotent because notification/outbox keys are unique and the subscription records the event start for which delivery occurred.

### Rescheduling

If an operator changes an Event’s start time, `last_delivered_for_start` no longer matches the canonical start. The active subscription may therefore produce a new reminder for the newly scheduled time when it becomes due.

### User Experience

The Event Reminders workspace lists real upcoming RSVP’d Events and lets the user independently enable or cancel supported reminder offsets. Browser-only timers are prohibited.

## Trust Boundaries

- Reminders never create or modify Events.
- Reminders never alter RSVP, arrival, attendance, or rewards.
- Reminder delivery cannot expose another user’s Event participation.
- Reminder rows are owner-readable only and client mutation occurs through governed RPCs.
- The cron worker is private and not executable by anonymous or authenticated clients.
- No reminder is delivered after the Event has started.
- No fabricated reminder rows or demo notifications are seeded.

## Observability

Delivery is measurable through:

- reminder subscription state
- `last_delivered_at`
- deterministic notification/outbox event keys
- `pbos_notification_outbox`
- `pbos_notifications`
- `cron.job` registration

## Definition of Done

- reminder subscription owner established
- scheduled worker exists in production
- full migration replay passes
- idempotent due-delivery behavior certified
- no browser timer dependency
- Events UI exposes reminder management
- CI, Database Certification, and Vercel pass on one exact immutable head
