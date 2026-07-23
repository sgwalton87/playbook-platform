import type { PlaybookRoleOS } from "@/lib/role-os";

export function buildRoleRecommendations(role: PlaybookRoleOS) {
  const shared = {
    scholar: "the connected learner",
    signal: "Kaiser Permanente Health Careers Internship matched at 87%",
  };

  const recommendations = {
    learner: [
      "Start the application",
      "Attach Biology Lab Reflection",
      "Ask Oracle how to strengthen your application",
    ],
    family: [
      "Review consent and transportation needs",
      "Help gather family schedule information",
      "Celebrate the learner’s verified progress",
    ],
    educator: [
      "Verify Biology evidence",
      "Recommend one academic strength",
      "Flag any A-G readiness concern",
    ],
    mentor: [
      "Schedule a mock interview",
      "Review the learner’s story",
      "Practice career pathway questions",
    ],
    district: [
      "Track internship access by school",
      "Identify students without matched opportunities",
      "Prepare equity access briefing",
    ],
    university: [
      "Add the matched learner to the appropriate outreach list",
      "Review verified readiness signals",
      "Invite scholar to pathway event",
    ],
    employer: [
      "Review verified evidence",
      "Invite qualified applicants",
      "Create next internship opportunity",
    ],
  };

  return {
    role,
    ...shared,
    recommendations: recommendations[role] || recommendations.learner,
  };
}

export function buildRoleScenarios(role: PlaybookRoleOS) {
  const scenarios = {
    learner: "What if the learner verifies new academic evidence?",
    family: "What if the family completes support documents?",
    educator: "What if the counselor verifies readiness?",
    mentor: "What if the mentor completes mock interview prep?",
    district: "What if every school gets equal internship access?",
    university: "What if the university invites verified scholars earlier?",
    employer: "What if the employer reviews verified candidates first?",
  };

  return {
    role,
    scenario: scenarios[role] || scenarios.learner,
    impact: {
      trust: role === "learner" || role === "educator" ? 10 : 4,
      opportunity: role === "district" || role === "employer" ? 15 : 8,
      scholarship: role === "family" || role === "learner" ? 4200 : 2500,
    },
  };
}

export function explainRoleIntelligence(role: PlaybookRoleOS) {
  const rec = buildRoleRecommendations(role);
  const scenario = buildRoleScenarios(role);

  return `${rec.role} intelligence is focused on helping ${rec.scholar} act on: ${rec.signal}. Scenario: ${scenario.scenario}. Estimated impact: Trust +${scenario.impact.trust}, Opportunity +${scenario.impact.opportunity}, Scholarship +$${scenario.impact.scholarship.toLocaleString()}.`;
}
