# ADR-0006 — Athletic Evidence and Eligibility Architecture

## Status

Accepted

## Decision

Playbook will model athletic performance evidence and eligibility as governed extensions of the Scholar Record rather than as free-form fields inside `athlete_profiles` or as intelligence-engine outputs.

`athlete_profiles` remains the canonical owner of declared athlete identity and recruiting context: sport, position, graduation year, governing path, recruiting status, and highlight-film reference.

Verified measurements, statistics, competition results, and eligibility findings will be stored as separate evidence records with provenance, source identity, verification state, and effective dates. Intelligence may interpret those records but may not overwrite them or convert unverified claims into verified facts.

## Canonical Ownership

### Athlete Profile

Owned by the Scholar through `athlete_profiles`.

Contains declared context only. It shall not become the canonical store for time-varying performance evidence.

### Athletic Evidence

Athletic measurements, statistics, results, and performance claims will have a dedicated canonical evidence owner.

Each evidence record must identify:

- Scholar
- sport
- evidence category
- metric or claim name
- value and unit where applicable
- event/season/context where applicable
- observed/effective date
- source type
- source reference or URL when available
- submitter identity
- verification state
- verifier identity when verified
- verification timestamp
- provenance metadata

A Scholar may submit evidence about themselves. Submission does not equal verification.

### Eligibility Rulesets

Eligibility rules will be represented as versioned source-backed rulesets rather than hard-coded assumptions in UI components.

Each ruleset must identify:

- governing body
- division/path where applicable
- ruleset version
- effective date
- source URL
- source publication date when available
- normalized requirements
- supersession state

Rulesets are derived from authoritative external sources and must preserve source provenance.

### Eligibility Findings

`athlete_eligibility_checks` remains the canonical owner of Scholar-specific eligibility evaluations.

A finding must reference:

- governing body
- ruleset version
- source URL
- evaluation timestamp
- requirement-level findings
- evidence references used for the evaluation
- verification status

Eligibility findings are decision support. Playbook must not represent an internal readiness result as official certification by a school, conference, NCAA, NAIA, NJCAA, or other governing body.

## Verification Authority

Verification is independent from self-reporting.

Authorized verification may eventually include explicitly governed roles such as:

- verified high-school coach
- verified school counselor or educator for academic evidence
- verified recruiting/college staff where appropriate
- approved platform reviewer
- trusted third-party data source

No role gains verification authority merely by being connected to the Scholar.

Verification permissions must be explicit and least-privilege.

## Evidence State Model

Athletic evidence will support at minimum:

- `self_reported`
- `submitted`
- `verified`
- `rejected`
- `superseded`

Historical evidence is preserved. Updating a measurement or statistic must not erase the prior verified observation.

## Intelligence Boundary

Athlete Intelligence may:

- normalize evidence
- summarize verified and unverified records separately
- identify missing evidence
- calculate trends from comparable records
- evaluate readiness against a versioned ruleset
- recommend next actions

Athlete Intelligence may not:

- fabricate measurements or statistics
- silently infer a verified fact
- overwrite canonical evidence
- mark eligibility as officially approved
- convert coach interest, an offer, or a commitment into an automated decision

Every recommendation must distinguish facts, self-reported evidence, verified evidence, and derived guidance.

## Recruiting Integration

Recruiting views may consume athletic evidence to improve context, but current recruiting stage remains a Scholar-controlled record.

Offers, visits, commitments, and coach interactions remain human-entered or independently verified events and shall not be inferred solely from performance data.

## Experience Requirements

Scholar-facing athletic evidence experiences must:

- use honest empty states
- show verification state
- show source/provenance when available
- distinguish current value from historical evidence
- support mobile, tablet, and desktop layouts
- provide loading, success, warning, error, and empty states
- never display demo athletic achievements as user data

## Security and Privacy

Athletic evidence is private by default.

Visibility outside the Scholar's own account requires explicit platform permission or a governed sharing workflow.

RLS and APIs must fail closed. Intelligence inherits the requesting user's permissions.

## Observability

The implementation must measure at minimum:

- evidence submitted
- evidence verified/rejected
- evidence verification latency
- eligibility checks generated
- ruleset version used
- recommendation acceptance/rejection when intelligence is added

Analytics must not expose private athletic evidence beyond authorized purposes.

## Alternatives Considered

- Add measurements/statistics columns directly to `athlete_profiles`
- Store performance claims only as JSON in recruiting targets
- Hard-code NCAA/NAIA requirements in the eligibility engine
- Treat user-entered statistics as verified facts

These alternatives were rejected because they create stale fields, destroy historical provenance, duplicate ownership, or weaken trust.

## Consequences

Playbook gains a durable athletic evidence layer that can support Recruiting Intelligence, eligibility readiness, public/private athlete records, coach collaboration, NIL readiness, and future verification without turning the athlete profile into a data silo.

The immediate engineering sequence is:

1. Create canonical athletic evidence schema and owner RLS.
2. Add Scholar submission and evidence-history experience.
3. Add explicit verification authority workflow.
4. Add versioned eligibility ruleset ingestion.
5. Connect the existing eligibility engine only to source-backed rulesets and evidence.
6. Add explainable readiness recommendations and outcome tracking.

No eligibility ruleset may be shipped from memory or unsourced assumptions.
