export type LearnerOSRole =
  | "scholar"
  | "scholar-athlete"
  | "transition-youth"
  | "athlete-abroad";

export type LearnerProfile = {
  full_name?: string | null;
  username?: string | null;
  school?: string | null;
  grade?: string | null;
  graduation_year?: string | null;
  dream_school?: string | null;
  ideal_profession?: string | null;
  onboarding_data?: Record<string, unknown> | null;
};

export type LearnerOSModule = {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  action: string;
};

type LearnerOSDefinition = {
  label: string;
  headline: string;
  subtitle: string;
  accent: string;
  modules: LearnerOSModule[];
};

export const SCHOLAR_BASELINE_MODULES: readonly LearnerOSModule[] = [
  { eyebrow: "Academic Readiness", title: "Know exactly where you stand", body: "Use transcript evidence and A–G progress to find gaps before they become barriers.", href: "/academic-readiness", action: "Review readiness" },
  { eyebrow: "Compass", title: "Turn goals into next actions", body: "Prioritize the deadlines, decisions, and support requests that move your plan forward.", href: "/compass", action: "Open Compass" },
  { eyebrow: "Opportunity", title: "Build application-ready evidence", body: "Connect achievements and goals to scholarships, internships, colleges, and programs.", href: "/opportunity-toolkit", action: "Explore opportunities" },
  { eyebrow: "My Record", title: "Own the complete story", body: "Keep your verified academics, activities, leadership, service, and growth in one record.", href: "/record", action: "Open my record" },
];

const DEFINITIONS: Record<LearnerOSRole, LearnerOSDefinition> = {
  scholar: {
    label: "Scholar OS",
    headline: "Turn your record into your next opportunity.",
    subtitle: "Academics, goals, evidence, applications, and trusted support—connected around the future you are building.",
    accent: "Academic Intelligence",
    modules: [...SCHOLAR_BASELINE_MODULES],
  },
  "scholar-athlete": {
    label: "Scholar-Athlete OS",
    headline: "Protect eligibility. Build leverage. Plan beyond sport.",
    subtitle: "Your academic record, athletic identity, recruiting work, NIL readiness, and long-term future in one command center.",
    accent: "Athlete Intelligence",
    modules: [
      ...SCHOLAR_BASELINE_MODULES,
      { eyebrow: "Eligibility", title: "Protect every pathway", body: "Connect academics, A–G progress, evidence, and eligibility needs before deadlines arrive.", href: "/academic-readiness", action: "Check eligibility" },
      { eyebrow: "Recruiting", title: "Own your recruiting story", body: "Keep targets, film, coach conversations, visits, and next outreach actions organized.", href: "/scholar-athlete-os", action: "Review recruiting" },
      { eyebrow: "Portfolio", title: "Present verified talent", body: "Pair athletic evidence with academic readiness, character, leadership, and goals.", href: "/record", action: "Build athlete record" },
      { eyebrow: "NIL + Future", title: "Prepare for opportunity responsibly", body: "Learn brand readiness, money fundamentals, compliance, and life after competition.", href: "/courses", action: "Open learning plan" },
    ],
  },
  "transition-youth": {
    label: "TAY OS",
    headline: "Build stability, momentum, and your next chapter.",
    subtitle: "Education, work, life goals, trusted people, and practical next steps designed around your real transition—not somebody else’s timeline.",
    accent: "Transition Intelligence",
    modules: [
      ...SCHOLAR_BASELINE_MODULES,
      { eyebrow: "My Next Chapter", title: "Choose the direction that fits now", body: "Connect education, credentials, college, work, and personal goals into one flexible plan.", href: "/compass", action: "Build my plan" },
      { eyebrow: "Opportunity", title: "Find practical next moves", body: "Explore jobs, internships, training, scholarships, and programs matched to your goals.", href: "/opportunities", action: "Explore pathways" },
      { eyebrow: "Support Network", title: "Know who is in your corner", body: "Coordinate trusted adults, mentors, educators, and community support without losing ownership.", href: "/support-network", action: "Open support network" },
      { eyebrow: "My Record", title: "Make every kind of progress visible", body: "Document learning, work, leadership, service, responsibilities, and achievements.", href: "/record", action: "Open my record" },
    ],
  },
  "athlete-abroad": {
    label: "Athlete Abroad OS",
    headline: "Take your game global—with a real plan behind it.",
    subtitle: "Connect academics, athletics, international eligibility, travel readiness, trusted support, and opportunity research before you cross borders.",
    accent: "Global Athlete Intelligence",
    modules: [
      ...SCHOLAR_BASELINE_MODULES,
      { eyebrow: "Global Passport", title: "Organize international readiness", body: "Track passport, credentials, eligibility, target countries, language, and start timing.", href: "/athlete-abroad-os", action: "Review readiness" },
      { eyebrow: "Athlete Portfolio", title: "Present the complete athlete", body: "Connect film, stats, position, honors, references, academics, and your future goals.", href: "/record", action: "Build global profile" },
      { eyebrow: "Country + Program Fit", title: "Research before you commit", body: "Compare education, clubs, leagues, housing, cost, culture, and support expectations.", href: "/courses/athletes-abroad-global-hub", action: "Open global hub" },
      { eyebrow: "Safety + Support", title: "Travel with people in your corner", body: "Keep guardians, mentors, coaches, emergency planning, health, and housing support connected.", href: "/support-network", action: "Review support plan" },
    ],
  },
};

const asText = (value: unknown) => typeof value === "string" || typeof value === "number" ? String(value) : "";

export function getLearnerOSDefinition(role: LearnerOSRole) {
  return DEFINITIONS[role];
}

export function buildLearnerOSProjection(role: LearnerOSRole, profile: LearnerProfile = {}) {
  const onboarding = profile.onboarding_data || {};
  const supportNetwork = Array.isArray(onboarding.support_network) ? onboarding.support_network : [];
  const supportCount = supportNetwork.filter((entry) =>
    Boolean(entry && typeof entry === "object" && asText((entry as Record<string, unknown>).email)),
  ).length;

  const relevantFields: Record<LearnerOSRole, string[]> = {
    scholar: ["school", "grade", "gpa", "graduation_year", "dream_school", "ideal_profession", "activities"],
    "scholar-athlete": ["school", "grade", "gpa", "primary_sport", "position", "current_team", "target_division", "highlight_link"],
    "transition-youth": ["school", "grade", "ideal_profession", "engagement_preferences", "activities"],
    "athlete-abroad": ["school", "primary_sport", "target_countries", "abroad_pathway_goal", "passport_status", "desired_start_window", "international_readiness_needs"],
  };

  const completed = relevantFields[role].filter((key) =>
    Boolean(profile[key as keyof LearnerProfile] || onboarding[key]),
  ).length;
  const readiness = Math.round((completed / relevantFields[role].length) * 100);

  return {
    role,
    definition: DEFINITIONS[role],
    displayName: asText(profile.full_name) || asText(profile.username) || "Playbook learner",
    school: asText(profile.school) || asText(onboarding.school) || "Add your school",
    grade: asText(profile.grade) || asText(onboarding.grade) || "Add grade",
    graduationYear: asText(profile.graduation_year) || asText(onboarding.graduation_year) || "Add year",
    primaryGoal:
      asText(profile.dream_school) ||
      asText(profile.ideal_profession) ||
      asText(onboarding.abroad_pathway_goal) ||
      "Add your next goal",
    supportCount,
    readiness,
  };
}
