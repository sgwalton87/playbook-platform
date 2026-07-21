# ADR-0008: Compass is an Orchestrator, Not a Domain Engine

Status: Accepted

Date: 2026-07-20

Owners:
Platform Architecture

---

# Context

Many platforms treat artificial intelligence as the primary application layer.

In this model, AI owns business logic, recommendations, permissions, workflows, and user interactions.

This architecture creates tight coupling between AI models and platform behavior, making systems difficult to audit, test, and evolve.

Playbook requires deterministic engines that remain authoritative regardless of whether AI is available.

---

# Decision

Compass shall not own business logic.

Compass is an orchestration layer that consumes canonical platform engines and presents guidance, coaching, explanations, and execution assistance to Participants.

Business decisions remain owned by deterministic platform engines.

---

# Canonical Architecture

Participant

↓

Compass

↓

Planning Engine

↓

Opportunity Engine

↓

Participant Record

↓

Evidence

↓

Domain Engines

Compass communicates with engines.

Compass does not replace them.

---

# Responsibilities

Compass is responsible for:

- Natural language interaction
- Coaching
- Goal tracking
- Motivation
- Explanations
- Recommendations
- Workflow assistance
- Draft generation
- Reflection
- Progress summaries
- Conversational planning

Compass is not responsible for:

- Eligibility determination
- Permission evaluation
- Policy enforcement
- Opportunity matching
- Financial calculations
- Transcript computation
- Credential verification
- Evidence validation

Those responsibilities remain with canonical engines.

---

# Guiding Principle

If Compass disappears, the platform still functions.

If Opportunity disappears, recommendations disappear.

If Policies disappear, permissions disappear.

AI is an accelerator—not the source of truth.

---

# Consequences

Positive

- Deterministic business logic
- Easier testing
- Explainable AI
- Easier model replacement
- Multi-agent future
- Reduced hallucination risk
- Strong governance

Trade-offs

- Requires more platform engines
- Slightly more architectural complexity

These trade-offs are accepted because they produce a more reliable, explainable, and maintainable platform.

---

# Status

Accepted.