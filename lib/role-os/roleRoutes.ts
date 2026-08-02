import {
  PLAYBOOK_ROLES,
  PUBLIC_ONBOARDING_ROLES,
  getRoleDestination,
  type PlaybookRole,
} from "@/lib/roles/registry";

export { getRoleDestination } from "@/lib/roles/registry";

const ROLE_DESCRIPTIONS: Record<PlaybookRole, string> = {
  scholar: "Build your record, find opportunities, and get guidance.",
  "scholar-athlete": "Connect academics, recruiting, eligibility, and life beyond sport.",
  "transition-youth": "Build a supported path through education, work, and independent adulthood.",
  family: "Support your scholar with clear next steps, permissions, and deadlines.",
  mentor: "Guide scholars through goals, confidence, applications, and opportunity.",
  educator: "Support students with readiness signals, evidence, and interventions.",
  coach: "Connect athlete development, academics, recruiting, and advocacy.",
  "college-coach": "Discover and support verified scholar-athlete talent.",
  "college-admissions": "Connect verified scholars with institutional pathways.",
  "brand-partner": "Create responsible campaigns, rewards, internships, and sponsorships.",
  employer: "Connect verified talent with internships, work experiences, and career pathways.",
  district: "Coordinate institution-wide support, readiness, and governed interventions.",
  other: "Connect community resources to Scholar journeys with clear permissions.",
};

export const roleOptions = PUBLIC_ONBOARDING_ROLES.map((role) => ({
  role,
  label: PLAYBOOK_ROLES[role].label,
  description: ROLE_DESCRIPTIONS[role],
  href: getRoleDestination(role),
}));
