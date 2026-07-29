export const KERNEL_STAGES = [
  "REPOSITORY_CONTEXT",
  "REPOSITORY_VALIDATION",
  "CONSTITUTION_VALIDATION",
  "OBJECTIVE_REGISTRY",
  "OBJECTIVE_STATE",
  "DEPENDENCY_GRAPH",
  "ELIGIBILITY",
  "PRIORITY",
  "RISK",
  "DECISION",
  "EXECUTION_PLAN",
  "CERTIFICATION",
  "REPORTING",
  "STATE_TRANSITION",
] as const;

export type KernelStage = (typeof KERNEL_STAGES)[number];
export type ObjectiveExecutionState =
  | "UNKNOWN"
  | "PLANNED"
  | "READY"
  | "BLOCKED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "DEFERRED"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export interface EvidenceReference {
  id: string;
  digest: string;
  uri: string;
}

export interface RepositoryContext {
  root: string;
  remote: string;
  head: string;
  branch: string;
  contentDigest: string;
  valid: boolean;
  errors: string[];
}

export interface RuntimeContext {
  engineVersion: string;
  mode: string;
  activeGate: string | null;
  completedGates: string[];
  releaseState: string;
  valid: boolean;
  errors: string[];
}

export interface KernelObjective {
  id: string;
  description: string;
  state: ObjectiveExecutionState;
  parentId: string | null;
  dependencyIds: string[];
  childIds?: string[];
  constitutionalOrder: number;
  priority: {
    constitutional: number;
    strategic: number;
    engineering: number;
    business: number;
    operational: number;
  };
  risk: number;
  estimatedEffort: number;
  criticalPath: boolean;
  authority: string;
  blockers: string[];
  requiredApprovals: string[];
  approvals: string[];
  validations: string[];
  artifacts: EvidenceReference[];
  outputs: string[];
  successCriteria: string[];
  failureCriteria: string[];
  rollback: string[];
}

export interface ObjectiveRegistry {
  id: string;
  digest: string;
  rootObjectiveIds: string[];
  objectives: KernelObjective[];
}

export interface PriorityWeights {
  constitutional: number;
  strategic: number;
  engineering: number;
  business: number;
  operational: number;
}

export interface KernelInput {
  observedAt: string;
  repository: RepositoryContext;
  runtime: RuntimeContext;
  constitution: EvidenceReference;
  registry: ObjectiveRegistry;
  priorityWeights: PriorityWeights;
}

export interface GraphFinding {
  code: string;
  objectiveId: string | null;
  reference: string | null;
  message: string;
}

export interface GraphValidation {
  valid: boolean;
  nodeCount: number;
  edgeCount: number;
  topologicalOrder: string[];
  findings: GraphFinding[];
}

export interface EligibilityResult {
  objectiveId: string;
  eligible: boolean;
  reasons: string[];
}

export interface PriorityResult {
  objectiveId: string;
  score: number;
  dimensions: KernelObjective["priority"];
}

export interface Decision {
  selectedObjectiveId: string | null;
  eligibleObjectiveIds: string[];
  blockedObjectiveIds: string[];
  rationale: string[];
  digest: string;
}

export interface ExecutionPlan {
  id: string;
  objectiveId: string;
  authority: string;
  dependencies: string[];
  validations: string[];
  artifacts: EvidenceReference[];
  approvals: string[];
  outputs: string[];
  certification: string[];
  rollback: string[];
  risk: number;
  effort: number;
  successCriteria: string[];
  failureCriteria: string[];
  digest: string;
}

export interface Certification {
  status: "CERTIFIED" | "REJECTED";
  validator: string;
  decisionDigest: string;
  planDigest: string | null;
  findings: string[];
  evidence: string[];
  digest: string;
}

export interface StateTransitionRequest {
  id: string;
  objectiveId: string;
  from: ObjectiveExecutionState;
  to: "PLANNED";
  authority: string;
  decisionDigest: string;
  certificationDigest: string;
  requestedAt: string;
}

export interface KernelEvent {
  timestamp: string;
  correlationId: string;
  executionId: string;
  objectiveId: string | null;
  stage: KernelStage;
  inputDigest: string;
  outputDigest: string;
  validator: string;
  durationMs: number;
  status: "PASS" | "FAIL";
  evidence: string[];
}

export interface KernelResult {
  version: "1.0.0";
  correlationId: string;
  executionId: string;
  status: "CERTIFIED" | "BLOCKED";
  decision: Decision;
  plan: ExecutionPlan | null;
  certification: Certification;
  transition: StateTransitionRequest | null;
  events: KernelEvent[];
  report: { json: string; markdown: string; digest: string };
}

export interface Planner {
  plan(input: KernelInput): KernelResult;
}

export interface DecisionEngine {
  decide(args: {
    objectives: KernelObjective[];
    eligibility: EligibilityResult[];
    priorities: PriorityResult[];
  }): Decision;
}

export interface EligibilityEngine {
  evaluate(
    objectives: KernelObjective[],
    graph: GraphValidation,
    context?: {
      repositoryValid: boolean;
      runtimeValid: boolean;
      constitutionValid: boolean;
      registryValid: boolean;
    }
  ): EligibilityResult[];
}

export interface PriorityEngine {
  score(
    objectives: KernelObjective[],
    weights: PriorityWeights
  ): PriorityResult[];
}

export interface CertificationEngine {
  certify(
    input: KernelInput,
    graph: GraphValidation,
    decision: Decision,
    plan: ExecutionPlan | null
  ): Certification;
}

export interface ExecutionReporter {
  render(value: unknown): { json: string; markdown: string; digest: string };
}

export interface StateCoordinator {
  request(
    input: KernelInput,
    decision: Decision,
    certification: Certification
  ): StateTransitionRequest | null;
}

export interface ExecutionKernel extends Planner {
  readonly version: "1.0.0";
}
