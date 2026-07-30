export const SCHOLAR_EXPERIENCE_DOMAINS = [
  "IDENTITY",
  "STORY",
  "GOALS",
  "JOURNEY",
  "OPPORTUNITIES",
  "CONNECTIONS",
  "GROWTH",
] as const;

export type ScholarExperienceDomain =
  (typeof SCHOLAR_EXPERIENCE_DOMAINS)[number];
export type ScholarExperienceRole =
  | "SCHOLAR"
  | "PARENT"
  | "MENTOR"
  | "COACH"
  | "COUNSELOR"
  | "INSTITUTION";
export type ExperienceCapabilityState =
  | "AVAILABLE"
  | "LOCKED"
  | "PENDING"
  | "REQUIRES_PERMISSION"
  | "UNAVAILABLE";

export interface ScholarOSExperienceArchitecture {
  readonly architecture_id: string;
  readonly scholar_identity: string;
  readonly owner_identity: string;
  readonly domains: readonly ScholarExperienceDomain[];
  readonly capability_dependencies: readonly string[];
  readonly permission_boundaries: readonly string[];
  readonly consent_boundaries: readonly string[];
  readonly human_confirmation_requirements: readonly string[];
  readonly lifecycle: "DRAFT" | "GOVERNED" | "RETIRED";
  readonly digest: string;
}

export interface ExperienceCapability {
  readonly capability_id: string;
  readonly domain: ScholarExperienceDomain;
  readonly required_permission: string;
  readonly required_consent: string | null;
  readonly kernel_decision_reference: string | null;
  readonly kernel_state: ExperienceCapabilityState;
  readonly sensitive: boolean;
  readonly allowed_roles: readonly ScholarExperienceRole[];
  readonly digest: string;
}

export interface ExperienceContext {
  readonly actor_identity: string;
  readonly scholar_identity: string;
  readonly role: ScholarExperienceRole;
  readonly permissions: readonly string[];
  readonly consents: readonly string[];
}

export interface ExperienceCapabilityDecision {
  readonly capability_id: string;
  readonly state: ExperienceCapabilityState;
  readonly visible: boolean;
  readonly reason: readonly string[];
  readonly kernel_decision_reference: string | null;
  readonly digest: string;
}

export interface ScholarExperienceFact {
  readonly fact_id: string;
  readonly scholar_identity: string;
  readonly owner_identity: string;
  readonly domain: ScholarExperienceDomain;
  readonly label: string;
  readonly value: string;
  readonly source: "HUMAN" | "INSTITUTION" | "VERIFIED_SYSTEM";
  readonly source_reference: string;
  readonly evidence_references: readonly string[];
  readonly human_confirmed: boolean;
  readonly recorded_at: string;
  readonly revision: number;
  readonly previous_digest: string | null;
  readonly sensitive: boolean;
  readonly digest: string;
}

export interface ScholarHomeExperience {
  readonly scholar_identity: string;
  readonly identity: readonly string[];
  readonly accomplishments: readonly string[];
  readonly goals: readonly string[];
  readonly next_actions: readonly string[];
  readonly capability_decisions: readonly ExperienceCapabilityDecision[];
  readonly digest: string;
}

export interface ScholarJourneyEvent {
  readonly event_id: string;
  readonly scholar_identity: string;
  readonly journey: "ACADEMIC" | "ATHLETIC" | "CAREER" | "PERSONAL_DEVELOPMENT";
  readonly milestone: string;
  readonly evidence_references: readonly string[];
  readonly occurred_at: string;
  readonly digest: string;
}

export interface ScholarJourneyExperience {
  readonly scholar_identity: string;
  readonly events: readonly ScholarJourneyEvent[];
  readonly digest: string;
}

export type ScholarDecisionAction =
  | "SUGGEST"
  | "ORGANIZE"
  | "HIGHLIGHT"
  | "RECOMMEND"
  | "DECIDE"
  | "RANK_HUMAN_WORTH"
  | "REPLACE_ADVISOR"
  | "CREATE_FACT"
  | "IRREVERSIBLE_ACTION";

export interface ScholarDecisionBoundary {
  readonly action: ScholarDecisionAction;
  readonly actor_identity: string;
  readonly scholar_identity: string;
  readonly explanation: string;
  readonly evidence_references: readonly string[];
  readonly human_confirmation_required: boolean;
  readonly digest: string;
}

export interface ScholarOSNavigationItem {
  readonly navigation_id: string;
  readonly label: string;
  readonly domain: ScholarExperienceDomain;
  readonly capability_id: string;
  readonly required_permission: string;
  readonly allowed_roles: readonly ScholarExperienceRole[];
  readonly order: number;
  readonly digest: string;
}
