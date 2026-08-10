import type { PlaybookRoleOS } from "@/lib/role-os";

export function buildRoleRecommendations(role: PlaybookRoleOS) {
  const shared = {
    scholar: "the authorized scholar",
    signal: "No verified Scholar Record signal is connected yet.",
  };

  const recommendations: Record<PlaybookRoleOS, string[]> = {
    learner: [
      "Connect verified academic and experience evidence",
      "Choose which supporters may view the next action",
      "Review explainable opportunities after evidence is available",
    ],
    family: [
      "Review consent and transportation needs",
      "Help gather family schedule information",
      "Celebrate progress after the scholar shares it",
    ],
    educator: [
      "Review assigned evidence verification requests",
      "Recommend one academic strength",
      "Escalate a verified readiness concern through the governed workflow",
    ],
    counselor: ["Review authorized academic plans", "Coordinate application deadlines", "Connect consented support referrals"],
    coach: ["Verify roster authority", "Coordinate academic support", "Request consent before recruiting advocacy"],
    mentor: [
      "Schedule a mock interview",
      "Review Scholar support story",
      "Practice career pathway questions",
    ],
    district: [
      "Track internship access by school",
      "Identify students without matched opportunities",
      "Prepare equity access briefing",
    ],
    university: [
      "Publish transparent institutional pathways",
      "Review verified readiness signals",
      "Invite an authorized scholar to a pathway event",
    ],
    recruiter: ["Verify program and recruiting authority", "Request access to consented athlete evidence", "Use governed recruiting communication"],
    admissions: ["Publish admissions criteria", "Review permissioned application evidence", "Connect enrollment support"],
    employer: [
      "Review verified evidence",
      "Invite qualified applicants",
      "Create next internship opportunity",
    ],
    "transition-youth": ["Connect a supported life plan", "Authorize trusted supporters", "Review education and employment actions"],
    community: ["Verify organization authority", "Publish accountable program capacity", "Coordinate governed referrals and events"],
  };

  return {
    role,
    ...shared,
    recommendations: recommendations[role] || recommendations.learner,
  };
}

export function buildRoleScenarios(role: PlaybookRoleOS) {
  const scenarios: Record<PlaybookRoleOS, string> = {
    learner: "What if Scholar verifies Biology evidence?",
    family: "What if the family completes support documents?",
    educator: "What if the counselor verifies readiness?",
    counselor: "What if an authorized academic plan reveals a preventable deadline risk?",
    coach: "What if a verified roster relationship connects an athlete to academic support?",
    mentor: "What if the mentor completes mock interview prep?",
    district: "What if every school gets equal internship access?",
    university: "What if the university invites verified scholars earlier?",
    recruiter: "What if an athlete grants access to verified recruiting evidence?",
    admissions: "What if transparent criteria connect a qualified scholar to enrollment support?",
    employer: "What if the employer reviews verified candidates first?",
    "transition-youth": "What if one authorized support action removes a barrier to the next milestone?",
    community: "What if a verified community program accepts a governed referral?",
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
