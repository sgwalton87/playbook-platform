import { artifactDigest } from "../../kernel/identity";
import type { ExecutionResult } from "../runner";
import type { ExecutionSummary } from "./types";

export function observeExecution(result: ExecutionResult): ExecutionSummary {
  const duration = Date.parse(result.completed_at) - Date.parse(result.started_at);
  if (!Number.isFinite(duration) || duration < 0) {
    throw new Error("Execution timeline is invalid.");
  }
  const body: ExecutionSummary = {
    result,
    health: {
      status:
        result.status === "FAILED"
          ? "FAILED"
          : result.failures.length > 0
            ? "DEGRADED"
            : "HEALTHY",
      validation_count: result.validations.length,
      failure_count: result.failures.length,
    },
    timeline: {
      execution_id: result.execution_id,
      started_at: result.started_at,
      completed_at: result.completed_at,
      duration_ms: duration,
    },
    risk: {
      execution_id: result.execution_id,
      artifact_count: result.artifacts.length,
      rollback_available: result.rollback.length > 0,
      findings: [
        ...(result.failures.length > 0 ? result.failures : []),
        ...(result.rollback.length === 0 ? ["Rollback evidence is missing."] : []),
      ],
    },
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
