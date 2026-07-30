export const COGNITIVE_CONTROL_PLANE_DEPENDENCIES = Object.freeze({
  mission_intelligence: ["context", "constitution", "objective_registry"],
  architectural_memory: ["artifact_intelligence", "institutional_memory"],
  world_model: ["context", "artifact_intelligence", "architectural_memory"],
  risk_intelligence: ["world_model", "security_governance", "compliance"],
  simulation: ["world_model", "risk_intelligence", "resilience"],
  agent_governance: [
    "ai_governance",
    "engine_admission",
    "capability_admission",
    "authorization",
  ],
  outcome_evaluation: [
    "mission_intelligence",
    "execution_evidence",
    "validation",
    "observability",
  ],
} as const);
