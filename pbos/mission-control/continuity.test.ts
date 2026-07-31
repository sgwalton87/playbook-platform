import { describe, expect, it } from "vitest";
import { formatRoadmapContinuity, type RoadmapContinuityView } from "./continuity";

describe("Mission Control roadmap continuity", () => {
  it("reports completed work and only the planner-derived successor", () => {
    const view: RoadmapContinuityView = {
      objective: "Build Playbook Platform",
      current_completed_milestone: "PRODUCT-DEFINITION-001",
      next_eligible_milestone: "IMPLEMENTATION-001",
      status: "READY",
    };
    expect(formatRoadmapContinuity(view)).toContain(
      "Current Completed Milestone:\nPRODUCT-DEFINITION-001"
    );
    expect(formatRoadmapContinuity(view)).toContain(
      "Next Eligible Milestone:\nIMPLEMENTATION-001"
    );
  });
});
