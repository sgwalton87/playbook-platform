export type PlaybookRole =
  | "scholar"
  | "scholar-athlete"
  | "transition-youth"
  | "family"
  | "mentor"
  | "coach"
  | "educator"
  | "college-admin"
  | "high-school-counselor"
  | "college-coach"
  | "college-admissions"
  | "employer"
  | "brand-partner"
  | "other";

export const ROLE_ALIASES: Record<string, PlaybookRole> = {
  scholar: "scholar",
  "scholar-athlete": "scholar-athlete",
  scholar_athlete: "scholar-athlete",
  scholarAthlete: "scholar-athlete",
  athlete: "scholar-athlete",
  tay: "transition-youth",
  "transition-youth": "transition-youth",
  parent: "family",
  guardian: "family",
  family: "family",
  mentor: "mentor",
  teacher: "educator",
  educator: "educator",
  counselor: "high-school-counselor",
  "high-school-counselor": "high-school-counselor",
  coach: "coach",
  "high-school-coach": "coach",
  "college-coach": "college-coach",
  recruiter: "college-coach",
  "college-admin": "college-admin",
  "college-admissions": "college-admissions",
  university: "college-admissions",
  employer: "employer",
  "brand-partner": "brand-partner",
  other: "other",
};

export const PLAYBOOK_PATHWAYS = [
  { role: "scholar", label: "Scholar", osRoute: "/dashboard", comingSoon: false },
  { role: "scholar-athlete", label: "Scholar-Athlete", osRoute: "/scholar-athlete-os", comingSoon: false },
  { role: "transition-youth", label: "Transition-Aged Youth", osRoute: "/dashboard", comingSoon: false },
  { role: "family", label: "Parent / Guardian", osRoute: "/family-os", comingSoon: false },
  { role: "mentor", label: "Mentor", osRoute: "/mentor-os", comingSoon: false },
  { role: "educator", label: "Teacher / Educator", osRoute: "/educator-os", comingSoon: false },
  { role: "high-school-counselor", label: "High School Counselor", osRoute: "/educator-os", comingSoon: false },
  { role: "coach", label: "High School Coach", osRoute: "/mentor-os", comingSoon: false },
  { role: "college-coach", label: "College Coach / Recruiter", osRoute: "/university-os", comingSoon: false },
  { role: "college-admissions", label: "College Admissions Officer", osRoute: "/university-os", comingSoon: false },
  { role: "college-admin", label: "College Administrator", osRoute: "/university-os", comingSoon: false },
  { role: "employer", label: "Employer", osRoute: "/employer-os", comingSoon: false },
  { role: "brand-partner", label: "Brand Partner — Coming Soon", osRoute: "/pending", comingSoon: true },
  { role: "other", label: "Other", osRoute: "/pending", comingSoon: false },
] as const;

export function normalizeRole(role?: string | null): PlaybookRole {
  if (!role) return "scholar";
  return ROLE_ALIASES[role] || ROLE_ALIASES[role.toLowerCase()] || "scholar";
}

export function getPathway(role?: string | null) {
  const normalized = normalizeRole(role);
  return PLAYBOOK_PATHWAYS.find((p) => p.role === normalized) || PLAYBOOK_PATHWAYS[0];
}
