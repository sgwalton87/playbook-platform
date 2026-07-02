import { describe, expect, it } from "vitest";
import { buildCompassReport } from "@/lib/compass";

describe("Compass Core", () => {
  it("builds an explainable Compass report", () => {
    const report = buildCompassReport({
      trustScore: 70,
      courses: [
        { name: "Biology", subject: "science", credits: 10, grade: "A", completed: true },
        { name: "Algebra II", subject: "math", credits: 10, grade: "B", completed: true },
      ],
    });

    expect(report.score).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.nextActions.length).toBeGreaterThan(0);
  });
});
