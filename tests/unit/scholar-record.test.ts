import { describe, expect, it } from "vitest";
import { buildScholarRecord } from "@/lib/scholar";

describe("buildScholarRecord", () => {
  it("builds a Scholar Record from profile and achievements", () => {
    const record = buildScholarRecord({
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
    expect(record.community.activities[0].name).toBe("Activity");
    expect(record.readiness.opportunityReadiness).toBeGreaterThan(0);
  });

  it("canonicalizes community experiences for AI-ready querying", () => {
    const record = buildScholarRecord({
      activities: [
        { id: "lead-1", activity_type: "Leadership", activity_name: "Student Council", role_title: "President" },
        { id: "vol-1", activity_type: "Volunteer Work", activity_name: "Food Bank", total_hours: 12 },
        { id: "intern-1", activity_type: "Internship", activity_name: "Clinic Intern", organization: "Health Center" },
      ],
    });

    expect(record.community.leadershipPositions[0].roleTitle).toBe("President");
    expect(record.community.volunteerWork[0].volunteerHours).toBe(12);
    expect(record.community.internships[0].organization).toBe("Health Center");
    expect(record.achievements.activities).toBe(record.community.activities);
  });

  it("handles missing optional data without crashing", () => {
    const record = buildScholarRecord({
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

it("canonicalizes dashboard widgets from ScholarRecord inputs", () => {
  const record = buildScholarRecord({
    profile: {
      id: "scholar-dashboard",
      sport: "Basketball",
      coin_balance: 125,
      xp: 450,
      weighted_gpa: "4.1",
      intended_major: "Biology",
    },
    certificates: [{ id: "cert-1", title: "CPR" }],
    badges: [{ id: "badge-1" }],
    activities: [{ id: "lead-1", activity_type: "Leadership", activity_name: "ASB", total_hours: 10 }],
    agProgress: [
      { subject: "A", years_completed: 2, years_required: 2 },
      { subject: "B", years_completed: 3, years_required: 4, in_progress: true },
    ],
    notifications: [{ id: "notice-1", label: "Transcript updated" }],
    upcomingDeadlines: [{ id: "deadline-1", label: "FAFSA review" }],
  });

  expect(record.academics.weightedGpa).toBe("4.1");
  expect(record.academics.intendedMajor).toBe("Biology");
  expect(record.athletics.sport).toBe("Basketball");
  expect(record.economy.coins).toBe(125);
  expect(record.economy.xp).toBe(450);
  expect(record.readiness.transcriptCompletion).toBe(83);
  expect(record.activity.recent.map((item) => item.label)).toContain("ASB");
  expect(record.activity.notifications[0].label).toBe("Transcript updated");
  expect(record.activity.upcomingDeadlines[0].label).toBe("FAFSA review");
});
