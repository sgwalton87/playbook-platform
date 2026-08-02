import { describe, expect, it } from "vitest";
import { buildTrustSummary } from "@/lib/launch-readiness/trustSummary";

describe("buildTrustSummary", () => {
  it("is deterministic, bounded, and explains every score component", () => {
    const summary = buildTrustSummary({ evidenceCount: 5, verifiedCount: 4, pendingVerificationCount: 0, recentActivityCount: 6 });
    expect(summary.score).toBe(92);
    expect(summary.level).toBe("opportunity_ready");
    expect(summary.signals.reduce((total, signal) => total + signal.points, 0)).toBe(82);
    expect(summary.nextSteps.some((step) => step.href === "/opportunities")).toBe(true);
  });

  it("does not imply readiness without persisted evidence", () => {
    const summary = buildTrustSummary({ evidenceCount: 0, verifiedCount: 0, pendingVerificationCount: 0, recentActivityCount: 0 });
    expect(summary.score).toBe(0);
    expect(summary.level).toBe("building");
    expect(summary.nextSteps[0]?.id).toBe("add-evidence");
  });
});
