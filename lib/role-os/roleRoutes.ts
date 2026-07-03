export function getRoleDestination(role?: string | null) {
  const key = String(role || "").toLowerCase();

  if (["student", "scholar", "learner"].includes(key)) return "/living-scholar";
  if (["parent", "guardian", "family"].includes(key)) return "/family-os";
  if (["teacher", "educator", "counselor", "coach"].includes(key)) return "/educator-os";
  if (["district", "admin", "school_admin"].includes(key)) return "/district-os";
  if (["university", "college", "admissions"].includes(key)) return "/university-os";
  if (["employer", "workforce", "partner"].includes(key)) return "/employer-os";
  if (["mentor", "trusted_adult", "advisor"].includes(key)) return "/mentor-os";

  return "/home";
}

export const roleOptions = [
  { role: "scholar", label: "Scholar", description: "Build your record, find opportunities, and get guidance.", href: "/living-scholar" },
  { role: "family", label: "Family", description: "Support your scholar with clear next steps and deadlines.", href: "/family-os" },
  { role: "educator", label: "Educator", description: "Guide students with readiness signals and interventions.", href: "/educator-os" },
  { role: "district", label: "District", description: "See readiness, equity, and opportunity access across schools.", href: "/district-os" },
  { role: "university", label: "University", description: "Discover verified learners and readiness pathways.", href: "/university-os" },
  { role: "employer", label: "Employer", description: "Match verified skills to career-connected opportunities.", href: "/employer-os" },
  { role: "mentor", label: "Mentor", description: "Support scholars with check-ins, encouragement, and opportunity coaching.", href: "/mentor-os" },
];
