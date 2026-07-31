export const BUILD_MILESTONE_STATES = [
  "DISCOVERED",
  "DEFINED",
  "BLOCKED",
  "READY",
  "PLANNED",
  "AUTHORIZED",
  "IN_PROGRESS",
  "VALIDATING",
  "COMPLETE",
  "ARCHIVED",
] as const;

export type BuildMilestoneState = (typeof BUILD_MILESTONE_STATES)[number];
export type BuildRiskLevel = "GREEN" | "YELLOW" | "RED";
export type BuildObjectType =
  | "PROGRAM"
  | "MILESTONE"
  | "OPERATING_SYSTEM"
  | "APPLICATION"
  | "ENGINE"
  | "FEATURE"
  | "COMPONENT"
  | "INFRASTRUCTURE"
  | "INTEGRATION"
  | "SECURITY_CONTROL";

export interface MissionControlDefinition {
  readonly objective: string;
  readonly phase: string;
  readonly completed: readonly {
    readonly label: string;
    readonly evidence: readonly string[];
  }[];
  readonly generating: readonly {
    readonly label: string;
    readonly output: string;
  }[];
  readonly next_human_decision: string;
}

export interface BuildMilestone {
  readonly id: string;
  readonly name: string;
  readonly type: BuildObjectType;
  readonly description: string;
  readonly domain: string;
  readonly priority: number;
  readonly status: BuildMilestoneState;
  readonly dependencies: readonly string[];
  readonly blocking_dependencies: readonly string[];
  readonly required_artifacts: readonly string[];
  readonly required_capabilities: readonly string[];
  readonly validation_requirements: readonly string[];
  readonly risk_level: BuildRiskLevel;
  readonly approval_level: "POLICY" | "HUMAN" | "EXPLICIT_HUMAN";
  readonly completion_definition: readonly string[];
  readonly evidence_requirements: readonly string[];
  readonly owner: string;
  readonly version: string;
  readonly outputs: readonly string[];
  readonly mission_control?: MissionControlDefinition;
}

export interface PlaybookMasterBuildManifest {
  readonly manifest_id: "PLAYBOOK-MASTER-MANIFEST";
  readonly version: string;
  readonly authority: "PBOS-KERNEL";
  readonly program: "Playbook Platform";
  readonly domains: readonly string[];
  readonly milestones: readonly BuildMilestone[];
}

export interface LoadedBuildManifest {
  readonly path: string;
  readonly manifest: PlaybookMasterBuildManifest;
  readonly digest: string;
}
