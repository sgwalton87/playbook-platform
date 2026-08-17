import { describe, expect, it } from "vitest";
import {
  evaluateSourceBackedEligibilityReadiness,
  flattenRequirementNodes,
  type SourceBackedEligibilityRuleset,
} from "./sourceBackedEligibility";

const ncaaRuleset: SourceBackedEligibilityRuleset = {
  id: "ruleset-di",
  rulesetKey: "ncaa-di-initial-2026-27",
  governingBody: "NCAA",
  pathway: "division_i",
  certificationAuthority: "NCAA Eligibility Center",
  authorityNote: "Playbook readiness is advisory only.",
  sourceTitle: "NCAA Division I Initial Eligibility Requirements",
  sourceUrl: "https://example.test/ncaa-di",
  sourceRetrievedAt: "2026-08-16",
  requirements: {
    logic: "ALL",
    requirements: [
      { key: "core_courses", label: "Core courses" },
      { key: "core_gpa", label: "Core GPA" },
    ],
  },
};

const naiaRuleset: SourceBackedEligibilityRuleset = {
  id: "ruleset-naia",
  rulesetKey: "naia-entering-freshman-2026-27",
  governingBody: "NAIA",
  pathway: "entering_freshman",
  certificationAuthority: "NAIA Eligibility Center",
  authorityNote: "Playbook readiness is advisory only.",
  sourceTitle: "NAIA Basics of Freshman Eligibility",
  sourceUrl: "https://example.test/naia",
  sourceRetrievedAt: "2026-08-16",
  requirements: {
    logic: "ALL",
    requirements: [
      { key: "high_school_completion", label: "High school completion" },
      {
        key: "freshman_pathway",
        label: "Freshman academic pathway",
        type: "choice",
        logic: "ANY",
        options: [
          {
            key: "gpa_direct",
            logic: "ALL",
            requirements: [{ key: "gpa_23", label: "2.3 GPA" }],
          },
          {
            key: "two_of_three",
            logic: "AT_LEAST",
            count: 2,
            requirements: [
              { key: "gpa_20", label: "2.0 GPA" },
              { key: "upper_half", label: "Upper half class rank" },
              { key: "test_score", label: "ACT or SAT threshold" },
            ],
          },
        ],
      },
    ],
  },
};

describe("source-backed eligibility readiness", () => {
  it("keeps official eligibility undetermined even when the Playbook record is ready", () => {
    const result = evaluateSourceBackedEligibilityReadiness(ncaaRuleset, [
      { requirementKey: "core_courses", reportedState: "complete" },
      { requirementKey: "core_gpa", reportedState: "complete" },
    ]);

    expect(result.readiness).toBe(100);
    expect(result.verifiedReadiness).toBe(0);
    expect(result.readinessState).toBe("record_ready");
    expect(result.officialEligibilityState).toBe("not_determined");
  });

  it("counts only independently verified linked evidence toward verified readiness", () => {
    const result = evaluateSourceBackedEligibilityReadiness(ncaaRuleset, [
      {
        requirementKey: "core_courses",
        reportedState: "complete",
        athleteEvidenceVerificationState: "verified",
      },
      { requirementKey: "core_gpa", reportedState: "complete" },
    ]);

    expect(result.readiness).toBe(100);
    expect(result.verifiedReadiness).toBe(50);
  });

  it("evaluates NAIA alternative pathways without requiring every alternative", () => {
    const result = evaluateSourceBackedEligibilityReadiness(naiaRuleset, [
      { requirementKey: "high_school_completion", reportedState: "complete" },
      { requirementKey: "gpa_20", reportedState: "complete" },
      { requirementKey: "upper_half", reportedState: "complete" },
    ]);

    expect(result.readiness).toBe(100);
    expect(result.findings[1]?.state).toBe("reported");
    expect(result.officialEligibilityState).toBe("not_determined");
  });

  it("exposes nested requirement keys for evidence entry without flattening branch logic", () => {
    const flattened = flattenRequirementNodes(naiaRuleset.requirements.requirements || []);
    expect(flattened.map((node) => node.key)).toContain("upper_half");
    expect(flattened.map((node) => node.key)).toContain("gpa_direct");
  });
});
