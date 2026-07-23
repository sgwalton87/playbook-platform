export const PLAYBOOK_ROLES = {
  scholar: { label: "Scholar", osLabel: "Scholar OS", osRoute: "/dashboard", onboarding: true },
  "scholar-athlete": { label: "Scholar-Athlete", osLabel: "Scholar-Athlete OS", osRoute: "/scholar-athlete-os", onboarding: true },
  "transition-youth": { label: "Transition-Aged Youth", osLabel: "TAY OS", osRoute: "/dashboard", onboarding: true },
  family: { label: "Parent / Guardian", osLabel: "Family OS", osRoute: "/family-os", onboarding: true },
  mentor: { label: "Mentor", osLabel: "Mentor OS", osRoute: "/mentor-os", onboarding: true },
  educator: { label: "Teacher / Educator", osLabel: "Educator OS", osRoute: "/educator-os", onboarding: true },
  coach: { label: "High School Coach", osLabel: "Coach OS", osRoute: "/educator-os", onboarding: true },
  "college-coach": { label: "College Coach / Recruiter", osLabel: "Recruiting OS", osRoute: "/university-os", onboarding: true },
  "college-admissions": { label: "College Admissions", osLabel: "Admissions OS", osRoute: "/university-os", onboarding: true },
  "brand-partner": { label: "Brand Partner", osLabel: "Brand Partner OS", osRoute: "/brand-partner-os", onboarding: true },
  employer: { label: "Employer / Workforce Partner", osLabel: "Employer OS", osRoute: "/employer-os", onboarding: false },
  district: { label: "District / School Administrator", osLabel: "District OS", osRoute: "/district-os", onboarding: false },
  other: { label: "Community Partner", osLabel: "Playbook", osRoute: "/pending", onboarding: true },
} as const;

export type PlaybookRole = keyof typeof PLAYBOOK_ROLES;

export const ROLE_ALIASES: Record<string, PlaybookRole> = {
  student: "scholar",
  learner: "scholar",
  athlete: "scholar-athlete",
  scholar_athlete: "scholar-athlete",
  tay: "transition-youth",
  parent: "family",
  guardian: "family",
  teacher: "educator",
  counselor: "educator",
  "high-school-counselor": "educator",
  "high-school-coach": "coach",
  recruiter: "college-coach",
  university: "college-admissions",
  college: "college-admissions",
  admissions: "college-admissions",
  "admissions-officer": "college-admissions",
  brand_partner: "brand-partner",
  workforce: "employer",
  partner: "employer",
  admin: "district",
  school_admin: "district",
};

export function normalizePlaybookRole(role?: string | null): PlaybookRole {
  const key = String(role || "scholar").trim().toLowerCase();
  if (key in PLAYBOOK_ROLES) return key as PlaybookRole;
  return ROLE_ALIASES[key] || "scholar";
}

export function getRoleDefinition(role?: string | null) {
  return PLAYBOOK_ROLES[normalizePlaybookRole(role)];
}

export function getRoleDestination(role?: string | null) {
  return getRoleDefinition(role).osRoute;
}

export function getOnboardingDestination(role?: string | null) {
  const normalized = normalizePlaybookRole(role);
  return `/start?first=1&role=${encodeURIComponent(normalized)}`;
}

export function getSignupDestination(role?: string | null) {
  const normalized = normalizePlaybookRole(role);
  return `/login?mode=signup&role=${encodeURIComponent(normalized)}`;
}

export const ROLE_SELECTION_ROUTE = "/role-select";

export const PUBLIC_ONBOARDING_ROLES = (Object.keys(PLAYBOOK_ROLES) as PlaybookRole[])
  .filter((role) => PLAYBOOK_ROLES[role].onboarding && role !== "other");
