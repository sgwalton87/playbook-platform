# Phase 11 — Events Certification

Status: Release candidate

## Canonical ownership

Phase 11 is implemented as one shared Events service. Role-specific experiences consume this service; they do not create parallel event, RSVP, attendance, networking, reminder, replay, or Summit authorities.

The canonical Phase 11 tracker requirements resolve as follows:

| Tracker capability | Canonical implementation |
| --- | --- |
| Browse Events | `/events` + `/api/community/events` |
| Event Detail | `/events/[eventId]` + `get_community_event_detail` |
| RSVP | shared community event RSVP authority through `/api/community/events` |
| Calendar Integration | Google Calendar / ICS derived from the canonical event record |
| Reminders | `/events/reminders` + `community_event_reminders` / shared Notifications delivery |
| QR Check-In | event token check-in through `check_in_community_event`; arrival evidence only |
| Event Networking | explicit opt-in through shared event networking RPCs |
| Replay Library | `/events/replays` reading operator-published `community_events.replay_url` |
| Summit Events | `summit` event taxonomy inside the shared Events service |

## Trust boundaries

- RSVP is not attendance.
- Check-in is arrival evidence and does not self-verify attendance or issue rewards.
- Networking is opt-in and excludes private Scholar Record data and direct contact information.
- Calendar exports are derived copies, not competing Playbook records.
- Replay publication does not imply attendance.
- Summit is an Event type, not an independent datastore or platform service.

## MVP functional evidence

The release-blocking Phase 11 convergence test verifies route existence, canonical API/RPC wiring, privacy boundaries, shared reminder delivery, calendar derivation, replay ownership, and Summit shared-service reuse.

## Constitutional alignment

This implementation follows One Platform, Shared Services First, Single Source of Truth, Privacy by Design, Security by Default, accessible reusable experiences, and honest system feedback. Intelligence is not required to decide event participation; users retain agency over RSVP, networking, and participation.

## Release gate

Phase 11 may be marked GREEN only after the exact PR head passes CI, tests, lint, and production build. Database Certification is required only when this package changes database authority or migrations; this certification package does not.