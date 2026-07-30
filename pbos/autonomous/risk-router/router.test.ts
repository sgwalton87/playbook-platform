import { describe, expect, it } from "vitest";
import type { BuildMilestone } from "../../manifests";
import { AutonomousRiskRouter } from "./router";

function milestone(
  risk_level: BuildMilestone["risk_level"],
  approval_level: BuildMilestone["approval_level"]
): BuildMilestone {
  return {
    id: "MILESTONE-001",
    name: "Governed milestone",
    type: "MILESTONE",
    description: "Test governed routing.",
    domain: "platform",
    priority: 1,
    status: "READY",
    dependencies: [],
    blocking_dependencies: [],
    required_artifacts: ["artifact"],
    required_capabilities: ["capability"],
    validation_requirements: ["test"],
    risk_level,
    approval_level,
    completion_definition: ["complete"],
    evidence_requirements: ["evidence"],
    owner: "PBOS",
    version: "1.0.0",
    outputs: ["output"],
  };
}

describe("autonomous risk router", () => {
  it.each([
    ["GREEN", "POLICY", "AUTOMATICALLY_ELIGIBLE"],
    ["YELLOW", "HUMAN", "FOUNDER_REVIEW"],
    ["RED", "EXPLICIT_HUMAN", "MANDATORY_APPROVAL"],
  ] as const)("routes %s risk without creating authority", (risk, approval, route) => {
    const result = new AutonomousRiskRouter().route(milestone(risk, approval));
    expect(result.route).toBe(route);
    expect(result.authority_required).toBe(approval);
  });
});
