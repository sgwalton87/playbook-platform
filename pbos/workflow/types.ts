export type WorkflowStatus =
  | "READY"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export type WorkflowStepStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export interface WorkflowStep {
  id: string;
  engine: string;
  description: string;
  status: WorkflowStepStatus;
  dependsOn: string[];
}

export interface WorkflowModel {
  workflowId: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
}
