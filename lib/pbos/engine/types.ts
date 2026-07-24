export const UNKNOWN = "UNKNOWN" as const;

export type UnknownValue = typeof UNKNOWN;
export type GateStatus = "completed" | "current" | "blocked" | "pending" | UnknownValue;

export interface RepositoryDocument {
  repository: string;
  [key: string]: unknown;
}

export interface RepositoryState extends RepositoryDocument {
  status: string;
}

export interface RepositoryHealth extends RepositoryDocument {
  health: string;
  blockers: string[];
}

export interface RepositoryTopology extends RepositoryDocument {
  required_files?: string[];
}

export interface EngineeringGate {
  id: string;
  goal: string;
  status: GateStatus;
  depends_on: string[];
  scope: string[];
  required_files: string[];
  constraints: string[];
  acceptance_criteria: string[];
  required_validations: string[];
}

export interface EngineeringGates extends RepositoryDocument {
  gates: EngineeringGate[];
}

export interface ValidationBaseline extends RepositoryDocument {
  validations: string[];
}

export interface PbosState {
  repositoryState: RepositoryState;
  repositoryHealth: RepositoryHealth;
  repositoryTopology: RepositoryTopology;
  engineeringGates: EngineeringGates;
  validationBaseline: ValidationBaseline;
}

export interface ValidationIssue {
  file: CanonicalFile;
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface GateResolution {
  currentGate: EngineeringGate | null;
  completedGates: EngineeringGate[];
  blockedGates: EngineeringGate[];
  nextEligibleGate: EngineeringGate | null;
}

export interface RecommendedSprint {
  gate: string;
  goal: string;
  scope: string[];
  requiredFiles: string[];
  constraints: string[];
  acceptanceCriteria: string[];
  requiredValidations: string[];
}

export interface ExecutionReport {
  repositoryStatus: string;
  currentGate: string | null;
  currentHealth: string;
  currentBlockers: string[];
  recommendedSprint: RecommendedSprint | null;
  validationSummary: { valid: boolean; issueCount: number; issues: ValidationIssue[] };
  confidence: "HIGH" | "LOW";
  unknownInformation: string[];
}

export type CanonicalFile =
  | "repository-state.yaml"
  | "repository-health.yaml"
  | "repository-topology.yaml"
  | "engineering-gates.yaml"
  | "validation-baseline.yaml";

export const CANONICAL_FILES: readonly CanonicalFile[] = [
  "repository-state.yaml",
  "repository-health.yaml",
  "repository-topology.yaml",
  "engineering-gates.yaml",
  "validation-baseline.yaml",
];
