export const PLAYBOOK_OPERATING_SYSTEMS = [
  { id: "SCHOLAR", label: "Scholar OS", route: "/dashboard", publicRole: "scholar" },
  { id: "SCHOLAR_ATHLETE", label: "Scholar-Athlete OS", route: "/scholar-athlete-os", publicRole: "scholar-athlete" },
  { id: "PARENT_GUARDIAN", label: "Parent / Guardian OS", route: "/family-os", publicRole: "family" },
  { id: "TEACHER_EDUCATOR", label: "Teacher / Educator OS", route: "/educator-os", publicRole: "educator" },
  { id: "HIGH_SCHOOL_COUNSELOR", label: "High School Counselor OS", route: "/counselor-os", publicRole: "high-school-counselor" },
  { id: "MENTOR", label: "Mentor OS", route: "/mentor-os", publicRole: "mentor" },
  { id: "HIGH_SCHOOL_COACH", label: "High School Coach OS", route: "/coach-os", publicRole: "coach" },
  { id: "COLLEGE_COACH_RECRUITER", label: "College Coach / Recruiter OS", route: "/recruiting-os", publicRole: "college-coach" },
  { id: "COLLEGE_ADMISSIONS", label: "College Admissions OS", route: "/admissions-os", publicRole: "college-admissions" },
  { id: "BRAND_PARTNER", label: "Brand Partner OS", route: "/brand-partner-os", publicRole: "brand-partner" },
  { id: "EMPLOYER", label: "Employer OS", route: "/employer-os", publicRole: "employer" },
  { id: "FOUNDER", label: "Founder OS", route: "/founder", provisioned: true },
  { id: "ATHLETES_ABROAD", label: "Athletes Abroad Hub", route: "/athlete-abroad-os", publicRole: "athlete-abroad" },
  { id: "TRANSITION_AGED_YOUTH", label: "Transition-Aged Youth OS", route: "/transition-youth-os", publicRole: "transition-youth" },
  { id: "DISTRICT_SCHOOL_ADMIN", label: "District / School Administrator OS", route: "/district-os", publicRole: "district" },
  { id: "COMMUNITY_PARTNER", label: "Community Partner OS", route: "/community-partner-os", publicRole: "other" },
  { id: "PLATFORM_ADMIN", label: "Platform Administration OS", route: "/admin", provisioned: true },
] as const;

export type PlaybookOperatingSystem = (typeof PLAYBOOK_OPERATING_SYSTEMS)[number];

export function assertCanonicalOperatingSystemRegistry() {
  if (PLAYBOOK_OPERATING_SYSTEMS.length !== 17) {
    throw new Error(`The Playbook requires 17 operating systems; received ${PLAYBOOK_OPERATING_SYSTEMS.length}.`);
  }
  const ids = new Set(PLAYBOOK_OPERATING_SYSTEMS.map((system) => system.id));
  const routes = new Set(PLAYBOOK_OPERATING_SYSTEMS.map((system) => system.route));
  if (ids.size !== PLAYBOOK_OPERATING_SYSTEMS.length) throw new Error("Operating system IDs must be unique.");
  if (routes.size !== PLAYBOOK_OPERATING_SYSTEMS.length) throw new Error("Every operating system must own a first-class destination.");
}
