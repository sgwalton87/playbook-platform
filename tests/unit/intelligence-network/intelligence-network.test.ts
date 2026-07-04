import { describe, expect, it } from "vitest";
import {
  buildLifeGraph,
  buildLivingTimeline,
  createGoal,
  createRelationship,
  orchestrateIntelligenceEvent,
} from "@/lib/intelligence-network";

describe("Playbook Intelligence Network", () => {
  it("orchestrates an intelligence event", () => {
    const result = orchestrateIntelligenceEvent({
      type: "transcript.imported",
      scholarId: "scholar-1",
    });

    expect(result.enginesTriggered).toContain("compass");
    expect(result.status).toBe("orchestrated");
  });

  it("builds a living timeline", () => {
    expect(buildLivingTimeline().length).toBeGreaterThan(0);
  });

  it("creates relationships with permissions", () => {
    const relationship = createRelationship({
      scholarId: "scholar-1",
      personName: "Coach Taylor",
      relationship: "coach",
    });

    expect(relationship.permissions).toContain("verify_evidence");
  });

  it("creates goals with tasks", () => {
    const goal = createGoal("submit_fafsa");
    expect(goal.tasks.length).toBeGreaterThan(0);
  });

  it("builds a life graph", () => {
    const graph = buildLifeGraph();
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
  });
});
