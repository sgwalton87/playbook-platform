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
    metrics: [{ label: "Verified evidence", value: "Not connected" }, { label: "Open actions", value: "Not connected" }, { label: "Opportunity matches", value: "Not connected" }, { label: "Supporters", value: "Not connected" }],
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
    metrics: [{ label: "Connected scholars", value: "Not connected" }, { label: "Shared actions", value: "Not connected" }, { label: "Unread messages", value: "Not connected" }, { label: "Upcoming deadlines", value: "Not connected" }],
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
    metrics: [{ label: "Authorized students", value: "Not connected" }, { label: "Evidence requests", value: "Not connected" }, { label: "Readiness alerts", value: "Not connected" }, { label: "Interventions", value: "Not connected" }],
    cards: [
      { label: "Academic readiness", title: "Review evidence, not assumptions", body: "Student readiness appears after an authorized scholar or cohort relationship is established.", href: "/academic-readiness", action: "Open readiness" },
      { label: "Verification", title: "Respond to evidence requests", body: "Verify only records assigned to your authenticated educator authority.", href: "/record", action: "Open records" },
      sharedCards.messages,
      sharedCards.profile,
    ],
  },
  counselor: {
    title: "Counselor OS",
    description: "Coordinate academic plans, applications, interventions, and trusted support within verified school authority.",
    metrics: [{ label: "Authorized scholars", value: "Not connected" }, { label: "Plan reviews", value: "Not connected" }, { label: "Application actions", value: "Not connected" }, { label: "Support referrals", value: "Not connected" }],
    cards: [
      { label: "Academic planning", title: "Review a scholar’s verified path", body: "Readiness evidence remains unavailable until the scholar or institution grants the required authority.", href: "/academic-readiness", action: "Open readiness" },
      { label: "Applications", title: "Coordinate accountable next steps", body: "Track application work only for scholars connected to your verified counseling scope.", href: "/application-workspaces", action: "Open applications" },
      sharedCards.messages,
      sharedCards.profile,
    ],
  },
  coach: {
    title: "Coach OS",
    description: "Connect roster authority, academic readiness, recruiting support, and athlete advocacy without weakening scholar ownership.",
    metrics: [{ label: "Authorized athletes", value: "Not connected" }, { label: "Roster actions", value: "Not connected" }, { label: "Readiness alerts", value: "Not connected" }, { label: "Recruiting requests", value: "Not connected" }],
    cards: [
      { label: "Roster authority", title: "Connect athletes through consent", body: "No athlete profile or academic evidence appears before a governed roster relationship is active.", href: "/invitations", action: "Review invitations" },
      { label: "Athlete advocacy", title: "Support the whole scholar-athlete", body: "Coordinate academics and recruiting only within the permissions granted by the athlete.", href: "/academic-readiness", action: "Open readiness" },
      sharedCards.messages,
      sharedCards.profile,
    ],
  },
  district: {
    title: "District OS",
    description: "Govern readiness and opportunity access with institution-scoped evidence and privacy controls.",
    metrics: [{ label: "Authorized schools", value: "Not connected" }, { label: "Cohorts", value: "Not connected" }, { label: "Readiness signals", value: "Not connected" }, { label: "Equity alerts", value: "Not connected" }],
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
    metrics: [{ label: "Authorized scholars", value: "Not connected" }, { label: "Open pathways", value: "Not connected" }, { label: "Invitations", value: "Not connected" }, { label: "Responses", value: "Not connected" }],
    cards: [
      { label: "Discovery authority", title: "Request access to verified talent", body: "Scholar records remain private until the scholar and platform authority permit access.", href: "/opportunities", action: "Open opportunities" },
      { label: "Institution profile", title: "Define the pathway you represent", body: "Complete institution, program, eligibility, and outreach context before discovery.", href: "/profile", action: "Review profile" },
      sharedCards.messages,
      { label: "Invitations", title: "Build consent-based outreach", body: "Invite scholars into a real pathway without manufacturing match scores.", href: "/invitations", action: "Open invitations" },
    ],
  },
  recruiter: {
    title: "Recruiting OS",
    description: "Discover and communicate with verified scholar-athletes through consented institutional recruiting authority.",
    metrics: [{ label: "Authorized athletes", value: "Not connected" }, { label: "Active programs", value: "Not connected" }, { label: "Recruiting requests", value: "Not connected" }, { label: "Responses", value: "Not connected" }],
    cards: [
      { label: "Recruiting authority", title: "Define the program you represent", body: "Institution, sport, division, eligibility, and communication boundaries must be verified before discovery.", href: "/profile", action: "Review recruiting profile" },
      { label: "Verified talent", title: "Request access—never assume it", body: "Scholar-athlete evidence remains private until a governed recruiting connection is approved.", href: "/opportunities", action: "Open recruiting pathways" },
      sharedCards.messages,
      { label: "Invitations", title: "Create consent-based outreach", body: "Invite athletes into a real program pathway with transparent requirements and no invented match score.", href: "/invitations", action: "Open invitations" },
    ],
  },
  admissions: {
    title: "Admissions OS",
    description: "Connect verified scholar readiness to transparent institutional admissions and enrollment pathways.",
    metrics: [{ label: "Authorized scholars", value: "Not connected" }, { label: "Open pathways", value: "Not connected" }, { label: "Applications", value: "Not connected" }, { label: "Enrollment actions", value: "Not connected" }],
    cards: [
      { label: "Institution authority", title: "Publish transparent criteria", body: "Programs, requirements, deadlines, cost, and support must be connected before outreach begins.", href: "/profile", action: "Review institution profile" },
      { label: "Applications", title: "Review permissioned evidence", body: "Scholar records appear only through a real application or explicit access grant.", href: "/application-workspaces", action: "Open applications" },
      sharedCards.messages,
      { label: "Opportunity", title: "Create an enrollment pathway", body: "Connect eligible scholars to honest, explainable institutional opportunities.", href: "/opportunities", action: "Open opportunities" },
    ],
  },
  employer: {
    title: "Employer OS",
    description: "Publish responsible opportunities and review consented, verified evidence—not invented readiness scores.",
    metrics: [{ label: "Published opportunities", value: "Not connected" }, { label: "Authorized candidates", value: "Not connected" }, { label: "Applications", value: "Not connected" }, { label: "Open actions", value: "Not connected" }],
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
    metrics: [{ label: "Connected scholars", value: "Not connected" }, { label: "Check-ins", value: "Not connected" }, { label: "Shared actions", value: "Not connected" }, { label: "Messages", value: "Not connected" }],
    cards: [
      { label: "Mentorship authority", title: "Connect through a verified invitation", body: "No scholar information is displayed until the mentoring relationship is approved.", href: "/mentor-connect", action: "Connect responsibly" },
      { label: "Support network", title: "Coordinate the scholar’s next step", body: "Use shared actions after the scholar grants the appropriate support permissions.", href: "/support-network", action: "Open support network" },
      sharedCards.messages,
      sharedCards.profile,
    ],
  },
  "transition-youth": {
    title: "Transition-Aged Youth OS",
    description: "Build a supported plan across education, employment, housing, life skills, trusted relationships, and independent adulthood.",
    metrics: [{ label: "Plan milestones", value: "Not connected" }, { label: "Supporters", value: "Not connected" }, { label: "Open actions", value: "Not connected" }, { label: "Opportunity matches", value: "Not connected" }],
    cards: [
      { label: "My plan", title: "Build the next stable step", body: "Connect goals and evidence across school, work, and independent living without fabricated progress.", href: "/journey", action: "Open my journey" },
      { label: "Trusted support", title: "Choose who can help", body: "Supporters see only the information and actions you explicitly authorize.", href: "/support-network", action: "Open support network" },
      sharedCards.messages,
      sharedCards.profile,
    ],
  },
  community: {
    title: "Community Partner OS",
    description: "Connect verified programs, referrals, events, and resources to scholars through accountable organization authority.",
    metrics: [{ label: "Verified programs", value: "Not connected" }, { label: "Authorized referrals", value: "Not connected" }, { label: "Community events", value: "Not connected" }, { label: "Open actions", value: "Not connected" }],
    cards: [
      { label: "Organization authority", title: "Verify the partner you represent", body: "Programs and referrals remain unavailable until organization authority and safeguarding expectations are verified.", href: "/profile", action: "Review partner profile" },
      { label: "Programs", title: "Connect real community support", body: "Publish eligibility, capacity, location, dates, and responsible referral boundaries.", href: "/opportunities", action: "Open opportunities" },
      { label: "Community", title: "Coordinate governed events", body: "Create and manage events only after partner authority is active.", href: "/community-events", action: "Open events" },
      sharedCards.messages,
    ],
  },
};

export function getRoleDashboard(role: PlaybookRoleOS) {
  return dashboards[role];
}
