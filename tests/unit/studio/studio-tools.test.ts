import { describe, expect, it } from "vitest";
import {
  generateDemoLearner,
  getDemoDirectorAudiences,
  getStudioEventFeed,
  inspectLearnerIntelligence,
} from "@/lib/studio/tools";

describe("Studio Intelligence Tools", () => {
  it("generates a demo learner", () => {
    const learner = generateDemoLearner();
    expect(learner.courses.length).toBeGreaterThan(0);
  });

  it("returns audience demo paths", () => {
    expect(getDemoDirectorAudiences().length).toBeGreaterThan(0);
  });

  it("inspects learner intelligence", () => {
    const learner = generateDemoLearner();
    const stages = inspectLearnerIntelligence(learner.courses, learner.trustScore);
    expect(stages.length).toBeGreaterThan(0);
  });

  it("returns event feed", () => {
    expect(getStudioEventFeed().length).toBeGreaterThan(0);
  });
});
