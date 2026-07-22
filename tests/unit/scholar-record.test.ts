import { describe, expect, it } from "vitest";
import { buildPlaybookRecord } from "@/lib/scholar";

describe("buildPlaybookRecord", () => {
  it("builds a Scholar Record from profile and achievements", () => {
    const record = buildPlaybookRecord({
      profile: {
        id: "scholar-1",
        username: "testscholar",
        role: "scholar",
        first_name: "Test",
        last_name: "Scholar",
        avatar_url: "avatar.png",
        school: "Playbook High",
        grade: "11",
        gpa: "3.8",
        dream_school: "UC Berkeley",
        ideal_profession: "Investment Advisor",
        desired_salary_range: "$100k+",
        bio: "Future leader",
      },
      certificates: [{ id: "cert-1" }],
      badges: [{ id: "badge-1" }],
      activities: [{ id: "activity-1", hours: 5 }],
      posts: [{ id: "post-1" }],
    });

    expect(record.id).toBe("scholar-1");
    expect(record.identity.fullName).toBe("Test Scholar");
    expect(record.academics.dreamSchool).toBe("UC Berkeley");
    expect(record.achievements.total).toBe(4);
    expect(record.service.volunteerHours).toBe(5);
    expect(record.readiness.opportunityReadiness).toBeGreaterThan(0);
  });

  it("handles missing optional data without crashing", () => {
    const record = buildPlaybookRecord({
      profile: {
        id: "scholar-2",
        username: "incomplete",
      },
    });

    expect(record.id).toBe("scholar-2");
    expect(record.achievements.total).toBe(0);
    expect(record.readiness.portfolioCompletion).toBeGreaterThanOrEqual(0);
  });
});
