import { artifactDigest } from "../../kernel/identity";
import type { TaskAssignment } from "../tasks";
import type { AgentExecutionResult, ExecutionAdapter } from "./types";

export class AgentExecutor {
  async execute(
    assignment: TaskAssignment,
    adapter: ExecutionAdapter
  ): Promise<AgentExecutionResult> {
    if (!assignment.assigned || assignment.findings.length > 0) {
      throw new Error("Agent execution rejected: task assignment is not authorized.");
    }
    const result = await adapter.execute(assignment.task);
    const scopeViolation = result.artifacts.some(({ path }) =>
      !assignment.task.allowed_scope.some(
        (allowed) => path === allowed || path.startsWith(`${allowed}/`)
      ) ||
      assignment.task.prohibited_scope.some(
        (prohibited) => path === prohibited || path.startsWith(`${prohibited}/`)
      )
    );
    if (
      result.task_id !== assignment.task.task_id ||
      result.agent_id !== assignment.task.assigned_agent ||
      scopeViolation ||
      result.evidence_references.length === 0
    ) {
      throw new Error("Agent execution result violated assignment governance.");
    }
    return { ...result, digest: artifactDigest(result) };
  }
}
