export const PLAYBOOK_ROLES = {
  scholar: { label: "Scholar", osLabel: "Scholar OS", osRoute: "/dashboard", onboarding: true },
  "scholar-athlete": { label: "Scholar-Athlete", osLabel: "Scholar-Athlete OS", osRoute: "/scholar-athlete-os", onboarding: true },
  "transition-youth": { label: "Transition-Aged Youth", osLabel: "TAY OS", osRoute: "/transition-youth-os", onboarding: true },
  family: { label: "Parent / Guardian", osLabel: "Family OS", osRoute: "/family-os", onboarding: true },
  mentor: { label: "Mentor", osLabel: "Mentor OS", osRoute: "/mentor-os", onboarding: true },
  educator: { label: "Teacher / Educator", osLabel: "Educator OS", osRoute: "/educator-os", onboarding: true },
  "high-school-counselor": { label: "High School Counselor", osLabel: "Counselor OS", osRoute: "/counselor-os", onboarding: true },
  coach: { label: "High School Coach", osLabel: "Coach OS", osRoute: "/coach-os", onboarding: true },
  "college-coach": { label: "College Coach / Recruiter", osLabel: "Recruiting OS", osRoute: "/recruiting-os", onboarding: true },
  "college-admissions": { label: "College Admissions", osLabel: "Admissions OS", osRoute: "/admissions-os", onboarding: true },
  "brand-partner": { label: "Brand Partner", osLabel: "Brand Partner OS", osRoute: "/brand-partner-os", onboarding: true },
  employer: { label: "Employer / Workforce Partner", osLabel: "Employer OS", osRoute: "/employer-os", onboarding: true },
  district: { label: "District / School Administrator", osLabel: "District OS", osRoute: "/district-os", onboarding: true },
  "athlete-abroad": { label: "Athlete Abroad", osLabel: "Athlete Abroad OS", osRoute: "/athlete-abroad-os", onboarding: true },
  other: { label: "Community Partner", osLabel: "Community Partner OS", osRoute: "/community-partner-os", onboarding: true },
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
  counselor: "high-school-counselor",
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
  "athlete-abroad-enrollment": "athlete-abroad",
  international_athlete: "athlete-abroad",
  "community-partner": "other",
  community_partner: "other",
};

/**
 * Compatibility normalizer for legacy surfaces that intentionally default to
 * Scholar when no role exists. Authority-bearing onboarding and completion
 * paths must use requirePlaybookRole instead.
 */
export function normalizePlaybookRole(role?: string | null): PlaybookRole {
  const key = String(role || "scholar").trim().toLowerCase();
  if (key in PLAYBOOK_ROLES) return key as PlaybookRole;
  return ROLE_ALIASES[key] || "scholar";
}

/**
 * Resolve a canonical role without silent fallback. Unknown or empty roles are
 * rejected so one role can never inherit Scholar onboarding or authority by
 * accident.
 */
export function requirePlaybookRole(role?: string | null): PlaybookRole {
  const key = String(role ?? "").trim().toLowerCase();
  if (!key) throw new Error("A Playbook role is required.");
  if (key in PLAYBOOK_ROLES) return key as PlaybookRole;
  const alias = ROLE_ALIASES[key];
  if (alias) return alias;
  throw new Error(`Unsupported Playbook role: ${key}`);
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

export const PUBLIC_ONBOARDING_ROLES = (Object.keys(PLAYBOOK_ROLES) as PlaybookRole[])
  .filter((role) => PLAYBOOK_ROLES[role].onboarding);
