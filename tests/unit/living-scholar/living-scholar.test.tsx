import { describe, expect, it } from "vitest";
import { buildLivingScholarExperience } from "@/lib/living-scholar";
import LivingScholar from "@/components/living-scholar/LivingScholar";

describe("Living Scholar Experience", () => {
  it("builds a living scholar experience", () => {
    const experience = buildLivingScholarExperience();

    expect(experience.growthScore).toBeGreaterThan(0);
    expect(experience.timeline.length).toBeGreaterThan(0);
    expect(experience.opportunities.matches.length).toBeGreaterThan(0);
  });

  it("component is defined", () => {
    expect(LivingScholar).toBeTruthy();
  });
});
