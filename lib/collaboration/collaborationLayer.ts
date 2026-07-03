export type SupportRole =
  | "scholar"
  | "family"
  | "educator"
  | "mentor"
  | "district"
  | "university"
  | "employer";

export function getSharedOpportunityPlan() {
  return {
    scholar: "Maya Johnson",
    opportunity: "Kaiser Permanente Health Careers Summer Internship",
    matchScore: 87,
    deadline: "April 15",
    sharedGoal: "Submit a strong internship application with verified evidence.",
    roleActions: [
      {
        role: "scholar",
        title: "Apply and reflect",
        action: "Draft application responses and attach Biology Lab Reflection.",
      },
      {
        role: "family",
        title: "Support documents",
        action: "Help gather transportation, consent, and family schedule information.",
      },
      {
        role: "educator",
        title: "Verify readiness",
        action: "Verify Biology evidence and recommend one academic strength.",
      },
      {
        role: "mentor",
        title: "Practice interview",
        action: "Schedule a mock interview and review Maya's story.",
      },
      {
        role: "district",
        title: "Track access",
        action: "Monitor internship access across schools and opportunity gaps.",
      },
      {
        role: "university",
        title: "Pathway signal",
        action: "Flag Maya for future health science outreach.",
      },
      {
        role: "employer",
        title: "Review candidate",
        action: "Review verified evidence and invite qualified applicants.",
      },
    ],
  };
}

export function getRoleAction(role: SupportRole) {
  return getSharedOpportunityPlan().roleActions.find(item => item.role === role);
}
