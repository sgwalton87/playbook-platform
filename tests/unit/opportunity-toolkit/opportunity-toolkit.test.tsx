import { describe, expect, it } from "vitest";
import {
  buildApplicationPlan,
  buildBragSheet,
  buildPortfolioPacket,
  buildRecommendationLetter,
  buildResumeProfile,
  scoreResumeReadiness,
} from "@/lib/opportunity-toolkit";
import OpportunityToolkitDashboard from "@/components/opportunity-toolkit/OpportunityToolkitDashboard";

describe("Opportunity Application Toolkit", () => {
  it("builds resume profile", () => {
    const resume = buildResumeProfile({
      name: "Maya",
      education: ["High School"],
    });

    expect(resume.name).toBe("Maya");
  });

  it("scores resume readiness", () => {
    const resume = buildResumeProfile({
      name: "Maya",
      education: ["High School"],
      skills: ["Leadership"],
    });

    expect(scoreResumeReadiness(resume).score).toBeGreaterThan(0);
  });

  it("builds recommendation letter", () => {
    const letter = buildRecommendationLetter({
      scholarName: "Maya",
      recommenderName: "Coach",
      recommenderRole: "coach",
      strengths: ["resilience"],
      evidence: ["Team leadership"],
    });

    expect(letter).toContain("Maya");
    expect(letter).toContain("Coach");
  });

  it("builds brag sheet", () => {
    const sheet = buildBragSheet({
      scholarName: "Maya",
      goals: ["College"],
      proudMoments: ["Captain"],
      challengesOvercome: ["Balance"],
      leadership: ["Mentor"],
      evidence: ["Transcript"],
    });

    expect(sheet.evidence).toContain("Transcript");
  });

  it("builds portfolio packet", () => {
    const packet = buildPortfolioPacket({
      scholarName: "Maya",
      resume: {},
      bragSheet: {},
      targetUse: "scholarship",
    });

    expect(packet.title).toContain("Maya");
  });

  it("builds application plan", () => {
    const plan = buildApplicationPlan({
      opportunityName: "Scholarship",
      opportunityType: "scholarship",
      missingItems: ["Essay"],
    });

    expect(plan.status).toBe("action_needed");
  });

  it("component is defined", () => {
    expect(OpportunityToolkitDashboard).toBeTruthy();
  });
});
