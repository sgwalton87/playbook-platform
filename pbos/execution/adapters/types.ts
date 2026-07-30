import type { ExecutionTask } from "../tasks";

export interface AgentExecutionArtifact {
  readonly path: string;
  readonly digest: string;
}

export interface AgentExecutionResult {
  readonly execution_id: string;
  readonly task_id: string;
  readonly agent_id: string;
  readonly status: "SUCCEEDED" | "FAILED";
  readonly artifacts: readonly AgentExecutionArtifact[];
  readonly validation_results: readonly string[];
  readonly evidence_references: readonly string[];
  readonly started_at: string;
  readonly completed_at: string;
  readonly digest: string;
}

export interface ExecutionAdapter {
  execute(task: ExecutionTask): Promise<Omit<AgentExecutionResult, "digest">>;
}
