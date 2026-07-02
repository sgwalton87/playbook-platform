import { describe, expect, it } from "vitest";
import { buildAcademicIntelligenceReport } from "@/lib/academic-intelligence";

describe("Academic Intelligence v2", () => {
  it("builds a unified academic intelligence report", () => {
    const report = buildAcademicIntelligenceReport([
      { name: "World History", subject: "history", credits: 10, grade: "A", agCategory: "A", completed: true },
      { name: "English 10", subject: "english", credits: 10, grade: "B", agCategory: "B", completed: true },
      { name: "Algebra II", subject: "math", credits: 10, grade: "A", agCategory: "C", completed: true },
      { name: "Biology", subject: "science", credits: 10, grade: "B", agCategory: "D", completed: true },
    ]);

    expect(report.gpa).toBeGreaterThan(0);
    expect(report.creditsEarned).toBe(40);
    expect(report.agProgress).toBeGreaterThan(0);
    expect(report.score).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it("returns needs attention for empty academic data", () => {
    const report = buildAcademicIntelligenceReport([]);

    expect(report.score).toBeLessThan(65);
    expect(report.status).toBe("Needs Attention");
    expect(report.gaps.length).toBeGreaterThan(0);
  });
});
