import { describe, expect, it } from "vitest";
import {
  buildApplicationWorkspace,
  buildApplicationWorkspaceRecommendations,
  getMissingApplicationRequirements,
} from "@/lib/application-workspace";

describe("Application Workspace", () => {
  it("builds application workspace readiness", () => {
    const workspace = buildApplicationWorkspace({
      scholarId: "s1",
      opportunityName: "Scholarship",
      opportunityType: "scholarship",
      requirements: [
        { id: "resume", label: "Resume", required: true, completed: true },
        { id: "letter", label: "Recommendation Letter", required: true, completed: false },
      ],
    });

    expect(workspace.readiness).toBe(50);
    expect(workspace.status).toBe("building");
  });

  it("finds missing requirements", () => {
    const workspace = buildApplicationWorkspace({
      scholarId: "s1",
      opportunityName: "Internship",
      opportunityType: "internship",
      requirements: [
        { id: "essay", label: "Essay", required: true, completed: false },
      ],
    });

    expect(getMissingApplicationRequirements(workspace)[0].label).toBe("Essay");
  });

  it("builds recommendations", () => {
    const workspace = buildApplicationWorkspace({
      scholarId: "s1",
      opportunityName: "Job",
      opportunityType: "job",
      requirements: [
        { id: "resume", label: "Resume", required: true, completed: false },
      ],
    });

    expect(buildApplicationWorkspaceRecommendations(workspace)[0]).toContain("Resume");
  });
});
