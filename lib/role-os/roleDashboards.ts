import type { PlaybookRole } from "@/lib/roles/registry";

export type RoleOSModule = {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  action: string;
};

export type RoleDashboardDefinition = {
  title: string;
  headline: string;
  subtitle: string;
  accent: string;
  modules: RoleOSModule[];
};

export const SHARED_ROLE_OS_MODULES: readonly RoleOSModule[] = [
  { eyebrow: "Messages", title: "Coordinate with the right people", body: "Use authenticated relationship threads for questions, encouragement, decisions, and next actions.", href: "/messages", action: "Open Messages" },
  { eyebrow: "Support Network", title: "Work through trusted relationships", body: "See only the learners and collaborators connected through accepted, permission-aware relationships.", href: "/support-network", action: "Open network" },
  { eyebrow: "Opportunities", title: "Connect people to meaningful pathways", body: "Discover or create appropriate opportunities while respecting role permissions and learner ownership.", href: "/opportunities", action: "View opportunities" },
  { eyebrow: "Profile", title: "Keep your professional identity current", body: "Your verified profile, role, organization, and preferences shape access throughout Playbook.", href: "/profile", action: "Review profile" },
];

const DEFINITIONS: Partial<Record<PlaybookRole, RoleDashboardDefinition>> = {
  family: {
    title: "Family OS",
    headline: "Support their next move without taking over.",
    subtitle: "Permissioned progress, deadlines, messages, and practical family actions connected to the learner who invited you.",
    accent: "Family Intelligence",
    modules: [
      ...SHARED_ROLE_OS_MODULES,
      { eyebrow: "Progress", title: "Understand what needs attention", body: "Review the progress and deadlines your learner has chosen to share.", href: "/academic-readiness", action: "Review progress" },
      { eyebrow: "Family Actions", title: "Turn support into follow-through", body: "Coordinate documents, transportation, schedules, celebrations, and requested help.", href: "/support-network", action: "Review actions" },
    ],
  },
  mentor: {
    title: "Mentor OS",
    headline: "Turn encouragement into focused action.",
    subtitle: "Goals, check-ins, messages, opportunities, and permissioned progress for every learner who has invited your support.",
    accent: "Mentor Intelligence",
    modules: [
      ...SHARED_ROLE_OS_MODULES,
      { eyebrow: "Check-ins", title: "Make each conversation count", body: "Prepare around the learner’s current goals, blockers, wins, and next decision.", href: "/messages", action: "Start a check-in" },
      { eyebrow: "Guidance", title: "Coach the next achievable step", body: "Connect confidence, accountability, preparation, and opportunity without taking ownership away.", href: "/compass", action: "Review next steps" },
    ],
  },
  educator: {
    title: "Educator OS",
    headline: "See learning signals. Respond while it matters.",
    subtitle: "Permissioned student readiness, evidence verification, interventions, messages, and opportunity connections.",
    accent: "Educator Intelligence",
    modules: [
      ...SHARED_ROLE_OS_MODULES,
      { eyebrow: "Academic Readiness", title: "Find gaps before they become barriers", body: "Review connected transcript and readiness signals for learners in your approved scope.", href: "/academic-readiness", action: "Review readiness" },
      { eyebrow: "Evidence", title: "Verify learning and growth", body: "Help learners turn authentic work into trusted evidence in their canonical record.", href: "/record", action: "Review evidence" },
    ],
  },
  counselor: {
    title: "Counselor OS",
    headline: "Coordinate the milestones that open doors.",
    subtitle: "Caseload readiness, graduation planning, applications, financial aid, interventions, and learner-centered communication.",
    accent: "Counselor Intelligence",
    modules: [
      ...SHARED_ROLE_OS_MODULES,
      { eyebrow: "Caseload", title: "Prioritize learners who need attention", body: "Organize readiness gaps, deadlines, approvals, and outreach across your permissioned caseload.", href: "/academic-readiness", action: "Review caseload" },
      { eyebrow: "College Access", title: "Coordinate application milestones", body: "Connect academic plans, financial aid preparation, recommendations, and pathway decisions.", href: "/opportunity-toolkit", action: "Open toolkit" },
    ],
  },
  coach: {
    title: "Coach OS",
    headline: "Develop the athlete. Protect the scholar.",
    subtitle: "Academic eligibility, athlete evidence, recruiting preparation, communication, and long-term development.",
    accent: "Coach Intelligence",
    modules: [
      ...SHARED_ROLE_OS_MODULES,
      { eyebrow: "Eligibility", title: "Keep academic pathways protected", body: "Review permissioned readiness signals and coordinate support before eligibility becomes urgent.", href: "/academic-readiness", action: "Check readiness" },
      { eyebrow: "Recruiting", title: "Help athletes present the complete story", body: "Support film, references, character, academics, outreach, and responsible recruiting preparation.", href: "/scholar-athlete-os", action: "Open athlete pathway" },
    ],
  },
  "college-coach": {
    title: "Recruiting OS",
    headline: "Discover verified talent responsibly.",
    subtitle: "Permissioned athlete records, program fit, compliant recruiting workflows, communication, and relationship history.",
    accent: "Recruiting Intelligence",
    modules: [
      ...SHARED_ROLE_OS_MODULES,
      { eyebrow: "Talent Discovery", title: "Evaluate the complete athlete", body: "Review shared academic, athletic, leadership, character, and pathway evidence.", href: "/opportunities", action: "Explore talent" },
      { eyebrow: "Program Fit", title: "Match opportunity with real readiness", body: "Organize criteria, outreach, next steps, and transparent expectations.", href: "/messages", action: "Coordinate outreach" },
    ],
  },
  "college-admissions": {
    title: "Admissions OS",
    headline: "Connect verified learners to institutional pathways.",
    subtitle: "Permissioned readiness evidence, outreach, events, pathway fit, and responsible admissions engagement.",
    accent: "Admissions Intelligence",
    modules: [
      ...SHARED_ROLE_OS_MODULES,
      { eyebrow: "Verified Records", title: "See readiness beyond a single number", body: "Review learner-shared academics, evidence, activities, leadership, service, and goals.", href: "/record", action: "Review records" },
      { eyebrow: "Pathway Outreach", title: "Reach learners with relevant opportunities", body: "Coordinate programs, events, deadlines, and transparent next steps.", href: "/opportunities", action: "Build outreach" },
    ],
  },
  "brand-partner": {
    title: "Brand Partner OS",
    headline: "Power opportunity with responsibility.",
    subtitle: "Campaigns, rewards, education, internships, sponsorship pathways, safeguards, and measurable community value.",
    accent: "Partnership Intelligence",
    modules: [
      ...SHARED_ROLE_OS_MODULES,
      { eyebrow: "Campaigns", title: "Create opportunities with clear value", body: "Build rewards, learning, events, internships, and campaigns around transparent expectations.", href: "/opportunities", action: "Create opportunity" },
      { eyebrow: "Responsible Partnership", title: "Protect learners and athlete interests", body: "Keep age, consent, NIL, safety, and data-use expectations visible in every activation.", href: "/courses", action: "Review safeguards" },
    ],
  },
  employer: {
    title: "Employer OS",
    headline: "Turn verified growth into career opportunity.",
    subtitle: "Work-based learning, internships, skills evidence, candidate communication, safeguards, and talent pathways.",
    accent: "Workforce Intelligence",
    modules: [
      ...SHARED_ROLE_OS_MODULES,
      { eyebrow: "Opportunity Builder", title: "Create accessible work-based learning", body: "Publish internships, job shadows, projects, mentorship, and entry-level pathways.", href: "/opportunities", action: "Create opportunity" },
      { eyebrow: "Verified Talent", title: "Evaluate evidence with context", body: "Review only the learner-owned skills and records explicitly shared for an opportunity.", href: "/record", action: "Review candidates" },
    ],
  },
  district: {
    title: "District OS",
    headline: "Turn readiness signals into equitable action.",
    subtitle: "Implementation, governance, school-level readiness, opportunity access, safeguards, and measurable system outcomes.",
    accent: "District Intelligence",
    modules: [
      ...SHARED_ROLE_OS_MODULES,
      { eyebrow: "Implementation", title: "Coordinate schools with clarity", body: "Manage approved rollout, staff roles, learner safeguards, and implementation milestones.", href: "/studio/architecture", action: "Review implementation" },
      { eyebrow: "Equity Signals", title: "Find where access is breaking down", body: "Use aggregate readiness and opportunity signals without compromising learner ownership.", href: "/academic-readiness", action: "Review signals" },
    ],
  },
};

export function getRoleDashboard(role: PlaybookRole) {
  const definition = DEFINITIONS[role];
  if (!definition) throw new Error(`${role} uses the learner OS dashboard.`);
  return definition;
}
