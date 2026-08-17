import { describe, expect, it } from "vitest";
import {
  buildRecommendationApproval,
  canViewPortfolioShare,
} from "@/lib/portfolio-sharing";

describe("Portfolio Sharing + Recommender Approval", () => {
  it("checks governed portfolio lifecycle visibility", () => {
    expect(canViewPortfolioShare({ status: "active" })).toBe(true);
    expect(canViewPortfolioShare({ status: "revoked" })).toBe(false);
    expect(canViewPortfolioShare({ status: "draft" })).toBe(false);
  });

  it("builds recommender approval", () => {
    const approval = buildRecommendationApproval({
      requestId: "r1",
      recommenderName: "Coach",
      letterText: "Great scholar.",
      status: "approved",
    });

    expect(approval.status).toBe("approved");
  });
});
