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
  educator: contract("educator", "EDUCATOR_AUTHORITY", "authority-pending", "Verified educator identity and scholar/institution relationship authority."),
  "high-school-counselor": contract("high-school-counselor", "COUNSELOR_AUTHORITY", "authority-pending", "Verified counselor identity, school scope, and scholar relationship authority."),
  coach: contract("coach", "HIGH_SCHOOL_COACH_AUTHORITY", "authority-pending", "Approved Coach identity evidence plus a separately governed active Coach-to-Scholar/Scholar-Athlete relationship."),
  "college-coach": contract("college-coach", "RECRUITING_AUTHORITY", "authority-pending", "Verified institution/recruiting identity and approved recruiting scope."),
  "college-admissions": contract("college-admissions", "ADMISSIONS_AUTHORITY", "authority-pending", "Verified admissions identity and approved institutional scope."),
  "brand-partner": contract("brand-partner", "BRAND_AUTHORITY", "authority-pending", "Verified organization identity, campaign authority, and compliance scope."),
  employer: contract("employer", "EMPLOYER_AUTHORITY", "authority-pending", "Verified organization identity and opportunity/hiring authority."),
  district: contract("district", "DISTRICT_AUTHORITY", "authority-pending", "Verified district/school administrator identity and administrative scope."),
  "athlete-abroad": contract("athlete-abroad", "ATHLETE_ABROAD_RECORD", "authority-pending", "Self-owned athlete pathway plus governed international/eligibility contract."),
  other: contract("other", "COMMUNITY_PARTNER_AUTHORITY", "authority-pending", "Verified Community Partner identity and explicit relationship scope."),
};

export function getRoleOnboardingCompletionContract(role: PlaybookRole) {
  return ROLE_ONBOARDING_COMPLETION[role];
}
