# Learning Entities

Version: 1.0

Status: Canonical

Owner: Learning Engine

Related Documents

- ../DATA_MODEL.md
- ../../DATABASE_BLUEPRINT.md
- FOUNDATION.md
- RELATIONSHIPS.md
- ORGANIZATIONS.md

---

# Purpose

The Learning domain defines educational experiences, instructional content, assessments, credentials, and evidence produced through participation in learning activities.

Learning exists to generate verified evidence that contributes to the Participant Record.

Learning is lifelong.

It is not limited to schools.

---

# Canonical Entity Index

| Entity | Aggregate Root | Owner Engine |
|---------|----------------|--------------|
| Learning Path | Learning | Learning Engine |
| Program | Program | Learning Engine |
| Course | Course | Learning Engine |
| Module | Course | Learning Engine |
| Lesson | Course | Learning Engine |
| Enrollment | Program | Learning Engine |
| Assessment | Course | Assessment Engine |
| Assignment | Course | Assessment Engine |
| Submission | Assignment | Assessment Engine |
| Evidence | Participant | Evidence Engine |
| Transcript | Participant | Transcript Engine |
| Certificate | Participant | Credential Engine |
| Badge | Participant | Credential Engine |

---

Learning Path
        │
        ▼
Program
        │
        ▼
Course
        │
        ▼
Module
        │
        ▼
Lesson

---

LIFECYCLE
Invited

↓

Registered

↓

Enrolled

↓

Active

↓

Completed

↓

Withdrawn

↓

Archived

---

EVIDENCE EXAMPLES
Transcript

Resume

Highlight Reel

Certification

Volunteer Hours

Recommendation

Project

Portfolio

Essay

Award

Business Plan

FAFSA Confirmation

A-G Completion

SAT

ACT

Financial Plan

---

Learning Path
        │
        ▼
Program
        │
        ▼
Course
        │
        ▼
Module
        │
        ▼
Lesson
                │
                ├── Assessment
                ├── Assignment
                └── Resources

Assignment
        │
        ▼
Submission
        │
        ▼
Evidence
        │
        ▼
Transcript
        │
        ▼
Participant Record