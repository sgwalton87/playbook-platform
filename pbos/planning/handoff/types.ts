export const OBJECTIVE_LIFECYCLE_STATES = [
  "PROPOSED",
  "REGISTERED",
  "ELIGIBLE",
  "PLANNED",
  "EXECUTING",
  "COMPLETED",
  "ARCHIVED",
] as const;

export type ObjectiveLifecycleState =
  (typeof OBJECTIVE_LIFECYCLE_STATES)[number];

export interface ObjectiveAuthority {
  originatingAuthority: string;
  constitutionalParent: string;
  owner: string;
}

export interface ObjectiveRegistryEntry {
  objectiveId: string;
  title: string;
  description: string;
  authority: ObjectiveAuthority;
  dependencies: {
    prerequisiteObjectives: string[];
    requiredArtifacts: string[];
    requiredEvidence: string[];
  };
  governance: {
    priority: number;
    lifecycleState: ObjectiveLifecycleState;
    eligibilityCriteria: string[];
    validationRequirements: string[];
    blockingConditions: string[];
  };
}

export interface ObjectiveRegistry {
  version: "1.0.0";
  authority: "PBOS_PLANNING_HANDOFF_REGISTRY";
  objectives: ObjectiveRegistryEntry[];
}

export type ObjectiveEligibilityStatus =
  | "ELIGIBLE"
  | "BLOCKED"
  | "INELIGIBLE";

export interface ObjectiveEvaluation {
  objectiveId: string;
  status: ObjectiveEligibilityStatus;
  reasons: string[];
  missingDependencies: string[];
  missingArtifacts: string[];
  missingEvidence: string[];
}

export interface PlanningLineage {
  repositoryIdentity: string;
  repositoryCommit: string;
  contextIdentity: string;
  objectiveIdentity: string | null;
  registryIdentity: string;
  dependencySnapshotIdentity: string;
  evidenceIdentity: string;
  lifecycleState: ObjectiveLifecycleState | null;
}

export interface PlanningHandoffDecision {
  status: "OBJECTIVE_ELIGIBLE" | "GOVERNED_IDLE";
  selectedObjective: ObjectiveRegistryEntry | null;
  evaluations: ObjectiveEvaluation[];
  reason: string;
}

export interface PlanningHandoffRecord {
  version: "1.0.0";
  recordId: string;
  generatedAt: string;
  owner: "planning-handoff";
  authorization: {
    authorized: true;
    authorityModel: "registered-objectives-only";
  };
  context: {
    valid: true;
    artifactHealth: "VALID";
  };
  lineage: PlanningLineage;
  decision: PlanningHandoffDecision;
}

export interface PlanningHandoffArtifact {
  version: "1.0.0";
  owner: "planning-handoff";
  latest: PlanningHandoffRecord;
  history: PlanningHandoffRecord[];
}

export interface PlanningHandoffInputs {
  rootDir: string;
  registry: ObjectiveRegistry;
  contextIdentity: string;
  repositoryIdentity: string;
  repositoryCommit: string;
}
