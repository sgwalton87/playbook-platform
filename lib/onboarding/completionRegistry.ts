import { PLAYBOOK_ROLES, type PlaybookRole } from "@/lib/roles/registry";

export type OnboardingAdapterState =
  | "implemented"
  | "relationship-gated"
  | "authority-pending";

export interface RoleOnboardingCompletionContract {
  role: PlaybookRole;
  endpoint: string;
  destination: string;
  adapter: string;
  state: OnboardingAdapterState;
  requirement: string;
}

const contract = (
  role: PlaybookRole,
  adapter: string,
  state: OnboardingAdapterState,
  requirement: string
): RoleOnboardingCompletionContract => ({
  role,
  endpoint: `/api/pbos/onboarding/${role}`,
  destination: PLAYBOOK_ROLES[role].osRoute,
  adapter,
  state,
  requirement,
});

export const ROLE_ONBOARDING_COMPLETION: Record<PlaybookRole, RoleOnboardingCompletionContract> = {
  scholar: contract("scholar", "SCHOLAR_RECORD", "implemented", "Authenticated self-owned Scholar Record completion."),
  "scholar-athlete": contract("scholar-athlete", "SCHOLAR_ATHLETE_RECORD", "implemented", "Authenticated Scholar Record plus durable athlete profile."),
  "transition-youth": contract("transition-youth", "TRANSITION_YOUTH_RECORD", "implemented", "Authenticated self-owned TAY Scholar Record specialization."),
  family: contract("family", "FAMILY_RELATIONSHIP", "relationship-gated", "Accepted scholar-originated Parent/Guardian relationship plus Family PBOS runtime certification."),
  mentor: contract("mentor", "MENTOR_VALIDATION", "relationship-gated", "Scholar invitation plus Mentor validation threshold plus Mentor PBOS runtime certification."),
  educator: contract("educator", "EDUCATOR_AUTHORITY", "authority-pending", "Approved Educator identity evidence plus a separately governed Scholar, cohort, or institution relationship."),
  "high-school-counselor": contract("high-school-counselor", "COUNSELOR_AUTHORITY", "authority-pending", "Approved Counselor identity and school-scope evidence plus a separately governed active Counselor-to-Scholar relationship."),
  coach: contract("coach", "HIGH_SCHOOL_COACH_AUTHORITY", "authority-pending", "Approved Coach identity evidence plus a separately governed active Coach-to-Scholar/Scholar-Athlete relationship."),
  "college-coach": contract("college-coach", "RECRUITING_AUTHORITY", "authority-pending", "Approved institutional recruiting identity evidence plus separately approved sport, geography, graduation-class, contact, and compliance scope."),
  "college-admissions": contract("college-admissions", "ADMISSIONS_AUTHORITY", "authority-pending", "Approved admissions identity evidence plus separately approved territory, search, contact, and engagement scope."),
  "brand-partner": contract("brand-partner", "BRAND_AUTHORITY", "authority-pending", "Approved organization identity plus separately approved campaign and compliance scope."),
  employer: contract("employer", "EMPLOYER_AUTHORITY", "authority-pending", "Approved employer organization identity plus separately approved opportunity-publishing scope; candidate access remains application/sharing-scoped."),
  district: contract("district", "DISTRICT_AUTHORITY", "authority-pending", "Approved administrator identity evidence plus separately approved district, school, program, or functional administrative scope."),
  "athlete-abroad": contract("athlete-abroad", "ATHLETE_ABROAD_RECORD", "authority-pending", "Self-owned athlete pathway plus governed international/eligibility contract."),
  other: contract("other", "COMMUNITY_PARTNER_AUTHORITY", "authority-pending", "Approved Community Partner organization identity plus approved service scope; Scholar-specific access requires a separately governed exact relationship."),
};

export function getRoleOnboardingCompletionContract(role: PlaybookRole) {
  return ROLE_ONBOARDING_COMPLETION[role];
}
