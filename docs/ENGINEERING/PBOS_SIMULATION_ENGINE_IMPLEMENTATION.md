# PBOS Simulation Engine Implementation

**Purpose:** Document bounded pre-execution simulation.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026

`pbos/simulation/` binds request, context, dependencies, assumptions, projections, limitations, rollback, evidence, confidence, and digest. Missing rollback validation or evidence is rejected. Every result explicitly has `production_authority: false`.
