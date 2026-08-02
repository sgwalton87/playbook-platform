import { describe, expect, it } from "vitest";
import { calculatePortfolioCompletion } from "@/lib/portfolio/services/completion";

describe("portfolio readiness", () => {
  it("reports explicit gaps instead of treating missing evidence as zero potential", () => {
    const result = calculatePortfolioCompletion({ identity: { fullName: "Maya", bio: "Scholar" }, academics: {}, career: {}, evidenceCount: 0, verifiedEvidenceCount: 0 });
    expect(result.ready).toBe(false);
    expect(result.gaps.map((gap) => gap.id)).toContain("verified-evidence");
  });
});
