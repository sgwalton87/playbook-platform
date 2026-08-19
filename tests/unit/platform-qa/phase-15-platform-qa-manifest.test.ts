import { describe, expect, it } from "vitest";
import { PLATFORM_QA_GATES, assertPlatformQaManifest } from "@/lib/platform/platformQaManifest";

describe("Phase 15 Platform QA manifest", () => {
  it("contains the complete canonical 24-gate inventory", () => {
    expect(() => assertPlatformQaManifest()).not.toThrow();
    expect(PLATFORM_QA_GATES).toHaveLength(24);
  });

  it("contains every role journey gate", () => {
    const roleTitles = PLATFORM_QA_GATES.filter((gate) => gate.category === "role-e2e").map((gate) => gate.title);
    expect(roleTitles).toEqual([
      "Scholar End-to-End QA",
      "Scholar-Athlete End-to-End QA",
      "Parent Guardian End-to-End QA",
      "Teacher Educator End-to-End QA",
      "Counselor End-to-End QA",
      "Mentor End-to-End QA",
      "High School Coach End-to-End QA",
      "College Coach End-to-End QA",
      "Admissions End-to-End QA",
      "Brand Partner End-to-End QA",
      "Employer End-to-End QA",
      "Founder End-to-End QA",
      "Athlete Abroad End-to-End QA",
    ]);
  });

  it("does not let automation self-certify human launch gates", () => {
    const softLaunch = PLATFORM_QA_GATES.find((gate) => gate.title === "Soft Launch");
    const betaFeedback = PLATFORM_QA_GATES.find((gate) => gate.title === "Beta Feedback");
    const finalLaunch = PLATFORM_QA_GATES.find((gate) => gate.title === "Final Launch QA");
    expect(softLaunch?.evidence).toBe("human-program");
    expect(betaFeedback?.evidence).toBe("human-program");
    expect(finalLaunch?.evidence).toBe("operator");
    expect(PLATFORM_QA_GATES.every((gate) => gate.releaseBlocking)).toBe(true);
  });

  it("keeps security and RLS explicit release blockers", () => {
    const security = PLATFORM_QA_GATES.filter((gate) => gate.category === "security");
    expect(security.map((gate) => gate.title)).toEqual(["Security QA", "RLS Audit"]);
    expect(security.every((gate) => gate.evidence === "automated")).toBe(true);
  });
});
