import {
  PLAYBOOK_ROLES,
  PUBLIC_ONBOARDING_ROLES,
  getRoleDestination,
} from "@/lib/roles/registry";

export { getRoleDestination } from "@/lib/roles/registry";

const ROLE_DESCRIPTIONS: Partial<Record<keyof typeof PLAYBOOK_ROLES, string>> = {
  scholar: "Build your record, find opportunities, and get guidance.",
  "scholar-athlete": "Connect academics, recruiting, eligibility, and life beyond sport.",
  "transition-youth": "Build a supported path through education, work, and independent adulthood.",
  family: "Support your scholar with clear next steps, permissions, and deadlines.",
  mentor: "Guide scholars through goals, confidence, applications, and opportunity.",
  educator: "Support students with readiness signals, evidence, and interventions.",
  counselor: "Coordinate academic planning, college access, caseloads, and student support.",
  coach: "Connect athlete development, academics, recruiting, and advocacy.",
  "college-coach": "Discover and support verified scholar-athlete talent.",
  "college-admissions": "Connect verified scholars with institutional pathways.",
  "brand-partner": "Create responsible campaigns, rewards, internships, and sponsorships.",
  employer: "Create internships, work-based learning, and verified career pathways.",
  district: "Coordinate schools, permissions, implementation, and student success at scale.",
  "athlete-abroad": "Prepare academics, athletics, travel, and support for an international pathway.",
};

export const roleOptions = PUBLIC_ONBOARDING_ROLES.map((role) => ({
  role,
  label: PLAYBOOK_ROLES[role].label,
  description: ROLE_DESCRIPTIONS[role] || "Enter your role-aware Playbook experience.",
  href: getRoleDestination(role),
}));
