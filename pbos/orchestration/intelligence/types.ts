export type SnapshotValidationStatus = "VALID" | "INVALID";

export interface OrchestrationSnapshot {
  readonly identity: string;
  readonly timestamp: string;
  readonly source_references: readonly string[];
  readonly digest: string;
  readonly confidence: number;
  readonly validation_status: SnapshotValidationStatus;
  readonly findings: readonly string[];
}

export interface RepositoryStateSnapshot extends OrchestrationSnapshot {
  readonly repository_root: string;
  readonly branch: string;
  readonly commit: string;
  readonly content_digest: string;
}

export interface ArchitectureStateSnapshot extends OrchestrationSnapshot {
  readonly constitution_reference: string;
  readonly objective_count: number;
  readonly architecture_gaps: readonly string[];
  readonly documentation_maturity: "UNKNOWN" | "PARTIAL" | "VALIDATED";
}

export interface CapabilityStateSnapshot extends OrchestrationSnapshot {
  readonly completed_capabilities: readonly string[];
  readonly incomplete_capabilities: readonly string[];
  readonly blocked_dependencies: readonly string[];
}

export interface EngineStateSnapshot extends OrchestrationSnapshot {
  readonly engine_version: string;
  readonly execution_mode: string;
  readonly active_gate: string | null;
  readonly test_health: "PASS" | "FAIL" | "UNKNOWN";
}

export interface GovernanceStateSnapshot extends OrchestrationSnapshot {
  readonly lifecycle_status: string;
  readonly certification_status: "CERTIFIED" | "REJECTED";
  readonly validation_status_summary: "PASS" | "FAIL";
  readonly governance_conflicts: readonly string[];
}

export interface LifecycleStateSnapshot extends OrchestrationSnapshot {
  readonly release_state: string;
  readonly active_gate: string | null;
  readonly completed_milestones: readonly string[];
}

export interface DocumentationStateSnapshot extends OrchestrationSnapshot {
  readonly constitutional_source: string;
  readonly maturity: "UNKNOWN" | "PARTIAL" | "VALIDATED";
}

export interface ValidationStateSnapshot extends OrchestrationSnapshot {
  readonly kernel_certification: "CERTIFIED" | "REJECTED";
  readonly repository_context: SnapshotValidationStatus;
  readonly runtime_context: SnapshotValidationStatus;
}

export interface PBOSSystemAssessment {
  readonly assessment_id: string;
  readonly current_maturity: "BLOCKED" | "STRUCTURAL" | "OPERATIONAL";
  readonly completed_domains: readonly string[];
  readonly incomplete_domains: readonly string[];
  readonly blocked_dependencies: readonly string[];
  readonly risks: readonly string[];
  readonly recommended_focus: string;
  readonly confidence: number;
  readonly evidence: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface PBOSSystemIntelligence {
  readonly repository: RepositoryStateSnapshot;
  readonly architecture: ArchitectureStateSnapshot;
  readonly capabilities: CapabilityStateSnapshot;
  readonly engine: EngineStateSnapshot;
  readonly governance: GovernanceStateSnapshot;
  readonly lifecycle: LifecycleStateSnapshot;
  readonly documentation: DocumentationStateSnapshot;
  readonly validation: ValidationStateSnapshot;
  readonly assessment: PBOSSystemAssessment;
  readonly digest: string;
}
