import { describe, expect, it, vi } from "vitest";
import {
  matchOpportunitiesFromSignals,
  buildOpportunityGraphFromAcademicDNA,
} from "@/lib/opportunity-graph";

vi.mock("@/lib/supabaseClient", () => {
  const chain = {
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };

  return {
    supabase: {
      from: vi.fn(() => chain),
    },
  };
});

describe("Opportunity Graph", () => {
  it("matches opportunities from skills and pathways", () => {
    const report = matchOpportunitiesFromSignals({
      skills: ["scientific thinking", "research"],
      majors: ["Biology", "Public Health"],
      careers: ["Doctor"],
    });

    expect(report.matches.length).toBeGreaterThan(0);
    expect(report.score).toBeGreaterThan(0);
  });

  it("builds opportunities from Academic DNA", async () => {
    const report = await buildOpportunityGraphFromAcademicDNA({
      courses: [
        { name: "Biology", subject: "science", credits: 10, completed: true },
        { name: "Algebra II", subject: "math", credits: 10, completed: true },
      ],
    });

    expect(report.matches.length).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });
});
