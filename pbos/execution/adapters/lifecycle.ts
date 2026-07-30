import type { ExecutionAdmissionEvidence } from "../admission";
import type { TaskAssignment } from "../tasks";
import { AgentExecutor } from "./executor";
import type { AgentExecutionResult, ExecutionAdapter } from "./types";

export class ExecutionLifecycleAdapter {
  readonly #adapters: ReadonlyMap<string, ExecutionAdapter>;

  constructor(adapters: ReadonlyMap<string, ExecutionAdapter>) {
    this.#adapters = new Map(adapters);
  }

  async execute(
    admission: ExecutionAdmissionEvidence,
    assignment: TaskAssignment
  ): Promise<AgentExecutionResult> {
    if (
      !admission.decision.admitted ||
      admission.assignment_digest !== assignment.digest
    ) {
      throw new Error("Execution lifecycle admission rejected.");
    }
    const adapter = this.#adapters.get(assignment.task.assigned_agent);
    if (!adapter) throw new Error("Execution adapter is unavailable.");
    return new AgentExecutor().execute(assignment, adapter);
  }
}
