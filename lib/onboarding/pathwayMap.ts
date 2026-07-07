export type PlaybookRole =
  | "scholar"
  | "scholar-athlete"
  | "brand-partner"
  | "family"
  | "mentor"
  | "educator"
  | "coach"
  | "college-coach"
  | "college-admissions"
  | "transition-youth"
  | "other";

export const ROLE_ALIASES: Record<string, PlaybookRole> = {
  scholar: "scholar",
  "scholar-athlete": "scholar-athlete",
  scholar_athlete: "scholar-athlete",
  athlete: "scholar-athlete",
  "brand-partner": "brand-partner",
  brand_partner: "brand-partner",
  family: "family",
  parent: "family",
  guardian: "family",
  mentor: "mentor",
  educator: "educator",
  teacher: "educator",
  coach: "coach",
  "high-school-coach": "coach",
  "college-coach": "college-coach",
  recruiter: "college-coach",
  "college-admissions": "college-admissions",
  "admissions-officer": "college-admissions",
  tay: "transition-youth",
  "transition-youth": "transition-youth",
  other: "other",
};

export const PLAYBOOK_PATHWAYS = [
  { role: "scholar", label: "Scholar", osRoute: "/dashboard" },
  { role: "scholar-athlete", label: "Scholar-Athlete", osRoute: "/scholar-athlete-os" },
  { role: "brand-partner", label: "Brand Partner", osRoute: "/brand-partner-os" },
  { role: "family", label: "Family", osRoute: "/family-os" },
  { role: "mentor", label: "Mentor", osRoute: "/mentor-os" },
  { role: "educator", label: "Educator", osRoute: "/educator-os" },
  { role: "coach", label: "High School Coach", osRoute: "/mentor-os" },
  { role: "college-coach", label: "College Coach / Recruiter", osRoute: "/university-os" },
  { role: "college-admissions", label: "College Admissions Officer", osRoute: "/university-os" },
  { role: "transition-youth", label: "Transition-Aged Youth", osRoute: "/dashboard" },
  { role: "other", label: "Other", osRoute: "/pending" },
] as const;

export function normalizeRole(role?: string | null): PlaybookRole {
  if (!role) return "scholar";
  return ROLE_ALIASES[role] || ROLE_ALIASES[role.toLowerCase()] || "scholar";
}

export function getPathway(role?: string | null) {
  const normalized = normalizeRole(role);
  return PLAYBOOK_PATHWAYS.find((p) => p.role === normalized) || PLAYBOOK_PATHWAYS[0];
}
