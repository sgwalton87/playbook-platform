import { describe, expect, it } from "vitest";
import {
  buildPortfolioShare,
  buildRecommendationApproval,
  canViewPortfolioShare,
} from "@/lib/portfolio-sharing";

describe("Portfolio Sharing + Recommender Approval", () => {
  it("builds portfolio share", () => {
    const share = buildPortfolioShare({
      scholarId: "s1",
      scholarName: "Maya",
      targetUse: "scholarship",
      packet: {},
    });

    expect(share.status).toBe("active");
    expect(share.shareUrl).toContain("/portfolio/");
  });

  it("checks portfolio access", () => {
    expect(canViewPortfolioShare({ status: "active" })).toBe(true);
    expect(canViewPortfolioShare({ status: "revoked" })).toBe(false);
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
