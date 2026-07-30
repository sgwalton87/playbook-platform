import type { ExecutionTask } from "../tasks";
import type { AgentExecutionResult, ExecutionAdapter } from "./types";

export type CodexTaskDelegate = (
  task: ExecutionTask
) => Promise<Omit<AgentExecutionResult, "digest">>;

export class CodexExecutionAdapter implements ExecutionAdapter {
  constructor(private readonly delegate: CodexTaskDelegate) {}

  execute(task: ExecutionTask): Promise<Omit<AgentExecutionResult, "digest">> {
    return this.delegate(task);
  }
}
