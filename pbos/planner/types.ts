import type { GateStatus } from "../lifecycle/status";

export interface GateDefinition {
  id: string;
  title: string;
  description: string;
  status: GateStatus;
  priority: number;
  lifecycle_stage: number;
  dependencies: string[];
  produces: string[];
  requires: string[];
  blocking_conditions: string[];
  completion_state: "pending" | "satisfied";
  handbook_refs: string[];
  tasks: string[];
  definition_of_done: string[];
  validation: string[];
  next_gate: string | null;
}

export interface DependencyNode {
  gate: GateDefinition;
  dependencies: string[];
  dependents: string[];
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  missingDependencies: Array<{
    gateId: string;
    dependencyId: string;
  }>;
  cycles: string[][];
}

export interface EligibilityReason {
  code: string;
  message: string;
}

export interface GateEligibility {
  gate: GateDefinition;
  eligible: boolean;
  reasons: EligibilityReason[];
  missingArtifacts: string[];
  invalidArtifacts: Array<{
    path: string;
    errors: string[];
  }>;
  incompleteDependencies: string[];
}

export interface ArtifactValidation {
  path: string;
  valid: boolean;
  digest: string | null;
  gateId: string | null;
  errors: string[];
}

export interface PlannerEnvironment {
  contextValid: boolean;
  contextErrors: string[];
  validationPassed: boolean;
  validationGate: string | null;
  releaseState: string;
  releasePermitsExecution: boolean;
  artifacts: Map<string, ArtifactValidation>;
}

export interface ConstitutionalPlanningReport {
  version: "1.0.0";
  generatedAt: string;
  engineVersion: string;
  repositoryContext: {
    valid: boolean;
    errors: string[];
  };
  currentLifecycle: {
    releaseState: string;
    releasePermitsExecution: boolean;
  };
  currentDependencyNode: string | null;
  completedGates: string[];
  eligibleGates: string[];
  blockedGates: Array<{
    gateId: string;
    reasons: EligibilityReason[];
    incompleteDependencies: string[];
    missingArtifacts: string[];
    invalidArtifacts: GateEligibility["invalidArtifacts"];
  }>;
  dependencyGraphSummary: {
    nodeCount: number;
    edgeCount: number;
    missingDependencies: DependencyGraph["missingDependencies"];
    cycles: string[][];
  };
  selectedGate: GateDefinition | null;
  reasonSelected: string;
  requiredArtifacts: string[];
  validationResults: {
    passed: boolean;
    gateId: string | null;
  };
  recommendedNextGate: string | null;
  expectedDeliverables: string[];
  estimatedImpact: string;
  blockingConditions: string[];
  planningHealth: "HEALTHY" | "BLOCKED";
}

export interface PlanningDecision {
  selectedGate: GateDefinition | null;
  eligible: GateDefinition[];
  blocked: GateDefinition[];
  reasons: string[];
}
