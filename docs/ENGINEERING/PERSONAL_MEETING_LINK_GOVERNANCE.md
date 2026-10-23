# Personal meeting rooms and governed communication

Status: draft implementation in PR #282; no production claim.

## Founder requirements
- Each authenticated member can opt to save an HTTPS Zoom or comparable meeting URL.
- Owner-only URL storage using `member_meeting_preferences` with RLS.
- The existing meeting-link sharing screen may send this URL **only** through conversations which Messaging already recognizes as authorized.
- The saved URL is not public profile information and is never a searchable scholar directory attribute.
- Coach→Scholar, advisor→Scholar, mentor→Scholar and authorized administrator→Scholar program contexts must each have an independently governed relationship, consent and child-safety basis before communication.
- Scholar→Scholar peer video introductions do not become a general-purpose video-chat feature. Allow only where a program/mentor relationship and an evidenced educational or mentorship benefit have been reviewed and approved.
- Use external providers for meeting transport; Playbook remains the coordination/course/programming and messaging layer, not a general-purpose video app.

## Outstanding safety gates
- Current implementation reuses existing Messaging conversation authorization; **not certified** for the desired entire role matrix.
- Define a mentor-supervised session policy, child protections, reporting, auditability, consent/guardian requirements and separate trusted meeting invitations.
- Do not treat possession of a stored Zoom URL as permission to contact a scholar.
- Review URL details for private passcodes, screenshots, public projections, notifications, and account revocation.
- Integrate programming/calendar/course sessions only through separately authorized scope.
- Run mobile browser and server-side RLS/permission E2E before deploying schema.
