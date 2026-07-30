export interface ExecutionTask {
  readonly task_id: string;
  readonly package_id: string;
  readonly milestone_id: string;
  readonly context_identity: string;
  readonly authorization_reference: string;
  readonly assigned_agent: string;
  readonly allowed_scope: readonly string[];
  readonly prohibited_scope: readonly string[];
  readonly required_capabilities: readonly string[];
  readonly validation_requirements: readonly string[];
  readonly evidence_requirements: readonly string[];
  readonly digest: string;
}

export interface TaskAssignment {
  readonly task: ExecutionTask;
  readonly assigned: boolean;
  readonly authority: "PBOS-TASK-ASSIGNMENT";
  readonly findings: readonly string[];
  readonly digest: string;
}

export interface GovernedTaskAssignment {
  readonly task_id: string;
  readonly package_id: string;
  readonly milestone_id: string;
  readonly agent_id: string;
  readonly context_id: string;
  readonly approval_id: string;
  readonly allowed_operations: readonly string[];
  readonly blocked_operations: readonly string[];
  readonly allowed_scope: readonly string[];
  readonly prohibited_scope: readonly string[];
  readonly required_capabilities: readonly string[];
  readonly validation_requirements: readonly string[];
  readonly evidence_requirements: readonly string[];
  readonly digest: string;
}
