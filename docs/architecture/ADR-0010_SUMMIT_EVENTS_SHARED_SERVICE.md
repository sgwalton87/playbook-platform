# ADR-0010 — Summit Events as a Shared Event Type

Status: Accepted for implementation

## Context

Phase 11 includes Summit Events. Playbook already has one canonical shared Event service (`community_events`) with governed creation, RSVP, capacity, attendance, rewards, detail, reminders, check-in, networking, and replay. Creating a separate Summit store or app would duplicate Event ownership and violate Shared Services First / Single Source of Truth.

The current Event creation authority allows workshop, lab, civic, social, virtual, course, networking, and community, but does not allow `summit`.

## Decision

Summit is a canonical `community_events.event_type` value.

- `community_events` remains the Event owner.
- `summit` is added to the governed Event type taxonomy.
- Operator Event creation supports Summit through the existing Event mutation authority.
- The Events hub can filter Summit Events without a separate Summit query/store.
- Summit Events automatically inherit RSVP, calendar handoff, reminders, arrival evidence, verified attendance/rewards, networking, and replay from the shared Event service.

## Trust Boundaries

- Summit creation remains platform-operator-only.
- Summit does not grant new user or Scholar Record permissions.
- Summit attendance/rewards continue to use the existing verified attendance authority.
- No fake Summit rows are seeded.
- Type classification is metadata on the canonical Event, not a second canonical record.

## Definition of Done

- database taxonomy includes summit
- creation authority accepts summit and rejects unsupported types
- operator UI can create Summit Events
- Events hub can filter Summit Events
- full migration replay and Event authority certification pass
- CI and Vercel pass on the exact release head
