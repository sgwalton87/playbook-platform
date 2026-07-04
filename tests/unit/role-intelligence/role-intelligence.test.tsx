import { describe, expect, it } from "vitest";
import {
  buildRoleRecommendations,
  buildRoleScenarios,
  explainRoleIntelligence,
} from "@/lib/role-intelligence";
import RoleIntelligenceCenter from "@/components/role-intelligence/RoleIntelligenceCenter";

describe("Role-Aware Intelligence Platform", () => {
  it("builds family recommendations", () => {
    const result = buildRoleRecommendations("family");
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("builds mentor scenario", () => {
    const scenario = buildRoleScenarios("mentor");
    expect(scenario.scenario).toContain("mentor");
  });

  it("explains role intelligence", () => {
    expect(explainRoleIntelligence("employer")).toContain("employer");
  });

  it("component is defined", () => {
    expect(RoleIntelligenceCenter).toBeTruthy();
  });
});
