# Playbook Verification Standard

**Status:** Active

This document defines the verification requirements for every AI system, engineering workflow, and intelligence engine within the Playbook Intelligence OS.

Trust is earned through evidence.

Accuracy is more important than speed.

---

# Core Principle

No AI, engineer, automation, report, recommendation, or user-facing feature may present unverified information as factual.

If information cannot be verified, it must be clearly identified as unverified.

---

# Rule 1 — Triple Verification

Whenever practical, all externally sourced factual information must be verified using at least three independent, authoritative sources before being presented as fact.

Examples include:

- scholarship deadlines
- FAFSA information
- NCAA requirements
- recruiting regulations
- financial information
- university admissions requirements
- government programs
- legal references
- statistics

If three authoritative sources cannot be found:

- identify the confidence level
- explain the limitation
- never present assumptions as facts

---

# Rule 2 — Canonical Source Priority

When information exists within the Playbook Record™, Scholar Record™, or another canonical Playbook domain, those records take precedence.

Do not overwrite canonical data using external sources unless explicitly authorized.

---

# Rule 3 — Evidence First

Every significant conclusion should be supported by evidence.

Evidence may include:

- official documents
- verified records
- uploaded documents
- transcripts
- certificates
- contracts
- institutional records
- verified APIs
- government publications

---

# Rule 4 — Confidence Levels

Every AI output should internally classify confidence.

Level 4 — VERIFIED

Verified by three or more independent authoritative sources.

Level 3 — HIGH

Verified by two authoritative sources.

Level 2 — MEDIUM

Verified by one authoritative source.

Level 1 — LOW

Derived from incomplete evidence.

Level 0 — UNVERIFIED

No verification available.

---

# Rule 5 — Hallucination Prevention

Never invent:

- dates
- deadlines
- statistics
- legal requirements
- financial figures
- policies
- database records
- implementation status
- user accomplishments

If verification is unavailable:

STOP.

Explain what cannot be verified.

Request additional evidence when appropriate.

---

# Rule 6 — Repository Verification

Before reporting implementation progress:

Verify by inspecting the repository.

Never assume:

- a file exists
- a feature is complete
- an engine is wired
- an integration is finished

Repository inspection is required.

---

# Rule 7 — Build Verification

Never report that a sprint is complete unless verification confirms:

- TypeScript passes
- Build passes
- Tests pass (when applicable)
- Acceptance criteria satisfied

Compilation is evidence.

Assumptions are not.

---

# Rule 8 — Integration Matrix

A box may only change from 🟡 to 🟢 after objective verification.

Verification must include:

- implementation inspection
- build verification
- acceptance criteria review

Do not mark work complete prematurely.

---

# Rule 9 — AI Engineering Conduct

AI systems should prefer:

Correctness over speed.

Evidence over assumptions.

Verification over confidence.

Truth over convenience.

---

# Guiding Principle

Playbook would rather delay an answer than provide an incorrect one.

Trust is the foundation of the Playbook Intelligence OS.

Evidence creates Trust.

Trust unlocks Opportunity.
