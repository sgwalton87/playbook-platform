# Mentor Intelligence Constitutional Specification

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
Create safe, purposeful mentor relationships that strengthen the Scholar’s support network.

## Vision
Every Scholar who wants mentorship can reach an appropriate, accountable human relationship with clear goals and healthy boundaries.

## Problem Statement
Mentor access is unequal; matching is opaque; relationships lapse; unsafe or overloaded matches can cause harm.

## Guiding Principles
Relationship quality over match volume; mutual consent; safeguarding first; explainable fit; no inferred sensitive similarity; easy rematch/exit; AI supports but never impersonates a mentor.

## Functional Requirements
Onboard/verify volunteer, professional and faculty mentors; represent expertise, availability and boundaries; include coach/parent roles without conflation; generate match candidates; mutual approval; relationship goals; meeting recommendations/scheduling; permitted communication; support tracking; mentor/student dashboards; progress reports; inactivity/intervention/rematch workflows; recognition tied to authentic service.

## Non-functional Requirements
Versioned and reproducible rules; stable typed contracts; idempotent events; secure server boundaries; tenant isolation; complete audit correlation; observable failures; accessible degradation; data export; defined SLOs; migration and rollback plans. Generative AI is optional and must not be a single point of failure.

## Canonical Data Model
MentorProfile, Credential/Check, Availability, MatchPreference, MatchCandidate, Relationship, Consent, Goal, Meeting, CheckIn, BoundaryIncident, Intervention, ProgressSummary and Recognition. Private communications are not intelligence inputs by default.

## Permission Model
Scholar/guardian consent follows age policy. Mentors see only scoped context. Coaches, parents and staff have distinct grants. Safety staff access is audited and policy-bound. Either party can pause/end/report without penalty.

## Privacy Considerations
Minimize fields and retention, bind use to declared purpose, redact logs, prohibit secondary training/targeting without separate consent, support access/correction/export/deletion, and complete minor/jurisdiction review before launch.

## Accessibility
Meet the design handbook and WCAG expectations: semantic structure, keyboard and screen-reader operation, non-color status, plain-language explanations, localized dates/numbers, zoom/reflow, reduced motion, low-bandwidth/manual alternatives, and accessible exported documents where applicable.

## Ethical Considerations
Do not optimize engagement, manufacture certainty, infer protected traits, punish missing data, or conceal commercial influence. Evaluate differential errors and access; provide correction, appeal, opt-out and human escalation.

## Verification Requirements
Identity, role, credentials/background checks as policy requires; badges identify assurance precisely. Match explanations list goals/expertise/availability and uncertainty. Relationship-health signals cannot surveil message sentiment or penalize protected communication patterns.

## Explainability Requirements
Show source, policy/model version, key factors, uncertainty, missing information, timing, available alternatives and how to correct or appeal. Structured reason codes are authoritative; generated prose is only a presentation.

## Integration Points
Starting Five/support relationships, permissions, messaging, Event Center, Compass, Career Journey, Scholar Record goals, Trust/safety and notifications.

## Dependencies
Scholar Record identity and evidence; permissions/RLS; Event Bus; audit; Trust Layer; accessible design system; notifications; domain policy owners; approved source/adaptor contracts. No dependency may broaden permission.

## Implementation Roadmap
Define safeguarding/consent; unify relationship model; verified profiles and manual matching; explainable candidate ranking; scheduling/check-ins/interventions; evaluated AI meeting preparation after privacy review.

## Success Metrics
Safe active relationships, time to mutual match, goal progress, meeting follow-through, rematch/exit resolution, incident response, mentor load equity, Scholar belonging and explanation comprehension.

## Future Expansion
Group mentoring, alumni networks, multilingual matching and AI-generated agendas/summaries only with participant consent.

## Open Questions
Safeguarding owner? Minor communication rules? Background-check jurisdictions? Maximum mentor load? What content may progress reports include?
