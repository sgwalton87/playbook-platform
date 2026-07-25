# Resume Intelligence Constitutional Specification

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
Maintain continuously evolving, evidence-linked resume projections without forcing a Scholar to rebuild their story.

## Vision
Every Scholar can produce an authentic, audience-appropriate resume whose claims trace to the live Scholar Record.

## Problem Statement
Resume evidence is forgotten, rewritten inconsistently and difficult for reviewers to trust.

## Guiding Principles
Record is source; resume is projection; verified over claimed; Scholar editorial voice; truthful tailoring, never fabrication; snapshot every external use.

## Functional Requirements
Detect eligible achievements/activity; propose—not silently publish—updates; map activities to skills with evidence; create digital, printable, admissions, employment and athletic views; public/private visibility; reviewer approval; version/diff/restore; accessible export; freshness alerts; lock submission snapshots and authenticity manifests.

## Non-functional Requirements
Versioned and reproducible rules; stable typed contracts; idempotent events; secure server boundaries; tenant isolation; complete audit correlation; observable failures; accessible degradation; data export; defined SLOs; migration and rollback plans. Generative AI is optional and must not be a single point of failure.

## Canonical Data Model
ResumeProfile, ResumeView(type/audience), ResumeSection, ResumeEntry, EvidenceCitation, SkillClaim, GeneratedDraft, ReviewDecision, VisibilityPolicy, Version and ExportArtifact. Entries reference record item versions; audience views store selection/order, not copied truth.

## Permission Model
Scholar edits and approves. Reviewers comment/approve only within grants. Public view is explicit, revocable and redacted; private drafts and reviewer notes remain private. Employers/admissions receive only shared snapshots.

## Privacy Considerations
Minimize fields and retention, bind use to declared purpose, redact logs, prohibit secondary training/targeting without separate consent, support access/correction/export/deletion, and complete minor/jurisdiction review before launch.

## Accessibility
Meet the design handbook and WCAG expectations: semantic structure, keyboard and screen-reader operation, non-color status, plain-language explanations, localized dates/numbers, zoom/reflow, reduced motion, low-bandwidth/manual alternatives, and accessible exported documents where applicable.

## Ethical Considerations
Do not optimize engagement, manufacture certainty, infer protected traits, punish missing data, or conceal commercial influence. Evaluate differential errors and access; provide correction, appeal, opt-out and human escalation.

## Verification Requirements
Display claim-level assurance and “as of” date without penalizing self-attested experience. Generated language must preserve fact scope and metrics. Authenticity uses signed/checksummed manifests where approved, not unverifiable “AI detection.”

## Explainability Requirements
Show source, policy/model version, key factors, uncertainty, missing information, timing, available alternatives and how to correct or appeal. Structured reason codes are authoritative; generated prose is only a presentation.

## Integration Points
Scholar Record, evidence/verification, Portfolio, Trust, Compass, applications, recommendation evidence, sharing and document/PDF services.

## Dependencies
Scholar Record identity and evidence; permissions/RLS; Event Bus; audit; Trust Layer; accessible design system; notifications; domain policy owners; approved source/adaptor contracts. No dependency may broaden permission.

## Implementation Roadmap
Unify existing builder/service; implement record-linked entries and versioning; add variants/export/accessibility; add review/public sharing; then tested achievement/skill suggestions and partner formats.

## Success Metrics
Verified claim coverage, time to valid resume, stale/duplicate claims, accepted suggestions, reviewer turnaround, export success, accessibility completion and correction rate.

## Future Expansion
Credential imports, standards-based exports, multilingual variants and employer/college adapters.

## Open Questions
Who owns editorial disputes? Approved templates? Public discovery policy for minors? Signature standard? Which inferred skills need verifier approval?
