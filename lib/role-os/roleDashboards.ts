import type { PlaybookRoleOS } from "./roleOS";

type RoleDashboardDefinition = {
  title: string;
  question: string;
};

export function getRoleDashboard(role: PlaybookRoleOS): RoleDashboardDefinition {
  const dashboards: Record<PlaybookRoleOS, RoleDashboardDefinition> = {
    learner: { title: "Scholar OS", question: "What profile data is available for this scholar?" },
    family: { title: "Family OS", question: "How can I support my scholar with the profile data available?" },
    educator: { title: "Educator OS", question: "Who needs support based on connected profile data?" },
    district: { title: "District OS", question: "Which system signals are available from live data?" },
    university: { title: "University OS", question: "Which verified profile signals are available?" },
    employer: { title: "Employer OS", question: "Which workforce profile signals are available?" },
    mentor: { title: "Mentor OS", question: "Who am I helping with the profile data available?" },
  };

  return dashboards[role];
}
