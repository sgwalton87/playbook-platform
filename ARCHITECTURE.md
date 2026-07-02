# Playbook Platform Architecture

## Stack

- Next.js
- React
- TypeScript
- Supabase
- Vercel

---

## Core Engines

Portfolio Engine

- PortfolioCompletion
- PortfolioStats
- PortfolioDNA
- OpportunityMeter

Scholar Record

- Achievements
- Timeline
- Recommendations
- Resume
- Verification

Event Engine

Community Engine

Learning Engine

Document Intelligence

Opportunity Engine

Compass AI

---

## Public Profile

ProfileHero

Portfolio Engine

ProfileStats

AboutCard

AcademicCard (planned)

BadgesCard (planned)

CertificatesCard (planned)

FeedModule (planned)

GalleryModule (planned)

---

## Data Flow

Supabase

↓

Portfolio Services

↓

Portfolio Engine

↓

Profile Components

↓

Public Profile

---

# Scholar Record First Principle

Every new feature must improve the Scholar Record or consume the Scholar Record.

If it does neither, it should not be built.

This principle governs Phase III of Playbook development and all future engines, including Transcript Intelligence, FAFSA Intelligence, Resume Intelligence, Athlete Intelligence, Opportunity Engine, and Compass AI.

The Scholar Record is the source of truth. Engines interpret it. Dashboards present it. AI coaches from it. Opportunities are unlocked by it.

---

# Living Evidence Principle

The Scholar Record is not just data.

It is living evidence.

Every meaningful achievement should eventually support documents, photos, videos, links, verifications, reflections, metrics, and outcomes.

This ensures that Scholars do not merely list accomplishments. They preserve, verify, and activate them.

---

# Phase III Intelligence Layer

Phase III introduces intelligence pipelines that transform data into action.

Data flows into the Scholar Record. Engines interpret the Scholar Record. Insights become actions.

Transcript Intelligence, FAFSA Intelligence, Resume Intelligence, Athlete Intelligence, Opportunity Engine, and Compass AI must all follow this pattern.

---

# Athlete Intelligence and NIL Preparation

Scholar-Athlete support must include academic eligibility, recruiting readiness, coach recommendations, highlight videos, athletic records, and NIL preparation.

The NIL preparation layer includes personal brand development, financial literacy, contract awareness, compliance awareness, media kit readiness, social media professionalism, and opportunity tracking.

---

## Playbook Record Architecture

The internal canonical engine is the Playbook Record™.

The Scholar Record™ is the learner-facing view of that record.

Future role-aware views include Scholar-Athlete Record™, Educator Record™, Coach Record™, Mentor Record™, Organization Record™, and Alumni Record™.

