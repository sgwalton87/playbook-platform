import { describe, expect, it } from "vitest";
import { buildEvidenceTraceabilityFeed, buildNotificationPreferenceSummary, buildScholarEvidenceSummary } from "./scholar-experience";

describe("scholar experience helpers", () => {
  it("summarizes evidence into counts and latest updates", () => {
    const summary = buildScholarEvidenceSummary({
      achievements: [
        { title: "Biology lab", category: "science" },
        { title: "Leadership award", category: "service" },
      ],
      evidence: [{ title: "Lab reflection" }, { title: "Recommendation letter" }],
      timelineEvents: [{ title: "Achievement captured", verified: false }, { title: "Recommendation shared", verified: true }],
    });

    expect(summary.totalItems).toBe(4);
    expect(summary.verifiedItems).toBe(1);
    expect(summary.latest[0].title).toBe("Biology lab");
    expect(summary.latest[0].status).toBe("pending");
  });

  it("builds notification preference cards from defaults and overrides", () => {
    const summary = buildNotificationPreferenceSummary({
      message: "daily_digest",
      recommendation: "muted",
    });

    expect(summary.some((item) => item.key === "message" && item.mode === "daily_digest")).toBe(true);
    expect(summary.some((item) => item.key === "recommendation" && item.mode === "muted")).toBe(true);
  });

  it("builds an evidence traceability feed with source and status context", () => {
    const feed = buildEvidenceTraceabilityFeed({
      items: [
        { title: "Biology lab reflection", status: "ready", source: "teacher" },
        { title: "Recommendation letter", status: "pending", source: "mentor" },
      ],
    });

    expect(feed.totalItems).toBe(2);
    expect(feed.readyItems).toBe(1);
    expect(feed.latest[0].title).toBe("Biology lab reflection");
    expect(feed.latest[0].source).toBe("teacher");
  });
});
