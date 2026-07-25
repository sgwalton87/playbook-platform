# Scholarship Intelligence Constitutional Specification

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
Connect Scholars to scholarships they can credibly pursue and help them complete strong, timely applications.

## Vision
Institutional, national, partner and community scholarships become discoverable through transparent eligibility and reusable verified evidence.

## Problem Statement
Scholarship discovery is fragmented; rules are ambiguous; deadlines and repeated packets create avoidable exclusion.

## Guiding Principles
Eligibility separate from ranking; uncertain remains visible; source authority/freshness; access over popularity; never guarantee awards; Scholar chooses applications.

## Functional Requirements
Ingest and normalize scholarships; model hard/soft eligibility; show eligible/uncertain/ineligible reasons; track deadlines and applications; prioritize by fit, impact, readiness, effort and urgency; build consented canonical application packets; progress checklists; reminders/Event Center; award/outcome tracking; probability ranges only when calibrated with adequate representative data.

## Non-functional Requirements
Versioned and reproducible rules; stable typed contracts; idempotent events; secure server boundaries; tenant isolation; complete audit correlation; observable failures; accessible degradation; data export; defined SLOs; migration and rollback plans. Generative AI is optional and must not be a single point of failure.

## Canonical Data Model
ScholarshipOpportunity(source/category), EligibilityRule/Evaluation, Deadline, Match, PriorityScore, Application, Requirement, PacketSnapshot, Submission, Award and Outcome. Category supports institutional, national, partner and community. Packet references exact record/evidence versions.

## Permission Model
Private financial/demographic eligibility fields are purpose-bound and hidden from unauthorized supporters/partners. Partners cannot browse Scholars absent explicit sharing. Submission always requires Scholar/authorized guardian confirmation.

## Privacy Considerations
Minimize fields and retention, bind use to declared purpose, redact logs, prohibit secondary training/targeting without separate consent, support access/correction/export/deletion, and complete minor/jurisdiction review before launch.

## Accessibility
Meet the design handbook and WCAG expectations: semantic structure, keyboard and screen-reader operation, non-color status, plain-language explanations, localized dates/numbers, zoom/reflow, reduced motion, low-bandwidth/manual alternatives, and accessible exported documents where applicable.

## Ethical Considerations
Do not optimize engagement, manufacture certainty, infer protected traits, punish missing data, or conceal commercial influence. Evaluate differential errors and access; provide correction, appeal, opt-out and human escalation.

## Verification Requirements
Rules cite authoritative source and retrieval time; unresolved ambiguity is flagged. Probability displays range, factors, limitations and “not a guarantee”; no probability until governance approves validation. Submitted claims retain provenance.

## Explainability Requirements
Show source, policy/model version, key factors, uncertainty, missing information, timing, available alternatives and how to correct or appeal. Structured reason codes are authoritative; generated prose is only a presentation.

## Integration Points
Opportunity Graph/Engine, Scholar Record, Resume, Recommendation Letters, Financial Literacy/FAFSA learning, Compass, Event Center, application workspace and approved provider adapters.

## Dependencies
Scholar Record identity and evidence; permissions/RLS; Event Bus; audit; Trust Layer; accessible design system; notifications; domain policy owners; approved source/adaptor contracts. No dependency may broaden permission.

## Implementation Roadmap
Curated verified catalog and deterministic eligibility; tracking/packets; partner feeds/reconciliation; transparent prioritization; only then calibrated probability/AI drafting under review.

## Success Metrics
Qualified matches, completed/on-time applications, awards/funding, false eligibility rate, stale listings, packet reuse, underserved coverage, explanation comprehension and provider correction time.

## Future Expansion
Common application interoperability, local partner portals, multilingual discovery and privacy-preserving outcome calibration.

## Open Questions
Authoritative source policy? Definition of representative data? Treatment of need information? Duplicate reconciliation? Who verifies local awards?
