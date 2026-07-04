import { describe, expect, it } from "vitest";
import {
  buildApplicationWorkspace,
  buildApplicationWorkspaceRecommendations,
} from "@/lib/application-workspace";
import {
  buildBragSheet,
  buildPortfolioPacket,
  buildRecommendationLetter,
  buildResumeProfile,
  scoreResumeReadiness,
} from "@/lib/opportunity-toolkit";
import {
  buildPortfolioShare,
  canViewPortfolioShare,
} from "@/lib/portfolio-sharing";
import {
  buildRecommenderRequest,
  updateRecommenderRequestStatus,
} from "@/lib/recommenders";
import {
  buildBeta33ApplicationJourney,
  getBeta33CompletionStatus,
} from "@/lib/beta33-completion";

describe("Beta 3.3 End-to-End Application Toolkit Journey", () => {
  it("models complete scholar application journey", () => {
    const workspace = buildApplicationWorkspace({
      scholarId: "scholar-1",
      opportunityName: "Health Careers Internship",
      opportunityType: "internship",
      requirements: [
        { id: "resume", label: "Resume", required: true, completed: true },
        { id: "brag", label: "Brag Sheet", required: true, completed: true },
        { id: "letter", label: "Recommendation Letter", required: true, completed: true },
      ],
    });

    const resume = buildResumeProfile({
      name: "Maya Johnson",
      education: ["Oakland High School"],
      leadership: ["Team captain"],
      athletics: ["Varsity basketball"],
      skills: ["Communication"],
    });

    const bragSheet = buildBragSheet({
      scholarName: "Maya Johnson",
      goals: ["Attend college"],
      proudMoments: ["Led team"],
      challengesOvercome: ["Balanced school and athletics"],
      leadership: ["Team captain"],
      evidence: ["Verified transcript"],
    });

    const request = buildRecommenderRequest({
      scholarId: "scholar-1",
      scholarName: "Maya Johnson",
      recommenderName: "Coach Taylor",
      recommenderEmail: "coach@example.com",
      recommenderRole: "coach",
      opportunityName: "Health Careers Internship",
      evidence: ["Verified transcript"],
    });

    const submitted = updateRecommenderRequestStatus(request, "submitted");

    const letter = buildRecommendationLetter({
      scholarName: "Maya Johnson",
      recommenderName: "Coach Taylor",
      recommenderRole: "coach",
      opportunityName: "Health Careers Internship",
      strengths: ["discipline", "leadership"],
      evidence: ["Verified transcript"],
    });

    const packet = buildPortfolioPacket({
      scholarName: "Maya Johnson",
      resume,
      bragSheet,
      recommendationLetter: letter,
      targetUse: "internship",
    });

    const share = buildPortfolioShare({
      scholarId: "scholar-1",
      scholarName: "Maya Johnson",
      targetUse: "internship",
      packet,
    });

    expect(workspace.status).toBe("ready");
    expect(scoreResumeReadiness(resume).score).toBeGreaterThan(0);
    expect(submitted.status).toBe("submitted");
    expect(packet.exportStatus).toBe("ready_for_pdf_foundation");
    expect(canViewPortfolioShare(share)).toBe(true);
    expect(buildApplicationWorkspaceRecommendations(workspace)).toContain("Review packet one final time");
  });

  it("marks Beta 3.3 complete", () => {
    expect(getBeta33CompletionStatus().percent).toBe(100);
    expect(buildBeta33ApplicationJourney().length).toBeGreaterThan(0);
  });
});
