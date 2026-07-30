import type {
  ExperienceCapabilityState,
  ScholarExperienceDomain,
  ScholarExperienceRole,
} from "../types";

export const SCHOLAR_OS_MODULES = [
  "HOME",
  "PROFILE",
  "JOURNEY",
  "GOALS",
  "OPPORTUNITIES",
  "CONNECTIONS",
  "GROWTH",
  "NOTIFICATIONS",
  "SETTINGS",
] as const;

export type ScholarOSModuleId = (typeof SCHOLAR_OS_MODULES)[number];
export type ScholarScreenState =
  | "LOADING"
  | "EMPTY"
  | "FIRST_TIME"
  | "SUCCESS"
  | "ERROR"
  | "LOCKED"
  | "PERMISSION_REQUIRED"
  | "UNAVAILABLE";

export interface ScholarOSCapabilityMapping {
  readonly mapping_id: string;
  readonly module_id: ScholarOSModuleId;
  readonly capability_id: string;
  readonly engine_dependency: string | null;
  readonly permission_requirement: string;
  readonly availability_state: ExperienceCapabilityState;
  readonly kernel_decision_reference: string | null;
  readonly digest: string;
}

export interface ScholarOSApplicationModule {
  readonly module_id: ScholarOSModuleId;
  readonly purpose: string;
  readonly user_value: string;
  readonly experience_domains: readonly ScholarExperienceDomain[];
  readonly required_capabilities: readonly string[];
  readonly data_sources: readonly string[];
  readonly data_owner: "SCHOLAR" | "ORGANIZATION" | "PLATFORM";
  readonly permissions: readonly string[];
  readonly available_states: readonly ScholarScreenState[];
  readonly future_engine_integrations: readonly string[];
  readonly digest: string;
}

export interface ScholarOSApplicationArchitecture {
  readonly application_id: "SCHOLAR-OS";
  readonly owner: string;
  readonly modules: readonly ScholarOSApplicationModule[];
  readonly navigation: readonly ScholarOSModuleId[];
  readonly capability_mappings: readonly ScholarOSCapabilityMapping[];
  readonly permission_boundaries: readonly string[];
  readonly data_ownership_boundaries: readonly string[];
  readonly supported_roles: readonly ScholarExperienceRole[];
  readonly lifecycle: "DRAFT" | "IMPLEMENTATION_READY" | "RETIRED";
  readonly digest: string;
}

export interface ScholarOSScreenSpecification {
  readonly screen_id: string;
  readonly module_id: ScholarOSModuleId;
  readonly purpose: string;
  readonly audience: readonly ScholarExperienceRole[];
  readonly primary_action: string;
  readonly secondary_actions: readonly string[];
  readonly information_hierarchy: readonly string[];
  readonly components: readonly string[];
  readonly data_displayed: readonly string[];
  readonly data_owner: "SCHOLAR" | "ORGANIZATION" | "PLATFORM";
  readonly permissions: readonly string[];
  readonly capability_dependencies: readonly string[];
  readonly states: Readonly<Record<ScholarScreenState, string>>;
  readonly digest: string;
}

export type ScholarOSFlowId =
  | "NEW_SCHOLAR_ENTRY"
  | "RETURNING_SCHOLAR"
  | "ACHIEVEMENT_CREATION"
  | "GOAL_MANAGEMENT"
  | "OPPORTUNITY_ENGAGEMENT"
  | "CONNECTION";

export interface ScholarOSUserFlowStep {
  readonly step_id: string;
  readonly label: string;
  readonly actor_role: ScholarExperienceRole;
  readonly required_permission: string | null;
  readonly capability_id: string | null;
  readonly kernel_decision_reference: string | null;
  readonly mutates_canonical_record: boolean;
  readonly human_confirmation_required: boolean;
  readonly digest: string;
}

export interface ScholarOSUserFlowArchitecture {
  readonly flow_id: ScholarOSFlowId;
  readonly scholar_identity: string;
  readonly purpose: string;
  readonly entry_state: string;
  readonly steps: readonly ScholarOSUserFlowStep[];
  readonly exit_state: string;
  readonly allowed_roles: readonly ScholarExperienceRole[];
  readonly digest: string;
}
