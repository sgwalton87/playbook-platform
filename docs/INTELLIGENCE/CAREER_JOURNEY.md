# Career Journey Intelligence

## Purpose
Specify career readiness and pathway guidance as an extension of existing journey, opportunity, application, portfolio, and Record capabilities.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 25, 2026

## Related Documents
- [Intelligence architecture](./ARCHITECTURE.md)
- [Resume Intelligence](./RESUME_INTELLIGENCE.md)
- [Mentor Intelligence](./MENTOR_INTELLIGENCE.md)

## Mission and Purpose
Help Scholars explore multiple career possibilities, build verified readiness, and take reversible next steps without prematurely narrowing their future.

## Repository Status — Represented by Existing Functionality

### Already Implemented
- **Inputs/outputs:** career goal, activities and certificates feed a career-readiness opportunity with reasons/next steps in [`lib/opportunities/engine.ts`](../../lib/opportunities/engine.ts).
- **Domain:** [`lib/core-journey/`](../../lib/core-journey/), [`components/journey/`](../../components/journey/), opportunity graph, application workspace, scholar data and Compass.
- **UI/components:** [`app/journey/page.tsx`](../../app/journey/page.tsx), opportunities, portfolio, application workspace, employer OS, courses and journey components.
- **Database/APIs:** Record outcomes/timeline/matches, application workspaces, portfolio shares and partner/opportunity surfaces provide adjacent persistence and delivery.

A single unified career journey engine, career ontology, labor-market feed, or complete milestone persistence contract is not evidenced.

## Current Limitations
Current readiness is coarse and depends on a small set of record signals. Skills-to-career evidence, exploration history, work experience, employer validation, pathway alternatives, labor-market source freshness and outcome feedback need defined contracts.

## Required Extensions
- Reuse existing journey nodes, Record outcomes/timeline/evidence, opportunity ontology, Compass actions and application workspaces.
- Add versioned career/pathway concepts and evidence requirements without asserting one “best” career.
- Offer exploration, course, project, mentor and opportunity actions with reasons and alternatives.
- Let Scholars revise goals and preserve exploration history; separate aspiration from verified competency.

## Engineering Readiness

| Area | Specification |
|---|---|
| Dependencies | Scholar Record, Compass, courses/certificates, opportunity graph, resume, mentors, employers, applications, notifications. |
| Complexity | High if external occupation/labor data is included; medium for internal milestone integration. |
| Risks | Premature tracking, biased recommendations, stale labor data, conflating interest with aptitude, employer overreach. |
| Validation | Ontology/source review, alternative-path tests, explanation/fairness review, permission tests, scholar/counselor usability, outcome calibration. |
| Success metrics | Exploration breadth, verified milestone completion, goal revisions supported, opportunity engagement, pathway equity—not a single placement metric. |

## Future Vision
Scenario planning can show several plausible paths and their evidence gaps. External market data must be dated and sourced; recommendations remain optional and should connect Scholars with educators, mentors, family, and employers on Scholar-approved terms.
