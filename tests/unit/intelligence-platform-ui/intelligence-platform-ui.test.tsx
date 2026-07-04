import { describe, expect, it } from "vitest";
import RecommendationCenter from "@/components/intelligence-platform/RecommendationCenter";
import ScenarioLab from "@/components/intelligence-platform/ScenarioLab";
import IntelligencePlatformDashboard from "@/components/intelligence-platform/IntelligencePlatformDashboard";

describe("Intelligence Platform UI", () => {
  it("components are defined", () => {
    expect(RecommendationCenter).toBeTruthy();
    expect(ScenarioLab).toBeTruthy();
    expect(IntelligencePlatformDashboard).toBeTruthy();
  });
});
