# PBOS Cognitive Control Plane Architecture

**Purpose:** Define the unified integration and dependency boundary.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026

`pbos/cognitive-control-plane/` owns shared evidence contracts, the dependency graph, and recommendation admission. It does not own domain truth.

Inputs bind context identity, human authority, mission assessment, risk assessment, simulation, optional agent decision, and source evidence. Output binds confidence, reasoning, expected impact, evidence, mandatory human review, and digest.

The Constitutional Planner remains selection authority; Authorization remains action authority; the Kernel remains execution authority; Certification remains trust-issuance authority.
