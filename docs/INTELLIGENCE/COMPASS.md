# Compass Intelligence

## Purpose
Specify the existing Compass engine and its safe extension as Playbook's explainable next-action guide.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 25, 2026

## Related Documents
- [Intelligence architecture](./ARCHITECTURE.md)
- [Canonical Student Record](./CANONICAL_STUDENT_RECORD.md)
- [Compass innovation record](../INNOVATIONS/Innovation-0004-Compass-AI.md)

## Mission and Purpose
Help a Scholar understand momentum, gaps, goals, relevant opportunities, and practical next steps without making decisions for them.

## Repository Status — Implemented

### Already Implemented
- **Inputs:** courses and optional trust score in [`lib/compass/CompassEngine.ts`](../../lib/compass/CompassEngine.ts), which derives academic intelligence/DNA and opportunity matches.
- **Outputs:** typed score, headline, summary, prioritized recommendations, reasons, next steps, and next actions in [`lib/compass/types.ts`](../../lib/compass/types.ts).
- **Components/UI:** [`app/compass/page.tsx`](../../app/compass/page.tsx) and [`components/compass/`](../../components/compass/).
- **Existing modules:** reasoning, goals, recommendations, next steps, and explainability under [`lib/compass/`](../../lib/compass/).
- **Validation:** [`tests/unit/compass/`](../../tests/unit/compass/) and related intelligence tests.

There is no dedicated Compass database table or API route. That is current state, not evidence that a duplicate record store is needed.

## Current Capabilities
Compass deterministically composes reusable academic and opportunity engines. Recommendations include reasons and next steps. A simple score explanation protects against a wholly opaque result.

## Current Limitations
Inputs are narrower than the Scholar Record; trust falls back to `40`; report outputs lack evidence identifiers, calculation version, freshness, persistence, preference/consent state, and accept/dismiss feedback. Score thresholds and copy are static.

## Partially Implemented and Required Extensions
- Add an adapter from the authorized Scholar Record projection rather than widening page-owned inputs.
- Include factor contributions, evidence links, missing-data disclosures, generated time, engine version, and confidence/uncertainty where meaningful.
- Store only recommendation lifecycle/event data in existing event/timeline patterns after schema review; never store a second scholar profile.
- Allow accept, dismiss, defer, edit, and “ask my support network” actions.
- Route accepted actions through existing journey, opportunity, support-action, event, and notification systems.

## Engineering Readiness

| Area | Specification |
|---|---|
| Dependencies | Scholar Record projection, academic intelligence, opportunity graph, trust/permissions, events/notifications. |
| Complexity | Medium for grounding/versioning; high if personalized ranking is introduced. |
| Risks | False precision, stale data, feedback loops, biased opportunity visibility, alert fatigue. |
| Validation | Unit/golden tests, missing-data tests, explanation fidelity, permission/RLS checks, accessibility, fairness review, human usability study. |
| Success metrics | Explanation view rate, accepted/deferred/dismissed distribution, action completion, stale recommendation rate, Record completeness improvement. |

## Future Opportunities
Scenario comparison and assisted natural-language explanations may extend the deterministic core. They must cite record evidence, make uncertainty visible, avoid protected-trait proxies, and defer consequential choices to the Scholar and their chosen humans.

