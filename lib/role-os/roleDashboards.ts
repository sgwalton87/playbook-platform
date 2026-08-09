import type { PlaybookRoleOS } from "./roleOS";

type RoleDashboardDefinition = {
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
  cards: Array<{ label: string; title: string; body: string; href: string; action: string }>;
};

const sharedCards = {
  messages: { label: "Communication", title: "Coordinate the next move", body: "Use governed messages once an authorized relationship is connected.", href: "/messages", action: "Open messages" },
  profile: { label: "Identity", title: "Complete your operating profile", body: "Keep your role, organization, interests, and contact context current.", href: "/profile", action: "Review profile" },
} as const;

const dashboards: Record<PlaybookRoleOS, RoleDashboardDefinition> = {
  learner: {
    title: "Scholar OS",
    description: "Build a verified record, understand the next action, and bring trusted support into the journey.",
    metrics: [{ label: "Verified evidence", value: "0 connected" }, { label: "Open actions", value: "0 connected" }, { label: "Opportunity matches", value: "0 connected" }, { label: "Supporters", value: "0 connected" }],
    cards: [
      { label: "Scholar Record", title: "Build evidence that travels with you", body: "Connect academics, achievements, goals, and verified experience.", href: "/record", action: "Open my record" },
      { label: "Opportunity", title: "Find the next reachable pathway", body: "Explore opportunities without treating unverified matches as recommendations.", href: "/opportunities", action: "Explore opportunities" },
      sharedCards.messages,
      sharedCards.profile,
    ],
  },
  family: {
    title: "Family OS",
    description: "Support a scholar through consent-based relationships, clear next steps, and shared deadlines.",
    metrics: [{ label: "Connected scholars", value: "0 authorized" }, { label: "Shared actions", value: "0 open" }, { label: "Unread messages", value: "0 connected" }, { label: "Upcoming deadlines", value: "0 connected" }],
    cards: [
      { label: "Relationship authority", title: "Connect with scholar consent", body: "A scholar invite or approved relationship is required before progress becomes visible.", href: "/invitations", action: "Review invitations" },
      { label: "Support network", title: "Organize trusted support", body: "Coordinate only the information and actions the scholar has authorized.", href: "/support-network", action: "Open support network" },
      sharedCards.messages,
      sharedCards.profile,
    ],
  },
  educator: {
    title: "Educator OS",
    description: "Help students act on evidence and readiness signals within verified institutional authority.",
    metrics: [{ label: "Authorized students", value: "0 connected" }, { label: "Evidence requests", value: "0 open" }, { label: "Readiness alerts", value: "0 connected" }, { label: "Interventions", value: "0 open" }],
    cards: [
      { label: "Academic readiness", title: "Review evidence, not assumptions", body: "Student readiness appears after an authorized scholar or cohort relationship is established.", href: "/academic-readiness", action: "Open readiness" },
      { label: "Verification", title: "Respond to evidence requests", body: "Verify only records assigned to your authenticated educator authority.", href: "/record", action: "Open records" },
      sharedCards.messages,
      sharedCards.profile,
    ],
  },
  district: {
    title: "District OS",
    description: "Govern readiness and opportunity access with institution-scoped evidence and privacy controls.",
    metrics: [{ label: "Authorized schools", value: "0 connected" }, { label: "Cohorts", value: "0 connected" }, { label: "Readiness signals", value: "0 connected" }, { label: "Equity alerts", value: "0 connected" }],
    cards: [
      { label: "Institution authority", title: "Connect verified district scope", body: "School and cohort data remain hidden until institutional authority is verified.", href: "/profile", action: "Review district profile" },
      { label: "Governance", title: "Review permissions before metrics", body: "District analysis must inherit consent, privacy, and minimum-necessary access.", href: "/permissions", action: "Review permissions" },
      sharedCards.messages,
      { label: "Workflow", title: "Coordinate accountable interventions", body: "Create governed next actions after real readiness evidence is available.", href: "/workflows", action: "Open workflows" },
    ],
  },
  university: {
    title: "University OS",
    description: "Connect verified scholars and scholar-athletes to institutional pathways without exposing private records by default.",
    metrics: [{ label: "Authorized scholars", value: "0 connected" }, { label: "Open pathways", value: "0 connected" }, { label: "Invitations", value: "0 sent" }, { label: "Responses", value: "0 received" }],
    cards: [
      { label: "Discovery authority", title: "Request access to verified talent", body: "Scholar records remain private until the scholar and platform authority permit access.", href: "/opportunities", action: "Open opportunities" },
      { label: "Institution profile", title: "Define the pathway you represent", body: "Complete institution, program, eligibility, and outreach context before discovery.", href: "/profile", action: "Review profile" },
      sharedCards.messages,
      { label: "Invitations", title: "Build consent-based outreach", body: "Invite scholars into a real pathway without manufacturing match scores.", href: "/invitations", action: "Open invitations" },
    ],
  },
  employer: {
    title: "Employer OS",
    description: "Publish responsible opportunities and review consented, verified evidence—not invented readiness scores.",
    metrics: [{ label: "Published opportunities", value: "0 connected" }, { label: "Authorized candidates", value: "0 connected" }, { label: "Applications", value: "0 connected" }, { label: "Open actions", value: "0 connected" }],
    cards: [
      { label: "Opportunity", title: "Create a real pathway", body: "Define requirements, support, compensation, deadlines, and responsible eligibility criteria.", href: "/opportunities", action: "Open opportunities" },
      { label: "Applications", title: "Review permissioned candidates", body: "Candidate evidence appears only after a real application and accepted authority.", href: "/application-workspaces", action: "Open applications" },
      sharedCards.messages,
      sharedCards.profile,
    ],
  },
  mentor: {
    title: "Mentor OS",
    description: "Turn an approved mentoring relationship into clear check-ins, encouragement, and accountable next actions.",
    metrics: [{ label: "Connected scholars", value: "0 authorized" }, { label: "Check-ins", value: "0 scheduled" }, { label: "Shared actions", value: "0 open" }, { label: "Messages", value: "0 connected" }],
    cards: [
      { label: "Mentorship authority", title: "Connect through a verified invitation", body: "No scholar information is displayed until the mentoring relationship is approved.", href: "/mentor-connect", action: "Connect responsibly" },
      { label: "Support network", title: "Coordinate the scholar’s next step", body: "Use shared actions after the scholar grants the appropriate support permissions.", href: "/support-network", action: "Open support network" },
      sharedCards.messages,
      sharedCards.profile,
    ],
  },
};

export function getRoleDashboard(role: PlaybookRoleOS) {
  return dashboards[role];
}
