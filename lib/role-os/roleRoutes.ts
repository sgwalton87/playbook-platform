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
  "high-school-counselor": "Coordinate academic planning, applications, interventions, and trusted support.",
  coach: "Connect athlete development, academics, recruiting, and advocacy.",
  "college-coach": "Discover and support verified scholar-athlete talent.",
  "college-admissions": "Connect verified scholars with institutional pathways.",
  "brand-partner": "Create responsible campaigns, rewards, internships, and sponsorships.",
  employer: "Create internships, work-based learning, and responsible hiring pathways.",
  district: "Govern schools, cohorts, permissions, readiness signals, and interventions.",
  "athlete-abroad": "Prepare academics, eligibility, travel, recruiting, and international transitions.",
  other: "Connect community services and trusted support without inheriting Scholar-data authority.",
};

export const roleOptions = PUBLIC_ONBOARDING_ROLES.map((role) => ({
  role,
  label: PLAYBOOK_ROLES[role].label,
  description: ROLE_DESCRIPTIONS[role] || "Enter your role-aware Playbook experience.",
  href: getRoleDestination(role),
}));
