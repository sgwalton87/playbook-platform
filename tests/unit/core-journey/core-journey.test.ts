import { describe, expect, it } from "vitest";
import fs from "node:fs";

import {
  CORE_JOURNEY,
  calculateJourneyProgress,
  getCoreJourneyNavigation,
  getNextJourneyStep,
} from "@/lib/core-journey";

import {
  SCHOLAR_PRIMARY_NAV,
  FOUNDER_NAV,
  getNavigationForRole,
} from "@/lib/core-journey/navigation";

import { FOUNDER_DEMO_JOURNEY } from "@/lib/core-journey/founderDemoJourney";

describe("Playbook Core Journey Restoration", () => {
  it("restores transcript and academic readiness near the beginning", () => {
    expect(CORE_JOURNEY[1].href).toBe("/transcript");
    expect(CORE_JOURNEY[2].href).toBe("/academic-readiness");
  });

  it("connects academic readiness to scholar-athlete readiness", () => {
    expect(getNextJourneyStep("academic-readiness")?.id).toBe(
      "scholar-athlete"
    );
  });

  it("keeps opportunities, applications, and support in the journey", () => {
    const ids = CORE_JOURNEY.map((step) => step.id);

    expect(ids).toContain("opportunities");
    expect(ids).toContain("applications");
    expect(ids).toContain("support");
  });

  it("calculates journey progress", () => {
    const result = calculateJourneyProgress({
      record: "complete",
      transcript: "complete",
      "academic-readiness": "ready",
    });

    expect(result.completed).toBe(3);
    expect(result.total).toBe(CORE_JOURNEY.length);
    expect(result.percent).toBeGreaterThan(0);
  });

  it("creates scholar navigation around the core journey", () => {
    expect(SCHOLAR_PRIMARY_NAV.some((item) => item.href === "/academic-readiness")).toBe(true);
    expect(SCHOLAR_PRIMARY_NAV.some((item) => item.href === "/courses")).toBe(true);
  });

  it("keeps founder tools separate", () => {
    expect(FOUNDER_NAV.some((item) => item.href === "/studio")).toBe(true);

    const scholar = getNavigationForRole("scholar");
    expect(scholar.founder).toHaveLength(0);

    const founder = getNavigationForRole("founder");
    expect(founder.founder.length).toBeGreaterThan(0);
  });

  it("uses the founder story as the demo journey", () => {
    expect(FOUNDER_DEMO_JOURNEY.length).toBeGreaterThan(0);

    expect(
      FOUNDER_DEMO_JOURNEY.some(
        (chapter) => chapter.id === "testing-timing"
      )
    ).toBe(true);

    expect(
      FOUNDER_DEMO_JOURNEY.some(
        (chapter) => chapter.id === "professional-athlete"
      )
    ).toBe(true);
  });

  it("preserves original academic infrastructure", () => {
    expect(fs.existsSync("app/transcript/page.tsx")).toBe(true);
    expect(fs.existsSync("app/api/parse-transcript/route.ts")).toBe(true);
    expect(fs.existsSync("components/ag/AGTracker.tsx")).toBe(true);
    expect(
      fs.existsSync(
        "lib/academic-intelligence/academicIntelligenceEngine.ts"
      )
    ).toBe(true);
  });

  it("exports journey navigation", () => {
    expect(getCoreJourneyNavigation().length).toBe(CORE_JOURNEY.length);
  });
});
