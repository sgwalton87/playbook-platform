# Career Journey Constitutional Specification

## Purpose
Provide implementation-grade constitutional boundaries for this domain under the [Playbook Intelligence Architecture](./ARCHITECTURE.md).

## Ownership
Owned by Playbook OS Engineering with the named domain, privacy, accessibility, safety, and data-governance owners.

## Last Updated
July 24, 2026

## Related Documents
- [Intelligence Architecture](./ARCHITECTURE.md)
- [Canonical Student Record](./CANONICAL_STUDENT_RECORD.md)
- [Constitutional review](./CONSTITUTIONAL_REVIEW.md)

## Mission
Help Scholars explore, choose and revise credible pathways from learning to sustainable work and purpose.

## Vision
College, trades, military service, entrepreneurship and direct employment are visible as dignified, comparable paths connected to evidence and long-term goals.

## Problem Statement
Career advice is often narrow, outdated, salary-only and disconnected from cost, credentials, network and lived constraints.

## Guiding Principles
Multiple pathways without hierarchy; exploration before commitment; current sourced labor data; total cost/time/risk; goals and values matter; plans remain reversible; no deterministic aptitude labels.

## Functional Requirements
Career exploration and assessments; pathway graphs; salary/range and cost scenarios; education/college/trade/military/entrepreneurship planning; licensing/certification requirements; networking/professional organizations; internships/employment; milestone plans; long-term scenarios; compare alternatives and prerequisites; recommend evidence-building actions.

## Non-functional Requirements
Versioned and reproducible rules; stable typed contracts; idempotent events; secure server boundaries; tenant isolation; complete audit correlation; observable failures; accessible degradation; data export; defined SLOs; migration and rollback plans. Generative AI is optional and must not be a single point of failure.

## Canonical Data Model
CareerInterest, Occupation, Industry, Pathway, PathwayStep, EducationOption, License, Certification, CompensationRange, CostScenario, Organization, NetworkGoal, Experience, Milestone, Scenario and DecisionSnapshot. Sources carry geography/date/authority.

## Permission Model
Private interests and scenarios remain Scholar-controlled. Recruiters/employers see only shared profiles/applications. Military or commercial pathways receive no privileged placement. Supporters may advise within grants, not overwrite goals.

## Privacy Considerations
Minimize fields and retention, bind use to declared purpose, redact logs, prohibit secondary training/targeting without separate consent, support access/correction/export/deletion, and complete minor/jurisdiction review before launch.

## Accessibility
Meet the design handbook and WCAG expectations: semantic structure, keyboard and screen-reader operation, non-color status, plain-language explanations, localized dates/numbers, zoom/reflow, reduced motion, low-bandwidth/manual alternatives, and accessible exported documents where applicable.

## Ethical Considerations
Do not optimize engagement, manufacture certainty, infer protected traits, punish missing data, or conceal commercial influence. Evaluate differential errors and access; provide correction, appeal, opt-out and human escalation.

## Verification Requirements
Separate official requirements, market estimates, Scholar preferences and inferred fit. Salary shows geography/date/range and excludes guaranteed outcomes. AI explains evidence and counter-options; material plans require human review.

## Explainability Requirements
Show source, policy/model version, key factors, uncertainty, missing information, timing, available alternatives and how to correct or appeal. Structured reason codes are authoritative; generated prose is only a presentation.

## Integration Points
Scholar Record career/education/employment, Resume, Mentor, Financial Literacy, Opportunity Engine, Compass, Event Center, Portfolio and approved labor/education/credential sources.

## Dependencies
Scholar Record identity and evidence; permissions/RLS; Event Bus; audit; Trust Layer; accessible design system; notifications; domain policy owners; approved source/adaptor contracts. No dependency may broaden permission.

## Implementation Roadmap
Canonical pathway ontology and curated sources; exploration/comparison; milestones/opportunities; salary/cost simulations; mentors/networking; evaluated future forecasting with update/rollback.

## Success Metrics
Plan clarity without premature lock-in, milestone completion, verified experiences, internships/employment/credentials, pathway changes handled, source freshness, outcome equity and explanation comprehension.

## Future Expansion
Skills adjacency, regional workforce ecosystems, alumni transitions and privacy-preserving market intelligence.

## Open Questions
Approved labor sources/update cadence? Military pathway safeguards? How represent entrepreneurship uncertainty? Who validates licensing rules? Which outcomes indicate quality beyond salary?
