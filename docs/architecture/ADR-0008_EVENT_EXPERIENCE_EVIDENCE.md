# ADR-0008 — Event Experience Evidence Architecture

Status: Accepted for implementation

## Context

Playbook already has a shared Community Events service with governed event creation, RSVP/capacity, operator-verified attendance, and idempotent rewards. The remaining canonical Event experience gaps are event-specific detail, calendar handoff, arrival/check-in evidence, attendee networking opt-in, and replay resources.

## Decision

The existing `community_events` service remains the single Event owner. New capabilities extend it rather than create a role-specific event implementation.

### Event Detail and Replay

`community_events` gains optional replay metadata plus experience flags. A governed event-detail projection returns only published event information and caller-specific RSVP/attendance/check-in state.

### QR / Token Check-In

Check-in is **arrival evidence**, not verified attendance. Platform operators may generate short-lived opaque event check-in tokens. Authenticated attendees with an active `going` RSVP may claim an active token. The resulting `community_event_checkins` record does not issue rewards and does not modify `community_event_attendance`.

Operator attendance verification remains the only attendance/reward authority.

### Event Networking

Networking is explicit opt-in. An attendee may publish a short event-specific networking headline only when the event enables networking and the attendee has an active RSVP or verified attendance. The networking directory returns only opted-in attendees and a narrow safe identity projection; it never reveals email, phone, Scholar Record data, support relationships, or private evidence.

### Calendar Integration

Calendar handoff is generated from the canonical event record at the experience layer. No duplicate calendar event record is created inside Playbook.

### Reminders

Reminder delivery is not included in this release. The existing PBOS Notification Outbox has delayed-attempt metadata but no certified background due-item delivery loop. A future Notifications extension must add a real delivery worker/cron contract before Event Reminders can be represented as functional.

## Trust Boundaries

- RSVP is not attendance.
- QR/token check-in is not verified attendance.
- Attendance verification remains operator-governed.
- Networking is opt-in and event-scoped.
- Replay access does not grant access to private event participants.
- Calendar export is a derived handoff, not a second Event owner.

## Canonical Ownership

- Event: `community_events`
- RSVP: `community_event_rsvps`
- Arrival evidence: `community_event_checkins`
- Verified attendance/reward: `community_event_attendance`
- Event networking opt-in: `community_event_networking_optins`
- Check-in token authority: `community_event_checkin_codes`

## Release Requirements

- RLS + least privilege
- opaque token hashing and bounded validity window
- active-RSVP check-in guard
- networking consent guard and safe projection
- no check-in-triggered reward issuance
- honest empty states
- CI, full database certification, and Vercel on the exact immutable head
