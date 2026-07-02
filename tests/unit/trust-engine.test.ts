import { describe, expect, it } from "vitest";
import { buildTrustReport } from "@/lib/trust";

describe("Trust Engine", () => {
  it("calculates trust score from Scholar Record signals", () => {
    const report = buildTrustReport({
      achievements: {
        certificates: [{ id: "cert-1" }],
        badges: [{ id: "badge-1" }],
        activities: [{ id: "act-1", verified: true, reflection: "I learned leadership.", outcome: "Led a project." }],
        posts: [{ id: "post-1" }],
      },
    });

    expect(report.score).toBeGreaterThan(0);
    expect(report.level).toBeTruthy();
    expect(report.signals.length).toBeGreaterThan(0);
  });

  it("returns missing trust steps when record is empty", () => {
    const report = buildTrustReport({ achievements: {} });

    expect(report.score).toBe(0);
    expect(report.missing.length).toBeGreaterThan(0);
  });
});
