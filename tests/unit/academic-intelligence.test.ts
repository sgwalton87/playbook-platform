import { describe, expect, it } from "vitest";
import { buildAcademicIntelligence, classifyCourseSubject } from "@/lib/academic-intelligence";

describe("Academic Intelligence", () => {
  it("classifies common course names", () => {
    expect(classifyCourseSubject("Algebra II")).toBe("math");
    expect(classifyCourseSubject("English Literature")).toBe("english");
    expect(classifyCourseSubject("Biology")).toBe("science");
  });

  it("builds an academic intelligence report", () => {
    const report = buildAcademicIntelligence([
      { name: "English 10", credits: 10 },
      { name: "Algebra II", credits: 10 },
      { name: "Biology", credits: 10 },
      { name: "World History", credits: 10 },
    ]);

    expect(report.passedCredits).toBe(40);
    expect(report.collegeReadiness).toBeGreaterThan(0);
    expect(report.missingSignals.length).toBeGreaterThan(0);
  });
});
