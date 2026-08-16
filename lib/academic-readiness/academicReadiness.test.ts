import { describe, expect, it } from "vitest";
import { buildAcademicReadinessSnapshot } from "./academicReadiness";

const completeAg = "abcdefg".split("").map((subject) => ({
  subject,
  years_completed: 1,
  years_required: 1,
}));

describe("buildAcademicReadinessSnapshot", () => {
  it("routes a scholar without academic evidence to transcript activation", () => {
    const snapshot = buildAcademicReadinessSnapshot({ agProgress: [], applications: [] });

    expect(snapshot.readinessScore).toBe(0);
    expect(snapshot.primaryRecommendation.key).toBe("academic.transcript.activate");
    expect(snapshot.primaryRecommendation.actionRoute).toBe("/transcript");
  });

  it("prioritizes incomplete A-G requirements before applications", () => {
    const snapshot = buildAcademicReadinessSnapshot({
      agProgress: completeAg.slice(0, 5),
      applications: [{ id: "workspace-1", opportunity_name: "Example College", opportunity_type: "college", status: "building" }],
    });

    expect(snapshot.agSubjectsMet).toBe(5);
    expect(snapshot.primaryRecommendation.key).toBe("academic.ag.close-gap");
  });

  it("advances the nearest active application after A-G completion", () => {
    const snapshot = buildAcademicReadinessSnapshot({
      agProgress: completeAg,
      applications: [
        { id: "later", opportunity_name: "Later College", opportunity_type: "college", status: "building", deadline: "2026-12-01" },
        { id: "next", opportunity_name: "Next College", opportunity_type: "college", status: "building", deadline: "2026-10-01" },
      ],
    });

    expect(snapshot.readinessScore).toBe(100);
    expect(snapshot.primaryRecommendation.key).toBe("academic.application.advance.next");
    expect(snapshot.primaryRecommendation.title).toContain("Next College");
  });

  it("preserves human review when an application is ready", () => {
    const snapshot = buildAcademicReadinessSnapshot({
      agProgress: completeAg,
      applications: [{ id: "ready", opportunity_name: "Ready College", opportunity_type: "college", status: "ready" }],
    });

    expect(snapshot.primaryRecommendation.key).toBe("academic.application.submit-ready");
    expect(snapshot.primaryRecommendation.explanation).toContain("human review");
  });
});
