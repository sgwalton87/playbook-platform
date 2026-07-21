# Community Entities

Version: 1.0

Status: Canonical

Owner: Community Engine

Related Documents

- ../DATA_MODEL.md
- ../../DATABASE_BLUEPRINT.md
- FOUNDATION.md
- RELATIONSHIPS.md
- ORGANIZATIONS.md
- LEARNING.md

---

# Purpose

The Community domain enables Participants to communicate, collaborate, mentor, celebrate achievements, exchange knowledge, and build meaningful relationships within trusted Communities of Practice.

Community exists to strengthen lifelong participation.

Communication serves community.

It is not the purpose of community.

---

# Canonical Entity Index

| Entity | Aggregate Root | Owner Engine |
|---------|----------------|--------------|
| Community | Community | Community Engine |
| Community Membership | Community | Community Engine |
| Feed | Community | Community Engine |
| Post | Community | Community Engine |
| Comment | Post | Community Engine |
| Reaction | Post | Community Engine |
| Conversation | Conversation | Messaging Engine |
| Message | Conversation | Messaging Engine |
| Announcement | Community | Community Engine |
| Event | Event | Events Engine |
| Notification | Participant | Notification Engine |

---

COMMUNTIY BECOMES THE PARENT
Community

↓

Feed

↓

Posts

↓

Comments

↓

Reactions

---

MEMBERSHIP LIFECYCLES
Invited

↓

Requested

↓

Approved

↓

Active

↓

Suspended

↓

Left

↓

Archived

---

COMMUNITY FEEDS
General

Announcements

Wins

Questions

Resources

Opportunities

Introductions

Events

---

COMMUNITY HIERARCHY
Community
      │
      ├── Memberships
      ├── Feeds
      │      │
      │      ├── Posts
      │      │      ├── Comments
      │      │      └── Reactions
      │
      ├── Announcements
      ├── Events
      └── Resources

Participant

↓

Conversations

↓

Messages

---

