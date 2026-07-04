import { describe, expect, it } from "vitest";
import {
  buildRecommenderEmail,
  buildRecommenderRequest,
  updateRecommenderRequestStatus,
} from "@/lib/recommenders";
import {
  buildPortfolioPdfPayload,
  buildPrintablePortfolioHtml,
} from "@/lib/opportunity-toolkit";
import RecommenderWorkflowDashboard from "@/components/recommenders/RecommenderWorkflowDashboard";

describe("PDF Export + Recommender Workflow", () => {
  it("builds recommender request", () => {
    const request = buildRecommenderRequest({
      scholarId: "s1",
      scholarName: "Maya",
      recommenderName: "Coach",
      recommenderEmail: "coach@example.com",
      recommenderRole: "coach",
      opportunityName: "Scholarship",
      evidence: ["Leadership"],
    });

    expect(request.status).toBe("draft");
  });

  it("updates recommender request status", () => {
    const request = buildRecommenderRequest({
      scholarId: "s1",
      scholarName: "Maya",
      recommenderName: "Coach",
      recommenderEmail: "coach@example.com",
      recommenderRole: "coach",
      opportunityName: "Scholarship",
      evidence: [],
    });

    expect(updateRecommenderRequestStatus(request, "sent").status).toBe("sent");
  });

  it("builds recommender email", () => {
    const email = buildRecommenderEmail({
      recommenderName: "Coach",
      scholarName: "Maya",
      opportunityName: "Scholarship",
      requestUrl: "https://playbook.test/recommenders",
    });

    expect(email.subject).toContain("Maya");
  });

  it("builds PDF payload and printable HTML", () => {
    const payload = buildPortfolioPdfPayload({
      scholarName: "Maya",
      targetUse: "scholarship",
      resume: {},
      bragSheet: {},
      recommendationLetter: "Letter",
    });

    expect(payload.filename).toContain("Maya");
    expect(buildPrintablePortfolioHtml(payload)).toContain("Portfolio Packet");
  });

  it("component is defined", () => {
    expect(RecommenderWorkflowDashboard).toBeTruthy();
  });
});
