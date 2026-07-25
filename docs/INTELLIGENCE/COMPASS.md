# Compass Engine Constitutional Specification

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
Answer one question: “What is the highest-impact action this Scholar should take next?”

## Vision
A trusted planning companion that turns the Scholar’s whole journey into manageable momentum while keeping people in control.

## Problem Statement
Scholars face competing goals, hidden prerequisites, scattered deadlines and inconsistent advice.

## Guiding Principles
Goal alignment; evidence before inference; one actionable next step plus alternatives; urgency without anxiety; human escalation; domain engines retain authority; no engagement optimization.

## Functional Requirements
Consume domain recommendation envelopes; detect opportunities, risks, missing prerequisites and deadline collisions; score and deduplicate actions; generate daily focus, weekly plans and monthly horizons; honor capacity, calendar and preferences; link Event Center items; snooze/dismiss/appeal/complete; notify authorized supporters only by policy; recompute on material record/event changes.

## Non-functional Requirements
Versioned and reproducible rules; stable typed contracts; idempotent events; secure server boundaries; tenant isolation; complete audit correlation; observable failures; accessible degradation; data export; defined SLOs; migration and rollback plans. Generative AI is optional and must not be a single point of failure.

## Canonical Data Model
CompassPlan, PlanWindow, RecommendationEnvelope, PriorityScore, Dependency, CapacityPreference, RiskSignal, ConflictResolution, Explanation, LifecycleEvent and Outcome. Priority combines impact, urgency, readiness, confidence, effort and dependency unlocks; hard eligibility/safety gates remain separate. Risk signals describe an actionable condition and must never label a Scholar.

## Permission Model
Scholars control plans. Support roles receive only granted actions; urgent safety escalation requires a separately approved policy. Compass cannot broaden source permissions or expose hidden evidence through explanations.

## Privacy Considerations
Minimize fields and retention, bind use to declared purpose, redact logs, prohibit secondary training/targeting without separate consent, support access/correction/export/deletion, and complete minor/jurisdiction review before launch.

## Accessibility
Meet the design handbook and WCAG expectations: semantic structure, keyboard and screen-reader operation, non-color status, plain-language explanations, localized dates/numbers, zoom/reflow, reduced motion, low-bandwidth/manual alternatives, and accessible exported documents where applicable.

## Ethical Considerations
Do not optimize engagement, manufacture certainty, infer protected traits, punish missing data, or conceal commercial influence. Evaluate differential errors and access; provide correction, appeal, opt-out and human escalation.

## Verification Requirements
Each recommendation cites goal, evidence, deadline/source, policy version, uncertainty, missing data and alternatives. High-impact or low-confidence actions require human review. Completion requires domain evidence, not a click alone.

## Explainability Requirements
Show source, policy/model version, key factors, uncertainty, missing information, timing, available alternatives and how to correct or appeal. Structured reason codes are authoritative; generated prose is only a presentation.

## Integration Points
Every intelligence engine, Scholar Record, Event Center, Event Bus, Starting Five, Opportunity Graph, Trust, notifications, messaging and calendar adapters.

## Dependencies
Scholar Record identity and evidence; permissions/RLS; Event Bus; audit; Trust Layer; accessible design system; notifications; domain policy owners; approved source/adaptor contracts. No dependency may broaden permission.

## Implementation Roadmap
Start with deterministic deadlines/prerequisites; add shared envelopes and planning windows; add capacity/conflict handling and supporter workflows; validate calibrated ranking; then introduce constrained AI reasoning over authorized retrieved context.

## Success Metrics
High-impact action completion, on-time deadlines, prerequisite unlocks, plan stability, explanation comprehension, override/correction rate, supporter response, recommendation freshness and equitable coverage.

## Future Expansion
Scenario comparison, multilingual conversational planning and constrained multi-step reasoning with evaluation/rollback.

## Open Questions
Who defines “impact” per journey? Maximum daily load? Safety escalation owner? How should conflicting supporter advice appear? Which outcomes may tune priority?
