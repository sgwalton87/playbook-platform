import { artifactDigest } from "../../kernel/identity";
import type { DecisionLineage, ExecutionHistory } from "./types";

export class DurableDecisionHistory {
  readonly #lineage: readonly DecisionLineage[];
  readonly #executions: readonly ExecutionHistory[];

  constructor(
    lineage: readonly DecisionLineage[] = [],
    executions: readonly ExecutionHistory[] = []
  ) {
    this.#lineage = [...lineage];
    this.#executions = [...executions];
  }

  appendLineage(input: Omit<DecisionLineage, "digest">): DurableDecisionHistory {
    if (
      input.evidence_ids.length === 0 ||
      this.#lineage.some(({ decision_id }) => decision_id === input.decision_id)
    ) {
      throw new Error("Decision history rejects missing evidence or rewriting.");
    }
    const value = { ...input, digest: artifactDigest(input) };
    return new DurableDecisionHistory([...this.#lineage, value], this.#executions);
  }

  appendExecution(
    input: Omit<ExecutionHistory, "digest">
  ): DurableDecisionHistory {
    if (
      !input.authority ||
      input.evidence_ids.length === 0 ||
      this.#executions.some(
        ({ execution_id }) => execution_id === input.execution_id
      )
    ) {
      throw new Error("Execution history rejects invalid or duplicate evidence.");
    }
    const value = { ...input, digest: artifactDigest(input) };
    return new DurableDecisionHistory(this.#lineage, [
      ...this.#executions,
      value,
    ]);
  }

  snapshot(): {
    readonly lineage: readonly DecisionLineage[];
    readonly executions: readonly ExecutionHistory[];
  } {
    return {
      lineage: [...this.#lineage],
      executions: [...this.#executions],
    };
  }
}
