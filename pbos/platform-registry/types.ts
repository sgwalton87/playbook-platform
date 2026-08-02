export const PLATFORM_RESOURCE_KINDS = [
  "APPLICATION",
  "FEATURE",
  "ROUTE",
  "API",
  "DATABASE_ENTITY",
  "ROLE",
  "OPERATING_SYSTEM",
  "ENGINE",
  "PRODUCTION_CONTROL",
] as const;

export const PLATFORM_RESOURCE_STATUSES = [
  "IMPLEMENTED",
  "PARTIAL",
  "MISSING",
  "BLOCKED",
  "DEMO_ONLY",
] as const;

export type PlatformResourceKind = (typeof PLATFORM_RESOURCE_KINDS)[number];
export type PlatformResourceStatus = (typeof PLATFORM_RESOURCE_STATUSES)[number];
export type AccessDecision = "NONE" | "OWN" | "RELATIONSHIP" | "INSTITUTION" | "GLOBAL";

export interface PlatformAccessContract {
  readonly view: AccessDecision;
  readonly edit: AccessDecision;
  readonly approve: AccessDecision;
  readonly verify: AccessDecision;
  readonly administer: AccessDecision;
  readonly audit_required: boolean;
}

export interface RoleOperatingSystemContract {
  readonly users: readonly string[];
  readonly dashboard: string;
  readonly workflows: readonly string[];
  readonly permissions: readonly string[];
  readonly data_access: readonly string[];
  readonly notifications: readonly string[];
  readonly metrics: readonly string[];
}

export interface PlatformResource {
  readonly id: string;
  readonly kind: PlatformResourceKind;
  readonly purpose: string;
  readonly owner: string;
  readonly dependencies: readonly string[];
  readonly status: PlatformResourceStatus;
  readonly evidence: readonly string[];
  readonly definition_of_done: readonly string[];
  readonly access?: PlatformAccessContract;
  readonly operating_system?: RoleOperatingSystemContract;
}

export interface PlatformRegistry {
  readonly registry_id: "PLAYBOOK-PLATFORM-REGISTRY-001";
  readonly version: string;
  readonly authority: "PBOS-KERNEL";
  readonly milestone_authority: "pbos/manifests/playbook-master-manifest.yaml";
  readonly generated_from_repository: true;
  readonly resources: readonly PlatformResource[];
}

export interface RegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly counts: Readonly<Record<PlatformResourceKind, number>>;
}

export interface PlatformReadinessAssessment {
  readonly registry_id: string;
  readonly registry_version: string;
  readonly maturity_percent: number;
  readonly infrastructure_readiness_percent: number;
  readonly production_readiness_percent: number;
  readonly feature_completion_percent: number;
  readonly status_counts: Readonly<Record<PlatformResourceStatus, number>>;
  readonly blocking_dependencies: readonly string[];
  readonly recommended_next_mission: string | null;
}
