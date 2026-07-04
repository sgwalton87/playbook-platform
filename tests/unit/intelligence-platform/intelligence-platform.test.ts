import { describe, expect, it } from "vitest";
import {
  buildRecommendations,
  calculateImpact,
  explainImpact,
  runScenario,
} from "@/lib/intelligence-platform";

describe("Playbook Intelligence Platform", () => {
  it("builds recommendations", () => {
    const recs = buildRecommendations({ academicProgress: 70, trustScore: 60, opportunities: 3 });
    expect(recs.length).toBeGreaterThan(0);
  });

  it("runs scenarios and explains impact", () => {
    const scenario = runScenario("submit_fafsa");
    const impact = calculateImpact(scenario.changes);
    const explanation = explainImpact({
      scenarioTitle: scenario.title,
      scholarshipImpact: impact.scholarshipImpact,
      totalSignalGain: impact.totalSignalGain,
    });

    expect(explanation).toContain("Submit FAFSA");
    expect(impact.totalSignalGain).toBeGreaterThan(0);
  });
});
